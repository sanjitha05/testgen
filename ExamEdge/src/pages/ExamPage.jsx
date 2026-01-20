import { useState,useEffect, useRef } from "react";
import { useNavigate,useParams } from "react-router-dom";
import "./ExamPage.css";

export default function ExamPage() {
  const navigate = useNavigate();
  const { examId,testId } = useParams();

const [testData, setTestData] = useState(null);
const [loading, setLoading] = useState(true);

 const [activeSubjectIndex, setActiveSubjectIndex] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.activeSubjectIndex ?? 0;
  } catch (e) {
    return 0;
  }
});

const [activeSectionIndex, setActiveSectionIndex] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.activeSectionIndex ?? 0;
  } catch (e) {
    return 0;
  }
});

const [currentIndex, setCurrentIndex] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.currentIndex ?? 0;
  } catch (e) {
    return 0;
  }
});
 const [responses, setResponses] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.responses ?? {};
  } catch (e) {
    return {};
  }
});

const [visited, setVisited] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.visited ?? {};
  } catch (e) {
    return {};
  }
});

const [markedForReview, setMarkedForReview] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.markedForReview ?? {};
  } catch (e) {
    return {};
  }
});

const [questionTime, setQuestionTime] = useState(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.questionTime ?? {};
  } catch (e) {
    return {};
  }
});
const [timeLeft, setTimeLeft] = useState(0);

    const getAllQuestionsFromSection = (section) => {
  const flat = [];

  section.questions.forEach(item => {
    // Normal question
    // CORRECT - check if the item is a passage container
if (item.passages && Array.isArray(item.passages)) {
  // Extract all questions from all passages
  item.passages.forEach(passage => {
    if (passage.questions && Array.isArray(passage.questions)) {
      passage.questions.forEach(pq => {
        flat.push({
          ...pq,
          passageId: passage.passage_id,
          passageImgName: passage.passageImgName
        });
      });
    }
  });
} else {
  // Regular question
  flat.push(item);
}
  });

  return flat;
};


const parseMarks = (marks) => {
  // already normalized
  if (typeof marks === "object" && marks !== null) {
    return {
      full: Number(marks.full ?? 4),
      negative: Number(marks.negative ?? 1)
    };
  }

  // string format "4,1"
  if (typeof marks === "string") {
    const [full, negative] = marks.split(",").map(Number);
    return {
      full: full ?? 4,
      negative: negative ?? 1
    };
  }

  // fallback
  return { full: 4, negative: 1 };
};
// initialize with 0

useEffect(() => {
  if (!testData) return;

  const examDurationMinutes = Number(testData[0].Duration || 180); // fallback
  const examDurationSeconds = examDurationMinutes * 60;

  // Only set timeLeft if nothing saved in localStorage
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (saved?.timeLeft != null) {
      setTimeLeft(saved.timeLeft);
    } else {
      setTimeLeft(examDurationSeconds);
    }
  } catch (e) {
    setTimeLeft(examDurationSeconds);
  }
}, [testData, testId]);
  const [tempAnswer, setTempAnswer] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
// Hydration flag to avoid overwriting saved state during initial mount
  const hydrated = useRef(false);
  // localStorage key for in-progress exam state
  const saveKey = `exam_${testId}`;


useEffect(() => {
  if (!testId) return;

  setLoading(true);

  import(`../data/mocktests/${testId}.json`)
    .then(module => {
      setTestData(module.default);
      setLoading(false);
    })
    .catch(err => {
      console.error("Invalid testId:", testId);
      setLoading(false);
    });
}, [testId]);


// Initialize timeLeft with exam duration when testData loads
  useEffect(() => {
    if (!testData || !Array.isArray(testData) || testData.length === 0) return;
    
    const examDurationMinutes = Number(testData[0].Duration);
    const examDurationSeconds = examDurationMinutes * 60;
    
    // Only set if we don't have a saved value
    try {
      const raw = localStorage.getItem(`exam_${testId}`);
      const saved = raw ? JSON.parse(raw) : null;
      if (!saved || saved.timeLeft === undefined) {
        setTimeLeft(examDurationSeconds);
      }
    } catch (e) {
      setTimeLeft(examDurationSeconds);
    }
  }, [testData, testId]);

 
