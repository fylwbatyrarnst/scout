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
const POLL_INTERVAL_MS = 15000;

const EMPTY_SITE_DATA = {
  logoUrl: "",
  heroBackgroundUrl: "",
  upcomingEvents: [],
  gallery: [],
  activities: [],
  committees: [],
  joinRequests: [],
};

function normalizeSiteData(raw) {
  const src = raw && typeof raw === "object" ? raw : {};

  const upcomingEvents = Array.isArray(src.upcomingEvents)
    ? src.upcomingEvents.map((ev, idx) => {
        const desc =
          typeof ev?.description === "string"
            ? ev.description
            : typeof ev?.shortDesc === "string"
            ? ev.shortDesc
            : "";
        return {
          id: ev?.id ?? `${Date.now()}-${idx}`,
          active: ev?.active !== false,
          title: typeof ev?.title === "string" ? ev.title : "",
          date: typeof ev?.date === "string" ? ev.date : "",
          location: typeof ev?.location === "string" ? ev.location : "",
          description: desc,
          shortDesc: desc,
          image: typeof ev?.image === "string" ? ev.image : "",
        };
      })
    : [];

  const gallery = Array.isArray(src.gallery)
    ? src.gallery.map((item, idx) => {
        const detailsText =
          typeof item?.details === "string"
            ? item.details
            : typeof item?.shortDesc === "string"
            ? item.shortDesc
            : "";
        return {
          id: item?.id ?? `${Date.now()}-g-${idx}`,
          title: typeof item?.title === "string" ? item.title : "",
          icon: typeof item?.icon === "string" ? item.icon : "",
          shortDesc: typeof item?.shortDesc === "string" ? item.shortDesc : "",
          details: detailsText,
          image: typeof item?.image === "string" ? item.image : "",
        };
      })
    : [];

  const activities = Array.isArray(src.activities)
    ? src.activities.map((act, idx) => ({
        id: act?.id ?? `${Date.now()}-a-${idx}`,
        badge: typeof act?.badge === "string" ? act.badge : "مجال كشفي",
        title: typeof act?.title === "string" ? act.title : "",
        description:
          typeof act?.description === "string" ? act.description : "",
        image: typeof act?.image === "string" ? act.image : "",
      }))
    : [];

  const committees = Array.isArray(src.committees)
    ? src.committees.map((com, idx) => ({
        id: com?.id ?? `${Date.now()}-c-${idx}`,
        title: typeof com?.title === "string" ? com.title : "",
        summary: typeof com?.summary === "string" ? com.summary : "",
        image: typeof com?.image === "string" ? com.image : "",
        tasks: Array.isArray(com?.tasks) ? com.tasks : [],
        skills: Array.isArray(com?.skills) ? com.skills : [],
      }))
    : [];

  const joinRequests = Array.isArray(src.joinRequests) ? src.joinRequests : [];

  return {
    logoUrl: typeof src.logoUrl === "string" ? src.logoUrl : "",
    heroBackgroundUrl:
      typeof src.heroBackgroundUrl === "string" ? src.heroBackgroundUrl : "",
    upcomingEvents,
    gallery,
    activities,
    committees,
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
        activities: (data.activities || []).map((a) => ({
          ...a,
          image: a.image?.startsWith("data:") ? "" : a.image,
        })),
        committees: (data.committees || []).map((c) => ({
          ...c,
          image: c.image?.startsWith("data:") ? "" : c.image,
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
          err?.message || "تعذر الاتصال بقاعدة البيانات السحابية"
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

    const handleFocus = () => {
      if (!isSavingRef.current) {
        refreshFromCloud({ silent: true });
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshFromCloud]);

  const commitState = useCallback(async (updater) => {
    isSavingRef.current = true;

    const prevNormalized = normalizeSiteData(siteDataRef.current);
    const computed =
      typeof updater === "function" ? updater(prevNormalized) : updater;
    const nextNormalized = normalizeSiteData(computed);

    siteDataRef.current = nextNormalized;
    setSiteData(nextNormalized);
    writeLocalCache(nextNormalized);

    if (!isCloudConfigured) {
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
      return { ok: true, cloudError: "" };
    }

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
      }, 2500);
    }
  }, []);

  const updateLogoUrl = useCallback(
    (logoUrl) => {
      return commitState((prev) => ({
        ...prev,
        logoUrl: typeof logoUrl === "string" ? logoUrl.trim() : "",
      }));
    },
    [commitState]
  );

  const updateHeroBackgroundUrl = useCallback(
    (heroBackgroundUrl) => {
      return commitState((prev) => ({
        ...prev,
        heroBackgroundUrl:
          typeof heroBackgroundUrl === "string" ? heroBackgroundUrl.trim() : "",
      }));
    },
    [commitState]
  );

  const addUpcomingEvent = useCallback(
    (newEvent) => {
      const desc =
        typeof newEvent?.description === "string"
          ? newEvent.description
          : typeof newEvent?.shortDesc === "string"
          ? newEvent.shortDesc
          : "";

      const created = {
        id: Date.now(),
        active: newEvent?.active !== false,
        title: typeof newEvent?.title === "string" ? newEvent.title : "",
        date: typeof newEvent?.date === "string" ? newEvent.date : "",
        location: typeof newEvent?.location === "string" ? newEvent.location : "",
        description: desc,
        shortDesc: desc,
        image: typeof newEvent?.image === "string" ? newEvent.image.trim() : "",
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
        upcomingEvents: prev.upcomingEvents.map((ev) => {
          if (String(ev.id) !== String(id)) return ev;
          const nextDesc =
            updatedFields?.description !== undefined
              ? String(updatedFields.description)
              : updatedFields?.shortDesc !== undefined
              ? String(updatedFields.shortDesc)
              : ev.description || ev.shortDesc || "";

          return {
            ...ev,
            ...updatedFields,
            active:
              updatedFields?.active !== undefined
                ? Boolean(updatedFields.active)
                : ev.active,
            title:
              updatedFields?.title !== undefined
                ? String(updatedFields.title)
                : ev.title,
            date:
              updatedFields?.date !== undefined
                ? String(updatedFields.date)
                : ev.date,
            location:
              updatedFields?.location !== undefined
                ? String(updatedFields.location)
                : ev.location,
            description: nextDesc,
            shortDesc: nextDesc,
            image:
              updatedFields?.image !== undefined
                ? String(updatedFields.image).trim()
                : ev.image,
          };
        }),
      }));
    },
    [commitState]
  );

  const deleteUpcomingEvent = useCallback(
    (id) => {
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
      const detailsText =
        typeof item?.details === "string"
          ? item.details
          : typeof item?.shortDesc === "string"
          ? item.shortDesc
          : "";

      const created = {
        id: Date.now(),
        title: typeof item?.title === "string" ? item.title : "",
        icon: typeof item?.icon === "string" ? item.icon : "",
        shortDesc: typeof item?.shortDesc === "string" ? item.shortDesc : "",
        details: detailsText,
        image: typeof item?.image === "string" ? item.image.trim() : "",
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

  const addActivity = useCallback(
    (act) => {
      const created = {
        id: Date.now(),
        badge: typeof act?.badge === "string" ? act.badge.trim() : "مجال كشفي",
        title: typeof act?.title === "string" ? act.title.trim() : "",
        description:
          typeof act?.description === "string" ? act.description.trim() : "",
        image: typeof act?.image === "string" ? act.image.trim() : "",
      };

      return commitState((prev) => ({
        ...prev,
        activities: [...prev.activities, created],
      }));
    },
    [commitState]
  );

  const updateActivity = useCallback(
    (id, updatedFields) => {
      return commitState((prev) => ({
        ...prev,
        activities: prev.activities.map((act) => {
          if (String(act.id) !== String(id)) return act;
          return {
            ...act,
            badge:
              updatedFields?.badge !== undefined
                ? String(updatedFields.badge).trim()
                : act.badge,
            title:
              updatedFields?.title !== undefined
                ? String(updatedFields.title).trim()
                : act.title,
            description:
              updatedFields?.description !== undefined
                ? String(updatedFields.description).trim()
                : act.description,
            image:
              updatedFields?.image !== undefined
                ? String(updatedFields.image).trim()
                : act.image,
          };
        }),
      }));
    },
    [commitState]
  );

  const deleteActivity = useCallback(
    (id) => {
      return commitState((prev) => ({
        ...prev,
        activities: prev.activities.filter(
          (act) => String(act.id) !== String(id)
        ),
      }));
    },
    [commitState]
  );

  const addCommittee = useCallback(
    (com) => {
      const tasksArr = Array.isArray(com?.tasks)
        ? com.tasks
        : String(com?.tasksText || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

      const skillsArr = Array.isArray(com?.skills)
        ? com.skills
        : String(com?.skillsText || "")
            .split(/[,،\n]/)
            .map((s) => s.trim())
            .filter(Boolean);

      const created = {
        id: Date.now(),
        title: typeof com?.title === "string" ? com.title.trim() : "",
        summary: typeof com?.summary === "string" ? com.summary.trim() : "",
        image: typeof com?.image === "string" ? com.image.trim() : "",
        tasks: tasksArr,
        skills: skillsArr,
      };

      return commitState((prev) => ({
        ...prev,
        committees: [...prev.committees, created],
      }));
    },
    [commitState]
  );

  const updateCommittee = useCallback(
    (id, updatedFields) => {
      return commitState((prev) => ({
        ...prev,
        committees: prev.committees.map((com) => {
          if (String(com.id) !== String(id)) return com;

          const nextTasks = Array.isArray(updatedFields?.tasks)
            ? updatedFields.tasks
            : updatedFields?.tasksText !== undefined
            ? String(updatedFields.tasksText)
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : com.tasks;

          const nextSkills = Array.isArray(updatedFields?.skills)
            ? updatedFields.skills
            : updatedFields?.skillsText !== undefined
            ? String(updatedFields.skillsText)
                .split(/[,،\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : com.skills;

          return {
            ...com,
            title:
              updatedFields?.title !== undefined
                ? String(updatedFields.title).trim()
                : com.title,
            summary:
              updatedFields?.summary !== undefined
                ? String(updatedFields.summary).trim()
                : com.summary,
            image:
              updatedFields?.image !== undefined
                ? String(updatedFields.image).trim()
                : com.image,
            tasks: nextTasks,
            skills: nextSkills,
          };
        }),
      }));
    },
    [commitState]
  );

  const deleteCommittee = useCallback(
    (id) => {
      return commitState((prev) => ({
        ...prev,
        committees: prev.committees.filter(
          (com) => String(com.id) !== String(id)
        ),
      }));
    },
    [commitState]
  );

  const saveDefaultSections = useCallback(
    (defaultActivities, defaultCommittees) => {
      return commitState((prev) => ({
        ...prev,
        activities: defaultActivities,
        committees: defaultCommittees,
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
        addActivity,
        updateActivity,
        deleteActivity,
        addCommittee,
        updateCommittee,
        deleteCommittee,
        saveDefaultSections,
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