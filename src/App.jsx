import { Navbar, Footer } from "./Components";
import { Hero, Services, Method, Projects, Team, Contact } from "./Sections";
import "./App.scss";

function App() {
  return (
    <>
      <div className="App">
        <div className="NavbarContainer">
          <Navbar />
        </div>
        <Hero />
        <Services />
        <Method />
        <Projects />
        <Team />
        <Contact />
        <div className="FooterContainer">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
