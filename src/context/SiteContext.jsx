import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  isCloudConfigured,
  fetchRemoteSiteData,
  saveRemoteSiteData,
  getCurrentSession,
  onAuthStateChange,
  submitJoinRequestRemote,
  fetchJoinRequestsRemote,
  updateJoinRequestStatusRemote,
  sanitizeImageUrl,
} from "../lib/cloudStore";

const SiteContext = createContext(null);
const LOCAL_STORAGE_KEY = "asu_rover_site_data_v1";

const DEFAULT_SITE_DATA = {
  logoUrl: "/rover-logo.svg",
  heroBackgroundUrl: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImage: "",
  upcomingEvents: [],
  events: [],
  gallery: [],
  activities: [],
  committees: [],
  joinRequests: [],
};

function createItemId(prefix = "item") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseListField(value, delimiterRegex) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(delimiterRegex)
    .map((v) => v.trim())
    .filter(Boolean);
}

function sanitizeSitePayload(raw) {
  if (!raw || typeof raw !== "object") return DEFAULT_SITE_DATA;
  const { joinRequests: _ignoredRequests, ...rest } = raw;

  const normalizedEvents = Array.isArray(rest.upcomingEvents)
    ? rest.upcomingEvents
    : Array.isArray(rest.events)
    ? rest.events
    : [];

  return {
    ...DEFAULT_SITE_DATA,
    ...rest,
    logoUrl:
      sanitizeImageUrl(rest.logoUrl || "") ||
      rest.logoUrl ||
      DEFAULT_SITE_DATA.logoUrl,
    heroBackgroundUrl:
      sanitizeImageUrl(rest.heroBackgroundUrl || "") ||
      rest.heroBackgroundUrl ||
      "",
    heroImage: sanitizeImageUrl(rest.heroImage || "") || rest.heroImage || "",
    upcomingEvents: normalizedEvents,
    events: Array.isArray(rest.events) ? rest.events : normalizedEvents,
    gallery: Array.isArray(rest.gallery) ? rest.gallery : [],
    activities: Array.isArray(rest.activities) ? rest.activities : [],
    committees: Array.isArray(rest.committees) ? rest.committees : [],
  };
}

