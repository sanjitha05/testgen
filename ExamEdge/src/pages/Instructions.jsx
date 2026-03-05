import React, { useState, useEffect } from "react";
import "./Instructions.css";
import { useNavigate, useLocation } from "react-router-dom";
import exams from "../data/exams.json"; 
import streams from "../data/streams.json";
import useDisableBackButton from "../components/useDisableBackButton";

const Instructions = ({ showStartButton = true }) => {
  const navigate = useNavigate();
  useDisableBackButton();
  const location = useLocation();

  // Get IDs from location.state or sessionStorage
  const [ids, setIds] = useState(() => {
    const stateIds = location.state || {};
    if (stateIds.examId && stateIds.testId) {
      // Save to sessionStorage if present in state
      sessionStorage.setItem("examId", stateIds.examId);
      sessionStorage.setItem("testId", stateIds.testId);
      if (stateIds.streamId) {
        sessionStorage.setItem("streamId", stateIds.streamId);
      } else {
        sessionStorage.removeItem("streamId");
      }
      return stateIds;
    }
    // Fallback to sessionStorage
    return {
      examId: sessionStorage.getItem("examId"),
      testId: sessionStorage.getItem("testId"),
      streamId: sessionStorage.getItem("streamId"),
    };
  });

  const { examId, streamId, testId } = ids;
  const exam = exams.find(e => e.id === examId) ;
  
  if (!exam) {
    return (
      <div className="instructions-wrapper">
        <div className="instructions-card">
         <h1 className="instructions-title">Exam not found</h1>
         <p>Selected exam is invalid or missing.</p>
       </div>
      </div>
    );
  }

  // Get exam pattern based on whether exam has streams
  let pattern = {};
  if (exam.hasStreams && streamId) {
    // For GATE/JAM, find the stream and get its pattern
    const stream = streams.find(s => s.id === streamId && s.examId === examId);
    pattern = stream?.examPattern || {};
  } else {
    // For UG exams, use the exam pattern directly
    pattern = exam.examPattern || {};
  }

  const subjectsAreObjects = Array.isArray(pattern.subjects) && typeof pattern.subjects[0] === "object";


  return (
    <div className="instructions-wrapper">
      <div className="instructions-card">
  <h1 className="instructions-title">Please Read the Instructions Carefully</h1>


   <section className="instructions-section">
          <h2 className="section-title">General Instructions</h2>
          <p className="instruction-note"><strong>Please read the following carefully.</strong></p>
          <ol>
            <li>
              The duration of the examination is <strong>{pattern.duration ?? "as specified"}</strong>. The clock will be set on the server. The countdown timer at the top right-hand corner of your screen displays the time available for you to complete the examination.
            </li>
            <li>
              When the timer reaches zero, the examination will end automatically. You will <strong>NOT</strong> be required to submit your examination.
            </li>
            <li>
              The screen is divided into two panels. The left panel shows the Questions (one at a time) and the narrow panel on the right has the Question Palette and Question numbers.
            </li>
            <li>
              The Question Palette shows the status of each question using one of the following symbols (Not Visited / Not Answered / Answered / Marked). Use 'Mark for Review' if you wish to revisit a question later.
            </li>

             <div className="palette-legendd">
          <h3 className="section-subtitle">Question Palette Legend</h3>
          <div className="palette-item">
            <div className="palette-box not-visited">1</div>
            <div>You have NOT visited the question yet.</div>
          </div>
          <div className="palette-item">
            <div className="palette-box not-answered">2</div>
            <div>You have visited the question and NOT answered the question.</div>
          </div>
          <div className="palette-item">
            <div className="palette-box answered">3</div>
            <div><strong>You have answered the question.</strong> This will be evaluated.</div>
          </div>
          <div className="palette-item">
            <div className="palette-box marked">4</div>
            <div>You have NOT answered the question but marked it for review.</div>
          </div>
          <div className="palette-item">
            <div className="palette-box marked-answered">5</div>
            <div><strong>You have answered the question and marked it for review.</strong> This will also be evaluated.</div>
          </div>
        </div>



            <li>
              Calculators, mobile phones, or any other electronic devices are <strong>NOT permitted</strong>.
            </li>
            <li>
              Once the test is submitted, answers <strong>cannot be changed</strong>.
            </li>
          </ol>
        </section>


        <section className="instructions-section">
          <h2 className="section-title">{exam.name} – Paper Specific Instructions</h2>
            <p>
            This mock test uses the official {exam.name} pattern.
          </p>
          <p> Total marks for the paper: <strong>{pattern.marks ?? "Varies"}</strong>.</p>
          
          <p>
            {pattern.totalQuestions && <>Total questions: <strong>{pattern.totalQuestions}</strong>. </>}
           </p>
  {subjectsAreObjects ? (
            <>
              <h3 className="section-subtitle">Per-subject Breakdown</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>No. of Questions</th>
                      <th>Marks / Question</th>
                      <th>Negative Marking</th>
                      <th>Total Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pattern.subjects.map((subj) =>
                      subj.breakdown.map((b, i) => (
                        <tr key={`${subj.name}-${b.type}-${i}`}>
                          <td>{i === 0 ? subj.name : ""}</td>
                          <td>{b.type}</td>
                          <td>{b.questions}</td>
                          <td>{b.marksPerQuestion ?? subj.marksPerQuestion ?? "-"}</td>
                          <td>{b.negativeMarking ?? pattern.negativeMarking ?? pattern.negitiveMarking ?? "-"}</td>
                          <td>{(b.questions && (b.marksPerQuestion ?? subj.marksPerQuestion)) ? (b.questions * (b.marksPerQuestion ?? subj.marksPerQuestion)) : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            Array.isArray(pattern.subjects) && (
              <p>Subjects: <strong>{pattern.subjects.join(", ")}</strong></p>
            )
          )}
        </section>



           <section className="instructions-section">
          <h2 className="section-title">Marking Scheme</h2>
          {subjectsAreObjects ? (
            <ul>
              <li>Refer to the per-subject table above for question type and marking.</li>
             
            </ul>
          ) : (
            <ul>
              <li>Correct answer marks: <strong>{pattern.marks ? `${pattern.marks / (pattern.totalQuestions || 1)} (approx)` : "Varies"}</strong></li>
              <li>Negative marking: <strong>{pattern.negitiveMarking || pattern.negativeMarking || "As per official notification"}</strong></li>
            </ul>
          )}
        </section>

         <section className="instructions-section">
          <h2 className="section-title">Other Important Instructions</h2>
          <ul>
            <li>
              You can navigate between questions and sections using the Question
              Palette.
            </li>
            <li>
              You may use the <strong>Mark for Review</strong> option to revisit a
              question later.
            </li>
            <li>
              Calculators, mobile phones, or any other electronic devices are
              <strong> NOT permitted</strong>.
            </li>
            <li>
              Once submitted, answers <strong>cannot be changed</strong>.
            </li>
          </ul>
        </section>

        {showStartButton && (

        <div className="instructions-footer">
          <button
            className="start-test-btn"
            onClick={() => {
              try {
              document.documentElement.requestFullscreen?.();
            } catch {}

              navigate("/mock-test", {
                state: { examId, streamId, testId }
              });
            }}
          >
            Start Mock Test
          </button>
        </div>
        )}

      </div>
    </div>
  );
};

export default Instructions;
