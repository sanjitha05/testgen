import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ScoreStrip from "./ScoreStrip";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import "./ResultsPage.css";
import { m } from "framer-motion";

export default function ResultsPage() {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ==================== ALL STATE HOOKS FIRST ====================
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================== EFFECTS ====================
  useEffect(() => {
    setLoading(true);
    import(`../data/mocktests/${testId}.json`)
      .then(module => {
        setTestData(module.default);
        setLoading(false);
      })
      .catch(err => {
        console.error("Test not found:", testId, err);
        setLoading(false);
      });
  }, [testId]);

  // ==================== ALL MEMOIZED CALCULATIONS (MUST BE BEFORE RETURNS) ====================
  const data = location.state ?? JSON.parse(localStorage.getItem(`results_${testId}`) || "null");
  const resultData = data?.resultData || [];
  const responses = data?.responses || {};

  const timesInMs = useMemo(() => resultData.some(q => (q.timeTaken || 0) > 10000), [resultData]);

  // Memoized calculations

  

  const normalizeMSQ = (val) => {
  if (!val) return [];

  if (Array.isArray(val)) {
    return [...val].map(v => v.toLowerCase()).sort();
  }

  if (typeof val === "string") {
    return val
      .split(",")
      .map(v => v.trim().toLowerCase())
      .sort();
  }

  return [];
};

const isAnswerCorrect = (selected, correct, qtype) => {
  if (selected == null) return false;

  if (qtype === "MSQ") {
    const s = normalizeMSQ(selected);
    const c = normalizeMSQ(correct);
    return s.length === c.length && s.every((v, i) => v === c[i]);
  }

  // MCQ / NAT
  return selected === correct;
};

const formatAnswer = (val, qtype) => {
  if (val == null) return "-";

  if (qtype === "MSQ") {
    return normalizeMSQ(val).join(", ").toUpperCase();
  }

  return String(val).toUpperCase();
};

const calculateMSQMarks = (selectedAnswer, correctAnswer, marks) => {
  const full = Number(marks?.full ?? 4);
  const negative = Number(marks?.negative ?? 1);

  const selected = normalizeMSQ(selectedAnswer);
  const correct = normalizeMSQ(correctAnswer);

  if (!selected.length) return 0;

  const correctSet = new Set(correct);

  let correctChosen = 0;
  let wrongChosen = 0;

  selected.forEach(opt => {
    if (correctSet.has(opt)) correctChosen++;
    else wrongChosen++;
  });

  if (wrongChosen > 0) return -negative;

  if (correctChosen === correct.length) return full;
  const partial=correctChosen;

  return Number(partial ?? 0);
};
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
const flattenedQuestionsMap = useMemo(() => {
  if (!testData) return {};

  const map = {};

  testData.forEach((subject, sIdx) => {
    subject.sections.forEach((section, secIdx) => {
      map[`${sIdx}-${secIdx}`] = getAllQuestionsFromSection(section);
    });
  });

  return map;
}, [testData]);
// Debug: Check the flattened map
useEffect(() => {
  if (flattenedQuestionsMap && Object.keys(flattenedQuestionsMap).length > 0) {
    
    // Check each section
    Object.entries(flattenedQuestionsMap).forEach(([key, questions]) => {
      questions.forEach(q => {
      });
    });
  }
}, [flattenedQuestionsMap]);



  
  const summary = useMemo(() => {
    if (!testData || !resultData.length) {
      return {
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        marksObtained: 0,
        maxMarks: 0,
        accuracy: 0,
        totalTime: 0,
        avgTime: 0
      };
    }



    let total = resultData.length;
    let attempted = 0, correct = 0, wrong = 0, unattempted = 0, totalTime = 0, marksObtained = 0, maxMarks = 0;


    resultData.forEach(q => {
        if (!q.question_id) {

    return;
  }
      const key = `${q.subjectIndex}-${q.sectionIndex}`;
 

      const section =
  testData[q.subjectIndex].sections[q.sectionIndex];
   const allQuestions =
   flattenedQuestionsMap[key] || [];


 //const allQuestions = getAllQuestionsFromSection(section);

const question = allQuestions.find(
  qq => qq.question_id === q.question_id
);

      //const question = testData[q.subjectIndex].sections[q.sectionIndex].questions.find(qq => qq.question_id === q.question_id);

      if (!question) {
      
      return; 
    }



  const { full: correctMarks, negative: negativeMarks } =
  parseMarks(question?.marks);
      // const correctMarks = Number(question.marks?.full ?? 4);
      // const negativeMarks = Number(question.marks?.negative ?? 1);
      maxMarks += correctMarks;
      totalTime += q.timeTaken;

      if (q.selectedAnswer === null) {
        unattempted++;
      } else {
        attempted++;
        let isCorrect = false;

        if (question.qtype === "MSQ") {
          const selected = normalizeMSQ(q.selectedAnswer);
          const correctAns = normalizeMSQ(question.answer);
          isCorrect =
            selected.length === correctAns.length &&
            selected.every((v, i) => v === correctAns[i]);
        } else {
          // MCQ / NAT
          isCorrect = q.selectedAnswer === question.answer;
        }

       if (question.qtype === "MSQ") {
        const score = calculateMSQMarks(q.selectedAnswer, question.answer,question.marks);
        marksObtained += score;

        if (score === correctMarks) correct++;
        else if (score < 0) wrong++;
      } else {
        // MCQ / NAT
        if (q.selectedAnswer === question.answer) {
          correct++;
          marksObtained += correctMarks;
        } else {
          wrong++;
          marksObtained -= negativeMarks;
        }
      }
      }
    });

    return {
      total,
      attempted,
      correct,
      wrong,
      unattempted,
      marksObtained,
      maxMarks,
      accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
      totalTime,
      avgTime: attempted ? Math.round(totalTime / attempted) : 0
    };
  }, [resultData, testData,flattenedQuestionsMap]);

  // Subject-wise analysis
  const subjectAnalysis = useMemo(() => {
    if (!testData || !resultData.length) return [];

    return testData.map((subject, sIdx) => {
      const questions = resultData.filter(q => q.subjectIndex === sIdx);

      const total = questions.length;
      let attempted = 0;
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;
      let timeSpent = 0;
      let marks = 0;

      questions.forEach(q => {
  if (!q.question_id) return;

        const section =
  testData[q.subjectIndex].sections[q.sectionIndex];

const allQuestions = flattenedQuestionsMap[`${q.subjectIndex}-${q.sectionIndex}`] || [];

const question = allQuestions.find(
  qq => qq.question_id === q.question_id
);

        // const question =
        //   subject.sections[q.sectionIndex].questions.find(
        //     qq => qq.question_id === q.question_id
        //   );

        // const correctMarks = Number(question.marks?.full ?? 4);
        // const negativeMarks = Number(question.marks?.negative ?? 1);
        const { full: correctMarks, negative: negativeMarks } =
          parseMarks(question?.marks);



        timeSpent += q.timeTaken;

        if (q.selectedAnswer === null) {
          unattempted++;
        } else {
          attempted++;
          let isCorrect = false;

        if (question.qtype === "MSQ") {
          const selected = normalizeMSQ(q.selectedAnswer);
          const correctAns = normalizeMSQ(question.answer);

          isCorrect =
            selected.length === correctAns.length &&
            selected.every((v, i) => v === correctAns[i]);
        } else {
          // MCQ / NAT
          isCorrect = q.selectedAnswer === question.answer;
        }

        if (question.qtype === "MSQ") {
        const score = calculateMSQMarks(q.selectedAnswer, question.answer,question.marks);
        marks += score;

        if (score === correctMarks) correct++;
        else if (score < 0) wrong++;
      } else {
        if (q.selectedAnswer === question.answer) {
          correct++;
          marks += correctMarks;
        } else {
          wrong++;
          marks -= negativeMarks;
        }
      }


        }
      });

      return {
        subjectName: subject.SubjectName,
        total,
        attempted,
        correct,
        wrong,
        unattempted,
        accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
        marks,
        timeSpent
      };
    });
  }, [resultData, testData]);

  const timePieData = useMemo(() => {
    if (!testData || !resultData.length) return [];

    const buildTimeSplit = (filterFn) => {
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      resultData.filter(filterFn).forEach(q => {
        const section =
  testData[q.subjectIndex].sections[q.sectionIndex];

    const allQuestions = flattenedQuestionsMap[`${q.subjectIndex}-${q.sectionIndex}`] || [];

    const question = allQuestions.find(
      qq => qq.question_id === q.question_id
    );

        // const question =
        //   testData[q.subjectIndex].sections[q.sectionIndex].questions.find(
        //     qq => qq.question_id === q.question_id
        //   );

        const mins = timesInMs ? q.timeTaken / (1000 * 60) : q.timeTaken / 60;

        if (q.selectedAnswer === null) {
          unattempted += mins;
        } else if (q.selectedAnswer === question.answer) {
          correct += mins;
        } else {
          wrong += mins;
        }
      });

      return [
        { name: "Correct", value: correct },
        { name: "Wrong", value: wrong },
        { name: "Unattempted", value: unattempted }
      ];
    };

    return [
      { title: "Overall", data: buildTimeSplit(() => true) },
      { title: "Mathematics", data: buildTimeSplit(q => q.subjectIndex === 0) },
      { title: "Physics", data: buildTimeSplit(q => q.subjectIndex === 1) },
      { title: "Chemistry", data: buildTimeSplit(q => q.subjectIndex === 2) }
    ];
  }, [resultData, testData, timesInMs]);

  const subjectWiseTimeCharts = useMemo(() => {
    if (!testData || !resultData.length) return [];

    return testData.map((subject, sIdx) => {
      const sections = subject.sections.map((section, secIdx) => ({
        sectionName: section.SectionName,
        data: resultData
          .filter(
            q => q.subjectIndex === sIdx && q.sectionIndex === secIdx
          )
          .map((q, i) => ({
            name: `Q${i + 1}`,
            time: +((timesInMs ? q.timeTaken / (1000 * 60) : q.timeTaken / 60).toFixed(2))
          }))
      }));

      return {
        subjectName: subject.SubjectName,
        sections
      };
    });
  }, [resultData, testData, timesInMs]);

  // Subject-wise datasets for the three summary charts
  const subjectMetrics = useMemo(() => {
    if (!subjectAnalysis.length) {
      return {
        time: [],
        attempted: [],
        accuracy: []
      };
    }

    return {
      time: subjectAnalysis.map(s => ({
        name: s.subjectName,
        value: +((timesInMs ? s.timeSpent / (1000 * 60) : s.timeSpent / 60).toFixed(2))
      })),
      attempted: subjectAnalysis.map(s => ({ name: s.subjectName, attempted: s.attempted })),
      accuracy: subjectAnalysis.map(s => ({ name: s.subjectName, accuracy: s.accuracy }))
    };
  }, [subjectAnalysis, timesInMs]);

  // ==================== CONDITIONAL RETURNS (AFTER ALL HOOKS) ====================
  if (loading) {
    return <div style={{ padding: 20 }}>Loading test...</div>;
  }

  if (!data) {
    return <p>No results found for test {testId}</p>;
  }

  if (!testData || !Array.isArray(testData)) {
    return <div style={{ padding: 20 }}>Test data not found</div>;
  }

  if (!resultData.length) {
    return <h2>No result data found</h2>;
  }

  // ==================== HELPER FUNCTIONS ====================
  const formatTime = (value) => {
    if (value == null || value === 0) return "0 s";
    const seconds = timesInMs ? Math.round(value / 1000) : Math.round(value);
    if (seconds < 60) return `${seconds} s`;
    return `${(seconds / 60).toFixed(1)} min`;
  };

  const formatMinutesValue = (minutes) => {
    if (!minutes) return "0 s";
    const seconds = Math.round(minutes * 60);
    if (seconds < 60) return `${seconds} s`;
    return `${Number(minutes).toFixed(1)} min`;
  };
  function getMarksAwarded(selected, question) {
  if (!selected) return 0;

  const { full, negative } = parseMarks(question?.marks);

  if (question.qtype === "MSQ") {
    return calculateMSQMarks(selected, question.answer, question.marks);
  }

  return selected === question.answer ? full : -negative;
}


  const COLORS = ["#4CAF50", "#FF4C4C", "#A0A0A0"];

  // Subject max marks (JEE style)
const SUBJECT_MAX_MARKS = 100;
const OVERALL_MAX_MARKS = 300;

// Calculate overall marks dynamically
const overallMarks = subjectAnalysis.reduce(
  (sum, subj) => sum + subj.marks,
  0
);

// Build score strip data
const scoreStripData = [
  {
    label: "OVERALL",
    score: overallMarks,
    total: OVERALL_MAX_MARKS,
    type: "overall",
    icon: "✔✔",
  },
  ...subjectAnalysis.map(subj => ({
    label: subj.subjectName.toUpperCase(),
    score: subj.marks,
    total: SUBJECT_MAX_MARKS,
    type: subj.subjectName.toLowerCase(), // physics | chemistry | mathematics
    icon:
      subj.subjectName === "Physics"
        ? "⚛"
        : subj.subjectName === "Chemistry"
        ? "🧪"
        : "±",
  })),
];


  // ==================== RENDER ====================
  return (
    <div className="results-page">
      <h1>Test Results</h1>
      <div className="results-actions">
        <button
          className="view-solutions-btn"
          onClick={() =>
            navigate(`/solutions/${testId}`, {
              state: { resultData, responses }
            })
          }
        >
          View Solutions
        </button>
      </div>
      {/* {console.log(scoreStripData)} */}

      {/* SCORE SUMMARY */}
      <div className="score-summary">
        {/* TOTAL SCORE CIRCLE */}
        <div className="score-circle">
          <svg>
            <circle cx="80" cy="80" r="70" className="circle-bg" />
            <circle
              cx="80"
              cy="80"
              r="70"
              className="circle-progress"
              style={{
                strokeDasharray: 439.82,
                strokeDashoffset: 439.82 - (summary.marksObtained / summary.maxMarks) * 439.82
              }}
            />
          </svg>

          <div className="circle-text">
            <h2>{summary.marksObtained}</h2>
            <p>out of {summary.maxMarks}</p>
          </div>
        </div>

        {/* SUBJECT MARKS */}
        <div className="subject-score-cards">
          {subjectAnalysis.map((subj, idx) => (
            <div key={idx} className={`subject-card subject-${idx}`}>
              <h3>{subj.subjectName}</h3>
              <p>
                {subj.marks} <span>marks</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <h1 className="results-title">Overview</h1>
      <p className="results-subtitle">
        This is a quick snapshot of your performance in this test.
      </p>

      <div className="overview-grid">
        {/* SCORE */}
        <div className="overview-card orange">
          <div>
            <h4>Score</h4>
            <p>Overall marks scored in this test</p>
          </div>
          <span>{summary.marksObtained}/{summary.maxMarks}</span>
        </div>

        {/* ATTEMPTED */}
        <div className="overview-card blue">
          <div>
            <h4>Questions Attempted</h4>
            <p>Total qs attempted in the test</p>
          </div>
          <span>{summary.attempted}/{summary.total}</span>
        </div>

        {/* ACCURACY */}
        <div className="overview-card green">
          <div>
            <h4>Accuracy</h4>
            <p>Overall accuracy of the test</p>
          </div>
          <span>{summary.accuracy}%</span>
        </div>

        {/* TIME TAKEN */}
        <div className="overview-card yellow">
          <div>
            <h4>Time Taken</h4>
            <p>Time spent to complete the test</p>
          </div>
          <span>{formatTime(summary.totalTime)}</span>
        </div>

        {/* POSITIVE SCORE */}
        <div className="overview-card purple">
          <div>
            <h4>Positive Score</h4>
            <p>Score if incorrect attempts are ignored</p>
          </div>
          <span>
            {summary.marksObtained + summary.wrong} / {summary.maxMarks}
          </span>
        </div>

        {/* MARKS LOST */}
        <div className="overview-card red">
          <div>
            <h4>Marks Lost</h4>
            <p>Marks lost due to wrong attempts</p>
          </div>
          <span>{summary.wrong}</span>
        </div>
      </div>

      {/* SUBJECT SUMMARY CHARTS */}
      <h2>Subject-wise Metrics</h2>

      <div className="subject-metrics-grid">
        {/* TIME SPENT PIE */}
        <div className="metric-card">
          <h3>Subject-wise Time Spent</h3>
          <div className="metric-legend">
            {subjectMetrics.time.map((s, i) => (
              <div key={i} className="legend-item small">
                <span className="legend-color" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span>{s.name}: {Math.round(s.value)} min</span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={subjectMetrics.time} dataKey="value" nameKey="name" outerRadius={80} label={({ name, value }) => `${Math.round(value)} min`}>
                {subjectMetrics.time.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${(+value).toFixed(1)} min`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ATTEMPTED BAR */}
        <div className="metric-card">
          <h3>Subject-wise Questions Attempted</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectMetrics.attempted}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} Qs`} />
              <Bar dataKey="attempted" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ACCURACY BAR */}
        <div className="metric-card">
          <h3>Subject-wise Accuracy</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectMetrics.accuracy}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="accuracy" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="analysis-section">
      
          <div className="analysis-section">



          <h2>Test Performance</h2>
        <p className="section-subtitle">
          This shows your overall as well as subject-wise scores.
        </p>

        <ScoreStrip data={scoreStripData} />

  <h2>Test Breakdown</h2>
  <p className="section-subtitle">
    Subject-wise breakdown of your correct, incorrect, unattempted and not visited questions.
  </p>

  <div className="breakdown-table">
    <div className="breakdown-header">
      <span>Subject</span>
      <span>Correct Attempts</span>
      <span>Incorrect Attempts</span>
      <span>Unattempted Qs</span>
      {/* <span>Not Visited Qs</span> */}
    </div>

    {subjectAnalysis.map((subj, idx) => {
      const total = subj.total;

      const correctPct = (subj.correct / total) * 100;
      const wrongPct = (subj.wrong / total) * 100;
      const unattemptedPct = (subj.unattempted / total) * 100;
      const notVisitedPct = ((subj.notVisited ?? 0) / total) * 100;

      return (
        <div className="breakdown-row" key={idx}>
  <div className="subject-cell">{subj.subjectName}</div>

  {/* Correct */}
  <div className="bar-cell green">
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: `${correctPct}%` }} />
      <span className="bar-text">{subj.correct} / {total}</span>
    </div>
  </div>

  {/* Incorrect */}
  <div className="bar-cell red">
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: `${wrongPct}%` }} />
      <span className="bar-text">{subj.wrong} / {total}</span>
    </div>
  </div>

  {/* Unattempted */}
  <div className="bar-cell blue">
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: `${unattemptedPct}%` }} />
      <span className="bar-text">{subj.unattempted} / {total}</span>
    </div>
  </div>

</div>

      );
    })}
  </div>
