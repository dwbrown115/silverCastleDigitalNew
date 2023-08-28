import { Navbar, Footer } from "./Components";
import { Hero, About, Services, Projects, Contact } from "./Sections";
import "./App.scss";

function App() {
  return (
    <>
      <div className="App">
        <div className="NavbarContainer">
          <Navbar />
        </div>
        <div id="Hero" className="PageContainer">
          <div className="HeroContainer">
            <Hero />
          </div>
          <div id="About" className="AboutContainer">
            <About />
          </div>
          <div id="Services" className="ServicesContainer">
            <Services />
          </div>
          <div id="Projects" className="ProjectsContainer">
            <Projects />
          </div>
          <div id="Contact" className="ContactContainer">
            <Contact />
          </div>
        </div>
        <div className="FooterContainer">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
