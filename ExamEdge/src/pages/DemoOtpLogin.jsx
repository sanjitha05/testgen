// import { useState } from "react";
// import { supabase } from "../supabaseClient.js";
// import { useParams,useNavigate } from "react-router-dom";
// import "./DemoOtpLogin.css";

// import exams from "../data/exams.json";
// import streams from "../data/streams.json";
// import mockTestsIndex from "../data/mocktests/index.json";

// export default function DemoOtpLogin() {
//   const navigate = useNavigate();
//   const { category } = useParams();
//   const [exam, setExam] = useState("");
//   const [stream, setStream] = useState("");
//   const [testId, setTestId] = useState("");

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Exams filtered by category
//   const examsByCategory = {
//     UG: exams.filter(e => e.category === "UG"),
//     PG: exams.filter(e => e.category === "PG")
//   };

//   // Streams filtered by exam
//   const streamsByExam = streams.filter(s => s.examId === exam);

//   // SEND OTP
//   const sendOtp = async () => {
//     setError("");
//     setLoading(true);

//     const { error } = await supabase.auth.signInWithOtp({
//       email,
//       options: { shouldCreateUser: true }
//     });

//     setLoading(false);

//     if (error) {
//       setError(error.message);
//     } else {
//       setOtpSent(true);
//     }
//   };

// const verifyOtp = async () => {
//   setError("");
//   setLoading(true);

//   const { data, error } = await supabase.auth.verifyOtp({
//     email,
//     token: otp,
//     type: "email"
//   });

//   if (error) {
//     setLoading(false);
//     setError("Invalid or expired OTP");
//     return;
//   }

//   // ✅ user is now authenticated
//   const user = data.user;

//   // 📌 store test attempt details
//   const { error: insertError } = await supabase
//     .from("test_attempts")
//     .insert([
//       {
//         user_id: user.id,
//         name,
//         email,
//         category,          // UG / PG
//         exam,
//         stream: exam === "gate" || exam === "jam" ? stream : null,
//         test_id: testId
//       }
//     ]);

//   if (insertError) {
//     console.error(insertError);
//     setError("Failed to save test details");
//     setLoading(false);
//     return;
//   }

//   setLoading(false);

  
//   // navigate
//   navigate("/instructions", {
//     state: {
//       examId: exam,
//       streamId: exam === "gate" || exam === "jam" ? stream : null,
//       testId: testId
//     }
//   });
// };

// sessionStorage.setItem("candidateName", name.trim() || "Candidate");
// navigate("/instructions", {
//   state: {
//     examId: exam,
//     streamId: (exam === "gate" || exam === "jam") ? stream : null,
//     testId
//   }
// });


//   const availableTests = (() => {
//   if (!exam) return [];

//   // PG exams → stream id is the key
//   if ((exam === "gate" || exam === "jam") && stream) {
//     return mockTestsIndex[stream] || [];
//   }

//   // UG exams → exam id is the key
//   return mockTestsIndex[exam] || [];
// })();


//   return (
//     <div className="otp-page">
//       <div className="otp-card">
//         <h2 className="otp-title">Candidate Login</h2>
//         <p className="otp-subtitle">Secure examination access portal</p>


//         {/* Exam */}
//         <label>Examination</label>
//         <select
//           value={exam}
//           onChange={(e) => {
//             setExam(e.target.value);
//             setStream("");
//             setTestId("");
//           }}

//         >
//           <option value="">-- Select Examination --</option>
//           {category &&
//             examsByCategory[category].map((ex) => (
//               <option key={ex.id} value={ex.id}>
//                 {ex.name}
//               </option>
//             ))}
//         </select>

//         {/* Stream (GATE / JAM only) */}
//         {(exam === "gate" || exam === "jam") && (
//           <>
//             <label>Stream</label>
//             <select
//               value={stream}
//               onChange={(e) => {
//                 setStream(e.target.value);
//                 setTestId("");
//               }}
//             >
//               <option value="">-- Select Stream --</option>
//               {streamsByExam.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.name}
//                 </option>
//               ))}
//             </select>
//           </>
//         )}

