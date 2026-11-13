import React, { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";

const EGYPT_PHONE_REGEX = /^(010|011|012|015)\d{8}$/;
const NAME_CHARS_REGEX = /^[\u0600-\u06FFa-zA-Z\s]+$/;

function validateFullName(rawName) {
  const cleaned = rawName.trim().replace(/\s+/g, " ");
  if (!cleaned) return "من فضلك أدخل الاسم الثلاثي.";
  if (!NAME_CHARS_REGEX.test(cleaned)) {
    return "الاسم يجب أن يحتوي على حروف فقط بدون أرقام أو رموز.";
  }
  const parts = cleaned.split(" ").filter((p) => p.length >= 2);
  if (parts.length < 3) {
    return "من فضلك اكتب الاسم الثلاثي كاملاً (3 أسماء على الأقل، كل اسم حرفان فأكثر).";
  }
  return "";
}

function validatePhone(rawPhone) {
  const digitsOnly = rawPhone.replace(/\D/g, "");
  if (!EGYPT_PHONE_REGEX.test(digitsOnly)) {
    return "أدخل رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ 010 أو 011 أو 012 أو 015.";
  }
  return "";
}

function createChallenge() {
  const a = Math.floor(Math.random() * 6) + 2; // 2..7
  const b = Math.floor(Math.random() * 5) + 1; // 1..5
  return { a, b, answer: String(a + b) };
}

export default function JoinModal({ show, onClose }) {
  const { addJoinRequest, siteData } = useSite();

  const [form, setForm] = useState({
    name: "",
    year: "الفرقة الأولى",
    phone: "",
    committee: "لجنة الميديا",
    website: "", // Honeypot ضد البوتات
  });

  const [challenge, setChallenge] = useState(createChallenge);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [syncWarning, setSyncWarning] = useState("");

  useEffect(() => {
    if (show) {
      setChallenge(createChallenge());
      setCaptchaAnswer("");
      setErrors({});
      setSyncWarning("");
    }
  }, [show]);

  if (!show) return null;

  const validateAll = () => {
    const nextErrors = {};

    if (form.website.trim() !== "") {
      nextErrors.general = "تعذر إرسال الطلب، حاول مرة أخرى.";
    }

    const nameErr = validateFullName(form.name);
    if (nameErr) nextErrors.name = nameErr;

    const phoneErr = validatePhone(form.phone);
    if (phoneErr) nextErrors.phone = phoneErr;

    if (captchaAnswer.trim() !== challenge.answer) {
      nextErrors.captcha = `تأكيد الأمان غير صحيح: ما ناتج ${challenge.a} + ${challenge.b}؟`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateAll()) {
      setChallenge(createChallenge());
      setCaptchaAnswer("");
      return;
    }

    setIsSubmitting(true);
    setSyncWarning("");

    const cleanName = form.name.trim().replace(/\s+/g, " ");
    const cleanPhone = form.phone.replace(/\D/g, "");

    const result = await addJoinRequest({
      name: cleanName,
      year: form.year,
      phone: cleanPhone,
      committee: form.committee,
    });

    setIsSubmitting(false);

    if (result?.cloudError) {
      setSyncWarning(
        "تم حفظ الطلب مؤقتاً، لكن حدثت مشكلة في المزامنة السحابية: " + result.cloudError
      );
    }

    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setSyncWarning("");
    setErrors({});
    setCaptchaAnswer("");
    setChallenge(createChallenge());
    setForm({
      name: "",
      year: "الفرقة الأولى",
      phone: "",
      committee: "لجنة الميديا",
      website: "",
    });
    onClose();
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rover-modal-content shadow">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold text-warning">
              ⚜️ انضم لعشيرة جوالة علوم عين شمس
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={resetAndClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {submitted ? (
              <div className="text-center py-4">
                <div className="display-3 text-warning mb-3">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h4 className="fw-bold text-white mb-2">تم تسجيل طلب انضمامك بنجاح!</h4>
                <p className="text-light opacity-75 mb-3">
                  أهلاً بك في عائلة جوالة كلية العلوم. سيتواصل معك فريق السكرتارية عبر واتساب قريباً.
                </p>
                {syncWarning && (
                  <div className="alert alert-warning text-dark small py-2 mb-3">
                    {syncWarning}
                  </div>
                )}
                <button onClick={resetAndClose} className="btn btn-gold px-5 rounded-pill">
                  تمام
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {errors.general && (
                  <div className="alert alert-danger py-2 small">{errors.general}</div>
                )}

                {/* حقل مخفي للحماية من البوتات */}
                <input
                  type="text"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  style={{ position: "absolute", left: "-9999px", opacity: 0 }}
                />

                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">الاسم الثلاثي</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    required
                    placeholder="مثال: أحمد محمد علي"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block small">{errors.name}</div>
                  )}
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
                    inputMode="numeric"
                    maxLength={11}
                    dir="ltr"
                    className={`form-control text-start ${errors.phone ? "is-invalid" : ""}`}
                    required
                    placeholder="010xxxxxxxx"
                    value={form.phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setForm({ ...form, phone: onlyNums });
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback d-block small">{errors.phone}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-warning">اللجنة المفضلة</label>
                  <select
                    className="form-select"
                    value={form.committee}
                    onChange={(e) => setForm({ ...form, committee: e.target.value })}
                  >
                    {siteData.committees.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-warning">
                    تأكيد الأمان: ما ناتج {challenge.a} + {challenge.b}؟
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`form-control ${errors.captcha ? "is-invalid" : ""}`}
                    required
                    placeholder="اكتب الناتج هنا"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value.replace(/\D/g, ""));
                      if (errors.captcha) setErrors({ ...errors, captcha: "" });
                    }}
                  />
                  {errors.captcha && (
                    <div className="invalid-feedback d-block small">{errors.captcha}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-gold w-100 py-2 rounded-pill"
                >
                  {isSubmitting ? "جاري إرسال الطلب..." : "إرسال الطلب"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}