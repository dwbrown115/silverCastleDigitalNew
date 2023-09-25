import { Navbar, Footer } from "./Components";
import { Hero, Services, Projects, Team, Contact } from "./Sections";
import "./App.scss";

function App() {
  return (
    <>
      <div className="App">
        <Navbar />
        <Hero />
        <Services />
        <Projects />
        <Team />
        <Contact />
        <Footer />
      </div>
    </>
  );
}

export default App;
