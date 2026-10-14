import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar, Footer } from "./Components";
import { Hero, Services, Projects, Contact } from "./Sections";
import ProjectDetail, { UnknownProject } from "./Pages/ProjectDetail";
import KittenJumpPrivacy from "./Pages/KittenJumpPrivacy";
import PageMetadata from "./Components/PageMetadata";
import { normalizePath } from "./seo";
import "./App.scss";

const StripePreview = import.meta.env.DEV && import.meta.env.VITE_STRIPE_DEMO === "1" ? lazy(() => import("./Pages/StripePreview")) : null;

function Home() {
  return (
    <main id="main">
      <Hero />
      <Projects />
      <Services />
      <Contact />
    </main>
  );
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [location.pathname, location.hash]);

  return null;
}

export function AppContent() {
  const location = useLocation();
  return (
      <div className="App">
        <PageMetadata />
        <ScrollManager />
        <a className="skip-link" href="#main">Skip to content</a>
        <Navbar />
        <Routes location={{ ...location, pathname: normalizePath(location.pathname) }}>
          <Route path="/" element={<Home />} />
          {StripePreview && <Route path="/__stripe-preview" element={<Suspense fallback={<main id="main" className="project-not-found"><div className="container">Loading local Stripe preview…</div></main>}><StripePreview /></Suspense>} />}
          <Route path="/privacy/kitten-jump" element={<KittenJumpPrivacy />} />
          <Route path="/:projectSlug" element={<ProjectDetail />} />
          <Route path="/:projectSlug/:pageSlug" element={<ProjectDetail />} />
          <Route path="*" element={<UnknownProject />} />
        </Routes>
        <Footer />
      </div>
  );
}

function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

export default App;
