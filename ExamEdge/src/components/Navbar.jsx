import { Link } from "react-router-dom";
import logo from "../assets/HeaderLogo.png"

const Navbar = ({ onAboutClick, onContactClick }) => (
  <nav className="navbar">
    <div className="navbar-logo">
      <img src={logo} alt="eGradtutor Logo" />
    </div>
    
    <div className="navbardiv">
      <Link to="/">Home</Link>
      <div onClick={onAboutClick} className="nav-item">About</div>
      <div onClick={onContactClick} className="nav-item">Contact</div>
      <Link to="/exams?category=UG">UG Exams</Link>
      <Link to="/exams?category=PG">PG Exams</Link>
    </div>

    <div className="navbar-auth">
      <Link to="/login" className="login-btn">Log In</Link>
      <Link to="/register" className="register-btn">Sign Up</Link>
    </div>
  </nav>
);

export default Navbar;