useEffect(() => {
  try {
    const raw = localStorage.getItem(`exam_${testId}`);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved || !testData) return;

    const curS = saved.activeSubjectIndex ?? 0;
    const curSec = saved.activeSectionIndex ?? 0;
    const curIdx = saved.currentIndex ?? 0;
    const curQuestion = testData[curS]?.sections?.[curSec]?.questions?.[curIdx];
    if (curQuestion) {
      const qKey = `${curS}-${curSec}-${curQuestion.question_id}`;
      const restored = saved.responses?.[qKey];

      if (currentQuestion.qtype === "MSQ") {
        setTempAnswer(Array.isArray(restored) ? restored : []);
      } else {
        setTempAnswer(restored ?? null);
      }

      // setTempAnswer(saved.responses?.[qKey] ?? null);
      setCursorPos((saved.responses?.[qKey] ?? "").length);
    }
  } catch (e) {
    // ignore
  }
}, [testId, testData]);

 // -------------------- TIMER --------------------

  useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);


  // -------------------- LOAD SAVED STATE --------------------
  useEffect(() => {
    if (!testData) return;

    try {
      const savedRaw = localStorage.getItem(saveKey);
      if (!savedRaw) {
        hydrated.current = true;
        return;
      }

      const saved = JSON.parse(savedRaw);

      if (saved && saved.testId === testId) {
        setActiveSubjectIndex(saved.activeSubjectIndex ?? 0);
        setActiveSectionIndex(saved.activeSectionIndex ?? 0);
        setCurrentIndex(saved.currentIndex ?? 0);
        setResponses(saved.responses ?? {});
        setVisited(saved.visited ?? {});
        setMarkedForReview(saved.markedForReview ?? {});
        setQuestionTime(saved.questionTime ?? {});
        setTimeLeft(saved.timeLeft ?? timeLeft);

        const curS = saved.activeSubjectIndex ?? 0;
        const curSec = saved.activeSectionIndex ?? 0;
        const curIdx = saved.currentIndex ?? 0;
        const curQuestion = testData[curS]?.sections?.[curSec]?.questions?.[curIdx];
        if (curQuestion) {
          const qKey = `${curS}-${curSec}-${curQuestion.question_id}`;
          const restored = saved.responses?.[qKey];

          if (currentQuestion.qtype === "MSQ") {
            setTempAnswer(Array.isArray(restored) ? restored : []);
          } else {
            setTempAnswer(restored ?? null);
          }

          // setTempAnswer(saved.responses?.[qKey] ?? null);
        }

        setQuestionStartTime(Date.now());
      }

      hydrated.current = true;
    } catch (e) {
      hydrated.current = true;
      console.warn('Failed to load saved exam state:', e);
    }
  }, [testData, testId]);

