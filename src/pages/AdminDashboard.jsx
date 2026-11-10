import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "rover2026";

const GALLERY_TEMPLATES = [
  {
    label: "⛺ معسكر كشفي",
    title: "معسكر خلاء ومغامرة",
    icon: "⛺",
    shortDesc: "تدريب عملي على التخييم ومهارات الخلاء والعمل الجماعي.",
    details:
      "معسكر كشفي يهدف لتنمية الاعتماد على النفس والقيادة من خلال نصب الخيام، العقد والربطات، الإسعافات الأولية، والأنشطة الميدانية.",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
  },
  {
    label: "❤️ يوم خير",
    title: "يوم الخير والمبادرات",
    icon: "❤️",
    shortDesc: "أنشطة تطوعية ومبادرات لخدمة المجتمع داخل الكلية وخارجها.",
    details:
      "يوم مخصص للعمل التطوعي وخدمة المجتمع وتنظيم المبادرات الخيرية ونشر روح العطاء بين الجوالين والطلاب.",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000&q=80",
  },
  {
    label: "🌙 إفطار وحفل",
    title: "إفطار العشيرة السنوي",
    icon: "🌙",
    shortDesc: "لقاء ودي يجمع أعضاء العشيرة ولجانها في أجواء أخوية.",
    details:
      "تجمع سنوي لأفراد العشيرة لتعزيز روح الأخوة والتواصل بين القيادات والجوالين الجدد مع فقرات ترفيهية وكشفية.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&q=80",
  },
];

