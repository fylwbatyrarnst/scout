import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  isCloudConfigured,
  fetchRemoteSiteData,
  saveRemoteSiteData,
} from "../lib/cloudStore";

const SiteContext = createContext();

const LOCAL_CACHE_KEY = "rover_site_data_cache_v2";
const POLL_INTERVAL_MS = 12000;

function normalizeSiteData(raw) {
  const src = raw && typeof raw === "object" ? raw : {};

  const upcomingEvents = Array.isArray(src.upcomingEvents)
    ? src.upcomingEvents.map((ev, idx) => ({
        id: ev?.id ?? `${Date.now()}-${idx}`,
        active: ev?.active !== false,
        title: typeof ev?.title === "string" ? ev.title : "",
        date: typeof ev?.date === "string" ? ev.date : "",
        location: typeof ev?.location === "string" ? ev.location : "",
        description:
          typeof ev?.description === "string"
            ? ev.description
            : typeof ev?.shortDesc === "string"
              ? ev.shortDesc
              : "",
        shortDesc:
          typeof ev?.shortDesc === "string"
            ? ev.shortDesc
            : typeof ev?.description === "string"
              ? ev.description
              : "",
        image: typeof ev?.image === "string" ? ev.image : "",
      }))
    : [];

  const gallery = Array.isArray(src.gallery)
    ? src.gallery.map((item, idx) => ({
        id: item?.id ?? `${Date.now()}-g-${idx}`,
        title: typeof item?.title === "string" ? item.title : "",
        icon: typeof item?.icon === "string" ? item.icon : "🏕️",
        shortDesc: typeof item?.shortDesc === "string" ? item.shortDesc : "",
        details:
          typeof item?.details === "string"
            ? item.details
            : typeof item?.shortDesc === "string"
              ? item.shortDesc
              : "",
        image: typeof item?.image === "string" ? item.image : "",
      }))
    : [];

  const joinRequests = Array.isArray(src.joinRequests) ? src.joinRequests : [];

  return {
    logoUrl: typeof src.logoUrl === "string" ? src.logoUrl : "",
    heroBackgroundUrl:
      typeof src.heroBackgroundUrl === "string" ? src.heroBackgroundUrl : "",
    upcomingEvents,
    gallery,
    joinRequests,
  };
}

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    return normalizeSiteData(JSON.parse(raw));
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
          ? ""
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

const EMPTY_SITE_DATA = {
  logoUrl: "",
  heroBackgroundUrl: "",
  upcomingEvents: [],
  gallery: [],
  joinRequests: [],
};

export function SiteProvider({ children }) {
  const [siteData, setSiteData] = useState(() => {
    return readLocalCache() || EMPTY_SITE_DATA;
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
        const normalized = normalizeSiteData(remote.data);
        siteDataRef.current = normalized;
        setSiteData(normalized);
        writeLocalCache(normalized);
        setLastSyncError("");
      } else if (remote && remote.isEmpty) {
        const seed = normalizeSiteData(siteDataRef.current || EMPTY_SITE_DATA);
        await saveRemoteSiteData(seed);
        setLastSyncError("");
      }
    } catch (err) {
      if (!isSavingRef.current) {
        setLastSyncError(
          err?.message || "تعذر الاتصال بقاعدة البيانات السحابية",
        );
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
    const prevNormalized = normalizeSiteData(siteDataRef.current);
    const computed =
      typeof updater === "function" ? updater(prevNormalized) : updater;
    const nextNormalized = normalizeSiteData(computed);

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
        logoUrl: typeof logoUrl === "string" ? logoUrl.trim() : "",
      }));
    },
    [commitState],
  );

  const updateHeroBackgroundUrl = useCallback(
    (heroBackgroundUrl) => {
      return commitState((prev) => ({
        ...prev,
        heroBackgroundUrl:
          typeof heroBackgroundUrl === "string" ? heroBackgroundUrl.trim() : "",
      }));
    },
    [commitState],
  );

  const addUpcomingEvent = useCallback(
    (newEvent) => {
      const created = {
        id: Date.now(),
        active: newEvent?.active !== false,
        title: newEvent?.title || "",
        date: newEvent?.date || "",
        location: newEvent?.location || "",
        description: newEvent?.description || "",
        shortDesc: newEvent?.description || "",
        image: typeof newEvent?.image === "string" ? newEvent.image : "",
      };

      return commitState((prev) => ({
        ...prev,
        upcomingEvents: [created, ...prev.upcomingEvents],
      }));
    },
    [commitState],
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
            : ev,
        ),
      }));
    },
    [commitState],
  );

  const deleteUpcomingEvent = useCallback(
    (id) => {
      return commitState((prev) => ({
        ...prev,
        upcomingEvents: prev.upcomingEvents.filter(
          (ev) => String(ev.id) !== String(id),
        ),
      }));
    },
    [commitState],
  );

  const addGalleryItem = useCallback(
    (item) => {
      const created = {
        id: Date.now(),
        title: item?.title || "",
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
    [commitState],
  );

  const deleteGalleryItem = useCallback(
    (id) => {
      return commitState((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((item) => String(item.id) !== String(id)),
      }));
    },
    [commitState],
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
    [commitState],
  );

  const updateRequestStatus = useCallback(
    (id, status) => {
      return commitState((prev) => ({
        ...prev,
        joinRequests: prev.joinRequests.map((r) =>
          String(r.id) === String(id) ? { ...r, status } : r,
        ),
      }));
    },
    [commitState],
  );

  const resetToDefault = useCallback(() => {
    return commitState(EMPTY_SITE_DATA);
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
