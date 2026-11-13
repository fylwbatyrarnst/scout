import React from "react";
import { useSite } from "../context/SiteContext";

export const DEFAULT_ACTIVITIES = [
  {
    id: "act-camp",
    badge: "خلاء ومغامرة",
    title: "المعسكرات والرحلات الخلوية",
    description:
      "تخييم، قراءة خرائط وبوصلة، نصب خيام، وعقد وربطات تبني الاعتماد على النفس وروح الفريق في قلب الطبيعة.",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=900&q=80",
  },
  {
    id: "act-service",
    badge: "خدمة مجتمعية",
    title: "خدمة وتنمية المجتمع",
    description:
      "مبادرات تطوعية وحملات توعية وخدمة عامة داخل الكلية والمجتمع المحيط لغرس قيمة العطاء الحقيقي.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=80",
  },
  {
    id: "act-leadership",
    badge: "بناء قيادات",
    title: "التدريب القيادي والمهاري",
    description:
      "ورش عمل في إدارة الفرق، التواصل الفعال، التخطيط، والاتزان الذهني لصناعة قائد كشفي واعي.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80",
  },
  {
    id: "act-culture",
    badge: "ثقافة وفنون",
    title: "الأنشطة الثقافية والفنية",
    description:
      "فنون كشفية، أشغال يدوية، أمسيات، وفعاليات تجمع بين التقاليد الكشفية وروح الشباب في كلية العلوم.",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&q=80",
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
            جوالة كلية العلوم - جامعة عين شمس
          </span>
          <h2 className="fw-bold text-white mb-2">مجالات الأنشطة</h2>
          <p
            className="text-light opacity-75 mx-auto mb-0"
            style={{ maxWidth: "600px" }}
          >
            مسارات متنوعة تجمع بين الخلاء، القيادة، والخدمة العامة عشان تلاقي نفسك وتطور مهاراتك
          </p>
        </div>

        <div className="row g-4">
          {activities.map((item, index) => (
            <div key={item?.id || index} className="col-12 col-md-6 col-lg-3">
              <div
                className="card h-100 rounded-4 overflow-hidden shadow-lg"
                style={{
                  backgroundColor: "#111b2e",
                  border: "1px solid rgba(255, 193, 7, 0.28)",
                  color: "#ffffff",
                }}
              >
                <div
                  className="position-relative"
                  style={{ height: "180px", backgroundColor: "#0a101d" }}
                >
                  {item?.image ? (
                    <img
                      src={item.image}
                      alt={item?.title || "مجال نشاط"}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary small">
                      لا توجد صورة
                    </div>
                  )}
                  <span
                    className="badge rounded-pill px-3 py-2 position-absolute top-0 end-0 m-3 small"
                    style={{
                      backgroundColor: "rgba(9, 16, 29, 0.88)",
                      color: "#ffc107",
                      border: "1px solid rgba(255, 193, 7, 0.35)",
                    }}
                  >
                    {item?.badge || "مجال كشفي"}
                  </span>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="fw-bold text-white mb-2">
                    {item?.title || "مجال نشاط"}
                  </h5>
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