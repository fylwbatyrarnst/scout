import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { defaultSiteData } from "../data/defaultSiteData";
import {
  isCloudConfigured,
  fetchRemoteSiteData,
  saveRemoteSiteData,
} from "../lib/cloudStore";

const SiteContext = createContext();

const LOCAL_CACHE_KEY = "rover_site_data_cache_v1";
const DELETED_EVENTS_KEY = "rover_deleted_event_ids_v1";
const POLL_INTERVAL_MS = 12000;

function readDeletedEventIds() {
  try {
    const raw = localStorage.getItem(DELETED_EVENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function writeDeletedEventIds(ids) {
  try {
    localStorage.setItem(DELETED_EVENTS_KEY, JSON.stringify(Array.from(new Set(ids.map(String)))));
  } catch {
    // تجاهل
  }
}

function normalizeSiteData(raw, deletedIds = []) {
  const src = raw && typeof raw === "object" ? raw : {};
  const deletedSet = new Set((deletedIds || []).map(String));

  const hasEventsArray = Array.isArray(src.upcomingEvents);
  const eventsSource = hasEventsArray ? src.upcomingEvents : defaultSiteData.upcomingEvents;

  const normalizedEvents = eventsSource
    .filter((ev) => ev && !deletedSet.has(String(ev.id)))
    .map((ev, idx) => ({
      id: ev?.id ?? `${Date.now()}-${idx}`,
      active: ev?.active !== false,
      title: ev?.title || "فعالية كشفية قادمة",
      date: ev?.date || "2027-02-10T10:00",
      location: ev?.location || "كلية العلوم - جامعة عين شمس",
      description: ev?.description || ev?.shortDesc || "",
      shortDesc: ev?.shortDesc || ev?.description || "",
      image: typeof ev?.image === "string" ? ev.image : "",
    }));

  const hasGalleryArray = Array.isArray(src.gallery);
  const gallerySource = hasGalleryArray ? src.gallery : defaultSiteData.gallery;
  const normalizedGallery = gallerySource.map((item, idx) => ({
    id: item?.id ?? `${Date.now()}-g-${idx}`,
    title: item?.title || "فعالية كشفية",
    icon: item?.icon || "🏕️",
    shortDesc: item?.shortDesc || "",
    details: item?.details || item?.shortDesc || "",
    image: typeof item?.image === "string" ? item.image : "",
  }));

  const hasRequestsArray = Array.isArray(src.joinRequests);
  const requestsSource = hasRequestsArray
    ? src.joinRequests
    : defaultSiteData.joinRequests;

  const rawLogo = typeof src.logoUrl === "string" ? src.logoUrl.trim() : "";
  const rawHero =
    typeof src.heroBackgroundUrl === "string" ? src.heroBackgroundUrl.trim() : "";

  return {
    logoUrl: rawLogo || defaultSiteData.logoUrl,
    heroBackgroundUrl:
      src.heroBackgroundUrl === "" ? "" : rawHero || defaultSiteData.heroBackgroundUrl,
    upcomingEvents: normalizedEvents,
    gallery: normalizedGallery,
    joinRequests: requestsSource,
  };
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    return normalizeSiteData(JSON.parse(raw), readDeletedEventIds());
  } catch {
    return null;
  }
}

function writeLocalCache(data) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
    return true;
  } catch {
    try {
      const lighter = {
        ...data,
        heroBackgroundUrl: data.heroBackgroundUrl?.startsWith("data:")
          ? defaultSiteData.heroBackgroundUrl
          : data.heroBackgroundUrl,
        upcomingEvents: (data.upcomingEvents || []).map((ev) => ({
          ...ev,
          image: ev.image?.startsWith("data:") ? "" : ev.image,
        })),
        gallery: (data.gallery || []).map((g) => ({
          ...g,
          image: g.image?.startsWith("data:") ? "" : g.image,
        })),
      };
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(lighter));
      return true;
    } catch {
      return false;
    }
  }
}

