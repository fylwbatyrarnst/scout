import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { pickFileFromDevice } from "../lib/imageFile";
import { DEFAULT_ACTIVITIES } from "../components/Activities";
import { DEFAULT_COMMITTEES } from "../components/Committees";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "rover2026";
const MAX_IMAGE_DATA_URL_CHARS = 28 * 1024;

const GALLERY_TEMPLATES = [
  {
    label: "معسكر كشفي",
    title: "معسكر خلاء ومغامرة",
    icon: "",
    shortDesc: "تدريب عملي على التخييم ومهارات الخلاء والعمل الجماعي.",
    details:
      "معسكر كشفي يهدف لتنمية الاعتماد على النفس والقيادة من خلال نصب الخيام، العقد والربطات، الإسعافات الأولية، والأنشطة الميدانية.",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
  },
  {
    label: "يوم خير",
    title: "يوم الخير والمبادرات",
    icon: "",
    shortDesc: "أنشطة تطوعية ومبادرات لخدمة المجتمع داخل الكلية وخارجها.",
    details:
      "يوم مخصص للعمل التطوعي وخدمة المجتمع وتنظيم المبادرات الخيرية ونشر روح العطاء بين الجوالين والطلاب.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000&q=80",
  },
  {
    label: "إفطار وحفل",
    title: "إفطار العشيرة السنوي",
    icon: "",
    shortDesc: "لقاء ودي يجمع أعضاء العشيرة ولجانها في أجواء أخوية.",
    details:
      "تجمع سنوي لأفراد العشيرة لتعزيز روح الأخوة والتواصل بين القيادات والجوالين الجدد مع فقرات ترفيهية وكشفية.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&q=80",
  },
];

const EMPTY_EVENT = {
  active: true,
  title: "",
  date: "2027-02-10T10:00",
  location: "كلية العلوم - جامعة عين شمس",
  description: "",
  image: "",
};

const EMPTY_ACTIVITY = {
  badge: "مجال كشفي",
  title: "",
  description: "",
  image: "",
};

