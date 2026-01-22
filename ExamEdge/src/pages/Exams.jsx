import { useSearchParams,useNavigate } from "react-router-dom";
import exams from "../data/exams.json";
import streams from "../data/streams.json";
import { useState } from "react";
import Navbar from "../components/Navbar";

import "./Exams.css";

import StreamSelectModal from "../components/StreamSelectModal";

const Exams = () => {
    const navigate=useNavigate();
    const [searchParams] = useSearchParams();

    const category=searchParams.get("category");

    const filteredExams=category?exams.filter(exam=>exam.category===category):exams;
  
     const [showStreamModal, setShowStreamModal] = useState(false);
      const [selectedExamId, setSelectedExamId] = useState(null);

      const handleExamClick = (exam) => {
        if (!exam.hasStreams) {
          // Direct navigation
          navigate(`/exams/${exam.id}`);
        } else {
          // Show stream popup
          setSelectedExamId(exam.id);
          setShowStreamModal(true);
        }
      };

      const handleStreamSelect = (stream) => {
        setShowStreamModal(false);
         if (!selectedExamId) return;
        navigate(`/exams/${selectedExamId}/stream/${stream.id}`);
      };

      const examStreams = selectedExamId
        ? streams.filter(s => s.examId === selectedExamId)
        : [];


  
    return (
    <div className="exams-page">
      <Navbar />

      {/* STREAM POPUP */}
      {showStreamModal && selectedExamId && (
        <StreamSelectModal
          examName={exams.find(e => e.id === selectedExamId)?.name}
          streams={examStreams}
          onSelect={handleStreamSelect}
          onClose={() => setShowStreamModal(false)}
        />
      )}

      {/* PAGE HEADER */}
    <section className="exams-header">
      <div className="header-top">
        <h1 className="page-title">
          {category === "UG" && "Undergraduate Entrance Exams"}
          {category === "PG" && "Postgraduate Entrance Exams"}
          {!category && "UG & PG Entrance Exams"}
        </h1>
        <p>
        Choose your exam and get a complete, expert-led preparation package
      </p>

        {/* Try Demo Test button only for UG */}
          <button
            className="demo-btn"
            onClick={() => window.open(`/mock/${category}`, "_blank")}
          >
            Try Mock Test
          </button>
        
      </div>
    </section>


      {/* EXAM CARDS */}
      <section className="exam-list">
        {filteredExams.map((exam) => (

          <div key={exam.id} className="exam-card">

            <div className="exam-left">
              <span className="exam-category">{exam.category}</span>

              <h2>{exam.name}</h2>

              <p className="exam-about">{exam.about}</p>

              <div className="exam-meta">
                <div>
                  <strong>Conducted By</strong>
                  <span>{exam.conductedBy}</span>
                </div>
                <div>
                  <strong>Exam Months</strong>
                  <span>{exam.examMonths}</span>
                </div>
                <div>
                  <strong>Eligibility</strong>
                  <span>{exam.eligibility}</span>
                </div>


              </div>
            </div>

            <div className="exam-right">
              <h4>Why eGradTutor?</h4>
              <ul>
                {exam.speciality.map((item) => (
                  <li key={item}>✔ {item}</li>
                ))}
              </ul>

              <button className="exam-cta"
              onClick={()=> handleExamClick(exam)}>
                {exam.cta}
              </button>
            </div>

          </div>
        ))}
      </section>

    </div>
  );
};

export default Exams;
