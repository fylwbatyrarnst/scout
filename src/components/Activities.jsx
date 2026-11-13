import React from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

export const DEFAULT_ACTIVITIES = [
  {
    id: "act-camp",
    tag: "مغامرة وخلاء",
    icon: "bi-compass-fill",
    title: "المعسكرات والرحلات الخلوية",
    description:
      "تخييم، قراءة خرائط وبوصلة، نصيب خيام، وعقد وربطات تبني الاعتماد على النفس وروح الفريق في قلب الطبيعة.",
  },
  {
    id: "act-service",
    tag: "أثر مجتمعي",
    icon: "bi-heart-handshake-fill",
    title: "خدمة وتنمية المجتمع",
    description:
      "مبادرات تطوعية وحملات توعية وخدمة عامة داخل الكلية والمجتمع المحيط لغرس قيمة العطاء الحقيقي.",
  },
  {
    id: "act-leadership",
    tag: "بناء قيادات",
    icon: "bi-award-fill",
    title: "التدريب القيادي والمهاري",
    description:
      "ورش عمل في إدارة الفرق، التواصل الفعال، التخطيط، والاتزان الذهني لصناعة قائد كشفي واعي.",
  },
  {
    id: "act-culture",
    tag: "إبداع وهوية",
    icon: "bi-palette-fill",
    title: "الأنشطة الثقافية والفنية",
    description:
      "فنون كشفية، أشغال يدوية، أمسيات، وفعاليات تجمع بين التقاليد الكشفية وروح الشباب في كلية العلوم.",
  },
];

export default function Activities() {
  const { siteData } = useSite();

  const items =
    Array.isArray(siteData?.activities) && siteData.activities.length > 0
      ? siteData.activities
      : DEFAULT_ACTIVITIES;

  return (
    <section id="activities" className="py-5 section-dark position-relative">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-5">
            <span className="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-50 px-3 py-2 rounded-pill mb-2">
              ⚜️ حياة الجوالة في كلية العلوم
            </span>
            <h2 className="section-title">مجالات الأنشطة</h2>
            <p className="text-light opacity-75 mx-auto" style={{ maxWidth: "600px" }}>
              مسارات متنوعة تجمع بين الخلاء، القيادة، والخدمة العامة عشان تلاقي نفسك وتطور قدراتك
            </p>
          </div>
        </Reveal>

        <div className="row g-4">
          {items.map((act, idx) => (
            <div key={act?.id || idx} className="col-md-6 col-lg-3">
              <Reveal delay={idx * 85} className="h-100">
                <div className="card h-100 rover-card border-warning border-opacity-25">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                        style={{ width: "48px", height: "48px", fontSize: "1.35rem" }}
                      >
                        <i className={`bi ${act?.icon || "bi-stars"}`}></i>
                      </div>
                      <span className="badge bg-dark text-warning border border-warning border-opacity-25 rounded-pill px-3 py-2">
                        {act?.tag || "مجال كشفي"}
                      </span>
                    </div>

                    <h5 className="fw-bold text-white mb-2">{act?.title || ""}</h5>
                    <p className="text-light opacity-75 small lh-lg mb-0 flex-grow-1">
                      {act?.description || ""}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}