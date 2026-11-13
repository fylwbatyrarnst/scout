import React, { useState } from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

export default function Committees() {
  const { siteData } = useSite();
  const committees = Array.isArray(siteData?.committees) ? siteData.committees : [];
  const [activeCommittee, setActiveCommittee] = useState(null);

  const tasks = Array.isArray(activeCommittee?.tasks) ? activeCommittee.tasks : [];
  const skills = Array.isArray(activeCommittee?.skills) ? activeCommittee.skills : [];

  return (
    <section id="committees" className="py-5 section-navy">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-5">
            <h2 className="section-title">اللجان النوعية</h2>
            <p className="text-light opacity-75">اختر اللجنة التي تناسب شغفك ومهاراتك</p>
          </div>
        </Reveal>

        {committees.length === 0 ? (
          <div className="text-center text-light opacity-75 py-4">
            لا توجد لجان مضافة حالياً.
          </div>
        ) : (
          <div className="row g-4">
            {committees.map((com, idx) => (
              <div key={com?.id || idx} className="col-md-6 col-lg-3">
                <Reveal delay={idx * 90} className="h-100">
                  <div className="card h-100 rover-card">
                    <div className="card-body d-flex flex-column">
                      <div className="fs-2 text-warning mb-2">
                        <i className={`bi ${com?.icon || "bi-people"}`}></i>
                      </div>
                      <h5 className="fw-bold text-white">{com?.title || ""}</h5>
                      <p className="text-light opacity-75 small flex-grow-1">
                        {com?.summary || ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveCommittee(com)}
                        className="btn btn-gold btn-sm rounded-pill mt-2"
                      >
                        المهام والمهارات
                      </button>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        )}

        {activeCommittee && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rover-modal-content">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title fw-bold text-warning">
                    <i className={`bi ${activeCommittee?.icon || "bi-people"} me-2`}></i>
                    {activeCommittee?.title || ""}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setActiveCommittee(null)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold text-warning mb-2">أهم المهام:</h6>
                  <ul className="text-light opacity-75 mb-4">
                    {tasks.map((task, idx) => (
                      <li key={idx} className="mb-1">{task}</li>
                    ))}
                  </ul>
                  <h6 className="fw-bold text-warning mb-2">المهارات المكتسبة:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="badge bg-warning text-dark px-3 py-2">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}