import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ExamPage.css";
import Instructions from "./Instructions";
import useDisableBackButton from "../components/useDisableBackButton";


export default function ExamPage() {
  useDisableBackButton();
  const navigate = useNavigate();
  const location = useLocation();
  const MAX_FULLSCREEN_EXITS = 2;

const [fullscreenExitCount, setFullscreenExitCount] = useState(() => {
  const saved = sessionStorage.getItem("fs_exit_count");
  return saved ? Number(saved) : 0;
});

const [showFsWarning, setShowFsWarning] = useState(false);

  // Get IDs from location.state or sessionStorage
  const [ids] = useState(() => {
    const stateIds = location.state || {};
    if (stateIds.examId && stateIds.testId) {
      sessionStorage.setItem("examId", stateIds.examId);
      sessionStorage.setItem("testId", stateIds.testId);
      if (stateIds.streamId) {
        sessionStorage.setItem("streamId", stateIds.streamId);
      } else {
        sessionStorage.removeItem("streamId");
      }
      return stateIds;
    }
    return {
      examId: sessionStorage.getItem("examId"),
      testId: sessionStorage.getItem("testId"),
      streamId: sessionStorage.getItem("streamId"),
    };
  });

  const { examId, testId } = ids;
  const [showInstructions, setShowInstructions] = useState(false);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const raw = sessionStorage.getItem(`exam_${testId}`);
  const saved = raw ? JSON.parse(raw) : null;
 // const [candidateName,setCandidateName]=useState("");
  const [candidateName,setCandidateName] = useState(() => sessionStorage.getItem("candidateName") || "Candidate");


  const [activeSubjectIndex, setActiveSubjectIndex] = useState(saved?.activeSubjectIndex || 0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(saved?.activeSectionIndex || 0);
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex || 0);
  const [responses, setResponses] = useState(saved?.responses || {});
  const [visited, setVisited] = useState(saved?.visited || {});
  const [markedForReview, setMarkedForReview] = useState(saved?.markedForReview || {});
  const [questionTime, setQuestionTime] = useState(saved?.questionTime || {});
const hasStarted = useRef(false);
const handleSubmitRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0);
    const [paperCompletedInfo, setPaperCompletedInfo] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const handleRequestFullscreen = () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {
          console.warn("Fullscreen request failed.");
        });
      }
    } catch (err) {
      console.warn("Fullscreen not supported.");
    }
  };
  const [tempAnswer, setTempAnswer] = useState([]);
  const [cursorPos, setCursorPos] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  // Hydration flag to avoid overwriting saved state during initial mount
  const hydrated = useRef(false);
  // sessionStorage key for in-progress exam state
  const saveKey = `exam_${testId}`;

useEffect(() => {
  handleSubmitRef.current = handleSubmitTest;
}, [responses, testData, questionTime, activeSubjectIndex, activeSectionIndex, currentIndex, timeLeft]);



    const getAllQuestionsFromSection = (section) => {
    const flat = [];
    section.questions.forEach(item => {
      if (item.passages && Array.isArray(item.passages)) {
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
        flat.push(item);
      }
    });
    return flat;
  };


  const parseMarks = (marks) => {
    if (typeof marks === "object" && marks !== null) {
      return {
        full: Number(marks.full ?? 4),
        negative: Number(marks.negative ?? 1)
      };
    }
    if (typeof marks === "string") {
      const [full, negative] = marks.split(",").map(Number);
      return {
        full: full ?? 4,
        negative: negative ?? 1
      };
    }
    return { full: 4, negative: 1 };
  };
 //Initialize the exam time when the test loads
  useEffect(() => {
    if (!testData) return;
    const examDurationMinutes = Number(testData[0].Duration || 180);
    const examDurationSeconds = examDurationMinutes * 60;
    //if the user is resuming the test, load the remaining time from sessionStorage, otherwise start fresh
    if(saved?.timeLeft != null){
       setTimeLeft(saved.timeLeft);
    }
    else{
      setTimeLeft(examDurationSeconds);
    }
  }, [testData, testId]);

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
//restore candidate's exam state when the page reloads
  useEffect(() => {
    
    try {
      const raw = sessionStorage.getItem(`exam_${testId}`);
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
        setCursorPos((saved.responses?.[qKey] ?? "").length);
      }
    } catch (e) {
    }
  }, [testId, testData]);
