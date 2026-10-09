import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar, Footer } from "./Components";
import { Hero, Services, Projects, Contact } from "./Sections";
import ProjectDetail from "./Pages/ProjectDetail";
import KittenJumpPrivacy from "./Pages/KittenJumpPrivacy";
import PageMetadata from "./Components/PageMetadata";
import { normalizePath } from "./seo";
import "./App.scss";

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
          <Route path="/privacy/kitten-jump" element={<KittenJumpPrivacy />} />
          <Route path="/:projectSlug" element={<ProjectDetail />} />
          <Route path="/:projectSlug/:pageSlug" element={<ProjectDetail />} />
        </Routes>
        <Footer />
      </div>
  );
}

function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

export default App;
