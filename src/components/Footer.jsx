import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-light pt-5 pb-3 border-top border-warning border-opacity-25">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-md-5">
            <h5 className="fw-bold text-warning mb-3">⚜️ عشيرة جوالة كلية العلوم</h5>
            <p className="text-secondary small lh-lg">
              نشاط طلابي كشفي تابع لاتحاد طلاب كلية العلوم - جامعة عين شمس. نعمل معاً لبناء جيل قيادي يخدم مجتمعه بروح الكشافة.
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold text-warning mb-3">روابط سريعة</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><a href="#home" className="text-secondary text-decoration-none">الرئيسية</a></li>
              <li><a href="#about" className="text-secondary text-decoration-none">من نحن</a></li>
              <li><a href="#gallery" className="text-secondary text-decoration-none">المعرض</a></li>
              <li><a href="#committees" className="text-secondary text-decoration-none">اللجان النوعية</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="fw-bold text-warning mb-3">تواصل معنا</h6>
            <p className="text-secondary small mb-1">
              <i className="bi bi-envelope text-warning me-2"></i> sciencerover@gmail.com
            </p>
            <p className="text-secondary small">
              <i className="bi bi-geo-alt text-warning me-2"></i> كلية العلوم - جامعة عين شمس، القاهرة
            </p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center text-secondary small mb-0">
          جميع الحقوق محفوظة © {currentYear} عشيرة جوالة كلية العلوم - جامعة عين شمس
        </p>
      </div>
    </footer>
  );
}
