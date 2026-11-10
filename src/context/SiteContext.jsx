import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialSiteData } from "../data/initialData";
import {
  isCloudConfigured,
  fetchRemoteSiteData,
  saveRemoteSiteData,
} from "../lib/cloudStore";

const LOCAL_CACHE_KEY = "asu_rover_jsonbin_cache_v1";

function normalizeSiteData(raw) {
  const merged = { ...initialSiteData, ...(raw || {}) };
  let events = Array.isArray(merged.upcomingEvents) ? merged.upcomingEvents : [];
  if (events.length === 0 && merged.nextEvent) {
    events = [{ id: 1, ...merged.nextEvent }];
  }
  return {
    ...merged,
    logoUrl: merged.logoUrl || initialSiteData.logoUrl,
    heroBackgroundUrl: merged.heroBackgroundUrl ?? initialSiteData.heroBackgroundUrl,
    upcomingEvents: events,
    gallery: Array.isArray(merged.gallery) ? merged.gallery : initialSiteData.gallery,
    activities: Array.isArray(merged.activities) ? merged.activities : initialSiteData.activities,
    committees: Array.isArray(merged.committees) ? merged.committees : initialSiteData.committees,
    joinRequests: Array.isArray(merged.joinRequests)
      ? merged.joinRequests
      : initialSiteData.joinRequests,
  };
}

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const [siteData, setSiteData] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      return cached ? normalizeSiteData(JSON.parse(cached)) : initialSiteData;
    } catch {
      return initialSiteData;
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(siteData));
    } catch {
      // تجاهل أخطاء التخزين المحلي
    }
  }, [siteData]);

  const persistToCloud = useCallback(async (nextData) => {
    if (!isCloudConfigured) return;
    setIsSyncing(true);
    setLastSyncError("");
    try {
      const normalized = normalizeSiteData(nextData);
      await saveRemoteSiteData(normalized);
    } catch (err) {
      setLastSyncError(err?.message || "تعذر الحفظ على السحابة");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (!isCloudConfigured) return;
    setIsSyncing(true);
    setLastSyncError("");
    try {
      const { data } = await fetchRemoteSiteData();
      if (data) {
        const normalized = normalizeSiteData(data);
        setSiteData(normalized);
      } else {
        await saveRemoteSiteData(initialSiteData);
      }
    } catch (err) {
      setLastSyncError(err?.message || "تعذر جلب البيانات من السحابة");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured) return;
    refreshFromCloud();

    const interval = setInterval(() => {
      refreshFromCloud();
    }, 20000);

    return () => clearInterval(interval);
  }, [refreshFromCloud]);

  const commitState = useCallback(
    (updater) => {
      setSiteData((prev) => {
        const computed = typeof updater === "function" ? updater(prev) : updater;
        const normalized = normalizeSiteData(computed);
        persistToCloud(normalized);
        return normalized;
      });
    },
    [persistToCloud]
  );

  const updateLogoUrl = (logoUrl) => {
    commitState((prev) => ({ ...prev, logoUrl }));
  };

  const updateHeroBackgroundUrl = (heroBackgroundUrl) => {
    commitState((prev) => ({ ...prev, heroBackgroundUrl }));
  };

  const addUpcomingEvent = (eventItem) => {
    commitState((prev) => ({
      ...prev,
      upcomingEvents: [
        ...prev.upcomingEvents,
        {
          ...eventItem,
          id: Date.now(),
          active: eventItem.active !== undefined ? eventItem.active : true,
        },
      ],
    }));
  };

  const updateUpcomingEvent = (id, updatedFields) => {
    commitState((prev) => ({
      ...prev,
      upcomingEvents: prev.upcomingEvents.map((ev) =>
        ev.id === id ? { ...ev, ...updatedFields } : ev
      ),
    }));
  };

  const deleteUpcomingEvent = (id) => {
    commitState((prev) => ({
      ...prev,
      upcomingEvents: prev.upcomingEvents.filter((ev) => ev.id !== id),
    }));
  };

  const addGalleryItem = (item) => {
    commitState((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { ...item, id: Date.now() }],
    }));
  };

  const deleteGalleryItem = (id) => {
    commitState((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((g) => g.id !== id),
    }));
  };

  const addJoinRequest = (request) => {
    const newReq = {
      ...request,
      id: Date.now(),
      status: "جديد",
      createdAt: new Date().toISOString().split("T")[0],
    };
    commitState((prev) => ({
      ...prev,
      joinRequests: [newReq, ...prev.joinRequests],
    }));
  };

  const updateRequestStatus = (id, status) => {
    commitState((prev) => ({
      ...prev,
      joinRequests: prev.joinRequests.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    }));
  };

  const resetToDefault = () => {
    commitState(initialSiteData);
  };

  return (
    <SiteContext.Provider
      value={{
        siteData,
        isCloudEnabled: isCloudConfigured,
        isSyncing,
        lastSyncError,
        refreshFromCloud,
        updateLogoUrl,
        updateHeroBackgroundUrl,
        addUpcomingEvent,
        updateUpcomingEvent,
        deleteUpcomingEvent,
        addGalleryItem,
        deleteGalleryItem,
        addJoinRequest,
        updateRequestStatus,
        resetToDefault,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
