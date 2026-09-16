import { Navbar, Footer } from "./Components";
import { Hero, Services, Projects, Contact } from "./Sections";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <Hero />
        <Projects />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
