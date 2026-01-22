import { useState,useEffect } from "react";
import { useLocation,useParams } from "react-router-dom";
import "./SolutionsPage.css";

export default function SolutionsPage() {
  
  const { testId } = useParams();
  const location = useLocation();
   const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
     if (!testId) return;

     setLoading(true);

     import(`../data/mocktests/${testId}.json`)
       .then((module) => {
         setTestData(module.default);
         setLoading(false);
       })
       .catch((err) => {
         console.error("Invalid testId:", testId, err);
         setTestData(null);
        setLoading(false);
       });
   }, [testId]);

   const data =
     location.state ??
     JSON.parse(localStorage.getItem(`results_${testId}`) || "null");

   if (!data && !loading)
     return <p>No solutions available for this test.</p>;

   const { responses = {} } = data || {};


  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");

  if (loading || !testData) {
     return <div className="solutions-loading">Loading solutions…</div>;
   }

  const subject = testData[activeSubjectIndex];
  const section = subject.sections[activeSectionIndex];
  const getAllQuestionsFromSection = (section) => {
  const flat = [];

  section.questions.forEach(item => {
    // Passage container
    if (item.passages && Array.isArray(item.passages)) {
      item.passages.forEach(passage => {
        if (Array.isArray(passage.questions)) {
          passage.questions.forEach(q => {
            flat.push({
              ...q,
              passageId: passage.passage_id,
              passageImgName: passage.passageImgName
            });
          });
        }
      });
    } else {
      // Normal question
      flat.push(item);
    }
  });

  return flat;
};
  const questions = getAllQuestionsFromSection(section);
  const question = questions[activeQuestionIndex];

   const normalizeQuestionId = (qid) => {
    if (typeof qid === "string" && qid.startsWith("Q")) {
      return Number(qid.replace("Q", ""));
    }
    return Number(qid);
  };

  const normalizeMSQ = (val) => {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val.map(v => String(v).toLowerCase()).sort();
  }

  if (typeof val === "string") {
    return val
      .split(",")
      .map(v => v.trim().toLowerCase())
      .sort();
  }

  return [];
};

const isCorrectAnswer = (user, correct, qtype) => {
  if (user == null) return false;

  if (qtype === "MSQ") {
    const u = normalizeMSQ(user);
    const c = normalizeMSQ(correct);
    return u.length === c.length && u.every((v, i) => v === c[i]);
  }

  return String(user).toLowerCase() === String(correct).toLowerCase();
};

const formatAnswer = (val, qtype) => {
  if (!val) return "Not Attempted";

  if (qtype === "MSQ") {
    return normalizeMSQ(val).join(", ").toUpperCase();
  }

  return String(val).toUpperCase();
};



  // ---------- RESPONSE KEY ----------
  const getQKey = (sectionIndex, qid) =>
    `${activeSubjectIndex}-${sectionIndex}-${normalizeQuestionId(qid)}`;

  const correctAnswer = question.answer;
  const userAnswer =
    responses[getQKey(activeSectionIndex, question.question_id)];

  // ---------- STATUS ----------
  // const getStatus = (q, sectionIndex) => {
  //   const qKey = getQKey(sectionIndex, q.question_id);
  //   const userAns = responses[qKey];

  //   if (!userAns) return "unattempted";
  //   if (userAns === q.answer) return "correct";
  //   return "wrong";
  // };
