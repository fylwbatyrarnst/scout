import React, { useState, useEffect } from "react";
import { useSite } from "../context/SiteContext";
import Reveal from "./Reveal";

function EventCountdown({ targetDate }) {
  const computeLeft = () => {
    const diff = +new Date(targetDate) - +new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [left, setLeft] = useState(computeLeft);

  useEffect(() => {
    setLeft(computeLeft());
    const timer = setInterval(() => {
      setLeft(computeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!left) {
    return (
      <div className="alert alert-warning text-dark d-inline-block px-3 py-2 fw-bold small mb-3">
        🎉 الفعالية جارية الآن أو انتهت مؤخراً!
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap" dir="ltr">
      <div className="countdown-box">
        <span>{String(left.days).padStart(2, "0")}</span>
        <small className="text-secondary">يوم</small>
      </div>
      <div className="countdown-box">
        <span>{String(left.hours).padStart(2, "0")}</span>
        <small className="text-secondary">ساعة</small>
      </div>
      <div className="countdown-box">
        <span>{String(left.minutes).padStart(2, "0")}</span>
        <small className="text-secondary">دقيقة</small>
      </div>
      <div className="countdown-box">
        <span>{String(left.seconds).padStart(2, "0")}</span>
        <small className="text-secondary">ثانية</small>
      </div>
    </div>
  );
}

export default function NextEvent({ onOpenJoin }) {
  const { siteData } = useSite();
  const activeEvents = (siteData.upcomingEvents || []).filter((ev) => ev.active !== false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (pageIndex >= activeEvents.length) {
      setPageIndex(0);
    }
  }, [activeEvents.length, pageIndex]);

  if (activeEvents.length === 0) return null;

  const currentEvent = activeEvents[pageIndex] || activeEvents[0];

  const prevSpread = () => {
    setPageIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length);
  };

  const nextSpread = () => {
    setPageIndex((prev) => (prev + 1) % activeEvents.length);
  };

  return (
    <section id="event" className="py-5 section-dark">
      <div className="container py-3">
        <Reveal>
          <div className="text-center mb-4">
            <h2 className="section-title">الأحداث القادمة</h2>
            <p className="text-light opacity-75 small">
              تصفّح صفحات الأحداث القادمة كأنك تقلّب صفحات كتاب العشيرة
            </p>
          </div>
        </Reveal>

        {activeEvents.length > 1 && (
          <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
            {activeEvents.map((ev, idx) => (
              <button
                key={ev.id || idx}
                type="button"
                onClick={() => setPageIndex(idx)}
                className={`btn btn-sm rounded-pill px-3 ${
                  idx === pageIndex ? "btn-gold" : "btn-outline-gold"
                }`}
              >
                <i className="bi bi-book me-1"></i>
                {ev.title}
              </button>
            ))}
          </div>
        )}

        <Reveal delay={100}>
          <div className="book-spread" key={currentEvent.id || pageIndex}>
            <span className="book-spine-badge">
              <i className="bi bi-journal-bookmark-fill me-1"></i>
              حدث {pageIndex + 1} من {activeEvents.length}
            </span>

            <div className="book-page book-page-right d-flex flex-column justify-content-between text-center text-lg-end">
              <div>
                <div className="d-flex align-items-center justify-content-center justify-content-lg-between mb-3 gap-2">
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                    صفحة التفاصيل • الحدث القادم
                  </span>
                  <small className="text-warning fw-bold">
                    صفحة {pageIndex * 2 + 1}
                  </small>
                </div>

                <h3 className="fw-bold text-white mb-2">{currentEvent.title}</h3>
                <p className="text-light opacity-75 lh-lg mb-3">{currentEvent.description}</p>

                <div className="d-flex flex-column gap-2 text-warning small mb-3">
                  <div>
                    <i className="bi bi-calendar-event me-2"></i>
                    {currentEvent.date
                      ? new Date(currentEvent.date).toLocaleDateString("ar-EG", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "موعد الفعالية قريباً"}
                  </div>
                  <div>
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    {currentEvent.location}
                  </div>
                </div>
              </div>

              <div>
                <EventCountdown targetDate={currentEvent.date} />
                <div className="d-flex justify-content-center justify-content-lg-start gap-2 flex-wrap">
                  <button onClick={onOpenJoin} className="btn btn-gold px-4 py-2 rounded-pill">
                    احجز مكانك الآن
                  </button>
                </div>
              </div>
            </div>

            <div className="book-page book-page-left d-flex flex-column justify-content-between">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-warning fw-bold small">
                  <i className="bi bi-image me-1"></i> صفحة الصورة
                </span>
                <small className="text-warning fw-bold">
                  صفحة {pageIndex * 2 + 2}
                </small>
              </div>

              <div className="book-photo-frame my-auto">
                <img
                  src={
                    currentEvent.image ||
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80"
                  }
                  alt={currentEvent.title}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-warning border-opacity-25">
                <button
                  type="button"
                  onClick={prevSpread}
                  disabled={activeEvents.length <= 1}
                  className="btn btn-outline-gold btn-sm rounded-pill px-3"
                >
                  <i className="bi bi-chevron-right me-1"></i> الصفحة السابقة
                </button>
                <span className="text-secondary small">{currentEvent.title}</span>
                <button
                  type="button"
                  onClick={nextSpread}
                  disabled={activeEvents.length <= 1}
                  className="btn btn-outline-gold btn-sm rounded-pill px-3"
                >
                  الصفحة التالية <i className="bi bi-chevron-left ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
