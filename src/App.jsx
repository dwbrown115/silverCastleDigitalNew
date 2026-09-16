import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar, Footer } from "./Components";
import { Hero, Services, Projects, Contact } from "./Sections";
import ProjectDetail from "./Pages/ProjectDetail";
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

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ScrollManager />
        <a className="skip-link" href="#main">Skip to content</a>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:projectSlug" element={<ProjectDetail />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
