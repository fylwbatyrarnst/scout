import React from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";

export default function Navbar({ onOpenJoin }) {
  const { siteData } = useSite();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top py-3">
      <div className="container">
        <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#home">
          <img
            src={siteData?.logoUrl || "/rover-logo.svg"}
            alt="شعار العشيرة"
            width="36"
            height="36"
            className="rounded-circle border border-warning"
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-warning">جوالة علوم عين شمس</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
            <li className="nav-item">
              <a className="nav-link" href="#home">الرئيسية</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#about">من نحن</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#event">الأحداث القادمة</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#gallery">المعرض</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#activities">الأنشطة</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#committees">اللجان النوعية</a>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <button onClick={onOpenJoin} className="btn btn-gold px-4 rounded-pill">
              انضم إلينا
            </button>
            <Link
              to="/admin"
              className="btn btn-outline-gold btn-sm d-flex align-items-center"
              title="لوحة التحكم"
            >
              <i className="bi bi-shield-lock"></i>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