const EMPTY_EVENT = {
  active: true,
  title: "",
  date: "2027-02-10T10:00",
  location: "كلية العلوم - جامعة عين شمس",
  description: "",
  image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
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
    updateRequestStatus,
    resetToDefault,
  } = useSite();

  const [logoInput, setLogoInput] = useState(siteData.logoUrl || "/rover-logo.svg");
  const [logoSaved, setLogoSaved] = useState(false);

  const [heroBgInput, setHeroBgInput] = useState(siteData.heroBackgroundUrl || "");
  const [heroBgSaved, setHeroBgSaved] = useState(false);

  const [newEventForm, setNewEventForm] = useState(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventForm, setEditEventForm] = useState(EMPTY_EVENT);
  const [eventNotice, setEventNotice] = useState("");

  const [newGallery, setNewGallery] = useState({
    title: "",
    icon: "🏕️",
    shortDesc: "",
    details: "",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
  });
  const [galleryAdded, setGalleryAdded] = useState(false);

  useEffect(() => {
    setLogoInput(siteData.logoUrl || "/rover-logo.svg");
    setHeroBgInput(siteData.heroBackgroundUrl || "");
  }, [siteData.logoUrl, siteData.heroBackgroundUrl]);

  const applyTemplate = (tpl) => {
    setNewGallery({
      title: tpl.title,
      icon: tpl.icon,
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

  const handleSaveEditedEvent = (e) => {
    e.preventDefault();
    updateUpcomingEvent(editingEventId, editEventForm);
    setEditingEventId(null);
    setEventNotice("✅ تم تحديث بيانات الحدث ومزامنتها سحابياً!");
    setTimeout(() => setEventNotice(""), 3000);
  };

  const handleAddNewEvent = (e) => {
    e.preventDefault();
    addUpcomingEvent(newEventForm);
    setNewEventForm(EMPTY_EVENT);
    setEventNotice("✅ تمت إضافة الحدث الجديد ومزامنته سحابياً!");
    setTimeout(() => setEventNotice(""), 3000);
  };

  if (!isAuth) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black">
        <div className="card rover-card p-4 shadow-lg" style={{ width: "380px" }}>
          <div className="text-center mb-3">
            <span className="display-4">🔐</span>
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
            {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}
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

  return (
    <div className="min-vh-100 bg-black text-light">
      <nav className="navbar navbar-dark bg-black px-4 py-3 border-bottom border-warning border-opacity-25">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="navbar-brand fw-bold text-warning mb-0">
            ⚜️ لوحة تحكم جوالة علوم عين شمس
          </span>
          {isCloudEnabled ? (
            <span className="badge bg-success px-3 py-2">
              <i className="bi bi-cloud-check-fill me-1"></i>
              {isSyncing ? "جاري المزامنة..." : "متصل بـ JSONBin السحابي (تحديث للجميع)"}
            </span>
          ) : (
            <span className="badge bg-warning text-dark px-3 py-2">
              <i className="bi bi-exclamation-triangle-fill me-1"></i>
              وضع محلي فقط (أضف مفاتيح JSONBin في .env للتعميم على الجميع)
            </span>
          )}
        </div>

        <div className="d-flex gap-2">
          {isCloudEnabled && (
            <button
              type="button"
              onClick={refreshFromCloud}
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
        {!isCloudEnabled && (
          <div className="alert alert-dark border border-warning text-light mb-4 small">
            <strong className="text-warning">معلومة مهمة للتعميم على كل الناس:</strong> عشان أي تعديل هنا يظهر لكل الزوار على أي جهاز حتى بعد فترات توقف، اربط المشروع بـ <strong>JSONBin.io</strong> بإضافة <code>VITE_JSONBIN_BIN_ID</code> و <code>VITE_JSONBIN_ACCESS_KEY</code> في ملف <code>.env</code> وفي إعدادات Vercel.
          </div>
        )}

        {lastSyncError && (
          <div className="alert alert-danger small mb-4">
            تنبيه المزامنة: {lastSyncError}
          </div>
        )}

        <ul className="nav nav-pills mb-4 gap-2 flex-wrap">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "event" ? "btn-gold text-dark" : "rover-card text-light"}`}
              onClick={() => setActiveTab("event")}
            >
              📅 الأحداث القادمة ({siteData.upcomingEvents.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "gallery" ? "btn-gold text-dark" : "rover-card text-light"}`}
              onClick={() => setActiveTab("gallery")}
            >
              🖼️ إدارة المعرض ({siteData.gallery.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "requests" ? "btn-gold text-dark" : "rover-card text-light"}`}
              onClick={() => setActiveTab("requests")}
            >
              📩 طلبات الانضمام ({siteData.joinRequests.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "branding" ? "btn-gold text-dark" : "rover-card text-light"}`}
              onClick={() => setActiveTab("branding")}
            >
              ⚜️ الشعار وخلفية الهيرو
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
                          setEditEventForm({ ...editEventForm, active: e.target.checked })
                        }
                      />
                      <label className="form-check-label fw-bold">إظهار الحدث في الكتاب</label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">اسم الحدث</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editEventForm.title}
                        onChange={(e) =>
                          setEditEventForm({ ...editEventForm, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">التاريخ والوقت</label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark text-white border-secondary"
                        value={editEventForm.date}
                        onChange={(e) =>
                          setEditEventForm({ ...editEventForm, date: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">المكان</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        required
                        value={editEventForm.location}
                        onChange={(e) =>
                          setEditEventForm({ ...editEventForm, location: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">رابط صورة الحدث (صفحة الصورة)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        dir="ltr"
                        required
                        value={editEventForm.image}
                        onChange={(e) =>
                          setEditEventForm({ ...editEventForm, image: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small text-warning">وصف الحدث</label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        required
                        value={editEventForm.description}
                        onChange={(e) =>
                          setEditEventForm({ ...editEventForm, description: e.target.value })
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
                          setNewEventForm({ ...newEventForm, active: e.target.checked })
                        }
                      />
                      <label className="form-check-label fw-bold">إظهار الحدث في قسم الأحداث القادمة</label>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">اسم الحدث</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: معسكر الربيع الكشفي"
                        required
                        value={newEventForm.title}
                        onChange={(e) =>
                          setNewEventForm({ ...newEventForm, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">التاريخ والوقت</label>
                      <input
                        type="datetime-local"
                        className="form-control bg-dark text-white border-secondary"
                        value={newEventForm.date}
                        onChange={(e) =>
                          setNewEventForm({ ...newEventForm, date: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">المكان</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="كلية العلوم - جامعة عين شمس"
                        required
                        value={newEventForm.location}
                        onChange={(e) =>
                          setNewEventForm({ ...newEventForm, location: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label small text-warning">رابط صورة الحدث (صفحة الصورة)</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        dir="ltr"
                        placeholder="https://..."
                        required
                        value={newEventForm.image}
                        onChange={(e) =>
                          setNewEventForm({ ...newEventForm, image: e.target.value })
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
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small text-warning">وصف الحدث</label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        placeholder="تفاصيل الفعالية والبرنامج..."
                        required
                        value={newEventForm.description}
                        onChange={(e) =>
                          setNewEventForm({ ...newEventForm, description: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-gold w-100">
                      + إضافة حدث جديد
                    </button>
                  </form>
                )}

                {eventNotice && (
                  <div className="text-warning small fw-bold text-center mt-3">{eventNotice}</div>
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
                            style={{ width: "68px", height: "68px", objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong className="text-warning">{ev.title}</strong>
                            <span
                              className={`badge ${
                                ev.active !== false ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {ev.active !== false ? "ظاهر" : "مخفي"}
                            </span>
                          </div>
                          <div className="small text-secondary">{ev.location}</div>
                          <div className="small text-light opacity-75">{ev.shortDesc || ev.description}</div>
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
                          onClick={() => deleteUpcomingEvent(ev.id)}
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

        {activeTab === "gallery" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card rover-card p-4">
                <h5 className="fw-bold text-warning mb-2">إضافة فعالية جديدة للمعرض</h5>
                <p className="text-secondary small mb-3">
                  اختر قالباً جاهزاً لتعبئة الحقول بسرعة وعدّله حسب الفعالية، أو اكتب البيانات يدوياً:
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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addGalleryItem(newGallery);
                    setNewGallery({
                      title: "",
                      icon: "🏕️",
                      shortDesc: "",
                      details: "",
                      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
                    });
                    setGalleryAdded(true);
                    setTimeout(() => setGalleryAdded(false), 3000);
                  }}
                >
                  <div className="row g-2 mb-2">
                    <div className="col-8">
                      <label className="form-label small text-warning mb-1">عنوان الفعالية</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="مثال: معسكر إعداد القادة"
                        required
                        value={newGallery.title}
                        onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-warning mb-1">أيقونة / إيموجي</label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={newGallery.icon}
                        onChange={(e) => setNewGallery({ ...newGallery, icon: e.target.value })}
                      >
                        <option value="🏕️">🏕️ مخيم</option>
                        <option value="⛺">⛺ خيمة</option>
                        <option value="⛵">⛵ بحري</option>
                        <option value="❤️">❤️ خير</option>
                        <option value="🌙">🌙 إفطار</option>
                        <option value="⚜️">⚜️ شعار</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-warning mb-1">رابط الصورة (URL)</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      dir="ltr"
                      placeholder="https://... أو /rover-logo.svg"
                      required
                      value={newGallery.image}
                      onChange={(e) => setNewGallery({ ...newGallery, image: e.target.value })}
                    />
                  </div>

                  {newGallery.image && (
                    <div className="mb-2 text-center">
                      <img
                        src={newGallery.image}
                        alt="معاينة الصورة"
                        className="img-fluid rounded-3 border border-warning"
                        style={{ maxHeight: "120px", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small text-warning mb-1">وصف مختصر يظهر على الكارت</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="جملة قصيرة تصف الفعالية"
                      required
                      value={newGallery.shortDesc}
                      onChange={(e) => setNewGallery({ ...newGallery, shortDesc: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-warning mb-1">تفاصيل الفعالية الكاملة</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="3"
                      placeholder="اكتب ملخصاً أو تفاصيل إضافية تظهر عند فتح الفعالية"
                      required
                      value={newGallery.details}
                      onChange={(e) => setNewGallery({ ...newGallery, details: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold w-100">
                    + إضافة للمعرض
                  </button>
                  {galleryAdded && (
                    <div className="text-warning small fw-bold text-center mt-2">
                      ✅ تمت إضافة الفعالية للمعرض ومزامنتها!
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
                        <img
                          src={g.image}
                          alt={g.title}
                          className="rounded-2 border border-warning"
                          style={{ width: "56px", height: "56px", objectFit: "cover" }}
                        />
                        <div>
                          <strong className="text-warning">
                            {g.icon} {g.title}
                          </strong>
                          <p className="small text-secondary mb-0">{g.shortDesc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGalleryItem(g.id)}
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
                        <span className="badge bg-warning text-dark">{req.status}</span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm bg-black text-white border-secondary"
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value)}
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
            <div className="col-lg-6">
              <div className="card rover-card p-4 h-100">
                <h5 className="fw-bold text-warning mb-3">تحديث شعار العشيرة (وأيقونة المتصفح)</h5>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateLogoUrl(logoInput);
                    setLogoSaved(true);
                    setTimeout(() => setLogoSaved(false), 3000);
                  }}
                >
                  <label className="form-label">مسار أو رابط صورة الشعار</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary mb-3"
                    dir="ltr"
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    placeholder="/rover-logo.svg أو https://..."
                  />
                  {logoInput && (
                    <div className="mb-3">
                      <img
                        src={logoInput}
                        alt="معاينة الشعار"
                        className="rounded-circle border border-warning"
                        style={{ width: "72px", height: "72px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <button type="submit" className="btn btn-gold px-4">
                    حفظ الشعار
                  </button>
                  {logoSaved && <span className="text-warning fw-bold ms-3">✅ تم تحديث الشعار!</span>}
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card rover-card p-4 h-100">
                <h5 className="fw-bold text-warning mb-3">خلفية قسم اسم العشيرة وزر "انضم إلينا"</h5>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateHeroBackgroundUrl(heroBgInput.trim());
                    setHeroBgSaved(true);
                    setTimeout(() => setHeroBgSaved(false), 3000);
                  }}
                >
                  <label className="form-label">رابط صورة الخلفية (اتركه فارغاً للخلفية الكحلي الافتراضية)</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary mb-3"
                    dir="ltr"
                    value={heroBgInput}
                    onChange={(e) => setHeroBgInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {heroBgInput && (
                    <div className="mb-3">
                      <img
                        src={heroBgInput}
                        alt="معاينة خلفية الهيرو"
                        className="img-fluid rounded-3 border border-warning"
                        style={{ maxHeight: "140px", width: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="d-flex gap-2 flex-wrap">
                    <button type="submit" className="btn btn-gold px-4">
                      حفظ خلفية الهيرو
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-gold btn-sm"
                      onClick={() => {
                        setHeroBgInput("");
                        updateHeroBackgroundUrl("");
                        setHeroBgSaved(true);
                        setTimeout(() => setHeroBgSaved(false), 3000);
                      }}
                    >
                      إزالة الصورة
                    </button>
                  </div>
                  {heroBgSaved && (
                    <div className="text-warning fw-bold small mt-2">✅ تم تحديث خلفية القسم الأول!</div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="text-end mt-4">
          <button onClick={resetToDefault} className="btn btn-outline-gold btn-sm">
            إعادة ضبط البيانات الافتراضية
          </button>
        </div>
      </div>
    </div>
  );
}
