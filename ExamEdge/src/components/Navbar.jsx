import { Link } from "react-router-dom";
import logo from "../assets/HeaderLogo.png"

const Navbar = ({ onAboutClick,onContactClick }) => (
  <nav className="navbar">
    <div className="navbar-logo">
    <img src={logo} alt="eGradtutor Logo"></img>
    </div>
    <div className="navbardiv">
      <Link to="/">Home</Link>
      <Link to="/exams">Exams</Link>
      <div>
        <span onClick={onAboutClick}>About</span>
        </div>
        <div>
        <span onClick={onContactClick}>Contact</span>
      </div>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  </nav>
);

export default Navbar;