//         {/* Test Selection */}
//         {exam && (
//           <>
//             <label>Test</label>
//             <select
//               value={testId}
//               onChange={(e) => setTestId(e.target.value)}
//               disabled={(exam === "gate" || exam === "jam") && !stream}
//             >
//               <option value="">-- Select Test --</option>
//               {availableTests.map(test => (
//                 <option key={test.id} value={test.id}>
//                   {test.name}
//                 </option>
//               ))}
//             </select>
//           </>
//         )}

//         {/* Name */}
//         <label>Full Name</label>
//         <input
//           placeholder="Enter your full name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         {/* Email */}
//         <label>Registered Email</label>
//         <input
//           placeholder="Enter your email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         {/* OTP */}
//         {otpSent && (
//           <>
//             <label>OTP</label>
//             <input
//               className="otp-input"
//               placeholder="Enter 6 digit OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />
//           </>
//         )}

//         {error && <p className="otp-error">{error}</p>}

//         {!otpSent ? (
//           <button
//             className="otp-btn otp-btn-primary"
//             onClick={sendOtp}
//             disabled={
//               loading ||
//               !exam ||
//               !testId ||
//               ((exam === "gate" || exam === "jam") && !stream)
//             }
//           >
//             {loading ? "Sending OTP..." : "Send OTP"}
//           </button>
//         ) : (
//           <button
//             className="otp-btn otp-btn-success"
//             onClick={verifyOtp}
//             disabled={loading}
//           >
//             {loading ? "Verifying..." : "Verify OTP"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [error, setError] = useState("");

  // Exams filtered by category
  const examsByCategory = {
    UG: exams.filter((e) => e.category === "UG"),
    PG: exams.filter((e) => e.category === "PG"),
  };

  // Streams filtered by exam
  const streamsByExam = streams.filter((s) => s.examId === exam);

  // Key to load tests
  const testKey = exam === "gate" || exam === "jam" ? `${exam}-${stream}` : exam;

  const availableTests = (() => {
    if (!exam) return [];
    if ((exam === "gate" || exam === "jam") && stream) return mockTestsIndex[stream] || [];
    return mockTestsIndex[exam] || [];
  })();

  const handleContinue = () => {
    if (!exam || !testId || ((exam === "gate" || exam === "jam") && !stream)) {
      setError("Please select exam, stream (if required) and test.");
      return;
    }
    sessionStorage.setItem("candidateName", name.trim() || "Candidate");
    navigate("/instructions", {
      state: {
        examId: exam,
        streamId: (exam === "gate" || exam === "jam") ? stream : null,
        testId,
      },
    });
  };

  return (
    <div className="otp-page">
      <div className="otp-card">
        <h2 className="otp-title">Candidate Login</h2>
        <p className="otp-subtitle">Secure examination access portal</p>

        <label>Examination</label>
        <select
          value={exam}
          onChange={(e) => {
            setExam(e.target.value);
            setStream("");
            setTestId("");
            setError("");
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

        {(exam === "gate" || exam === "jam") && (
          <>
            <label>Stream</label>
            <select
              value={stream}
              onChange={(e) => {
                setStream(e.target.value);
                setTestId("");
                setError("");
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

        {exam && (
          <>
            <label>Test</label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              disabled={(exam === "gate" || exam === "jam") && !stream}
            >
              <option value="">-- Select Test --</option>
              {availableTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label>Full Name</label>
        <input
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input
          placeholder="Enter your email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="otp-error">{error}</p>}

        <button
          className="otp-btn otp-btn-primary"
          onClick={handleContinue}
          disabled={
            !exam ||
            !testId ||
            ((exam === "gate" || exam === "jam") && !stream)
          }
        >
          Start Test
        </button>

        <button
          className="otp-btn otp-btn-secondary"
          onClick={() =>
            navigate("/instructions", {
              state: {
                examId: exam,
                streamId: (exam === "gate" || exam === "jam") ? stream : null,
                testId,
              },
            })
          }
          disabled={
            !exam ||
            !testId ||
            ((exam === "gate" || exam === "jam") && !stream)
          }
        >
          View Instructions
        </button>
      </div>
    </div>
  );
}