export function SiteProvider({ children }) {
  const [siteData, setSiteData] = useState(() => {
    return readLocalCache() || normalizeSiteData(defaultSiteData, readDeletedEventIds());
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState("");

  const isSavingRef = useRef(false);
  const siteDataRef = useRef(siteData);
  siteDataRef.current = siteData;

  const refreshFromCloud = useCallback(async ({ silent = false } = {}) => {
    if (!isCloudConfigured) return;
    if (isSavingRef.current) return;

    if (!silent) setIsSyncing(true);
    try {
      const remote = await fetchRemoteSiteData();
      if (isSavingRef.current) return;

      if (remote && remote.data && typeof remote.data === "object") {
        const normalized = normalizeSiteData(remote.data, readDeletedEventIds());
        siteDataRef.current = normalized;
        setSiteData(normalized);
        writeLocalCache(normalized);
        setLastSyncError("");
      } else if (remote && remote.isEmpty) {
        const seed = normalizeSiteData(
          siteDataRef.current || defaultSiteData,
          readDeletedEventIds()
        );
        await saveRemoteSiteData(seed);
        setLastSyncError("");
      }
    } catch (err) {
      if (!isSavingRef.current) {
        setLastSyncError(err?.message || "تعذر الاتصال بقاعدة البيانات السحابية");
      }
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    refreshFromCloud();
    if (!isCloudConfigured) return;

    const timer = setInterval(() => {
      refreshFromCloud({ silent: true });
    }, POLL_INTERVAL_MS);

    const handleFocus = () => refreshFromCloud({ silent: true });
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshFromCloud]);

  const commitState = useCallback(async (updater) => {
    const prevNormalized = normalizeSiteData(siteDataRef.current, readDeletedEventIds());
    const computed =
      typeof updater === "function" ? updater(prevNormalized) : updater;
    const nextNormalized = normalizeSiteData(computed, readDeletedEventIds());

    siteDataRef.current = nextNormalized;
    setSiteData(nextNormalized);
    writeLocalCache(nextNormalized);

    if (!isCloudConfigured) {
      return { ok: true, cloudError: "" };
    }

    isSavingRef.current = true;
    setIsSyncing(true);
    setLastSyncError("");

    try {
      await saveRemoteSiteData(nextNormalized);
      return { ok: true, cloudError: "" };
    } catch (err) {
      const msg = err?.message || "تعذر حفظ التعديل على السحابة";
      setLastSyncError(msg);
      return { ok: false, cloudError: msg };
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 1500);
    }
  }, []);

  const updateLogoUrl = useCallback(
    (logoUrl) => {
      return commitState((prev) => ({
        ...prev,
        logoUrl: String(logoUrl || "").trim() || defaultSiteData.logoUrl,
      }));
    },
    [commitState]
  );

  const updateHeroBackgroundUrl = useCallback(
    (heroBackgroundUrl) => {
      const cleaned = String(heroBackgroundUrl || "").trim();
      return commitState((prev) => ({
        ...prev,
        heroBackgroundUrl: cleaned || defaultSiteData.heroBackgroundUrl,
      }));
    },
    [commitState]
  );

  const addUpcomingEvent = useCallback(
    (newEvent) => {
      const id = Date.now();
      const updatedDeleted = readDeletedEventIds().filter((x) => x !== String(id));
      writeDeletedEventIds(updatedDeleted);

      const created = {
        id,
        active: newEvent?.active !== false,
        title: newEvent?.title || "فعالية كشفية قادمة",
        date: newEvent?.date || "2027-02-10T10:00",
        location: newEvent?.location || "كلية العلوم - جامعة عين شمس",
        description: newEvent?.description || "",
        shortDesc: newEvent?.description || "",
        image: typeof newEvent?.image === "string" ? newEvent.image : "",
      };

      return commitState((prev) => ({
        ...prev,
        upcomingEvents: [created, ...prev.upcomingEvents],
      }));
    },
    [commitState]
  );

  const updateUpcomingEvent = useCallback(
    (id, updatedFields) => {
      return commitState((prev) => ({
        ...prev,
        upcomingEvents: prev.upcomingEvents.map((ev) =>
          String(ev.id) === String(id)
            ? {
                ...ev,
                ...updatedFields,
                shortDesc:
                  updatedFields?.description !== undefined
                    ? updatedFields.description
                    : ev.shortDesc,
              }
            : ev
        ),
      }));
    },
    [commitState]
  );

  const deleteUpcomingEvent = useCallback(
    (id) => {
      const nextDeleted = [...readDeletedEventIds(), String(id)];
      writeDeletedEventIds(nextDeleted);

      return commitState((prev) => ({
        ...prev,
        upcomingEvents: prev.upcomingEvents.filter(
          (ev) => String(ev.id) !== String(id)
        ),
      }));
    },
    [commitState]
  );

  const addGalleryItem = useCallback(
    (item) => {
      const created = {
        id: Date.now(),
        title: item?.title || "فعالية كشفية",
        icon: item?.icon || "🏕️",
        shortDesc: item?.shortDesc || "",
        details: item?.details || item?.shortDesc || "",
        image: typeof item?.image === "string" ? item.image : "",
      };

      return commitState((prev) => ({
        ...prev,
        gallery: [created, ...prev.gallery],
      }));
    },
    [commitState]
  );

  const deleteGalleryItem = useCallback(
    (id) => {
      return commitState((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((item) => String(item.id) !== String(id)),
      }));
    },
    [commitState]
  );

  const addJoinRequest = useCallback(
    (reqData) => {
      const created = {
        id: Date.now(),
        ...reqData,
        status: "جديد",
        createdAt: new Date().toISOString().split("T")[0],
      };

      return commitState((prev) => ({
        ...prev,
        joinRequests: [created, ...prev.joinRequests],
      }));
    },
    [commitState]
  );

  const updateRequestStatus = useCallback(
    (id, status) => {
      return commitState((prev) => ({
        ...prev,
        joinRequests: prev.joinRequests.map((r) =>
          String(r.id) === String(id) ? { ...r, status } : r
        ),
      }));
    },
    [commitState]
  );

  const resetToDefault = useCallback(() => {
    writeDeletedEventIds([]);
    const fresh = normalizeSiteData(defaultSiteData, []);
    return commitState(fresh);
  }, [commitState]);

  const activeUpcomingEvent =
    siteData.upcomingEvents.find((ev) => ev.active !== false) || null;

  return (
    <SiteContext.Provider
      value={{
        siteData,
        activeUpcomingEvent,
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
}

export function useSite() {
  return useContext(SiteContext);
}