const EMPTY_COMMITTEE = {
  title: "",
  summary: "",
  image: "",
  tasksText: "",
  skillsText: "",
};

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(
    () => sessionStorage.getItem("rover_admin_auth") === "true"
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("event");

  const {
    siteData,
    isCloudEnabled,
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
    updateRequestStatus,
    resetToDefault,
  } = useSite();

  const [logoInput, setLogoInput] = useState(
    siteData.logoUrl || "/rover-logo.svg"
  );
  const [logoSaved, setLogoSaved] = useState(false);
  const [logoError, setLogoError] = useState("");

  const [heroBgInput, setHeroBgInput] = useState(
    siteData.heroBackgroundUrl || ""
  );
  const [heroBgSaved, setHeroBgSaved] = useState(false);
  const [heroBgError, setHeroBgError] = useState("");

  const [newEventForm, setNewEventForm] = useState(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventForm, setEditEventForm] = useState(EMPTY_EVENT);
  const [eventNotice, setEventNotice] = useState("");

  const [newGallery, setNewGallery] = useState({
    title: "",
    icon: "",
    shortDesc: "",
    details: "",
    image: "",
  });
  const [galleryNotice, setGalleryNotice] = useState("");

  const [newActivityForm, setNewActivityForm] = useState(EMPTY_ACTIVITY);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editActivityForm, setEditActivityForm] = useState(EMPTY_ACTIVITY);
  const [activityNotice, setActivityNotice] = useState("");

  const [newCommitteeForm, setNewCommitteeForm] = useState(EMPTY_COMMITTEE);
  const [editingCommitteeId, setEditingCommitteeId] = useState(null);
  const [editCommitteeForm, setEditCommitteeForm] = useState(EMPTY_COMMITTEE);
  const [committeeNotice, setCommitteeNotice] = useState("");

  const [requestNotice, setRequestNotice] = useState("");

  useEffect(() => {
    setLogoInput(siteData.logoUrl || "/rover-logo.svg");
    setHeroBgInput(siteData.heroBackgroundUrl || "");
  }, [siteData.logoUrl, siteData.heroBackgroundUrl]);

  const handleFileChange = async (
    e,
    onPicked,
    onErrorMsg,
    maxWidth = 480,
    quality = 0.42
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const base64 = await pickFileFromDevice(file, maxWidth, quality);
      if (
        typeof base64 === "string" &&
        base64.length > MAX_IMAGE_DATA_URL_CHARS
      ) {
        const approxKb = (base64.length / 1024).toFixed(1);
        const msg = `حجم الصورة بعد الضغط (${approxKb} KB) كبير على حد 100 KB في JSONBin المجاني. الأفضل استخدام رابط صورة مباشر (URL) أو تقليل الصور المخزنة.`;
        if (onErrorMsg) {
          onErrorMsg(msg);
        } else {
          alert(msg);
        }
        return null;
      }

      if (onErrorMsg) onErrorMsg("");
      onPicked(base64);
      return base64;
    } catch (err) {
      const msg = err?.message || "تعذر تحميل الصورة من الجهاز.";
      if (onErrorMsg) {
        onErrorMsg(msg);
      } else {
        alert(msg);
      }
      return null;
    }
  };

  const applyTemplate = (tpl) => {
    setGalleryNotice("");
    setNewGallery({
      title: tpl.title,
      icon: tpl.icon || "",
      shortDesc: tpl.shortDesc,
      details: tpl.details,
      image: tpl.image,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuth(true);
      sessionStorage.setItem("rover_admin_auth", "true");
      setError("");
    } else {
      setError("كلمة المرور غير صحيحة!");
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    sessionStorage.removeItem("rover_admin_auth");
  };

  const startEditEvent = (ev) => {
    setEventNotice("");
    setEditingEventId(ev.id);
    setEditEventForm({
      active: ev.active !== false,
      title: ev.title || "",
      date: ev.date ? String(ev.date).slice(0, 16) : "",
      location: ev.location || "",
      description: ev.description || "",
      image: ev.image || "",
    });
  };

  const handleSaveEditedEvent = async (e) => {
    e.preventDefault();
    const res = await updateUpcomingEvent(editingEventId, editEventForm);
    setEditingEventId(null);
    setEventNotice(
      res?.ok === false
        ? `تم التحديث محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تم تحديث بيانات الحدث."
    );
    setTimeout(() => setEventNotice(""), 4000);
  };

  const handleAddNewEvent = async (e) => {
    e.preventDefault();
    const res = await addUpcomingEvent(newEventForm);
    if (res?.ok !== false) {
      setNewEventForm(EMPTY_EVENT);
    }
    setEventNotice(
      res?.ok === false
        ? `تمت الإضافة محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تمت إضافة الحدث الجديد."
    );
    setTimeout(() => setEventNotice(""), 4000);
  };

  const handleDeleteEvent = async (id) => {
    const res = await deleteUpcomingEvent(id);
    setEventNotice(
      res?.ok === false
        ? `تم الحذف محلياً وتعذر حفظه على السحابة: ${res.cloudError}`
        : "تم حذف الحدث."
    );
    setTimeout(() => setEventNotice(""), 4000);
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    const res = await addGalleryItem(newGallery);
    if (res?.ok !== false) {
      setNewGallery({
        title: "",
        icon: "",
        shortDesc: "",
        details: "",
        image: "",
      });
    }
    setGalleryNotice(
      res?.ok === false
        ? `تمت الإضافة محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تمت إضافة الفعالية للمعرض."
    );
    setTimeout(() => setGalleryNotice(""), 4000);
  };

  const handleDeleteGallery = async (id) => {
    const res = await deleteGalleryItem(id);
    setGalleryNotice(
      res?.ok === false
        ? `تم الحذف محلياً وتعذر حفظه على السحابة: ${res.cloudError}`
        : "تم حذف الفعالية من المعرض."
    );
    setTimeout(() => setGalleryNotice(""), 4000);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    const res = await addActivity(newActivityForm);
    if (res?.ok !== false) {
      setNewActivityForm(EMPTY_ACTIVITY);
    }
    setActivityNotice(
      res?.ok === false
        ? `تمت الإضافة محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تمت إضافة مجال النشاط."
    );
    setTimeout(() => setActivityNotice(""), 4000);
  };

  const startEditActivity = (act) => {
    setActivityNotice("");
    setEditingActivityId(act.id);
    setEditActivityForm({
      badge: act.badge || "مجال كشفي",
      title: act.title || "",
      description: act.description || "",
      image: act.image || "",
    });
  };

  const handleSaveEditedActivity = async (e) => {
    e.preventDefault();
    const res = await updateActivity(editingActivityId, editActivityForm);
    setEditingActivityId(null);
    setActivityNotice(
      res?.ok === false
        ? `تم التحديث محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تم تحديث مجال النشاط."
    );
    setTimeout(() => setActivityNotice(""), 4000);
  };

  const handleDeleteActivity = async (id) => {
    const res = await deleteActivity(id);
    setActivityNotice(
      res?.ok === false
        ? `تم الحذف محلياً وتعذر حفظه على السحابة: ${res.cloudError}`
        : "تم حذف مجال النشاط."
    );
    setTimeout(() => setActivityNotice(""), 4000);
  };

  const handleAddCommittee = async (e) => {
    e.preventDefault();
    const res = await addCommittee(newCommitteeForm);
    if (res?.ok !== false) {
      setNewCommitteeForm(EMPTY_COMMITTEE);
    }
    setCommitteeNotice(
      res?.ok === false
        ? `تمت الإضافة محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تمت إضافة اللجنة النوعية."
    );
    setTimeout(() => setCommitteeNotice(""), 4000);
  };

  const startEditCommittee = (com) => {
    setCommitteeNotice("");
    setEditingCommitteeId(com.id);
    setEditCommitteeForm({
      title: com.title || "",
      summary: com.summary || "",
      image: com.image || "",
      tasksText: Array.isArray(com.tasks) ? com.tasks.join("\n") : "",
      skillsText: Array.isArray(com.skills) ? com.skills.join("، ") : "",
    });
  };

  const handleSaveEditedCommittee = async (e) => {
    e.preventDefault();
    const res = await updateCommittee(editingCommitteeId, editCommitteeForm);
    setEditingCommitteeId(null);
    setCommitteeNotice(
      res?.ok === false
        ? `تم التحديث محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تم تحديث بيانات اللجنة."
    );
    setTimeout(() => setCommitteeNotice(""), 4000);
  };

  const handleDeleteCommittee = async (id) => {
    const res = await deleteCommittee(id);
    setCommitteeNotice(
      res?.ok === false
        ? `تم الحذف محلياً وتعذر حفظه على السحابة: ${res.cloudError}`
        : "تم حذف اللجنة."
    );
    setTimeout(() => setCommitteeNotice(""), 4000);
  };

  const handleLoadDefaults = async (sectionType) => {
    const res = await saveDefaultSections(
      sectionType === "activities" || sectionType === "all"
        ? DEFAULT_ACTIVITIES
        : siteData.activities,
      sectionType === "committees" || sectionType === "all"
        ? DEFAULT_COMMITTEES
        : siteData.committees
    );
    const msg =
      res?.ok === false
        ? `تم التحميل محلياً وتعذر الحفظ السحابي: ${res.cloudError}`
        : "تم تحميل البيانات الافتراضية بالصور.";
    if (sectionType === "activities") setActivityNotice(msg);
    else setCommitteeNotice(msg);
    setTimeout(() => {
      setActivityNotice("");
      setCommitteeNotice("");
    }, 4000);
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    setLogoError("");
    setLogoSaved(false);
    const res = await updateLogoUrl(logoInput);
    if (res?.ok === false) {
      setLogoError(res.cloudError || "تعذر حفظ الشعار على السحابة");
      return;
    }
    setLogoSaved(true);
    setTimeout(() => setLogoSaved(false), 3000);
  };

  const handleSaveHeroBg = async (e) => {
    e.preventDefault();
    setHeroBgError("");
    setHeroBgSaved(false);
    try {
      const res = await updateHeroBackgroundUrl(heroBgInput);
      if (res?.ok === false) {
        setHeroBgError(res.cloudError || "تعذر حفظ خلفية الهيرو على السحابة");
        return;
      }
      setHeroBgSaved(true);
      setTimeout(() => setHeroBgSaved(false), 3000);
    } catch (err) {
      setHeroBgError(err?.message || "حدث خطأ أثناء حفظ خلفية الهيرو");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const res = await updateRequestStatus(id, status);
    if (res?.ok === false) {
      setRequestNotice(
        `تم التحديث محلياً وتعذر حفظه على السحابة: ${res.cloudError}`
      );
      setTimeout(() => setRequestNotice(""), 4000);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black">
        <div className="card rover-card p-4 shadow-lg" style={{ width: "380px" }}>
          <div className="text-center mb-3">
            <h4 className="fw-bold text-warning mt-2">لوحة تحكم العشيرة</h4>
            <p className="text-secondary small">أدخل كلمة المرور للمتابعة</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="form-control bg-dark text-white border-secondary mb-3 text-center"
              placeholder="كلمة المرور"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
            {error && (
              <div className="alert alert-danger py-2 small text-center">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-gold w-100 mb-2">
              دخول
            </button>
            <Link to="/" className="btn btn-outline-gold btn-sm w-100">
              العودة للموقع الرئيسي
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const displayedActivities =
    Array.isArray(siteData.activities) && siteData.activities.length > 0
      ? siteData.activities
      : DEFAULT_ACTIVITIES;

  const displayedCommittees =
    Array.isArray(siteData.committees) && siteData.committees.length > 0
      ? siteData.committees
      : DEFAULT_COMMITTEES;

  return (
    <div className="min-vh-100 bg-black text-light">
      <nav className="navbar navbar-dark bg-black px-4 py-3 border-bottom border-warning border-opacity-25">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="navbar-brand fw-bold text-warning mb-0">
            لوحة تحكم جوالة علوم عين شمس
          </span>
          {isCloudEnabled ? (
            <span className="badge bg-success px-3 py-2">
              <i className="bi bi-cloud-check-fill me-1"></i>
              {isSyncing ? "جاري المزامنة..." : "متصل بـ JSONBin السحابي"}
            </span>
          ) : (
            <span className="badge bg-warning text-dark px-3 py-2">
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              وضع محلي فقط
            </span>
          )}
        </div>

        <div className="d-flex gap-2">
          {isCloudEnabled && (
            <button
              type="button"
              onClick={() => refreshFromCloud()}
              className="btn btn-outline-gold btn-sm"
              title="مزامنة الآن"
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>
          )}
          <Link to="/" className="btn btn-outline-gold btn-sm">
            معاينة الموقع
          </Link>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            تسجيل خروج
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {lastSyncError && (
          <div className="alert alert-danger small mb-4">
            تنبيه المزامنة: {lastSyncError}
          </div>
        )}

        <ul className="nav nav-pills mb-4 gap-2 flex-wrap">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "event"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("event")}
            >
              الأحداث القادمة ({siteData.upcomingEvents.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "activities"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("activities")}
            >
              مجالات الأنشطة ({displayedActivities.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "committees"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("committees")}
            >
              اللجان النوعية ({displayedCommittees.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "gallery"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("gallery")}
            >
              إدارة المعرض ({siteData.gallery.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "requests"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("requests")}
            >
              طلبات الانضمام ({siteData.joinRequests.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "branding"
                  ? "btn-gold text-dark"
                  : "rover-card text-light"
              }`}
              onClick={() => setActiveTab("branding")}
            >
              الشعار وخلفية الهيرو
            </button>
          </li>
        </ul>

        {activeTab === "event" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-3">
                  {editingEventId ? "تعديل حدث حالي" : "إضافة حدث قادم جديد"}
                </h5>

                {editingEventId ? (
                  <form onSubmit={handleSaveEditedEvent}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editEventForm.active}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            active: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-bold">
                        إظهار الحدث في الكتاب
                      </label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم الحدث
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editEventForm.title}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        التاريخ والوقت
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark text-white border-secondary"
                        value={editEventForm.date}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        المكان
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editEventForm.location}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو اختر ملفاً صغيراً
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={editEventForm.image}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setEditEventForm({ ...editEventForm, image: img }),
                            (msg) => setEventNotice(msg)
                          )
                        }
                      />
                    </div>

                    {editEventForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={editEventForm.image}
                          alt="معاينة"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        وصف الحدث
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        required
                        value={editEventForm.description}
                        onChange={(e) =>
                          setEditEventForm({
                            ...editEventForm,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-gold flex-grow-1">
                        حفظ التعديل
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-gold"
                        onClick={() => setEditingEventId(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddNewEvent}>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newEventForm.active}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            active: e.target.checked,
                          })
                        }
                      />
                      <label className="form-check-label fw-bold">
                        إظهار الحدث في قسم الأحداث القادمة
                      </label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم الحدث
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: معسكر الربيع الكشفي"
                        required
                        value={newEventForm.title}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        التاريخ والوقت
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark text-white border-secondary"
                        value={newEventForm.date}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        المكان
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="كلية العلوم - جامعة عين شمس"
                        required
                        value={newEventForm.location}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو اختر ملفاً صغيراً
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={newEventForm.image}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        required={!newEventForm.image}
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setNewEventForm({ ...newEventForm, image: img }),
                            (msg) => setEventNotice(msg)
                          )
                        }
                      />
                    </div>

                    {newEventForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={newEventForm.image}
                          alt="معاينة صورة الحدث"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        وصف الحدث
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        placeholder="تفاصيل الفعالية والبرنامج..."
                        required
                        value={newEventForm.description}
                        onChange={(e) =>
                          setNewEventForm({
                            ...newEventForm,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-gold w-100">
                      + إضافة حدث جديد
                    </button>
                  </form>
                )}

                {eventNotice && (
                  <div className="text-warning small fw-bold text-center mt-3">
                    {eventNotice}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-3">
                  الأحداث القادمة المسجلة ({siteData.upcomingEvents.length})
                </h5>
                <div className="d-flex flex-column gap-3">
                  {siteData.upcomingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-3 bg-dark border border-secondary d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {ev.image && (
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="rounded-2 border border-warning"
                            style={{
                              width: "68px",
                              height: "68px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong className="text-warning">{ev.title}</strong>
                            <span
                              className={`badge ${
                                ev.active !== false
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {ev.active !== false ? "ظاهر" : "مخفي"}
                            </span>
                          </div>
                          <div className="small text-secondary">
                            {ev.location}
                          </div>
                          <div className="small text-light opacity-75">
                            {ev.shortDesc || ev.description}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditEvent(ev)}
                          className="btn btn-outline-gold btn-sm"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card rover-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                  <h5 className="fw-bold text-warning mb-0">
                    {editingActivityId
                      ? "تعديل مجال نشاط"
                      : "إضافة مجال نشاط جديد"}
                  </h5>
                  {siteData.activities.length === 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-gold btn-sm"
                      onClick={() => handleLoadDefaults("activities")}
                    >
                      اعتماد الافتراضيات
                    </button>
                  )}
                </div>

                {editingActivityId ? (
                  <form onSubmit={handleSaveEditedActivity}>
                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم المجال
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editActivityForm.title}
                        onChange={(e) =>
                          setEditActivityForm({
                            ...editActivityForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        تصنيف قصير (Badge)
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={editActivityForm.badge}
                        onChange={(e) =>
                          setEditActivityForm({
                            ...editActivityForm,
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو ملف صغير
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={editActivityForm.image}
                        onChange={(e) =>
                          setEditActivityForm({
                            ...editActivityForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setEditActivityForm({
                                ...editActivityForm,
                                image: img,
                              }),
                            (msg) => setActivityNotice(msg)
                          )
                        }
                      />
                    </div>

                    {editActivityForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={editActivityForm.image}
                          alt="معاينة"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        الوصف
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        required
                        value={editActivityForm.description}
                        onChange={(e) =>
                          setEditActivityForm({
                            ...editActivityForm,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-gold flex-grow-1">
                        حفظ التعديل
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-gold"
                        onClick={() => setEditingActivityId(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddActivity}>
                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم المجال
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: المعسكرات الكشفية"
                        required
                        value={newActivityForm.title}
                        onChange={(e) =>
                          setNewActivityForm({
                            ...newActivityForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        تصنيف قصير (Badge)
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: خلاء ومغامرة"
                        value={newActivityForm.badge}
                        onChange={(e) =>
                          setNewActivityForm({
                            ...newActivityForm,
                            badge: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو ملف صغير
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={newActivityForm.image}
                        onChange={(e) =>
                          setNewActivityForm({
                            ...newActivityForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setNewActivityForm({
                                ...newActivityForm,
                                image: img,
                              }),
                            (msg) => setActivityNotice(msg)
                          )
                        }
                      />
                    </div>

                    {newActivityForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={newActivityForm.image}
                          alt="معاينة"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        الوصف
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        placeholder="اشرح طبيعة هذا المجال..."
                        required
                        value={newActivityForm.description}
                        onChange={(e) =>
                          setNewActivityForm({
                            ...newActivityForm,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-gold w-100">
                      + إضافة مجال نشاط
                    </button>
                  </form>
                )}

                {activityNotice && (
                  <div className="text-warning small fw-bold text-center mt-3">
                    {activityNotice}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-3">
                  مجالات الأنشطة الحالية ({displayedActivities.length})
                </h5>
                <div className="d-flex flex-column gap-3">
                  {displayedActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-3 bg-dark border border-secondary d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {act.image && (
                          <img
                            src={act.image}
                            alt={act.title}
                            className="rounded-2 border border-warning"
                            style={{
                              width: "68px",
                              height: "68px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <strong className="text-warning">{act.title}</strong>
                            {act.badge && (
                              <span className="badge bg-secondary">
                                {act.badge}
                              </span>
                            )}
                          </div>
                          <div className="small text-light opacity-75 mt-1">
                            {act.description}
                          </div>
                        </div>
                      </div>

                      {siteData.activities.length > 0 && (
                        <div className="d-flex gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditActivity(act)}
                            className="btn btn-outline-gold btn-sm"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(act.id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "committees" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card rover-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                  <h5 className="fw-bold text-warning mb-0">
                    {editingCommitteeId ? "تعديل لجنة" : "إضافة لجنة نوعية"}
                  </h5>
                  {siteData.committees.length === 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-gold btn-sm"
                      onClick={() => handleLoadDefaults("committees")}
                    >
                      اعتماد الافتراضيات
                    </button>
                  )}
                </div>

                {editingCommitteeId ? (
                  <form onSubmit={handleSaveEditedCommittee}>
                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم اللجنة
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editCommitteeForm.title}
                        onChange={(e) =>
                          setEditCommitteeForm({
                            ...editCommitteeForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        ملخص اللجنة
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="2"
                        required
                        value={editCommitteeForm.summary}
                        onChange={(e) =>
                          setEditCommitteeForm({
                            ...editCommitteeForm,
                            summary: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو ملف صغير
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={editCommitteeForm.image}
                        onChange={(e) =>
                          setEditCommitteeForm({
                            ...editCommitteeForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setEditCommitteeForm({
                                ...editCommitteeForm,
                                image: img,
                              }),
                            (msg) => setCommitteeNotice(msg)
                          )
                        }
                      />
                    </div>

                    {editCommitteeForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={editCommitteeForm.image}
                          alt="معاينة"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        المهام (كل مهمة في سطر)
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        value={editCommitteeForm.tasksText}
                        onChange={(e) =>
                          setEditCommitteeForm({
                            ...editCommitteeForm,
                            tasksText: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        المهارات المكتسبة (مفصولة بفاصلة)
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={editCommitteeForm.skillsText}
                        onChange={(e) =>
                          setEditCommitteeForm({
                            ...editCommitteeForm,
                            skillsText: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-gold flex-grow-1">
                        حفظ التعديل
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-gold"
                        onClick={() => setEditingCommitteeId(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddCommittee}>
                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        اسم اللجنة
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: لجنة الإعلام والتوثيق"
                        required
                        value={newCommitteeForm.title}
                        onChange={(e) =>
                          setNewCommitteeForm({
                            ...newCommitteeForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        ملخص اللجنة
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="2"
                        placeholder="دور اللجنة باختصار..."
                        required
                        value={newCommitteeForm.summary}
                        onChange={(e) =>
                          setNewCommitteeForm({
                            ...newCommitteeForm,
                            summary: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        رابط صورة مباشر (URL) أو ملف صغير
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary mb-2"
                        placeholder="https://..."
                        value={newCommitteeForm.image}
                        onChange={(e) =>
                          setNewCommitteeForm({
                            ...newCommitteeForm,
                            image: e.target.value,
                          })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control bg-dark text-white border-secondary"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            (img) =>
                              setNewCommitteeForm({
                                ...newCommitteeForm,
                                image: img,
                              }),
                            (msg) => setCommitteeNotice(msg)
                          )
                        }
                      />
                    </div>

                    {newCommitteeForm.image && (
                      <div className="mb-2 text-center">
                        <img
                          src={newCommitteeForm.image}
                          alt="معاينة"
                          className="img-fluid rounded-3 border border-warning"
                          style={{ maxHeight: "110px", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label small text-warning">
                        المهام (كل مهمة في سطر)
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        placeholder="مهمة 1&#10;مهمة 2"
                        value={newCommitteeForm.tasksText}
                        onChange={(e) =>
                          setNewCommitteeForm({
                            ...newCommitteeForm,
                            tasksText: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-warning">
                        المهارات المكتسبة (مفصولة بفاصلة)
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="التخطيط، التواصل، إدارة الوقت"
                        value={newCommitteeForm.skillsText}
                        onChange={(e) =>
                          setNewCommitteeForm({
                            ...newCommitteeForm,
                            skillsText: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button type="submit" className="btn btn-gold w-100">
                      + إضافة لجنة
                    </button>
                  </form>
                )}

                {committeeNotice && (
                  <div className="text-warning small fw-bold text-center mt-3">
                    {committeeNotice}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-3">
                  اللجان النوعية الحالية ({displayedCommittees.length})
                </h5>
                <div className="d-flex flex-column gap-3">
                  {displayedCommittees.map((com) => (
                    <div
                      key={com.id}
                      className="p-3 rounded-3 bg-dark border border-secondary d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {com.image && (
                          <img
                            src={com.image}
                            alt={com.title}
                            className="rounded-2 border border-warning"
                            style={{
                              width: "68px",
                              height: "68px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <strong className="text-warning">{com.title}</strong>
                          <div className="small text-light opacity-75 mt-1">
                            {com.summary}
                          </div>
                        </div>
                      </div>

                      {siteData.committees.length > 0 && (
                        <div className="d-flex gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditCommittee(com)}
                            className="btn btn-outline-gold btn-sm"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCommittee(com.id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-2">
                  إضافة فعالية جديدة للمعرض
                </h5>
                <p className="text-secondary small mb-3">
                  اختر قالباً جاهزاً أو اكتب البيانات وأضف رابط صورة أو ملفاً صغيراً:
                </p>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {GALLERY_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-outline-gold btn-sm rounded-pill"
                      onClick={() => applyTemplate(tpl)}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddGallery}>
                  <div className="mb-2">
                    <label className="form-label small text-warning mb-1">
                      عنوان الفعالية
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="مثال: معسكر إعداد القادة"
                      required
                      value={newGallery.title}
                      onChange={(e) =>
                        setNewGallery({ ...newGallery, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-warning mb-1">
                      رابط صورة مباشر (URL) أو اختر ملفاً صغيراً
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary mb-2"
                      placeholder="https://..."
                      value={newGallery.image}
                      onChange={(e) =>
                        setNewGallery({ ...newGallery, image: e.target.value })
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-dark text-white border-secondary"
                      required={!newGallery.image}
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          (img) =>
                            setNewGallery({ ...newGallery, image: img }),
                          (msg) => setGalleryNotice(msg)
                        )
                      }
                    />
                  </div>

                  {newGallery.image && (
                    <div className="mb-2 text-center">
                      <img
                        src={newGallery.image}
                        alt="معاينة الصورة"
                        className="img-fluid rounded-3 border border-warning"
                        style={{ maxHeight: "120px", objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small text-warning mb-1">
                      وصف مختصر يظهر على الكارت
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="جملة قصيرة تصف الفعالية"
                      required
                      value={newGallery.shortDesc}
                      onChange={(e) =>
                        setNewGallery({
                          ...newGallery,
                          shortDesc: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-warning mb-1">
                      تفاصيل الفعالية الكاملة
                    </label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="3"
                      placeholder="اكتب ملخصاً أو تفاصيل إضافية تظهر عند فتح الفعالية"
                      required
                      value={newGallery.details}
                      onChange={(e) =>
                        setNewGallery({
                          ...newGallery,
                          details: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold w-100">
                    + إضافة للمعرض
                  </button>
                  {galleryNotice && (
                    <div className="text-warning small fw-bold text-center mt-2">
                      {galleryNotice}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-3">الفعاليات الحالية</h5>
                <div className="list-group">
                  {siteData.gallery.map((g) => (
                    <div
                      key={g.id}
                      className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {g.image && (
                          <img
                            src={g.image}
                            alt={g.title}
                            className="rounded-2 border border-warning"
                            style={{
                              width: "56px",
                              height: "56px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <strong className="text-warning">{g.title}</strong>
                          <p className="small text-secondary mb-0">
                            {g.shortDesc}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="card rover-card p-4">
            <h5 className="fw-bold text-warning mb-3">طلبات الانضمام الواردة</h5>
            {requestNotice && (
              <div className="alert alert-warning py-2 small">
                {requestNotice}
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الفرقة</th>
                    <th>واتساب</th>
                    <th>اللجنة</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {siteData.joinRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="fw-bold text-warning">{req.name}</td>
                      <td>{req.year}</td>
                      <td>
                        <a
                          href={`https://wa.me/2${req.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-success btn-sm"
                        >
                          <i className="bi bi-whatsapp me-1"></i> {req.phone}
                        </a>
                      </td>
                      <td>{req.committee}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm bg-black text-white border-secondary"
                          value={req.status}
                          onChange={(e) =>
                            handleUpdateStatus(req.id, e.target.value)
                          }
                        >
                          <option>جديد</option>
                          <option>تم التواصل</option>
                          <option>مقبول</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card rover-card p-4 h-100">
                <h5 className="fw-bold text-warning mb-3">
                  شعار العشيرة (Logo)
                </h5>
                <form onSubmit={handleSaveLogo}>
                  <div className="mb-3">
                    <label className="form-label small text-warning">
                      رابط الشعار (/rover-logo.svg أو رابط صورة)
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary mb-2"
                      value={logoInput}
                      onChange={(e) => setLogoInput(e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-dark text-white border-secondary"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          (img) => setLogoInput(img),
                          (msg) => setLogoError(msg),
                          320,
                          0.45
                        )
                      }
                    />
                  </div>
                  {logoInput && (
                    <div className="mb-3 text-center">
                      <img
                        src={logoInput}
                        alt="معاينة الشعار"
                        className="img-fluid rounded-3 border border-warning p-1"
                        style={{ maxHeight: "90px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <button type="submit" className="btn btn-gold w-100">
                    حفظ الشعار
                  </button>
                  {logoSaved && (
                    <div className="text-warning small fw-bold text-center mt-2">
                      تم حفظ الشعار.
                    </div>
                  )}
                  {logoError && (
                    <div className="text-danger small fw-bold text-center mt-2">
                      {logoError}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card rover-card p-4 h-100">
                <h5 className="fw-bold text-warning mb-3">خلفية قسم الهيرو</h5>
                <form onSubmit={handleSaveHeroBg}>
                  <div className="mb-3">
                    <label className="form-label small text-warning">
                      رابط صورة الخلفية (URL) أو ملف صغير جداً
                    </label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary mb-2"
                      placeholder="https://..."
                      value={heroBgInput}
                      onChange={(e) => setHeroBgInput(e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-dark text-white border-secondary"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          (img) => setHeroBgInput(img),
                          (msg) => setHeroBgError(msg),
                          480,
                          0.4
                        )
                      }
                    />
                  </div>
                  {heroBgInput && (
                    <div className="mb-3 text-center">
                      <img
                        src={heroBgInput}
                        alt="معاينة خلفية الهيرو"
                        className="img-fluid rounded-3 border border-warning"
                        style={{ maxHeight: "120px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-gold flex-grow-1">
                      حفظ الخلفية
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-gold"
                      onClick={() => setHeroBgInput("")}
                    >
                      تفريغ
                    </button>
                  </div>
                  {heroBgSaved && (
                    <div className="text-warning small fw-bold text-center mt-2">
                      تم حفظ خلفية الهيرو.
                    </div>
                  )}
                  {heroBgError && (
                    <div className="text-danger small fw-bold text-center mt-2">
                      {heroBgError}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="col-12">
              <div className="card rover-card p-4 border-danger border-opacity-50">
                <h6 className="fw-bold text-danger mb-2">إعادة ضبط البيانات</h6>
                <p className="text-secondary small mb-3">
                  لو حجم البيانات على JSONBin ممتلئ بصور قديمة، يمكنك إعادة ضبط البيانات وتفريغ السحابة ثم البدء بروابط صور خفيفة.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "هل أنت متأكد من إعادة ضبط بيانات الموقع؟"
                      )
                    ) {
                      await resetToDefault();
                    }
                  }}
                >
                  إعادة ضبط إلى البيانات الفارغة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}