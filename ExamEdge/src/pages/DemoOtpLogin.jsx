import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { useParams,useNavigate } from "react-router-dom";
import "./DemoOtpLogin.css";

import exams from "../data/exams.json";
import streams from "../data/streams.json";
import mockTestsIndex from "../data/mocktests/index.json";

export default function DemoOtpLogin() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [exam, setExam] = useState("");
  const [stream, setStream] = useState("");
  const [testId, setTestId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Exams filtered by category
  const examsByCategory = {
    UG: exams.filter(e => e.category === "UG"),
    PG: exams.filter(e => e.category === "PG")
  };

  // Streams filtered by exam
  const streamsByExam = streams.filter(s => s.examId === exam);

  // Key to load tests
  const testKey =
    exam === "gate" || exam === "jam"
      ? `${exam}-${stream}`
      : exam;


  // SEND OTP
  const sendOtp = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    const path =
  exam === "gate" || exam === "jam"
    ? `/instructions/${exam}/${stream}/${testId}`
    : `/instructions/${exam}/${testId}`;



    setError("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email"
    });

    setLoading(false);

    if (error) {
      setError("Invalid or expired OTP");
    } else {
      navigate(path);
    }
  };
  const availableTests = (() => {
  if (!exam) return [];

  // PG exams → stream id is the key
  if ((exam === "gate" || exam === "jam") && stream) {
    return mockTestsIndex[stream] || [];
  }

  // UG exams → exam id is the key
  return mockTestsIndex[exam] || [];
})();


  return (
    <div className="otp-page">
      <div className="otp-card">
        <h2 className="otp-title">Candidate Login</h2>
        <p className="otp-subtitle">Secure examination access portal</p>


        {/* Exam */}
        <label>Examination</label>
        <select
          value={exam}
          onChange={(e) => {
            setExam(e.target.value);
            setStream("");
            setTestId("");
          }}

        >
          <option value="">-- Select Examination --</option>
          {category &&
            examsByCategory[category].map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
        </select>

        {/* Stream (GATE / JAM only) */}
        {(exam === "gate" || exam === "jam") && (
          <>
            <label>Stream</label>
            <select
              value={stream}
              onChange={(e) => {
                setStream(e.target.value);
                setTestId("");
              }}
            >
              <option value="">-- Select Stream --</option>
              {streamsByExam.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Test Selection */}
        {exam && (
          <>
            <label>Test</label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              disabled={(exam === "gate" || exam === "jam") && !stream}
            >
              <option value="">-- Select Test --</option>
              {availableTests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Name */}
        <label>Full Name</label>
        <input
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <label>Registered Email</label>
        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* OTP */}
        {otpSent && (
          <>
            <label>OTP</label>
            <input
              className="otp-input"
              placeholder="Enter 6 digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </>
        )}

        {error && <p className="otp-error">{error}</p>}

        {!otpSent ? (
          <button
            className="otp-btn otp-btn-primary"
            onClick={sendOtp}
            disabled={
              loading ||
              !exam ||
              !testId ||
              ((exam === "gate" || exam === "jam") && !stream)
            }
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <button
            className="otp-btn otp-btn-success"
            onClick={verifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        )}
      </div>
    </div>
  );
}
