import "./Home.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

import heroImg from "../assets/home_imgg.png";
import feature1 from "../assets/smart_learning.jpg";
import feature2 from "../assets/tests.jpg";
import feature3 from "../assets/instructors.jpg";
import feature4 from "../assets/analytics.jpg";
import feature5 from "../assets/questions.jpg";
import feature6 from "../assets/doubt_solving.jpg";

const Home = () => {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home">
      <Navbar
        onAboutClick={() => scrollToSection(aboutRef)}
        onContactClick={() => scrollToSection(contactRef)}
      />

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Your Next Step to <br />
            <span>Exam Success Starts Here</span>
          </h1>
          <p>
            Complete UG & PG entrance exam preparation with expert guidance,
            smart learning tools, and structured test practice.
          </p>

          {/* <div className="hero-actions">
            <button onClick={() => navigate("/exams")}>Explore Exams</button>
            <button className="outline-btn" onClick={() => navigate("/demo")}>Try Demo Test</button>
          </div> */}
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Students learning" />
        </div>
      </section>

      {/* TAGLINE */}
      <section className="tagline">
        <h2>
          One Platform. One Goal. <br />
          <span>Your Entrance Exam Success.</span>
        </h2>
      </section>

      {/* UG / PG */}
      <section className="programs">
      <div className="program-card">
  <h3>UG Entrance Exams</h3>

      <p className="program-subtitle">
        National-level entrance exams for engineering, medical, and university admissions.
      </p>

      <ul className="program-list">
        <li>
          <strong>JEE Main & Advanced     </strong>
          <span>Engineering admissions (IITs, NITs, IIITs)</span>
        </li>
        <li>
          <strong>NEET – UG     </strong>
          <span>Medical and allied health courses</span>
        </li>
        <li>
          <strong>TS & AP EAMCET    </strong>
          <span>State-level engineering entrance exams</span>
        </li>
      </ul>
      <button
        className="program-btn"
        onClick={() => navigate("/exams?category=UG")}
      >
        Explore UG Entrance Exams
      </button>
    </div>
<div className="program-card">
  <h3>PG Entrance Exams </h3>

  <p className="program-subtitle">
    Postgraduate entrance exams for admissions into IITs, IIMs, central universities, and medical institutes.
  </p>

  <ul className="program-list">
    <li>
      <strong>GATE  </strong>
      <span>Engineering, science & PSU recruitment</span>
    </li>
     <li>
      <strong>JAM  </strong>
      <span>M.Sc. & research admissions (IITs / IISc)</span>
    </li>
  </ul>


  <button
    className="program-btn"
    onClick={() => navigate("/exams?category=PG")}
  >
    Explore PG Entrance Exams
  </button>
</div>

      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why Choose eGradTutor</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <img src={feature1} alt="" />
            <h4>Smart Learning</h4>
            <p>Adaptive lessons based on your progress.</p>
          </div>

          <div className="feature-card">
            <img src={feature2} alt="" />
            <h4>Basic to Advanced Tests</h4>
            <p>Step-by-step exam-level practice.</p>
          </div>

          <div className="feature-card">
            <img src={feature3} alt="" />
            <h4>Expert Instructors</h4>
            <p>Learn from experienced faculty.</p>
          </div>

          <div className="feature-card">
            <img src={feature4} alt="" />
            <h4>Performance Analytics</h4>
            <p>Detailed reports & improvement tracking.</p>
          </div>

          <div className="feature-card">
            <img src={feature5} alt="" />
            <h4>Previous Year Questions</h4>
            <p>Exam-pattern based PYQs.</p>
          </div>

          <div className="feature-card">
            <img src={feature6} alt="" />
            <h4>Doubt Solving Sessions</h4>
            <p>Clear concepts with live support.</p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section ref={aboutRef} className="about">
        <h2>About eGradTutor</h2>
        <p>
          eGradTutor is a modern education platform focused on helping students
          crack competitive UG & PG entrance exams with confidence. We blend
          expert teaching, structured content, and technology-driven testing to
          deliver real results.
        </p>
      </section>

      {/* CONTACT */}
      <section ref={contactRef} className="contact">
        <h2>Contact Us</h2>
        <p>Email: support@egradtutor.com</p>
        <p>Phone: +91 98765 43210</p>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 eGradTutor. Learning Simplified.
      </footer>
    </div>
  );
};

export default Home;
