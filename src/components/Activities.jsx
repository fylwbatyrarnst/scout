import React from "react";
import { useSite } from "../context/SiteContext";

const DEFAULT_ACTIVITIES = [
  {
    id: "act-camp",
    badge: "خلاء ومغامرة",
    icon: "bi-compass-fill",
    title: "المعسكرات والرحلات الخلوية",
    description:
      "تخييم، قراءة خرائط وبوصلة، نصب خيام، وعقد وربطات تبني الاعتماد على النفس وروح الفريق في قلب الطبيعة.",
  },
  {
    id: "act-service",
    badge: "خدمة مجتمعية",
    icon: "bi-heart-handshake-fill",
    title: "خدمة وتنمية المجتمع",
    description:
      "مبادرات تطوعية وحملات توعية وخدمة عامة داخل الكلية والمجتمع المحيط لغرس قيمة العطاء الحقيقي.",
  },
  {
    id: "act-leadership",
    badge: "بناء قيادات",
    icon: "bi-award-fill",
    title: "التدريب القيادي والمهاري",
    description:
      "ورش عمل في إدارة الفرق، التواصل الفعال، التخطيط، والاتزان الذهني لصناعة قائد كشفي واعي.",
  },
  {
    id: "act-culture",
    badge: "ثقافة وفنون",
    icon: "bi-palette-fill",
    title: "الأنشطة الثقافية والفنية",
    description:
      "فنون كشفية، أشغال يدوية، أمسيات، وفعاليات تجمع بين التقاليد الكشفية وروح الشباب في كلية العلوم.",
  },
];

export default function Activities() {
  const { siteData } = useSite();

  const activities =
    Array.isArray(siteData?.activities) && siteData.activities.length > 0
      ? siteData.activities
      : DEFAULT_ACTIVITIES;

  return (
    <section
      id="activities"
      className="py-5"
      style={{
        background: "linear-gradient(180deg, #070b14 0%, #0d1526 100%)",
        color: "#ffffff",
      }}
    >
      <div className="container py-3">
        <div className="text-center mb-5">
          <span
            className="badge rounded-pill px-3 py-2 mb-2 fw-bold"
            style={{
              backgroundColor: "rgba(255, 193, 7, 0.14)",
              color: "#ffc107",
              border: "1px solid rgba(255, 193, 7, 0.45)",
            }}
          >
            ⚜️ جوالة كلية العلوم - جامعة عين شمس
          </span>
          <h2 className="fw-bold text-white mb-2">مجالات الأنشطة</h2>
          <p className="text-light opacity-75 mx-auto mb-0" style={{ maxWidth: "600px" }}>
            مسارات متنوعة تجمع بين الخلاء، القيادة، والخدمة العامة عشان تلاقي نفسك وتطور مهاراتك
          </p>
        </div>

        <div className="row g-4">
          {activities.map((item, index) => (
            <div key={item?.id || index} className="col-12 col-md-6 col-lg-3">
              <div
                className="card h-100 rounded-4 shadow-lg"
                style={{
                  backgroundColor: "#111b2e",
                  border: "1px solid rgba(255, 193, 7, 0.28)",
                  color: "#ffffff",
                }}
              >
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "rgba(255, 193, 7, 0.14)",
                        color: "#ffc107",
                        fontSize: "1.35rem",
                      }}
                    >
                      <i className={`bi ${item?.icon || "bi-stars"}`}></i>
                    </div>

                    <span
                      className="badge rounded-pill px-3 py-2 small"
                      style={{
                        backgroundColor: "#09101d",
                        color: "#ffc107",
                        border: "1px solid rgba(255, 193, 7, 0.25)",
                      }}
                    >
                      {item?.badge || "مجال كشفي"}
                    </span>
                  </div>

                  <h5 className="fw-bold text-white mb-2">{item?.title || "مجال نشاط"}</h5>
                  <p className="text-light opacity-75 small lh-lg mb-0 flex-grow-1">
                    {item?.description || ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}