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
      {/* LEFT SIDEBAR */}
      <aside className="solutions-sidebar">
        <select
        className="subject-select"
          value={activeSubjectIndex}
          onChange={(e) => {
            setActiveSubjectIndex(Number(e.target.value));
            setActiveSectionIndex(0);
            setActiveQuestionIndex(0);
          }}
        >
          {testData.map((s, i) => (
            <option key={i} value={i}>
              {s.SubjectName}
            </option>
          ))}
        </select>

        <div className="question-nav">

          {subject.sections.map((sec, secIdx) => {
  const flatQuestions = getAllQuestionsFromSection(sec);

  return (
    <div key={secIdx}>
      <div className="section-heading">
        {sec.SectionName}
      </div>

      {flatQuestions.map((q, qIdx) => (
        <button
          key={`${q.question_id}-${qIdx}`}
          className={`q-nav-btn ${getStatus(q, secIdx)} ${
            secIdx === activeSectionIndex &&
            qIdx === activeQuestionIndex
              ? "active"
              : ""
          }`}
          onClick={() => {
            setActiveSectionIndex(secIdx);
            setActiveQuestionIndex(qIdx);
          }}
        >
          Question {qIdx + 1}
        </button>
      ))}
    </div>
  );
})}

          {/* {subject.sections.map((sec, secIdx) => (
            <div key={secIdx}>
              <div className="section-heading">
                {sec.SectionName}
              </div>

             

            {flatQuestions.map((q, qIdx) => (
              <button
                key={`${q.question_id}-${qIdx}`}
                className={`q-nav-btn ${getStatus(q, secIdx)} ${
                  secIdx === activeSectionIndex &&
                  qIdx === activeQuestionIndex
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveSectionIndex(secIdx);
                  setActiveQuestionIndex(qIdx);
                }}
              >
                Question {qIdx + 1}
              </button>
            ))}


              {/* {sec.questions.map((q, qIdx) => (
                <button
                  key={q.question_id}
                  className={`q-nav-btn ${getStatus(q, secIdx)} ${
                    secIdx === activeSectionIndex &&
                    qIdx === activeQuestionIndex
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveSectionIndex(secIdx);
                    setActiveQuestionIndex(qIdx);
                  }}
                >
                  Question {qIdx + 1}
                </button>
              ))} */}
           
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="solutions-content">
        <h3>
          Question {activeQuestionIndex + 1} •{" "}
          {userAnswer == null
          ? "Unattempted"
          : isCorrectAnswer(userAnswer, correctAnswer, question.qtype)
          ? "Correct"
          : "Incorrect"}

        </h3>

        {/* PASSAGE / PARAGRAPH */}
        {question.passageImgName && (
          <div className="passage-block">
            <h4>Read the passage carefully:</h4>
            <img
              src={question.passageImgName}
              alt="passage"
              className="passage-image"
            />
          </div>
        )}


        {/* QUESTION IMAGE */}
        {question.questionImgName && (
          <img
            src={question.questionImgName}
            alt="question"
            className="question-image"
          />
        )}


         {Array.isArray(question.options) && question.options.length > 0 && (
           <div className="optionss">
             {question.options.map((opt) => {
          const userSet =
            question.qtype === "MSQ"
              ? normalizeMSQ(userAnswer)
              : [String(userAnswer).toLowerCase()];

          const correctSet = normalizeMSQ(question.answer);

          const isUser = userSet.includes(String(opt.option_index).toLowerCase());
          const isCorrect = correctSet.includes(String(opt.option_index).toLowerCase());

          const cls = [
            "option",
            isUser && isCorrect ? "selected-correct" : "",
            isUser && !isCorrect ? "selected-wrong" : "",
            !isUser && isCorrect ? "correct-unselected" : ""
          ].join(" ");

          return (
            <label key={opt.option_id} className={cls}>
              <div className="optionn-main">
                <input
                  type={question.qtype === "MSQ" ? "checkbox" : "radio"}
                  checked={isUser}
                  readOnly
                />

                {opt.optionImgName ? (
                  <img src={opt.optionImgName} alt="option" />
                ) : (
                  <span>{opt.optionText ?? opt.option_caption}</span>
                )}
              </div>
            </label>
          );
        })}

           </div>
         )}


        {/* ANSWER BOXES */}
        <div className="answer-boxes">
          <div className="answer-box user">
            <h4>Your Answer</h4>
            <p>{formatAnswer(userAnswer, question.qtype)}</p>
          </div>

          <div className="answer-box correct">
            <h4>Correct Answer</h4>
            <p>{formatAnswer(correctAnswer, question.qtype)}</p>
          </div>
        </div>

        {/* SOLUTION IMAGE */}
        {question.solution && (
          <div className="solution-block">
            <h4>Step-by-Step Solution</h4>
            <img
              src={question.solution}
              alt="solution"
              className="solution-image"
            />
          </div>
        )}

        {question.vsoln && (
              <div className="video-solution-label">Video Solution</div>

        )}
        {question.vsoln && (
          <div
            className="video-thumb"
            role="button"
           tabIndex={0}
            onClick={() => {
              setVideoSrc(getEmbedUrl(question.vsoln));
              setShowVideo(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && (setVideoSrc(getEmbedUrl(question.vsoln)), setShowVideo(true))}
            aria-label="Watch video solution"
          >
            {getVideoThumbnail(question.vsoln) ? (
              <img
                src={getVideoThumbnail(question.vsoln)}
                alt="video thumbnail"
                className="video-thumb-img"
              />
            ) : (
              <div className="video-thumb-placeholder" aria-hidden="true" />
            )}
            <div className="video-thumb-overlay">
              <div className="video-thumb-play">▶</div>
            </div>
          </div>
          
        )}

 {showVideo && (
          <div className="video-modal" onClick={() => setShowVideo(false)}>
           <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="video-close" onClick={() => setShowVideo(false)}>×</button>
              <div className="video-wrapper">
                <iframe
                  src={videoSrc}
                  title="Video Solution"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

     
