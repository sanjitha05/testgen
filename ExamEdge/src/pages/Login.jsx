import { Link } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  return (
    <div className="auth-container">
      {/* LEFT IMAGE */}
      <div className="auth-image">
        <h1>ExamEdge</h1>
        <p>Prepare smarter. Crack exams faster.</p>
      </div>

      {/* RIGHT FORM */}
      <div className="auth-form">
        <div className="auth-card">
          <h2>Log in to your account</h2>

          <form>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

            <button type="submit" className="auth-btn">
              Log In
            </button>
          </form>

          <p className="auth-footer">
            New to ExamEdge? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
