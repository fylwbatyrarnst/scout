import React, { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

export const DEFAULT_COMMITTEES = [
  {
    id: "com-programs",
    title: "لجنة البرامج والتدريب",
    icon: "bi-journal-check",
    summary: "تصميم البرامج الكشفية، المعسكرات، والورش التدريبية للأعضاء.",
    tasks: [
      "إعداد خطط المعسكرات والرحلات والأنشطة الأسبوعية",
      "تقديم تدريبات المهارات الكشفية والقيادية للجوالين الجدد",
      "متابعة تقييم البرامج وتطوير محتواها باستمرار",
    ],
    skills: ["التخطيط التشغيلي", "الإلقاء والتدريب", "إدارة الوقت", "العمل الجماعي"],
  },
  {
    id: "com-service",
    title: "لجنة خدمة وتنمية المجتمع",
    icon: "bi-globe-americas",
    summary: "قيادة المبادرات التطوعية والعمل الخيري لخدمة الكلية والمجتمع.",
    tasks: [
      "تنظيم حملات التوعية والمبادرات المجتمعية والخيرية",
      "التنسيق مع الجهات والفرق التطوعية لتنفيذ المشاريع الميدانية",
      "نشر ثقافة المسؤولية المجتمعية بين طلاب الكلية",
    ],
    skills: ["إدارة المبادرات", "التواصل المجتمعي", "حل المشكلات", "المرونة الميدانية"],
  },
  {
    id: "com-media",
    title: "لجنة الإعلام والتوثيق",
    icon: "bi-camera-reels-fill",
    summary: "توثيق لحظات العشيرة وصناعة المحتوى البصري والرقمي بأسلوب جذاب.",
    tasks: [
      "تغطية المعسكرات والفعاليات بالصور والفيديو والتقارير",
      "تصميم منشورات وهوية بصرية تعكس روح العشيرة",
      "إدارة المحتوى الرقمي وإبراز أنشطة اللجان",
    ],
    skills: ["صناعة المحتوى", "التصميم والتصوير", "السرد القصصي", "إدارة المنصات"],
  },
  {
    id: "com-logistics",
    title: "لجنة التنظيم والعهدة",
    icon: "bi-box-seam-fill",
    summary: "تجهيز الميدان، إدارة المعدات الكشفية، وضمان انسيابية الفعاليات.",
    tasks: [
      "حصر وصيانة وتجهيز العهدة والمعدات قبل وبعد الفعاليات",
      "تنظيم استقبال المشاركين وترتيب مساحات العمل والميدان",
      "وضع خطط السلامة والجاهزية اللوجستية للأنشطة",
    ],
    skills: ["اللوجستيات", "الدقة والمتابعة", "إدارة المخاطر", "التنسيق الميداني"],
  },
];

export default function Committees({ onOpenJoin }) {
  const { siteData } = useSite();
  const [activeCommittee, setActiveCommittee] = useState(null);

  const committees =
    Array.isArray(siteData?.committees) && siteData.committees.length > 0
      ? siteData.committees
      : DEFAULT_COMMITTEES;

  useEffect(() => {
    if (!activeCommittee) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveCommittee(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCommittee]);

  const tasks = Array.isArray(activeCommittee?.tasks) ? activeCommittee.tasks : [];
  const skills = Array.isArray(activeCommittee?.skills) ? activeCommittee.skills : [];

  return (
    <section id="committees" className="py-5 section-navy">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-5">
            <span className="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-50 px-3 py-2 rounded-pill mb-2">
              🎯 اختر مكانك المناسب
            </span>
            <h2 className="section-title">اللجان النوعية</h2>
            <p className="text-light opacity-75 mx-auto" style={{ maxWidth: "600px" }}>
              كل لجنة ليها دور واضح ومهارات بتصقلها—استعرض المهام واختر اللجنة الأقرب لشغفك
            </p>
          </div>
        </Reveal>

        <div className="row g-4">
          {committees.map((com, idx) => (
            <div key={com?.id || idx} className="col-md-6 col-lg-3">
              <Reveal delay={idx * 90} className="h-100">
                <div className="card h-100 rover-card border-warning border-opacity-25">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-dark fw-bold"
                        style={{ width: "46px", height: "46px", fontSize: "1.25rem" }}
                      >
                        <i className={`bi ${com?.icon || "bi-people-fill"}`}></i>
                      </div>
                      <span className="text-warning small fw-bold opacity-75">
                        0{idx + 1}
                      </span>
                    </div>

                    <h5 className="fw-bold text-white mb-2">{com?.title || ""}</h5>
                    <p className="text-light opacity-75 small lh-lg flex-grow-1 mb-3">
                      {com?.summary || ""}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveCommittee(com)}
                      className="btn btn-gold btn-sm rounded-pill w-100 py-2 fw-bold"
                    >
                      <i className="bi bi-eye-fill me-1"></i>
                      المهام والمهارات
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {activeCommittee && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.78)" }}
            onClick={() => setActiveCommittee(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content rover-modal-content border border-warning border-opacity-50">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title fw-bold text-warning">
                    <i className={`bi ${activeCommittee?.icon || "bi-people-fill"} me-2`}></i>
                    {activeCommittee?.title || ""}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setActiveCommittee(null)}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  {activeCommittee?.summary && (
                    <p className="text-light opacity-75 small mb-4">
                      {activeCommittee.summary}
                    </p>
                  )}

                  <h6 className="fw-bold text-warning mb-2">
                    <i className="bi bi-list-check me-1"></i> أهم المهام:
                  </h6>
                  <ul className="text-light opacity-85 small mb-4 pe-3">
                    {tasks.map((task, idx) => (
                      <li key={idx} className="mb-2">{task}</li>
                    ))}
                  </ul>

                  <h6 className="fw-bold text-warning mb-2">
                    <i className="bi bi-lightning-charge-fill me-1"></i> المهارات المكتسبة:
                  </h6>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {typeof onOpenJoin === "function" && (
                    <button
                      type="button"
                      className="btn btn-gold w-100 rounded-pill py-2 fw-bold"
                      onClick={() => {
                        setActiveCommittee(null);
                        onOpenJoin();
                      }}
                    >
                      قدّم للانضمام لهذه اللجنة الآن
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}