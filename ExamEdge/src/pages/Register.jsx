import { Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  return (
    <div className="auth-container">
      {/* LEFT IMAGE */}
      <div className="auth-image">
        <h1>ExamEdge</h1>
        <p>Your journey to top ranks starts here.</p>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-form">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="subtitle">Join thousands of students preparing for success</p>

          <form>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

            <button type="submit" className="auth-btn">
              Sign Up
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