//security check if the user is opening the correct test session and not accessing the exam pzge incorrectly
useEffect(() => {
  if (!raw) return; // allow fresh start

  try {
    const saved = JSON.parse(raw);

    if (saved.testId !== testId) {
      navigate("/home", { replace: true });
    }
  } catch (e) {
    navigate("/home", { replace: true });
  }
}, [testId]);



  // -------------------- TIMER --------------------
  //for implementing the exam countdown timer
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
// Auto-submit when time runs out
useEffect(() => {
  if (!hasStarted.current) return;

  if (timeLeft === 0 && testData) {
    if (handleSubmitRef.current) {
      handleSubmitRef.current();
    }
  }
}, [timeLeft, testData]);



  //Mark current question as visited the first time it is shown (runs only once at the beginning of the test)
  useEffect(() => {
    if (!testData) return;

    const qKey = getQKey(currentQuestion.question_id);

    setVisited(prev => {
      if (prev[qKey]) return prev; // already marked
      const updated = { ...prev, [qKey]: true };
      persistProgress({ visited: updated });
      return updated;
    });
  }, [testData]);


  // load saved state if the user refreshes or reopens the page
  useEffect(() => {
    if (!testData) return;

    try {
      const savedRaw = sessionStorage.getItem(saveKey);
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
       hasStarted.current = true;
    } catch (e) {
      hydrated.current = true;
       hasStarted.current = true;
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
      sessionStorage.setItem(saveKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save exam state:', e);
    }
  }, [responses, visited, markedForReview, questionTime, timeLeft, activeSubjectIndex, activeSectionIndex, currentIndex, testId]);

//store timetaken for that question,its visited status etc
  useEffect(() => {
    if (!testData) return;

    const activeSubject = testData[activeSubjectIndex];
    if (!activeSubject) return;

    const activeSection = activeSubject.sections[activeSectionIndex];
    if (!activeSection) return;

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

  // useEffect(() => {
  //   if (!testId) return;
  
  //   const loadCandidate = async () => {
  //     const { data, error } = await supabase
  //       .from("test_attempts")
  //       .select("name")
  //       .eq("test_id", testId)
  //       .order("created_at", { ascending: false })
  //       .limit(1)
  //       .single();
  
  //     if (!error && data) {
  //       setCandidateName(data.name);
  //     }
  //   };
  
  //   loadCandidate();
  // }, [testId]);

   useEffect(() => {
  const handleFsChange = () => {
    const isNowFullscreen = !!document.fullscreenElement;
    setIsFullscreen(isNowFullscreen);

    // 🚨 User EXITED fullscreen
    if (!isNowFullscreen) {
      setFullscreenExitCount(prev => {
        const newCount = prev + 1;
        sessionStorage.setItem("fs_exit_count", newCount);
       if (newCount > MAX_FULLSCREEN_EXITS) {
        if (handleSubmitRef.current) {
          handleSubmitRef.current();
        }
      }

        else {
          setShowFsWarning(true);
        }

        return newCount;
      });
    } else {
      // ✅ Returned to fullscreen
      setShowFsWarning(false);
    }
  };

  document.addEventListener("fullscreenchange", handleFsChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFsChange);
  };
}, []);
  

  // ==================== CONDITIONAL RETURNS (AFTER ALL HOOKS) ====================

  if (loading) {
    return <div style={{ padding: 20 }}>Loading test...</div>;
  }

  if (!testData || !Array.isArray(testData) || testData.length === 0) {
    return <div style={{ padding: 20 }}>Test not found</div>;
  }

  // ==================== DERIVED VALUES ====================

  if (paperCompletedInfo) {
    const { paperNo, totalPapers, nextPaperId, examId: cExamId, examName: cExamName } = paperCompletedInfo;

    const handleStartNextPaper = () => {
      // Navigate to the Instructions page for Paper N+1.
      // Instructions will then navigate to ExamPage with the new testId.
      navigate("/instructions", {
        state: {
          examId: cExamId,
          testId: nextPaperId,
          streamId: ids.streamId || null
        }
      });
    };

    const handleAttemptLater = () => {
      // Paper N result is already persisted in sessionStorage.
      // User can resume Paper N+1 later from the home/test-list page.
      navigate("/");
    };

    return (
      <div className="paper-completed-page">
        <div className="paper-completed-card">

          {/* ---- Header ---- */}
          <div className="paper-completed-header">
            <div className="paper-completed-icon">✅</div>
            <h1>Paper {paperNo} Submitted Successfully!</h1>
            <p className="paper-completed-exam-name">{cExamName}</p>
          </div>

          {/* ---- Status strip ---- */}
          <div className="paper-completed-strip">
            <div className="strip-item">
              <span className="strip-label">Papers Completed</span>
              <span className="strip-value">{paperNo} / {totalPapers}</span>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <span className="strip-label">Papers Remaining</span>
              <span className="strip-value">{totalPapers - paperNo}</span>
            </div>
            <div className="strip-divider" />
            <div className="strip-item">
              <span className="strip-label">Up Next</span>
              <span className="strip-value">Paper {paperNo + 1}</span>
            </div>
          </div>

          {/* ---- Message ---- */}
          <div className="paper-completed-body">
            <h2>Ready to attempt Paper {paperNo + 1}?</h2>
            <p>
              Your responses for <strong>Paper {paperNo}</strong> have been saved.
              Your combined results for all {totalPapers} papers will be shown only after
              you submit <strong>Paper {totalPapers}</strong>.
            </p>
            <p>
              Click <strong>"Proceed to Paper {paperNo + 1}"</strong> below to read the
              instructions and begin. Make sure you are ready — the timer will start as
              soon as you enter the exam.
            </p>
          </div>

          {/* ---- Important notice ---- */}
          <div className="paper-completed-notice">
            <span className="notice-icon">⚠️</span>
            <span>
              <strong>Do not close this browser tab.</strong>&nbsp;
              Your Paper {paperNo} data is stored in this session.
              Closing the tab before completing all papers may result in data loss.
            </span>
          </div>

          {/* ---- Action buttons ---- */}
          <div className="paper-completed-actions">
            <button
              className="paper-completed-btn-primary"
              onClick={handleStartNextPaper}
            >
              Proceed to Paper {paperNo + 1} Instructions →
            </button>
            <button
              className="paper-completed-btn-secondary"
              onClick={handleAttemptLater}
            >
              I'll attempt Paper {paperNo + 1} later
            </button>
          </div>

          <p className="paper-completed-footer">
            If you attempt later, navigate back to the test list and start Paper {paperNo + 1} from there.
            Your Paper {paperNo} responses will remain saved in this browser session.
          </p>
        </div>
      </div>
    );
  }


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


  function getQKey  (questionId) {
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
      //if the option is already selected, unselect it, otherwise add it to the array of selected options
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
  //overrides is used because it allows the function to change certail values temporarily
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

      sessionStorage.setItem(saveKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist exam state:', e);
    }
  };

  const selectOption = (optionValue) => {
    // const qKey = getQKey(currentQuestion.question_id);
    // const newResponses = { ...responses, [qKey]: optionValue };
    setTempAnswer(optionValue);

  };


  const saveAndNext = () => {
    const qKey = getQKey(currentQuestion.question_id);

    //let newResponses = responses;
    let newResponses = { ...responses };
    let newMarked = { ...markedForReview };
    const hasAnswer =
      tempAnswer !== null &&
      !(Array.isArray(tempAnswer) && tempAnswer.length === 0);

    if (hasAnswer) {
      newResponses[qKey] = normalizeAnswer(
        currentQuestion.qtype,
        tempAnswer
      );
    }

    delete newMarked[qKey];
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
    setActiveSubjectIndex(0);
    setActiveSectionIndex(0);
    setCurrentIndex(0);

    persistProgress({
      responses: newResponses,
      markedForReview: newMarked,
      activeSubjectIndex: 0,
      activeSectionIndex: 0,
      currentIndex: 0
    });


  };

  const clearResponse = () => {
    const qKey = getQKey(currentQuestion.question_id);

    resetTempAnswer();


    const newResponses = { ...responses };
    delete newResponses[qKey];

    const newMarked = { ...markedForReview };
    delete newMarked[qKey];

    setResponses(newResponses);
    setMarkedForReview(newMarked);

    // persist immediately
    persistProgress({
      responses: newResponses,
      markedForReview: newMarked
    });
  };
  const markForReview = () => {
    const qKey = getQKey(currentQuestion.question_id);

    // 1️⃣ Save answer if present (same behavior as now)
    let newResponses = { ...responses };
    if (
      tempAnswer !== null &&
      !(Array.isArray(tempAnswer) && tempAnswer.length === 0)
    ) {
      newResponses[qKey] = normalizeAnswer(
        currentQuestion.qtype,
        tempAnswer
      );
    }

    // 2️⃣ Mark question for review
    const newMarked = { ...markedForReview, [qKey]: true };

    setResponses(newResponses);
    setMarkedForReview(newMarked);
    resetTempAnswer();

    // 3️⃣ Navigation logic (IDENTICAL to saveAndNext)
    let newSubjectIndex = activeSubjectIndex;
    let newSectionIndex = activeSectionIndex;
    let newQuestionIndex = currentIndex + 1;

    const currentSectionQuestions = questions;

    // ▶ Move within section
    if (newQuestionIndex < currentSectionQuestions.length) {
      setCurrentIndex(newQuestionIndex);

      persistProgress({
        responses: newResponses,
        markedForReview: newMarked,
        currentIndex: newQuestionIndex
      });
      return;
    }

    // ▶ Move to next section
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

    // ▶ Move to next subject
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

    // ▶ End of test
    // 🔁 Wrap around to first subject → first section → first question
    setActiveSubjectIndex(0);
    setActiveSectionIndex(0);
    setCurrentIndex(0);

    persistProgress({
      responses: newResponses,
      markedForReview: newMarked,
      activeSubjectIndex: 0,
      activeSectionIndex: 0,
      currentIndex: 0
    });

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
  const isFirstQuestion =
    activeSubjectIndex === 0 &&
    activeSectionIndex === 0 &&
    currentIndex === 0;

  const handleSubmit = () => {
    if (window.confirm("Are you sure you want to submit the test?")) {
      handleSubmitTest();
    }
  };


  // function handleSubmitTest  (){

  //   sessionStorage.removeItem("fs_exit_count");

  //   const now = Date.now();
  //   const timeSpent = Math.floor((now - questionStartTime) / 1000);

  //   const lastQKey = getQKey(currentQuestion.question_id);

  //   const finalQuestionTime = {
  //     ...questionTime,
  //     [lastQKey]: (questionTime[lastQKey] || 0) + timeSpent
  //   };

  //   // Build final result data
  //   const resultData = [];

  //   testData.forEach((subject, sIdx) => {
  //     subject.sections.forEach((section, secIdx) => {
  //       const allQuestions = getAllQuestionsFromSection(section);

  //       allQuestions.forEach(q => {
  //         const qKey = `${sIdx}-${secIdx}-${q.question_id}`;

  //         resultData.push({
  //           question_id: q.question_id,
  //           subjectIndex: sIdx,
  //           sectionIndex: secIdx,
  //           selectedAnswer: responses[qKey] ?? null,
  //           timeTaken: finalQuestionTime[qKey] || 0
  //         });
  //       });
  //     });
  //   });



  //   const payload = { resultData, responses, questionTime: finalQuestionTime };

  //   // persist so ResultsPage can reload/refresh safely
  //   sessionStorage.setItem(`results_${testId}`, JSON.stringify(payload));

  //   // clear any in-progress saved exam state
  //   try { sessionStorage.removeItem(`exam_${testId}`); } catch (e) { }
  //      // Exit full-screen mode
  //   try {
  //     if (document.fullscreenElement) {
  //       document.exitFullscreen().catch(() => {
  //         console.warn("Failed to exit full-screen.");
  //       });
  //     }
  //   } catch (err) {
  //     console.warn("Fullscreen exit not supported.");
  //   }

  //   navigate("/results", { state: { ...payload, testId } }, { replace: true });

  // };
// async function handleSubmitTest() {
//     sessionStorage.removeItem("fs_exit_count");

//     const now = Date.now();
//     const timeSpent = Math.floor((now - questionStartTime) / 1000);

//     // getQKey uses the CURRENT activeSubjectIndex/activeSectionIndex — plain "sIdx-secIdx-qId"
//     const lastQKey = getQKey(currentQuestion.question_id);

//     // Merge the last question's elapsed time into finalQuestionTime
//     // All keys are "sIdx-secIdx-qId" — NO testId prefix anywhere
//     const finalQuestionTime = {
//       ...questionTime,
//       [lastQKey]: (questionTime[lastQKey] || 0) + timeSpent
//     };

//     // Also merge the latest unsaved responses (tempAnswer for current question)
//     // so we don't lose the answer the user was on when they hit Submit
//     const finalResponses = { ...responses };
//     if (
//       tempAnswer !== null &&
//       !(Array.isArray(tempAnswer) && tempAnswer.length === 0)
//     ) {
//       finalResponses[lastQKey] = Array.isArray(tempAnswer)
//         ? [...tempAnswer].sort()
//         : tempAnswer;
//     }

//     // Build resultData by walking testData and looking up plain "sIdx-secIdx-qId" keys
//     const resultData = [];
//     testData.forEach((subject, sIdx) => {
//       subject.sections.forEach((section, secIdx) => {
//         const allQuestions = getAllQuestionsFromSection(section);
//         allQuestions.forEach(q => {
//           const qKey = `${sIdx}-${secIdx}-${q.question_id}`;   // plain format — matches responses
//           resultData.push({
//             question_id:    q.question_id,
//             subjectIndex:   sIdx,
//             sectionIndex:   secIdx,
//             selectedAnswer: finalResponses[qKey] ?? null,
//             timeTaken:      finalQuestionTime[qKey] || 0
//           });
//         });
//       });
//     });

//     const info = testData[0];
//     const payload = {
//       testId,
//       examId:      info.examId || examId,
//       paperNo:     info.paperNo     || 1,
//       totalPapers: info.totalPapers || 1,
//       nextPaperId: info.nextPaperId || null,
//       resultData,
//       responses:    finalResponses,
//       questionTime: finalQuestionTime,
//       testDataSectionCounts: testData.map(s => s.sections.length)
//     };

//     // Persist this paper's completed result
//     sessionStorage.setItem(
//       `exam_${payload.examId}_paper_${payload.paperNo}`,
//       JSON.stringify(payload)
//     );

//     // Clear the in-progress autosave for this paper (no longer needed)
//     //try { sessionStorage.removeItem(`exam_${testId}`); } catch (e) {}

//     // Exit fullscreen
//     try {
//       if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
//     } catch {}

//     // ---- SINGLE-PAPER TEST ----
//     if (payload.totalPapers === 1) {
//       sessionStorage.setItem(`results_${payload.examId}`, JSON.stringify(payload));
//       navigate("/results", { state: { ...payload, testId: payload.examId } });
//       return;
//     }

//     // ---- INTERMEDIATE PAPER: show the paper-completed screen ----
//     if (payload.paperNo < payload.totalPapers && payload.nextPaperId) {
//       setPaperCompletedInfo({
//         paperNo: payload.paperNo,
//         totalPapers: payload.totalPapers,
//         nextPaperId: payload.nextPaperId,
//         examId: payload.examId,
//         examName: info.Test_Name || examName
//       });
//       // Component re-renders with the paperCompletedInfo screen (no navigate needed)
//       return;
//     }

//     // ---- LAST PAPER: merge all papers and go to results ----

//     // Collect ordered testIds for all papers so ResultsPage can rebuild merged testData
//     const allPaperTestIds = [];
//     for (let i = 1; i <= payload.totalPapers; i++) {
//       const paperRaw = sessionStorage.getItem(`exam_${payload.examId}_paper_${i}`);
//       if (paperRaw) {
//         const p = JSON.parse(paperRaw);
//         allPaperTestIds.push(p.testId);
//       }
//     }

//     const combined = {
//       resultData: [],
//       responses: {},
//       questionTime: {},
//       sectionOffsets: {}
//     };

//     for (let i = 1; i <= payload.totalPapers; i++) {
//       const paperRaw = sessionStorage.getItem(`exam_${payload.examId}_paper_${i}`);
//       if (!paperRaw) continue;
//       const p = JSON.parse(paperRaw);

//       // Build the per-subject offset for THIS paper before updating combined.sectionOffsets
//       const offsetBySubject = new Map();
//       p.testDataSectionCounts?.forEach((count, sIdx) => {
//         const prev = combined.sectionOffsets[sIdx] || 0;
//         offsetBySubject.set(sIdx, prev);          // offset = sections already seen
//         combined.sectionOffsets[sIdx] = prev + count; // advance for next paper
//       });

//       p.resultData.forEach(q => {
//         const off = offsetBySubject.get(q.subjectIndex) || 0;
//         combined.resultData.push({
//           ...q,
//           sectionIndex: q.sectionIndex + off,
//           paperNo: p.paperNo
//         });
//       });

//       Object.entries(p.responses || {}).forEach(([k, v]) => {
//         const parts = k.split("-");
//         const s = Number(parts[0]);
//         const sec = Number(parts[1]);
//         const qid = parts.slice(2).join("-");
//         const off = offsetBySubject.get(s) || 0;
//         combined.responses[`${s}-${sec + off}-${qid}`] = v;
//       });

//       Object.entries(p.questionTime || {}).forEach(([k, v]) => {
//         const parts = k.split("-");
//         const s = Number(parts[0]);
//         const sec = Number(parts[1]);
//         const qid = parts.slice(2).join("-");
//         const off = offsetBySubject.get(s) || 0;
//         const newKey = `${s}-${sec + off}-${qid}`;
//         combined.questionTime[newKey] = (combined.questionTime[newKey] || 0) + v;
//       });
//     }

//     // Cleanup per-paper storage now that we have the combined result
//     // for (let i = 1; i <= payload.totalPapers; i++) {
//     //   sessionStorage.removeItem(`exam_${payload.examId}_paper_${i}`);
//     // }

//     const finalCombined = {
//       ...combined,
//       examId: payload.examId,
//       testId: payload.examId,
//       totalPapers: payload.totalPapers,
//       allPaperTestIds
//     };

//     sessionStorage.setItem(`results_${payload.examId}`, JSON.stringify(finalCombined));
//     navigate("/results", { state: finalCombined });
//   }
 async function handleSubmitTest() {
    sessionStorage.removeItem("fs_exit_count");

    const now = Date.now();
    const timeSpent = Math.floor((now - questionStartTime) / 1000);

    // getQKey uses the CURRENT activeSubjectIndex/activeSectionIndex — plain "sIdx-secIdx-qId"
    const lastQKey = getQKey(currentQuestion.question_id);

    // Merge the last question's elapsed time into finalQuestionTime
    // All keys are "sIdx-secIdx-qId" — NO testId prefix anywhere
    const finalQuestionTime = {
      ...questionTime,
      [lastQKey]: (questionTime[lastQKey] || 0) + timeSpent
    };

    // Also merge the latest unsaved responses (tempAnswer for current question)
    // so we don't lose the answer the user was on when they hit Submit
    const finalResponses = { ...responses };
    if (
      tempAnswer !== null &&
      !(Array.isArray(tempAnswer) && tempAnswer.length === 0)
    ) {
      finalResponses[lastQKey] = Array.isArray(tempAnswer)
        ? [...tempAnswer].sort()
        : tempAnswer;
    }

    // Build resultData by walking testData and looking up plain "sIdx-secIdx-qId" keys
    const resultData = [];
    testData.forEach((subject, sIdx) => {
      subject.sections.forEach((section, secIdx) => {
        const allQuestions = getAllQuestionsFromSection(section);
        allQuestions.forEach(q => {
          const qKey = `${sIdx}-${secIdx}-${q.question_id}`;   // plain format — matches responses
          resultData.push({
            question_id:    q.question_id,
            subjectIndex:   sIdx,
            sectionIndex:   secIdx,
            selectedAnswer: finalResponses[qKey] ?? null,
            timeTaken:      finalQuestionTime[qKey] || 0
          });
        });
      });
    });

    const info = testData[0];
    const payload = {
      testId,
      examId:      info.examId || examId,
      paperNo:     info.paperNo     || 1,
      totalPapers: info.totalPapers || 1,
      nextPaperId: info.nextPaperId || null,
      resultData,
      responses:    finalResponses,
      questionTime: finalQuestionTime,
      testDataSectionCounts: testData.map(s => s.sections.length)
    };

    // Persist this paper's completed result
    sessionStorage.setItem(
      `exam_${payload.examId}_paper_${payload.paperNo}`,
      JSON.stringify(payload)
    );

    // Clear the in-progress autosave for this paper (no longer needed)
    try { sessionStorage.removeItem(`exam_${testId}`); } catch (e) {}

    // Exit fullscreen
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {}

    // ---- SINGLE-PAPER TEST ----
    if (payload.totalPapers === 1) {
      sessionStorage.setItem(`results_${payload.examId}`, JSON.stringify(payload));
      navigate("/results", { state: { ...payload, testId: payload.examId } });
      return;
    }

    // ---- INTERMEDIATE PAPER: show the paper-completed screen ----
    if (payload.paperNo < payload.totalPapers && payload.nextPaperId) {
      setPaperCompletedInfo({
        paperNo: payload.paperNo,
        totalPapers: payload.totalPapers,
        nextPaperId: payload.nextPaperId,
        examId: payload.examId,
        examName: info.Test_Name || examName
      });
      // Component re-renders with the paperCompletedInfo screen (no navigate needed)
      return;
    }

    // ---- LAST PAPER: merge all papers and go to results ----

    // Collect ordered testIds for all papers so ResultsPage can rebuild merged testData
    const allPaperTestIds = [];
    for (let i = 1; i <= payload.totalPapers; i++) {
      const paperRaw = sessionStorage.getItem(`exam_${payload.examId}_paper_${i}`);
      if (paperRaw) {
        const p = JSON.parse(paperRaw);
        allPaperTestIds.push(p.testId);
      }
    }

    const combined = {
      resultData: [],
      responses: {},
      questionTime: {},
      sectionOffsets: {}
    };

    for (let i = 1; i <= payload.totalPapers; i++) {
      const paperRaw = sessionStorage.getItem(`exam_${payload.examId}_paper_${i}`);
      if (!paperRaw) continue;
      const p = JSON.parse(paperRaw);

      // Build the per-subject offset for THIS paper before updating combined.sectionOffsets
      const offsetBySubject = new Map();
      p.testDataSectionCounts?.forEach((count, sIdx) => {
        const prev = combined.sectionOffsets[sIdx] || 0;
        offsetBySubject.set(sIdx, prev);          // offset = sections already seen
        combined.sectionOffsets[sIdx] = prev + count; // advance for next paper
      });

      p.resultData.forEach(q => {
        const off = offsetBySubject.get(q.subjectIndex) || 0;
        combined.resultData.push({
          ...q,
          // sectionIndex is offset so ResultsPage flatMap (merged testData) resolves correctly
          sectionIndex:         q.sectionIndex + off,
          // keep original indices so Solutions page can look up by paper JSON
          origSectionIndex:     q.sectionIndex,
          paperNo:              p.paperNo,
          paperTestId:          p.testId
        });
      });

      // responses: key = "paperNo-sIdx-origSecIdx-qId"
      // This avoids offset ambiguity and lets SolutionsPage find answers with original indices
      Object.entries(p.responses || {}).forEach(([k, v]) => {
        combined.responses[`${p.paperNo}-${k}`] = v;
      });

      // questionTime: key = "paperNo-sIdx-origSecIdx-qId" (same scheme as responses)
      Object.entries(p.questionTime || {}).forEach(([k, v]) => {
        const newKey = `${p.paperNo}-${k}`;
        combined.questionTime[newKey] = (combined.questionTime[newKey] || 0) + v;
      });
    }

    // Cleanup per-paper storage now that we have the combined result
    for (let i = 1; i <= payload.totalPapers; i++) {
      sessionStorage.removeItem(`exam_${payload.examId}_paper_${i}`);
    }

    const finalCombined = {
      ...combined,
      examId: payload.examId,
      testId: payload.examId,
      totalPapers: payload.totalPapers,
      allPaperTestIds
    };

    sessionStorage.setItem(`results_${payload.examId}`, JSON.stringify(finalCombined));
    navigate("/results", { state: finalCombined });
  }




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

  const goPrevious = () => {
    let newSubjectIndex = activeSubjectIndex;
    let newSectionIndex = activeSectionIndex;
    let newQuestionIndex = currentIndex - 1;

    if (newQuestionIndex < 0) {
      newSectionIndex--;
      if (newSectionIndex < 0) {
        newSubjectIndex--;
        if (newSubjectIndex < 0) return;
        newSectionIndex = testData[newSubjectIndex].sections.length - 1;
      }
      const prevSection = testData[newSubjectIndex].sections[newSectionIndex];
      const prevQuestions = prevSection.questions.flatMap(item =>
        item.passages ? item.passages.flatMap(p => p.questions) : [item]
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
  };


  const hasMultipleSections = activeSubject.sections.length > 1;
  const showSubjectInPalette = activeSubject.sections.length === 1;

  const paletteHeaderText = showSubjectInPalette
    ? activeSubject.SubjectName
    : activeSection.SectionName;

    

  return (
    <div className="exam-page">
     {!isFullscreen && showFsWarning && (
        <div className="fullscreen-warning-overlay">
  <div className="warning-content">
    <h3>Full-Screen Mode Required</h3>

    <p>
      You have exited full-screen mode.
    </p>

    <p style={{ color: "red", fontWeight: "bold" }}>
      Attempts remaining: {MAX_FULLSCREEN_EXITS - fullscreenExitCount}
    </p>

    <p>
      Exiting full-screen more than {MAX_FULLSCREEN_EXITS} times will
      automatically submit your exam.
    </p>

    <button className="return-fs-btn" onClick={handleRequestFullscreen}>
      Return to Full-Screen
    </button>
  </div>
</div>

      )}
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="exam-logo-container">
          <div className="exam-title">{examName}</div>
        </div>
        <div className="top-bar-right">
          <div className="candidate-info">
            <div className="candidate-details">
              <span>Candidate Name: <b>{candidateName}</b></span>
              <span>Subject: <b>{activeSubject.SubjectName}</b></span>
            </div>
            <div className="candidate-photo">👤</div>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
          <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
            <button className="instructions-close" onClick={() => setShowInstructions(false)}>×</button>
            <Instructions showStartButton={false} />
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="exam-body">
        {/* LEFT COLUMN: Question area */}
        <div className="left-column">
          <div className="subject-nav-tabs">
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
                    persistProgress({ activeSubjectIndex: idx, activeSectionIndex: 0, currentIndex: 0 });
                  }}
                >
                  {subject.SubjectName}
                </button>
              ))}
            </div>

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
                      persistProgress({ activeSectionIndex: idx, currentIndex: 0 });
                    }}
                  >
                    {sec.SectionName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="question-content-area">
            <div className="question-top-info">
              <span className="q-number">Question No. {currentIndex + 1}</span>
              <div className="inst-timer-row">
                <button className="instructions-link" onClick={() => setShowInstructions(true)}>
                  View Instructions
                </button>
                <div className="exam-timer">
                  Time Left: {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <div className="question-header">
              <div className="q-type-label">Type: {currentQuestion.qtype}</div>
              <div className="q-marks">
                <span>Marks for correct answer <span className="mark-pos">{correctMarks}</span></span>
                <span>Negative marks <span className="mark-neg">{negativeMarks}</span></span>
              </div>
            </div>

            <div className="question-scroll-container">
              {currentQuestion.__passage && (
                <div className="passage-box">
                  <img src={currentQuestion.__passage.passageImgName} alt="Passage" className="passage-image" />
                </div>
              )}

              {currentQuestion.questionImgName ? (
                <img src={currentQuestion.questionImgName} alt="question" className="question-image" />
              ) : (
                <div className="question-text">{currentQuestion.question}</div>
              )}

              <div className="options-container">
                {(currentQuestion.qtype === "MCQ" || currentQuestion.qtype === "MSQ") && (
                  <div className="options">
                    {currentQuestion.options.map((opt, idx) => {
                      const isChecked = currentQuestion.qtype === "MCQ" 
                        ? tempAnswer === opt.option_index
                        : (Array.isArray(tempAnswer) && tempAnswer.includes(opt.option_index));
                      
                      return (
                        <label key={idx} className={`option ${isChecked ? "selected" : ""}`}>
                          <input
                            type={currentQuestion.qtype === "MCQ" ? "radio" : "checkbox"}
                            name={`question-${currentQuestion.question_id}`}
                            checked={isChecked}
                            onChange={() => currentQuestion.qtype === "MCQ" ? selectOption(opt.option_index) : toggleMSQOption(opt.option_index)}
                          />
                          <span className="option-label">{opt.option_index.toUpperCase()}.</span>
                          <div className="option-content">
                          {opt.optionImgName ? (
                            <img src={opt.optionImgName} alt="option" className="option-image" />
                          ) : (
                            
                            <span>{opt.option_text}</span>
                          )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.qtype === "NATI" && (
                  <div className="nat-container">
                    <div className="nat-display-box">
                      <span className="nat-label">Answer:</span>
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
                    </div>
                    <div className="nat-keypad">
                      <div className="key-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, ".", "-"].map(num => (
                          <button key={num} className="key" onClick={() => handleKeyPress(num)}>{num}</button>
                        ))}
                      </div>
                      <div className="key-actions">
                        <button className="key backspace" onClick={handleBackspace}>Backspace</button>
                        <button className="key clear" onClick={handleClear}>Clear</button>
                        <div className="arrows">
                          <button className="key" onClick={() => moveCursor("left")}>←</button>
                          <button className="key" onClick={() => moveCursor("right")}>→</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="footer-controls">
            <div className="footer-left">
              <button className="review-btn" onClick={markForReview}>Mark for Review & Next</button>
              <button className="clear-btn" onClick={clearResponse}>Clear Response</button>
            </div>
            <div className="footer-right">
              {!isFirstQuestion && (
                <button className="prev-btn" onClick={goPrevious}>Previous</button>
              )}
              <button className="next-btn" onClick={saveAndNext}>Save & Next</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Palette & Info */}
        <div className="right-column">
          <div className="candidate-palette-info">
            <div className="palette-legend">
              <div className="legend-row">
                <div className="legend-item"><span className="count answered"></span> Answered</div>
                <div className="legend-item"><span className="count not-answered"></span> Not Answered</div>
              </div>
              <div className="legend-row">
                <div className="legend-item"><span className="count not-visited"></span> Not Visited</div>
                <div className="legend-item"><span className="count marked-review"></span> Marked for Review</div>
              </div>
              <div className="legend-row">
                <div className="legend-item"><span className="count answered-review"></span> Answered & Marked for Review</div>
              </div>
            </div>

            <div className="palette-section">
              <div className="palette-header">{paletteHeaderText}</div>
              <div className="palette-scroll">
                <div className="questions-grid">
                  {questions.map((q, idx) => (
                    <button
                      key={idx}
                      className={`q-btn ${getQuestionStatus(q)} ${idx === currentIndex ? "current" : ""}`}
                      onClick={() => {
                        const qKey = getQKey(q.question_id);
                        const newVisited = { ...visited, [qKey]: true };
                        setVisited(newVisited);
                        setCurrentIndex(idx);
                        setTempAnswer(responses[qKey] ?? (q.qtype === "MSQ" ? [] : null));
                        persistProgress({ visited: newVisited, currentIndex: idx });
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="palette-footer">
            <button className="submit-exam-btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}