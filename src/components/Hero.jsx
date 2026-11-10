import React, { useState, useEffect } from "react";

export default function Hero({
  onOpenJoin,
  logoUrl = "/rover-logo.svg",
  backgroundUrl = "",
}) {
  const [imgError, setImgError] = useState(false);
  const [bgError, setBgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  useEffect(() => {
    setBgError(false);
  }, [backgroundUrl]);

  const hasCustomBg = Boolean(backgroundUrl && backgroundUrl.trim() && !bgError);

  return (
    <section id="home" className="hero-section text-center">
      {hasCustomBg && (
        <>
          <div
            className="hero-bg-image"
            style={{ backgroundImage: `url("${backgroundUrl}")` }}
          />
          <img
            src={backgroundUrl}
            alt=""
            className="d-none"
            onError={() => setBgError(true)}
          />
        </>
      )}
      <div className="hero-bg-overlay" />

      <div className="container hero-content animate-fade-up">
        <div className="hero-emblem-box" aria-label="شعار عشيرة جوالة كلية العلوم">
          {!imgError && logoUrl ? (
            <img
              src={logoUrl}
              alt="شعار عشيرة جوالة كلية العلوم - جامعة عين شمس"
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ fontSize: "3.3rem", lineHeight: 1 }}>⚜️</span>
          )}
        </div>

        <div className="hero-badge mb-3">
          لجنة الجوالة والخدمة العامة • اتحاد طلاب كلية العلوم
        </div>

        <h1 className="display-4 fw-bold mb-3">
          عشيرة جوالة كلية العلوم
          <span className="d-block text-warning fs-2 mt-2">جامعة عين شمس</span>
        </h1>

        <p className="lead text-light opacity-85 mx-auto mb-4" style={{ maxWidth: "660px" }}>
          نبني القادة... ونخدم المجتمع. رحلة كشفية تجمع بين العمل التطوعي، مهارات الخلاء، وروح الفريق داخل كلية العلوم.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button onClick={onOpenJoin} className="btn btn-gold btn-lg px-5 rounded-pill">
            انضم إلينا
          </button>
          <a href="#about" className="btn btn-outline-gold btn-lg px-4 rounded-pill">
            تعرف علينا
          </a>
        </div>
      </div>
    </section>
  );
}
