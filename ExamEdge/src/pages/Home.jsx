import "./Home.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

import heroImg from "../assets/home_img_bg.png";
import ug from "../assets/ug.png"
import pg from "../assets/pg.png"

import feature1 from "../assets/smart_learningg.png";
import feature2 from "../assets/testss.png";
import feature3 from "../assets/instructorss.png";
import feature4 from "../assets/performancee.png";
import feature5 from "../assets/questionss.png";
import feature6 from "../assets/doubtss.png";

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
            Learn Smart   &   Rank Higher<br />
            <span>For Undergraduates  <br/>Postgraduates</span>
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

      {/* UG / PG ALTERNATING SECTION */}
<section className="programs-alt">

  {/* UG */}
  <div className="program-row">
    <div className="program-image">
      <img src={ug} alt="UG students" />
    </div>

    <div className="program-content">
      <h3>UG Entrance Exams</h3>
      <p className="program-subtitle">
        National-level entrance exams for engineering, medical, and university admissions.
      </p>

      <ul className="program-list">
        <li><strong>JEE Main & Advanced</strong> – IITs, NITs, IIITs</li>
        <li><strong>NEET – UG</strong> – Medical & allied health</li>
        <li><strong>BITSAT</strong> – BITS campuses</li>
        <li><strong>TS & AP EAMCET</strong> – State-level exams</li>
      </ul>

      <button
        className="program-btn"
        onClick={() => navigate("/exams?category=UG")}
      >
        Explore UG Entrance Exams
      </button>
    </div>
  </div>

  {/* PG */}
  <div className="program-row reverse">
    <div className="program-image">
      <img src={pg} alt="PG preparation" />
    </div>

    <div className="program-content">
      <h3>PG Entrance Exams</h3>
      <p className="program-subtitle">
        Postgraduate entrance exams for IITs, IIMs, central universities & research institutes.
      </p>

      <ul className="program-list">
        <li><strong>GATE</strong> – Engineering, science & PSU recruitment</li>
        <li><strong>JAM</strong> – M.Sc. & research (IITs / IISc)</li>
      </ul>

      <button
        className="program-btn"
        onClick={() => navigate("/exams?category=PG")}
      >
        Explore PG Entrance Exams
      </button>
    </div>
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
    We help students crack competitive UG & PG entrance exams through
    expert-led learning, structured preparation, and real exam practice.
  </p>

  <div className="about-stats">
    <div><strong>UG & PG Exams</strong><span>Comprehensive coverage</span></div>
    <div><strong>Expert Faculty</strong><span>Exam-focused teaching</span></div>
    <div><strong>Smart Testing</strong><span>Performance analytics</span></div>
  </div>
</section>

      {/* FOOTER */}
      <footer className="footer">
  <div className="footer-grid">

    <div>
      <h4>eGradTutor</h4>
      <p>
        Learning simplified for UG & PG entrance exams with expert guidance
        and smart practice tools.
      </p>
    </div>

    <div>
      <h4>Programs</h4>
      <ul>
        <li>UG Entrance Exams</li>
        <li>PG Entrance Exams</li>
        <li>Mock Tests</li>
        <li>Performance Analytics</li>
      </ul>
    </div>

    <div>
      <h4>Quick Links</h4>
      <ul>
        <li onClick={() => scrollToSection(aboutRef)}>About Us</li>
        <li onClick={() => navigate("/exams")}>Exams</li>
        <li onClick={() => navigate("/mock-test")}>Mock Test</li>
      </ul>
    </div>

    <div>
      <h4>Contact</h4>
      <p>Email: support@egradtutor.com</p>
      <p>Phone: +91 98765 43210</p>
    </div>

  </div>

  <div className="footer-bottom">
    © 2026 eGradTutor. Learning Simplified.
  </div>
</footer>

    </div>
  );
};

export default Home;
