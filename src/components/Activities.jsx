import React from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

export default function Activities() {
  const { siteData } = useSite();
  const activities = Array.isArray(siteData?.activities) ? siteData.activities : [];

  return (
    <section id="activities" className="py-5 section-dark">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-5">
            <h2 className="section-title">مجالات الأنشطة</h2>
            <p className="text-light opacity-75">تنوع الأنشطة الكشفية لبناء شخصية متكاملة</p>
          </div>
        </Reveal>

        {activities.length === 0 ? (
          <div className="text-center text-light opacity-75 py-4">
            لا توجد أنشطة مضافة حالياً.
          </div>
        ) : (
          <div className="row g-4">
            {activities.map((act, idx) => (
              <div key={act?.id || idx} className="col-md-6 col-lg-3">
                <Reveal delay={idx * 90} className="h-100">
                  <div className="card h-100 rover-card p-3 text-center">
                    <div className="card-body">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle text-warning border border-warning"
                        style={{
                          width: "66px",
                          height: "66px",
                          fontSize: "1.8rem",
                          backgroundColor: "rgba(212, 175, 55, 0.12)",
                        }}
                      >
                        <i className={`bi ${act?.icon || "bi-stars"}`}></i>
                      </div>
                      <h5 className="fw-bold text-warning mb-2">{act?.title || ""}</h5>
                      <p className="text-light opacity-75 small lh-lg mb-0">
                        {act?.description || ""}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}