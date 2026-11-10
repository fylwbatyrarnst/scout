import React from "react";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="py-5 section-navy">
      <div className="container py-4">
        <Reveal>
          <div className="text-center mb-5">
            <h2 className="section-title">من نحن</h2>
          </div>
        </Reveal>
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <Reveal delay={80}>
              <h4 className="fw-bold text-warning mb-3">
                إعداد جيل يمتلك روح القيادة والمسؤولية المجتمعية
              </h4>
              <p className="text-light opacity-75 lh-lg fs-5">
                عشيرة جوالة كلية العلوم بجامعة عين شمس هي نشاط طلابي تابع للجنة الجوالة
                والخدمة العامة باتحاد طلاب كلية العلوم. تستند العشيرة إلى مبادئ الحركة الكشفية،
                وتسعى إلى تنمية مهارات أعضائها وصقل شخصياتهم ليكونوا عناصر مؤثرة وإيجابية في مجتمعهم.
              </p>
              <div className="row g-3 mt-3">
                <div className="col-sm-4">
                  <div className="p-3 stat-box text-center">
                    <h3 className="fw-bold text-warning mb-0">+150</h3>
                    <small className="text-secondary">جوال وجوالة</small>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-3 stat-box text-center">
                    <h3 className="fw-bold text-warning mb-0">4</h3>
                    <small className="text-secondary">لجان نوعية</small>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-3 stat-box text-center">
                    <h3 className="fw-bold text-warning mb-0">+20</h3>
                    <small className="text-secondary">معسكر وفعالية سنوياً</small>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="col-lg-5 text-center">
            <Reveal delay={180}>
              <div className="p-4 rover-card shadow-sm">
                <div className="display-1 mb-3">⚜️</div>
                <h5 className="fw-bold text-warning">وعد الكشافة</h5>
                <p className="text-light opacity-75 fst-italic mb-0">
                  "أعد بشرفي أن أبذل جهدي في أن أقوم بما يجب عليّ نحو الله ثم الوطن، وأن أساعد الناس في جميع الظروف، وأن أعمل بقانون الكشافة."
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
