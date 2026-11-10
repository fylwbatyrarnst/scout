import React, { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

export default function Gallery() {
  const { siteData } = useSite();
  const items = siteData.gallery || [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (activeIdx >= items.length) {
      setActiveIdx(0);
    }
  }, [items.length, activeIdx]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1 || selectedEvent) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoPlay, items.length, selectedEvent]);

  if (items.length === 0) return null;

  const current = items[activeIdx] || items[0];

  const handleSelect = (idx) => {
    setActiveIdx(idx);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % items.length);
  };

  return (
    <section id="gallery" className="py-5 section-navy">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-4">
            <h2 className="section-title">معرض الفعاليات</h2>
            <p className="text-light opacity-75">
              عرض متحرك لصور الفعاليات يتنقل تلقائياً كل بضع ثوانٍ
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="gallery-stage">
            <div className="gallery-slide-hero mb-3" key={current.id || activeIdx}>
              <img src={current.image} alt={current.title} />

              <div className="gallery-slide-caption d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
                <div>
                  <span className="badge bg-warning text-dark fw-bold mb-2">
                    {current.icon} {current.title}
                  </span>
                  <h4 className="fw-bold text-white mb-1">{current.title}</h4>
                  <p className="text-light opacity-85 small mb-0">{current.shortDesc}</p>
                </div>

                <div className="d-flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    className="btn btn-gold btn-sm rounded-pill px-3"
                    onClick={() => setSelectedEvent(current)}
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-gold btn-sm rounded-pill px-3"
                    onClick={() => setAutoPlay((prev) => !prev)}
                    title={autoPlay ? "إيقاف الحركة التلقائية" : "تشغيل الحركة التلقائية"}
                  >
                    <i className={`bi ${autoPlay ? "bi-pause-fill" : "bi-play-fill"} me-1`}></i>
                    {autoPlay ? "إيقاف" : "تشغيل"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-gold btn-sm rounded-circle"
                    onClick={handlePrev}
                    aria-label="الصورة السابقة"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-gold btn-sm rounded-circle"
                    onClick={handleNext}
                    aria-label="الصورة التالية"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="row g-2">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="col-6 col-md-3">
                  <div
                    className={`gallery-thumb-card p-1 ${idx === activeIdx ? "active" : ""}`}
                    onClick={() => handleSelect(idx)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 rounded-2"
                      style={{ height: "78px", objectFit: "cover" }}
                    />
                    <div className="px-2 py-1 text-center small fw-bold text-warning text-truncate">
                      {item.icon} {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {selectedEvent && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rover-modal-content">
                <div className="modal-header border-secondary">
                  <h5 className="modal-title fw-bold text-warning">
                    {selectedEvent.icon} {selectedEvent.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedEvent(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="img-fluid rounded-3 mb-3 w-100 border border-warning"
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                  />
                  <p className="text-light opacity-75 lh-lg mb-0">{selectedEvent.details}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
