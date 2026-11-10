import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteProvider, useSite } from "./context/SiteContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";

function FaviconSync() {
  const { siteData } = useSite();

  useEffect(() => {
    const logoHref = siteData?.logoUrl || "/rover-logo.svg";
    let iconLink = document.getElementById("dynamic-favicon");
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.id = "dynamic-favicon";
      iconLink.rel = "icon";
      document.head.appendChild(iconLink);
    }
    iconLink.href = logoHref;

    let appleLink = document.getElementById("dynamic-apple-icon");
    if (appleLink) {
      appleLink.href = logoHref;
    }
  }, [siteData?.logoUrl]);

  return null;
}

export default function App() {
  return (
    <SiteProvider>
      <FaviconSync />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