const getStatus = (q, sectionIndex) => {
  const qKey = getQKey(sectionIndex, q.question_id);
  const userAns = responses[qKey];

  if (userAns == null) return "unattempted";

  return isCorrectAnswer(userAns, q.answer, q.qtype)
    ? "correct"
    : "wrong";
};

    

  const getYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return v;
        const parts = u.pathname.split("/");
        const embedIndex = parts.indexOf("embed");
        if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      }
    } catch (e) {}
    return null;
 };

  const getVideoThumbnail = (url) => {
    const id = getYouTubeId(url);
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    return null; // fallback handled in UI
  };

  const getEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
        if (u.pathname.includes("/embed/")) return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  
  // const data = location.state ?? JSON.parse(localStorage.getItem(`results_${testId}`) || "null");
  // if (!data) return <p>No solutions available for this test.</p>;

  // const { resultData, responses } = data;

  // ---------- NORMALIZE QID ----------
 

  return (
    <div className="solutions-page">
      <header className="top-bar">
        <div className="exam-title">
          {testId.replace(/_/g, " ").toUpperCase()} - SOLUTIONS
        </div>
        <div className="top-bar-right">
          <div className="candidate-info">
            <div className="candidate-details">
              <span className="candidate-name">CANDIDATE NAME</span>
              <span className="subject-name">Subject: {subject.SubjectName}</span>
            </div>
            <div className="candidate-photo">
              👤
            </div>
          </div>
        </div>
      </header>

      <div className="solutions-body">
        {/* MAIN CONTENT (LEFT) */}
        <main className="solutions-content">
          <div className="subject-nav-tabs">
            <div className="subject-tabs">
              {testData.map((s, i) => (
                <button
                  key={i}
                  className={`tab-btn ${i === activeSubjectIndex ? "active" : ""}`}
                  onClick={() => {
                    setActiveSubjectIndex(i);
                    setActiveSectionIndex(0);
                    setActiveQuestionIndex(0);
                  }}
                >
                  {s.SubjectName}
                </button>
              ))}
            </div>
          </div>

          <div className="section-nav-info">
            <div className="section-tabs">
              {subject.sections.map((sec, i) => (
                <button
                  key={i}
                  className={`section-tab-btn ${i === activeSectionIndex ? "active" : ""}`}
                  onClick={() => {
                    setActiveSectionIndex(i);
                    setActiveQuestionIndex(0);
                  }}
                >
                  {sec.SectionName}
                </button>
              ))}
            </div>
          </div>

          <div className="question-container">
            <div className="question-header">
              <span className="question-number">Question No. {activeQuestionIndex + 1}</span>
              <div className="question-meta">
                <span className={`status-badge ${userAnswer == null ? "unattempted" : isCorrectAnswer(userAnswer, correctAnswer, question.qtype) ? "correct" : "wrong"}`}>
                  {userAnswer == null ? "Not Attempted" : isCorrectAnswer(userAnswer, correctAnswer, question.qtype) ? "Correct" : "Incorrect"}
                </span>
                <span className="q-type">{question.qtype}</span>
              </div>
            </div>

            <div className="question-scroll-area">
              {/* PASSAGE / PARAGRAPH */}
              {question.passageImgName && (
                <div className="passage-block">
                  <img src={question.passageImgName} alt="passage" className="passage-image" />
                </div>
              )}

              {/* QUESTION IMAGE */}
              {question.questionImgName && (
                <img src={question.questionImgName} alt="question" className="question-image" />
              )}

              {Array.isArray(question.options) && question.options.length > 0 && (
                <div className="options-container">
                  {question.options.map((opt) => {
                    const userSet = question.qtype === "MSQ" ? normalizeMSQ(userAnswer) : [String(userAnswer).toLowerCase()];
                    const correctSet = normalizeMSQ(question.answer);
                    const isUser = userSet.includes(String(opt.option_index).toLowerCase());
                    const isCorrect = correctSet.includes(String(opt.option_index).toLowerCase());

                    let optionClass = "option-item";
                    if (isUser && isCorrect) optionClass += " correct-choice";
                    else if (isUser && !isCorrect) optionClass += " wrong-choice";
                    else if (!isUser && isCorrect) optionClass += " missed-correct";

                    return (
                      <div key={opt.option_id} className={optionClass}>
                        <div className="option-marker">
                          <input type={question.qtype === "MSQ" ? "checkbox" : "radio"} checked={isUser} readOnly />
                        </div>
                        <div className="option-content">
                          {opt.optionImgName ? <img src={opt.optionImgName} alt="option" /> : <span>{opt.optionText ?? opt.option_caption}</span>}
                        </div>
                        {isUser && isCorrect && <span className="choice-label correct">Your Correct Answer</span>}
                        {isUser && !isCorrect && <span className="choice-label wrong">Your Wrong Answer</span>}
                        {!isUser && isCorrect && <span className="choice-label actual">Correct Answer</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SOLUTION SECTION */}
              <div className="solution-section">
                <h4 className="solution-title">Step-by-Step Solution</h4>
                <div className="answer-summary">
                  <div className="summary-item">
                    <span className="label">Your Answer:</span>
                    <span className={`value ${userAnswer == null ? "" : isCorrectAnswer(userAnswer, correctAnswer, question.qtype) ? "text-success" : "text-danger"}`}>
                      {formatAnswer(userAnswer, question.qtype)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Correct Answer:</span>
                    <span className="value text-success">{formatAnswer(correctAnswer, question.qtype)}</span>
                  </div>
                </div>

                {question.solution && (
                  <div className="solution-image-container">
                    <img src={question.solution} alt="solution" className="solution-image" />
                  </div>
                )}

                {question.vsoln && (
                  <div className="video-solution-container">
                    <h5 className="video-solution-label">Video Explanation</h5>
                    <div className="video-thumb" onClick={() => { setVideoSrc(getEmbedUrl(question.vsoln)); setShowVideo(true); }}>
                      <img className="video-thumb-img" src={getVideoThumbnail(question.vsoln)} alt="Video solution" />
                      <div className="video-thumb-overlay">
                        <div className="video-thumb-play">▶</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="solutions-footer">
            <button
              className="footer-btn prev"
              disabled={activeQuestionIndex === 0}
              onClick={() => setActiveQuestionIndex(prev => prev - 1)}
            >
              &lt; Previous
            </button>
            <button
              className="footer-btn next"
              disabled={activeQuestionIndex === questions.length - 1}
              onClick={() => setActiveQuestionIndex(prev => prev + 1)}
            >
              Next &gt;
            </button>
          </div>
        </main>

        {/* RIGHT SIDEBAR (PALETTE) */}
        <aside className="solutions-sidebar">
          <div className="palette-header">
            Question Palette
          </div>
          <div className="question-palette">
            {questions.map((q, idx) => (
              <button
                key={q.question_id}
                className={`palette-btn ${getStatus(q, activeSectionIndex)} ${idx === activeQuestionIndex ? "active" : ""}`}
                onClick={() => setActiveQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="palette-legend">
            <div className="legend-item">
              <span className="legend-box correct"></span>
              <span className="legend-text">Correct</span>
            </div>
            <div className="legend-item">
              <span className="legend-box wrong"></span>
              <span className="legend-text">Incorrect</span>
            </div>
            <div className="legend-item">
              <span className="legend-box unattempted"></span>
              <span className="legend-text">Not Attempted</span>
            </div>
          </div>
        </aside>
      </div>

      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-close" onClick={() => setShowVideo(false)}>×</button>
            <div className="video-wrapper">
              <iframe src={videoSrc} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="video-solution"></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

     
