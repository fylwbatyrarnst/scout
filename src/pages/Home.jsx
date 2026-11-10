import React, { useState } from "react";
import { useSite } from "../context/SiteContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import NextEvent from "../components/NextEvent";
import Gallery from "../components/Gallery";
import Activities from "../components/Activities";
import Committees from "../components/Committees";
import JoinModal from "../components/JoinModal";
import BadenPowellBot from "../components/BadenPowellBot";
import Footer from "../components/Footer";

export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);
  const { siteData } = useSite();

  return (
    <>
      <Navbar onOpenJoin={() => setJoinOpen(true)} />
      <Hero
        onOpenJoin={() => setJoinOpen(true)}
        logoUrl={siteData?.logoUrl || "/rover-logo.svg"}
        backgroundUrl={siteData?.heroBackgroundUrl || ""}
      />
      <About />
      <NextEvent onOpenJoin={() => setJoinOpen(true)} />
      <Gallery />
      <Activities />
      <Committees />
      <Footer />
      <JoinModal show={joinOpen} onClose={() => setJoinOpen(false)} />
      <BadenPowellBot />
    </>
  );
}