// Persist progress whenever key pieces of state change (but only after hydration)
useEffect(() => {
  if (!hydrated.current) return; // avoid overwriting saved state during initial load

  try {
    const payload = {
      testId,
      activeSubjectIndex,
      activeSectionIndex,
      currentIndex,
      responses,
      visited,
      markedForReview,
      questionTime,
      timeLeft
    };
    localStorage.setItem(saveKey, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save exam state:', e);
  }
}, [responses, visited, markedForReview, questionTime, timeLeft, activeSubjectIndex, activeSectionIndex, currentIndex, testId]);


useEffect(() => {
    if (!testData) return;

    const activeSubject = testData[activeSubjectIndex];
    if (!activeSubject) return;
    
    const activeSection = activeSubject.sections[activeSectionIndex];
    if (!activeSection) return;
    
    //const currentQuestion = activeSection.questions[currentIndex];
    const questions = activeSection.questions.flatMap(item => {
  // Normal question
  if (!item.passages) {
    return [{ ...item, __passage: null }];
  }

  // Passage-based questions
  return item.passages.flatMap(passage =>
    passage.questions.map(q => ({
      ...q,
      __passage: passage
    }))
  );
});

const safeIndex = Math.min(currentIndex, questions.length - 1);
const currentQuestion = questions[safeIndex];


    if (!currentQuestion) return;

    const prevTime = Date.now() - questionStartTime;
    const prevQKey = getQKey(currentQuestion.question_id);

    setQuestionTime(prev => ({
      ...prev,
      [prevQKey]: (prev[prevQKey] || 0) + Math.floor(prevTime / 1000)
    }));

    // Mark visited
    const qKey = getQKey(currentQuestion.question_id);
    setVisited(prev => ({ ...prev, [qKey]: true }));

    // Restore answer
    const restored = responses[qKey] ?? null;
    setTempAnswer(restored);
    setCursorPos((restored ?? "").length);

    // Reset start time for new question
    setQuestionStartTime(Date.now());
  }, [currentIndex, activeSubjectIndex, activeSectionIndex]);

  // ==================== CONDITIONAL RETURNS (AFTER ALL HOOKS) ====================
  
  if (loading) {
    return <div style={{ padding: 20 }}>Loading test...</div>;
  }

  if (!testData || !Array.isArray(testData) || testData.length === 0) {
    return <div style={{ padding: 20 }}>Test not found</div>;
  }


// ==================== DERIVED VALUES ====================
  
  const examName = testData[0].Test_Name;
  const activeSubject = testData[activeSubjectIndex];
  const activeSection = activeSubject.sections[activeSectionIndex];


const questions = activeSection.questions.flatMap(item => {
  // Normal question
  if (!item.passages) {
    return [{ ...item, __passage: null }];
  }

  // Passage-based questions
  return item.passages.flatMap(passage =>
    passage.questions.map(q => ({
      ...q,
      __passage: passage
    }))
  );
});


  // const questions = activeSection.questions;
const safeIndex = Math.min(currentIndex, questions.length - 1);
const currentQuestion = questions[safeIndex];

  
  const { full: correctMarks, negative: negativeMarks } =
  parseMarks(currentQuestion.marks);


  const getQKey = (questionId) => {
  return `${activeSubjectIndex}-${activeSectionIndex}-${questionId}`;
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const toggleMSQOption = (optionIndex) => {
  setTempAnswer(prev => {
    const arr = Array.isArray(prev) ? [...prev] : [];

    if (arr.includes(optionIndex)) {
      return arr.filter(o => o !== optionIndex);
    }

    return [...arr, optionIndex].sort(); //  SORT HERE
  });
};
const normalizeAnswer = (qtype, answer) => {
  if (qtype === "MSQ") {
    return Array.isArray(answer)
      ? [...answer].sort()
      : [];
  }
  return answer;
};

const resetTempAnswer = () => {
  if (currentQuestion.qtype === "MSQ") {
    setTempAnswer([]);
  } else {
    setTempAnswer(null);
  }
};




  // Immediate persist helper: merges current question's elapsed time before saving
  const persistProgress = (overrides = {}) => {
    try {
      // compute elapsed for the currently active question
      let mergedQuestionTime = { ...questionTime };
      if (currentQuestion) {
        const activeQKey = getQKey(currentQuestion.question_id);
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        // only add elapsed if > 0 to avoid noisy zero writes
        if (elapsed > 0) {
          mergedQuestionTime = {
            ...mergedQuestionTime,
            [activeQKey]: (mergedQuestionTime[activeQKey] || 0) + elapsed
          };
          // reset question start time to avoid double counting
          setQuestionStartTime(Date.now());
          // update in-memory state so UI and other logic see the new value immediately
          setQuestionTime(mergedQuestionTime);
        }
      }

      const payload = {
        testId,
        activeSubjectIndex,
        activeSectionIndex,
        currentIndex,
        responses,
        visited,
        markedForReview,
        questionTime: mergedQuestionTime,
        timeLeft,
        ...overrides
      };

      localStorage.setItem(saveKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist exam state:', e);
    }
  };

  const selectOption = (optionValue) => {
    const qKey = getQKey(currentQuestion.question_id);
    const newResponses = { ...responses, [qKey]: optionValue };
    setTempAnswer(optionValue);

  };


const saveAndNext = () => {
   const qKey = getQKey(currentQuestion.question_id);

   //let newResponses = responses;
    let newResponses = { ...responses };
  let newMarked = { ...markedForReview };
   if (
    tempAnswer !== null &&
    !(Array.isArray(tempAnswer) && tempAnswer.length === 0)
  ) {
    newResponses[qKey] = normalizeAnswer(
      currentQuestion.qtype,
      tempAnswer
    );

    // remove review mark if answered
    delete newMarked[qKey];
  }

  setResponses(newResponses);
  setMarkedForReview(newMarked);

    let newSubjectIndex = activeSubjectIndex;
  let newSectionIndex = activeSectionIndex;
  let newQuestionIndex = currentIndex + 1;
    const currentSectionQuestions = questions;

      if (newQuestionIndex < currentSectionQuestions.length) {
    setCurrentIndex(newQuestionIndex);

    persistProgress({
      responses: newResponses,
      markedForReview: newMarked,
      currentIndex: newQuestionIndex
    });
    return;
  }
  newSectionIndex++;

  if (newSectionIndex < testData[newSubjectIndex].sections.length) {
    setActiveSectionIndex(newSectionIndex);
    setCurrentIndex(0);

    persistProgress({
      responses: newResponses,
      markedForReview: newMarked,
      activeSectionIndex: newSectionIndex,
      currentIndex: 0
    });
    return;
  }

  // 5️⃣ Move to next subject
  newSubjectIndex++;
  newSectionIndex = 0;

  if (newSubjectIndex < testData.length) {
    setActiveSubjectIndex(newSubjectIndex);
    setActiveSectionIndex(0);
    setCurrentIndex(0);

    persistProgress({
      responses: newResponses,
      markedForReview: newMarked,
      activeSubjectIndex: newSubjectIndex,
      activeSectionIndex: 0,
      currentIndex: 0
    });
    return;
  }
   alert(
    "⚠ This is the last question of the test.\nPlease click on Submit to finish the test."
  );

  // Stay on same question, but persist answers
  persistProgress({
    responses: newResponses,
    markedForReview: newMarked
  });

};

const clearResponse = () => {
  const qKey = getQKey(currentQuestion.question_id);

  resetTempAnswer();


  const newResponses = { ...responses };
  delete newResponses[qKey];
  setResponses(newResponses);

  // persist immediately
  persistProgress({ responses: newResponses });
};
const markForReview = () => {
  const qKey = getQKey(currentQuestion.question_id);

  let newResponses = responses;
  if (tempAnswer !== null && tempAnswer !== "") {
    newResponses = { ...responses, [qKey]: normalizeAnswer(currentQuestion.qtype, tempAnswer) };
    setResponses(newResponses);
  }

  const newMarked = { ...markedForReview, [qKey]: true };
  setMarkedForReview(newMarked);

  const nextIndex = Math.min(currentIndex + 1, questions.length - 1);
  setCurrentIndex(nextIndex);
  resetTempAnswer();


  // persist immediately
  persistProgress({ responses: newResponses, markedForReview: newMarked, currentIndex: nextIndex });
};
const getQuestionStatus = (q) => {
  const qKey = `${activeSubjectIndex}-${activeSectionIndex}-${q.question_id}`;

  if (markedForReview[qKey] && responses[qKey] !== undefined) {
    return "review-answered";
  }

  if (markedForReview[qKey]) {
    return "review";
  }

  if (responses[qKey] !== undefined) {
    return "answered";
  }

  if (visited[qKey]) {
    return "visited"; // red
  }

  return "not-visited";
};


const handleSubmitTest = () => {
  const now = Date.now();
  const timeSpent = Math.floor((now - questionStartTime) / 1000);

  const lastQKey = getQKey(currentQuestion.question_id);

  const finalQuestionTime = {
    ...questionTime,
    [lastQKey]: (questionTime[lastQKey] || 0) + timeSpent
  };

  // Build final result data
  const resultData = [];

  testData.forEach((subject, sIdx) => {
    subject.sections.forEach((section, secIdx) => {
      const allQuestions = getAllQuestionsFromSection(section);

      allQuestions.forEach(q => {
        const qKey = `${sIdx}-${secIdx}-${q.question_id}`;

        resultData.push({
          question_id: q.question_id,
          subjectIndex: sIdx,
          sectionIndex: secIdx,
          selectedAnswer: responses[qKey] ?? null,
          timeTaken: finalQuestionTime[qKey] || 0
        });
      });
    });
  });


  const payload = {resultData, responses, questionTime: finalQuestionTime };

  // persist so ResultsPage can reload/refresh safely
  localStorage.setItem(`results_${testId}`, JSON.stringify(payload));

  // clear any in-progress saved exam state
  try { localStorage.removeItem(`exam_${testId}`); } catch (e) {}

  navigate(`/results/${testId}`, { state: payload });

};

const handleKeyPress = (key) => {
  let value = tempAnswer ?? "";
  let pos = cursorPos;

  //  block second decimal point
  if (key === "." && value.includes(".")) return;
  if (key === "-" && value.length > 0) return;

  //  If '.' is first input → convert to '0.'
  if (key === "." && value === "") {
    value = "0.";
    pos = 2;
  }

  //  If '-' is first input
  else if (key === "-" && value === "") {
    value = "-";
    pos = 1;
  }

  //  If '-' then '.' → '-0.'
  else if (key === "." && value === "-") {
    value = "-0.";
    pos = 3;
  }

  //  normal insertion at cursor
  else {
    value =
      value.slice(0, pos) +
      key +
      value.slice(pos);
    pos += 1;
  }

  setTempAnswer(value);
  setCursorPos(pos);
};


const handleBackspace = () => {
  const value = tempAnswer ?? "";
  if (cursorPos === 0) return;

  const newValue =
    value.slice(0, cursorPos - 1) +
    value.slice(cursorPos);

  setTempAnswer(newValue === "" ? null : newValue);
  setCursorPos(cursorPos - 1);
};

const handleClear = () => {
  resetTempAnswer();

  setCursorPos(0);
};

const moveCursor = (direction) => {
  const value = tempAnswer ?? "";
  if (direction === "left" && cursorPos > 0) {
    setCursorPos(cursorPos - 1);
  }
  if (direction === "right" && cursorPos < value.length) {
    setCursorPos(cursorPos + 1);
  }
};

const hasMultipleSections = activeSubject.sections.length > 1;
const showSubjectInPalette = activeSubject.sections.length === 1;

const paletteHeaderText = showSubjectInPalette
  ? activeSubject.SubjectName
  : activeSection.SectionName;





  return (
    <div className="exam-page">
      {/* TOP BAR */}
<div className="top-bar">

        {/* Exam Name */}
    <div className="exam-title">{examName}</div>

    {/* Timer */}
    <div className="exam-timer">
      ⏱ {formatTime(timeLeft)}
    </div>
</div>



  {/* RIGHT STACK */}
  <div className="top-section">
    {/* Subjects */}
    <div className="subject-tabs">
      {testData.map((subject, idx) => (
        <button
          key={idx}
          className={`tab-btn ${idx === activeSubjectIndex ? "active" : ""}`}
          onClick={() => {
            setActiveSubjectIndex(idx);
            setActiveSectionIndex(0);
            setCurrentIndex(0);
            resetTempAnswer();


            // persist immediately
            persistProgress({ activeSubjectIndex: idx, activeSectionIndex: 0, currentIndex: 0 });
          }}
        >
          {subject.SubjectName}
        </button>
      ))}
    </div>

    {/* Sections */}
    {hasMultipleSections && (
    <div className="section-tabs">
      {activeSubject.sections.map((sec, idx) => (
        <button
          key={idx}
          className={`tab-btn small ${idx === activeSectionIndex ? "active" : ""}`}
          onClick={() => {
            setActiveSectionIndex(idx);
            setCurrentIndex(0);
            resetTempAnswer();


             // persist immediately
             persistProgress({ activeSectionIndex: idx, currentIndex: 0 });
          }}
        >
          {sec.SectionName}
        </button>
      ))}
    </div> )} 

  </div>

      {/* BODY */}
      <div className="body">
        {/* QUESTION AREA */}
        <div className="main-question-area">
          <div className="question-header">
            <div>
            Question {currentIndex + 1} 
          </div>
          <div>
             Correct Marks : +{correctMarks} / Negative Marks :  -{negativeMarks}
          </div>
          </div>


          {/* PASSAGE (render once per group) */}
      {currentQuestion.__passage && (
        <div className="passage-box">
          <img
            src={currentQuestion.__passage.passageImgName}
            alt="Passage"
            className="passage-image"
          />
        </div>
      )}


          {/* QUESTION IMAGE OR TEXT */}
          {currentQuestion.questionImgName ? (
            <img
              src={currentQuestion.questionImgName}
              alt="question"
              className="question-image"
            />
          ) : (
            <div className="question-text">{currentQuestion.question}</div>
          )}

{/* OPTIONS */}
{currentQuestion.qtype === "MCQ" && (
  <div className="options">
    {currentQuestion.options.map((opt, idx) => (
      <label
        key={idx}
        className={`option ${
          tempAnswer === opt.option_index ? "selected" : ""
        }`}
      >
        <input
          type="radio"
          name={`question-${currentQuestion.question_id}`}
          checked={tempAnswer === opt.option_index}
          onChange={() => selectOption(opt.option_index)}
        />

        <span className="option-label">
          {opt.option_index.toUpperCase()}.
        </span>

        {opt.optionImgName ? (
          <img
            src={opt.optionImgName}
            alt="option"
            className="option-image"
          />
        ) : (
          <span>{opt.option_text}</span>
        )}
      </label>
    ))}
  </div>
)}

{/* NUMERIC (NAT) */}
{currentQuestion.qtype === "NATI" && (
  <div className="nat-wrapper">

    <div className="nat-label">Enter your answer</div>

  <div className="nat-display">
  {(() => {
    const value = String(tempAnswer ?? "");
    return (
      <>
        {value.split("").map((ch, idx) => (
          <span key={idx} className="nat-char">
            {idx === cursorPos && <span className="caret" />}
            {ch}
          </span>
        ))}
        {cursorPos === value.length && <span className="caret" />}
      </>
    );
  })()}
</div>


    <div className="nat-keypad">
      <button className="key backspace" onClick={handleBackspace}>
        Backspace
      </button>

      <div className="key-grid">
        {[7,8,9,4,5,6,1,2,3].map(num => (
          <button
            key={num}
            className="key"
            onClick={() => handleKeyPress(num)}
          >
            {num}
          </button>
        ))}

        <button className="key" onClick={() => handleKeyPress(0)}>0</button>
        <button className="key" onClick={() => handleKeyPress(".")}>.</button>
        <button className="key" onClick={() => handleKeyPress("-")}>-</button>
      </div>

      <div className="arrow-row">
        <button className="key" onClick={() => moveCursor("left")}>←</button>
        <button className="key" onClick={() => moveCursor("right")}>→</button>
      </div>

      <button className="key clear" onClick={handleClear}>
        Clear All
      </button>
    </div>
  </div>
)}

{currentQuestion.qtype === "MSQ" && (
  <div className="options">
    {currentQuestion.options.map((opt, idx) => {
      const checked = Array.isArray(tempAnswer)
    ? tempAnswer.includes(opt.option_index)
    : false;

      return (
        <label
          key={idx}
          className={`option ${checked ? "selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleMSQOption(opt.option_index)}
          />

          <span className="option-label">
            {opt.option_index.toUpperCase()}.
          </span>

          {opt.optionImgName ? (
            <img
              src={opt.optionImgName}
              alt="option"
              className="option-image"
            />
          ) : (
            <span>{opt.option_text}</span>
          )}
        </label>
      );
    })}
  </div>
)}




       <div className="question-controls">
  <button className="review-btn" onClick={markForReview}>
    Mark for Review and Next
  </button>

  <button className="clear-btn" onClick={clearResponse}>
    Clear Response
  </button>

  <div>
    <button
  className="prev-btn"
  onClick={() => {
    // Check if this is the very first question in entire exam
    if (
      activeSubjectIndex === 0 &&
      activeSectionIndex === 0 &&
      currentIndex === 0
    ) {
      alert("⚠ This is the first question. Previous is not available.");
      return;
    }

    let newSubjectIndex = activeSubjectIndex;
    let newSectionIndex = activeSectionIndex;
    let newQuestionIndex = currentIndex - 1;

    // Move to previous section if needed
    if (newQuestionIndex < 0) {
      newSectionIndex--;

      if (newSectionIndex < 0) {
        newSubjectIndex--;
        newSectionIndex =
          testData[newSubjectIndex].sections.length - 1;
      }

      const prevSection =
        testData[newSubjectIndex].sections[newSectionIndex];

      const prevQuestions = prevSection.questions.flatMap(item =>
        item.passages
          ? item.passages.flatMap(p => p.questions)
          : [item]
      );

      newQuestionIndex = prevQuestions.length - 1;
    }

    setActiveSubjectIndex(newSubjectIndex);
    setActiveSectionIndex(newSectionIndex);
    setCurrentIndex(newQuestionIndex);

    persistProgress({
      activeSubjectIndex: newSubjectIndex,
      activeSectionIndex: newSectionIndex,
      currentIndex: newQuestionIndex
    });
  }}
>
  Previous
</button>

    {/* <button
      className="prev-btn"
      onClick={() => {
        const prevIdx = Math.max(currentIndex - 1, 0);
        // mark visited for the target question
        const q = questions[prevIdx];
        const qKey = `${activeSubjectIndex}-${activeSectionIndex}-${q.question_id}`;
        const newVisited = { ...visited, [qKey]: true };
        setVisited(newVisited);
        setCurrentIndex(prevIdx);
        persistProgress({ currentIndex: prevIdx, visited: newVisited });
      }}
    >
      Previous
    </button> */}

    <button
      className="next-btn"
      onClick={saveAndNext}
    >
      Save & Next
    </button>
  </div>
</div>

        </div>

        {/* QUESTION PALETTE */}
        <div className="question-palette">
          <div className="palette-header">
            {paletteHeaderText}
          </div>

          {/* <div className="palette-header">{activeSection.SectionName}</div> */}

          <div className="questions-grid">
            {questions.map((q, idx) => (
              <button
                key={idx}
                className={`q-btn ${getQuestionStatus(q)} ${
                  idx === currentIndex ? "current" : ""
                }`}
                onClick={() => {
                  const qKey = `${activeSubjectIndex}-${activeSectionIndex}-${q.question_id}`;
                  const newVisited = { ...visited, [qKey]: true };
                  setVisited(newVisited);
                  setCurrentIndex(idx);
                  // restore temp answer for that question
                  setTempAnswer(responses[qKey] ?? null);
                  persistProgress({ visited: newVisited, currentIndex: idx });
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button className="submit-btn" onClick={handleSubmitTest}>Submit Test</button>
        </div>
      </div>
    </div>
  );
}