import React, { useState } from "react";
import { useSite } from "../context/SiteContext";

export default function JoinModal({ show, onClose }) {
  const { addJoinRequest, siteData } = useSite();
  const [form, setForm] = useState({
    name: "",
    year: "الفرقة الأولى",
    phone: "",
    committee: "لجنة الميديا",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addJoinRequest(form);
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setForm({ name: "", year: "الفرقة الأولى", phone: "", committee: "لجنة الميديا" });
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rover-modal-content shadow">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold text-warning">⚜️ انضم لعشيرة جوالة علوم عين شمس</h5>
            <button type="button" className="btn-close btn-close-white" onClick={resetAndClose}></button>
          </div>

          <div className="modal-body p-4">
            {submitted ? (
              <div className="text-center py-4">
                <div className="display-3 text-warning mb-3">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h4 className="fw-bold text-white mb-2">تم تسجيل طلب انضمامك بنجاح!</h4>
                <p className="text-light opacity-75 mb-4">
                  أهلاً بك في عائلة جوالة كلية العلوم. سيتواصل معك فريق السكرتارية عبر واتساب قريباً.
                </p>
                <button onClick={resetAndClose} className="btn btn-gold px-5 rounded-pill">
                  تمام
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">الاسم الثلاثي</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="اكتب اسمك بالكامل"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">الفرقة الدراسية</label>
                  <select
                    className="form-select"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    <option>الفرقة الأولى</option>
                    <option>الفرقة الثانية</option>
                    <option>الفرقة الثالثة</option>
                    <option>الفرقة الرابعة</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">رقم الواتساب</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    placeholder="01xxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-warning">اللجنة المفضلة</label>
                  <select
                    className="form-select"
                    value={form.committee}
                    onChange={(e) => setForm({ ...form, committee: e.target.value })}
                  >
                    {siteData.committees.map((c) => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-gold w-100 py-2 rounded-pill">
                  إرسال الطلب
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