export function SiteProvider({ children }) {
  const [siteData, setSiteData] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      return cached ? sanitizeSitePayload(JSON.parse(cached)) : DEFAULT_SITE_DATA;
    } catch {
      return DEFAULT_SITE_DATA;
    }
  });

  const siteDataRef = useRef(siteData);
  siteDataRef.current = siteData;

  const [joinRequests, setJoinRequests] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState("");

  const isAdminAuthenticated = Boolean(session?.user);

  const loadJoinRequests = useCallback(async (activeSession) => {
    if (!activeSession?.user || !isCloudConfigured) {
      setJoinRequests([]);
      return;
    }
    try {
      const rows = await fetchJoinRequestsRemote();
      setJoinRequests(rows);
    } catch (err) {
      setSyncError(err?.message || "تعذر تحميل طلبات الانضمام.");
    }
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (!isCloudConfigured) return null;
    setIsSaving(true);
    setSyncError("");
    try {
      const remote = await fetchRemoteSiteData();
      if (remote?.data) {
        const cleaned = sanitizeSitePayload(remote.data);
        setSiteData(cleaned);
        siteDataRef.current = cleaned;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        } catch {
          // تجاهل خطأ التخزين المحلي
        }
        return cleaned;
      }
      return null;
    } catch (err) {
      const msg = err?.message || "تعذر مزامنة بيانات الموقع.";
      setSyncError(msg);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      setIsLoading(true);
      setSyncError("");

      const currentSession = await getCurrentSession();
      if (active) setSession(currentSession);

      if (isCloudConfigured) {
        try {
          const remote = await fetchRemoteSiteData();
          if (active && remote?.data) {
            const cleaned = sanitizeSitePayload(remote.data);
            setSiteData(cleaned);
            siteDataRef.current = cleaned;
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
            } catch {
              // تجاهل خطأ التخزين المحلي
            }
          }
        } catch (err) {
          if (active) setSyncError(err?.message || "تعذر مزامنة بيانات الموقع.");
        }
      }

      if (active && currentSession?.user) {
        await loadJoinRequests(currentSession);
      }

      if (active) setIsLoading(false);
    }

    init();

    const { data: authListener } = onAuthStateChange(async (nextSession) => {
      if (!active) return;
      setSession(nextSession);
      await loadJoinRequests(nextSession);
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadJoinRequests]);

  const updateSiteData = useCallback(async (updaterOrValue) => {
    setSyncError("");
    const current = siteDataRef.current;
    const rawNext =
      typeof updaterOrValue === "function"
        ? updaterOrValue(current)
        : updaterOrValue;
    const nextData = sanitizeSitePayload(rawNext);

    setSiteData(nextData);
    siteDataRef.current = nextData;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextData));
    } catch {
      // تجاهل خطأ امتلاء التخزين المحلي
    }

    if (isCloudConfigured) {
      setIsSaving(true);
      try {
        await saveRemoteSiteData(nextData);
        return { ok: true };
      } catch (err) {
        const msg = err?.message || "تعذر حفظ البيانات سحابياً.";
        setSyncError(msg);
        return { ok: false, cloudError: msg };
      } finally {
        setIsSaving(false);
      }
    }

    return { ok: true };
  }, []);

  const updateLogoUrl = useCallback(
    async (logoUrl) => {
      const cleanUrl = sanitizeImageUrl(logoUrl) || String(logoUrl || "").trim();
      return updateSiteData((prev) => ({
        ...prev,
        logoUrl: cleanUrl || DEFAULT_SITE_DATA.logoUrl,
      }));
    },
    [updateSiteData]
  );

  const updateHeroBackgroundUrl = useCallback(
    async (heroBackgroundUrl) => {
      const cleanUrl =
        sanitizeImageUrl(heroBackgroundUrl) ||
        String(heroBackgroundUrl || "").trim();
      return updateSiteData((prev) => ({
        ...prev,
        heroBackgroundUrl: cleanUrl,
        heroImage: cleanUrl,
      }));
    },
    [updateSiteData]
  );

  const addUpcomingEvent = useCallback(
    async (eventForm) => {
      const newEvent = {
        id: createItemId("evt"),
        active: eventForm?.active !== false,
        title: String(eventForm?.title || "").trim(),
        date: eventForm?.date || "",
        location: String(eventForm?.location || "").trim(),
        description: String(eventForm?.description || "").trim(),
        shortDesc: String(eventForm?.description || "").trim(),
        image:
          sanitizeImageUrl(eventForm?.image || "") ||
          String(eventForm?.image || "").trim(),
      };
      return updateSiteData((prev) => {
        const list = Array.isArray(prev.upcomingEvents) ? prev.upcomingEvents : [];
        const updated = [newEvent, ...list];
        return { ...prev, upcomingEvents: updated, events: updated };
      });
    },
    [updateSiteData]
  );

  const updateUpcomingEvent = useCallback(
    async (id, eventForm) => {
      return updateSiteData((prev) => {
        const list = Array.isArray(prev.upcomingEvents) ? prev.upcomingEvents : [];
        const updated = list.map((item) =>
          item.id === id
            ? {
                ...item,
                active: eventForm?.active !== false,
                title: String(eventForm?.title || "").trim(),
                date: eventForm?.date || "",
                location: String(eventForm?.location || "").trim(),
                description: String(eventForm?.description || "").trim(),
                shortDesc: String(eventForm?.description || "").trim(),
                image:
                  sanitizeImageUrl(eventForm?.image || "") ||
                  String(eventForm?.image || "").trim(),
              }
            : item
        );
        return { ...prev, upcomingEvents: updated, events: updated };
      });
    },
    [updateSiteData]
  );

  const deleteUpcomingEvent = useCallback(
    async (id) => {
      return updateSiteData((prev) => {
        const list = Array.isArray(prev.upcomingEvents) ? prev.upcomingEvents : [];
        const updated = list.filter((item) => item.id !== id);
        return { ...prev, upcomingEvents: updated, events: updated };
      });
    },
    [updateSiteData]
  );

  const addGalleryItem = useCallback(
    async (galleryForm) => {
      const newItem = {
        id: createItemId("gal"),
        title: String(galleryForm?.title || "").trim(),
        icon: String(galleryForm?.icon || "").trim(),
        shortDesc: String(galleryForm?.shortDesc || "").trim(),
        details: String(galleryForm?.details || "").trim(),
        image:
          sanitizeImageUrl(galleryForm?.image || "") ||
          String(galleryForm?.image || "").trim(),
      };
      return updateSiteData((prev) => ({
        ...prev,
        gallery: [newItem, ...(Array.isArray(prev.gallery) ? prev.gallery : [])],
      }));
    },
    [updateSiteData]
  );

  const deleteGalleryItem = useCallback(
    async (id) => {
      return updateSiteData((prev) => ({
        ...prev,
        gallery: (Array.isArray(prev.gallery) ? prev.gallery : []).filter(
          (item) => item.id !== id
        ),
      }));
    },
    [updateSiteData]
  );

  const addActivity = useCallback(
    async (activityForm) => {
      const newActivity = {
        id: createItemId("act"),
        badge: String(activityForm?.badge || "مجال كشفي").trim(),
        title: String(activityForm?.title || "").trim(),
        description: String(activityForm?.description || "").trim(),
        image:
          sanitizeImageUrl(activityForm?.image || "") ||
          String(activityForm?.image || "").trim(),
      };
      return updateSiteData((prev) => ({
        ...prev,
        activities: [
          newActivity,
          ...(Array.isArray(prev.activities) ? prev.activities : []),
        ],
      }));
    },
    [updateSiteData]
  );

  const updateActivity = useCallback(
    async (id, activityForm) => {
      return updateSiteData((prev) => ({
        ...prev,
        activities: (Array.isArray(prev.activities) ? prev.activities : []).map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  badge: String(activityForm?.badge || "مجال كشفي").trim(),
                  title: String(activityForm?.title || "").trim(),
                  description: String(activityForm?.description || "").trim(),
                  image:
                    sanitizeImageUrl(activityForm?.image || "") ||
                    String(activityForm?.image || "").trim(),
                }
              : item
        ),
      }));
    },
    [updateSiteData]
  );

  const deleteActivity = useCallback(
    async (id) => {
      return updateSiteData((prev) => ({
        ...prev,
        activities: (Array.isArray(prev.activities) ? prev.activities : []).filter(
          (item) => item.id !== id
        ),
      }));
    },
    [updateSiteData]
  );

  const addCommittee = useCallback(
    async (committeeForm) => {
      const newCommittee = {
        id: createItemId("com"),
        title: String(committeeForm?.title || "").trim(),
        summary: String(committeeForm?.summary || "").trim(),
        image:
          sanitizeImageUrl(committeeForm?.image || "") ||
          String(committeeForm?.image || "").trim(),
        tasks: parseListField(
          committeeForm?.tasksText ?? committeeForm?.tasks,
          /\r?\n+/
        ),
        skills: parseListField(
          committeeForm?.skillsText ?? committeeForm?.skills,
          /[,،\n]+/
        ),
      };
      return updateSiteData((prev) => ({
        ...prev,
        committees: [
          newCommittee,
          ...(Array.isArray(prev.committees) ? prev.committees : []),
        ],
      }));
    },
    [updateSiteData]
  );

  const updateCommittee = useCallback(
    async (id, committeeForm) => {
      return updateSiteData((prev) => ({
        ...prev,
        committees: (Array.isArray(prev.committees) ? prev.committees : []).map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  title: String(committeeForm?.title || "").trim(),
                  summary: String(committeeForm?.summary || "").trim(),
                  image:
                    sanitizeImageUrl(committeeForm?.image || "") ||
                    String(committeeForm?.image || "").trim(),
                  tasks: parseListField(
                    committeeForm?.tasksText ?? committeeForm?.tasks,
                    /\r?\n+/
                  ),
                  skills: parseListField(
                    committeeForm?.skillsText ?? committeeForm?.skills,
                    /[,،\n]+/
                  ),
                }
              : item
        ),
      }));
    },
    [updateSiteData]
  );

  const deleteCommittee = useCallback(
    async (id) => {
      return updateSiteData((prev) => ({
        ...prev,
        committees: (Array.isArray(prev.committees) ? prev.committees : []).filter(
          (item) => item.id !== id
        ),
      }));
    },
    [updateSiteData]
  );

  const saveDefaultSections = useCallback(
    async (nextActivities, nextCommittees) => {
      return updateSiteData((prev) => ({
        ...prev,
        activities: Array.isArray(nextActivities)
          ? nextActivities
          : prev.activities,
        committees: Array.isArray(nextCommittees)
          ? nextCommittees
          : prev.committees,
      }));
    },
    [updateSiteData]
  );

  const resetToDefault = useCallback(async () => {
    return updateSiteData(DEFAULT_SITE_DATA);
  }, [updateSiteData]);

  const submitJoinRequest = useCallback(async (reqData) => {
    setSyncError("");
    const created = await submitJoinRequestRemote(reqData);
    return created;
  }, []);

  const updateJoinRequestStatus = useCallback(
    async (id, status) => {
      if (!isAdminAuthenticated) {
        const msg = "يجب تسجيل دخول الأدمن أولاً.";
        setSyncError(msg);
        return { ok: false, cloudError: msg };
      }
      try {
        await updateJoinRequestStatusRemote(id, status);
        setJoinRequests((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        return { ok: true };
      } catch (err) {
        const msg = err?.message || "تعذر تحديث حالة الطلب.";
        setSyncError(msg);
        return { ok: false, cloudError: msg };
      }
    },
    [isAdminAuthenticated]
  );

  return (
    <SiteContext.Provider
      value={{
        siteData,
        updateSiteData,
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
        resetToDefault,
        refreshFromCloud,
        joinRequests,
        refreshJoinRequests: () => loadJoinRequests(session),
        submitJoinRequest,
        updateJoinRequestStatus,
        updateRequestStatus: updateJoinRequestStatus,
        session,
        isAdminAuthenticated,
        isCloudConfigured,
        isCloudEnabled: isCloudConfigured,
        isLoading,
        isSaving,
        isSyncing: isSaving || isLoading,
        syncError,
        lastSyncError: syncError,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSite يجب أن يُستخدم داخل SiteProvider");
  }
  return ctx;
}