</div>


          <h2>Time Analysis</h2>
            <p className="section-subtitle">
              Time spent, questions attempted and accuracy at subject level.
            </p>

            <div className="time-table">
              <div className="time-header">
                <span>SUBJECT</span>
                <span>TIME SPENT</span>
                <span>QS ATTEMPTED</span>
                <span>ACCURACY</span>
              </div>

              {/* OVERALL */}
              <div className="time-row overall">
                <div className="time-subject">
                  ✔✔ Overall
                </div>

                <div className="time-cell">
                  {formatTime(summary.totalTime)}
                </div>

                <div className="time-cell">
                  {summary.attempted} <span>/ {summary.total}</span>
                </div>

                <div className="time-cell">
                  {summary.accuracy}%
                </div>
              </div>

              {/* SUBJECTS */}
              {subjectAnalysis.map((subj, idx) => (
                <div className="time-row" key={idx}>
                  <div className="time-subject">
                    {subj.subjectName === "Physics" ? "⚛" :
                    subj.subjectName === "Chemistry" ? "🧪" : "±"}{" "}
                    {subj.subjectName}
                  </div>

                  <div className="time-cell">
                    {formatTime(subj.timeSpent)}
                  </div>

                  <div className="time-cell">
                    {subj.attempted} <span>/ {subj.total}</span>
                  </div>

                  <div className="time-cell">
                    {subj.accuracy}%
                  </div>
                </div>
              ))}
            </div>

      </div>


      <h2>Time Spent per Question (Subject & Section-wise)</h2>

      {subjectWiseTimeCharts.map((subject, sIdx) => (
        <div key={sIdx} className="subject-chart-wrapper">
          <h2 className="subject-title">{subject.subjectName}</h2>

          <div className="section-charts">
            {subject.sections.map((section, secIdx) => (
              <div key={secIdx} className="section-chart-card">
                <h4>{section.sectionName}</h4>

                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={section.data}>
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Time (min)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `${(+value).toFixed(1)} min`} />
                    <Bar
                      dataKey="time"
                      fill={secIdx === 0 ? "#2563EB" : "#F97316"}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <p className="section-label">
                  {secIdx === 0
                    ? "Section A (Q1–20)"
                    : "Section B (Q1–5)"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2>Time Distribution by Attempt Status</h2>

      <div className="pie-legend">
        <div className="legend-item">
          <span className="legend-color correct"></span>
          <span>Correct</span>
        </div>

        <div className="legend-item">
          <span className="legend-color wrong"></span>
          <span>Wrong</span>
        </div>

        <div className="legend-item">
          <span className="legend-color unattempted"></span>
          <span>Unattempted</span>
        </div>
      </div>

      <div className="pie-grid">
        {timePieData.map((pie, idx) => (
          <div key={idx} className="pie-card">
            <h4>{pie.title}</h4>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pie.data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, value }) => formatMinutesValue(value)}
                >
                  <Cell fill="#4CAF50" /> {/* Correct */}
                  <Cell fill="#FF4C4C" /> {/* Wrong */}
                  <Cell fill="#A0A0A0" /> {/* Unattempted */}
                </Pie>
                <Tooltip formatter={(value) => formatMinutesValue(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* DETAILED QUESTION TABLE */}
      <h2>Question-wise Details</h2>
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Q No</th>
            <th>Subject</th>
            <th>Section</th>
            <th>Selected Answer</th>
            <th>Correct Answer</th>
            <th>Marks Awarded</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {resultData.filter(q => q.question_id).map((q, idx) => {
            const section =
            testData[q.subjectIndex].sections[q.sectionIndex];

          const allQuestions = flattenedQuestionsMap[`${q.subjectIndex}-${q.sectionIndex}`] || [];

          const question = allQuestions.find(
            qq => qq.question_id === q.question_id
          );

            // question = testData[q.subjectIndex].sections[q.sectionIndex].questions.find(qq => qq.question_id === q.question_id);
           let status = "Unattempted";

         if (q.selectedAnswer !== null) {
        if (question.qtype === "MSQ") {
          const score = getMarksAwarded(q.selectedAnswer, question); // use same function
          status =
            score === Number(question.marks.full) ? "Correct" :
            score > 0 ? "Partially Correct" :
            score < 0 ? "Wrong" : "Incorrect";
        } else {
          status = q.selectedAnswer === question.answer ? "Correct" : "Wrong";
        }
      }


            return (
              <tr key={idx}>
                <td>{q.question_id}</td>
                <td>{testData[q.subjectIndex].SubjectName}</td>
                <td>{testData[q.subjectIndex].sections[q.sectionIndex].SectionName}</td>
                <td>{formatAnswer(q.selectedAnswer, question.qtype)}</td>
                <td>{formatAnswer(question.answer, question.qtype)}</td>
                 <td>{getMarksAwarded(q.selectedAnswer, question)}</td>
                <td>{status}</td>
                <td>{formatTime(q.timeTaken)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}