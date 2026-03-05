import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import exams from "../data/exams.json";
import streams from "../data/streams.json";
import courses from "../data/courses.json";
import courseStreams from "../data/courseStreams.json";
import modules from "../data/modules.json";
import instructors from "../data/instructors.json";
import Navbar from "../components/Navbar";
import examVisual from "../assets/course_card.png"
import "./ExamDetails.css";

const ExamDetails = () => {
  const { examId,streamId } = useParams();
  const navigate = useNavigate();

  const exam = exams.find(e => e.id === examId);
  const [searchQuery, setSearchQuery] = useState("");
const [courseTypeFilter, setCourseTypeFilter] = useState("all");



  const examStreams = exam.hasStreams
  ? streams.filter(s => s.examId === examId)
  : [];
  const activeStream =
  exam.hasStreams && streamId
    ? examStreams.find(s => s.id === streamId)
    : null;

  // const baseCourses = courses.filter(c => c.examId === examId);


  const streamCourses = exam.hasStreams && activeStream
  ? courseStreams
      .filter(cs => cs.streamId === activeStream.id)
      .map(cs => {
        const course = courses.find(c => c.id === cs.courseId);
        return course ? { ...course, ...cs } : null;
      })
      .filter(Boolean)
  : courses.filter(c => c.examId === examId);

 
  const [selectedModule, setSelectedModule] = useState("complete-preparation-program");
  const [openCourse, setOpenCourse] = useState(null);

  const activeModule = modules.find(m => m.id === selectedModule);
  const allCourses = exam.hasStreams && activeStream
  ? courseStreams
      .filter(cs => cs.streamId === activeStream.id)
      .map(cs => {
        const course = courses.find(c => c.id === cs.courseId);
        return course ? { ...course, ...cs } : null;
      })
      .filter(Boolean)
  : courses.filter(c => c.examId === examId);
const filteredCourses = allCourses
  .filter(course => course.moduleId === selectedModule)
  .filter(course => {
    if (courseTypeFilter === "all") return true;
    return course.courseType === courseTypeFilter;
  })
  .filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pattern = activeStream
  ? activeStream.examPattern
  : exam.examPattern;


return (
  <div className="exam-layout">
    <Navbar />

    {/* LEFT – SCROLLABLE CONTENT */}
    <div className="exam-scroll-content">
      <div className="exam-details-page">

        {/* HEADER */}
        <div className="exam-title-box">
          <h1>{exam.name} Preparation</h1>
           <p>{exam.about}</p>
        </div>

    {/* OVERVIEW */}
    <div className="overview-section">

      {/* CARD 1 – BASIC DETAILS */}
      <div className="overview-cardd">
        <h3>Exam Overview</h3>

        <p><strong>Conducted By:</strong> {exam.conductedBy}</p>
        <p><strong>Exam Month:</strong> {exam.examMonths}</p>
        <p><strong>Eligibility:</strong> {exam.eligibility}</p>

        <p>
          <strong>Official Link:</strong>{" "}
          <a href={exam.officialLink} target="_blank" rel="noreferrer">
            {exam.officialLink}
          </a>
        </p>
      </div>

      {/* CARD 2 – EXAM PATTERN */}
<div className="overview-cardd">
  <h3>Exam Pattern</h3>

  <p>
    <strong>Subjects:</strong>{" "}
    {Array.isArray(pattern?.subjects)
      ? pattern.subjects
          .map(s => (typeof s === "string" ? s : s.name))
          .join(", ")
      : "-"}
  </p>

  <p>
    <strong>Total Questions:</strong>{" "}
    {pattern?.totalQuestions ?? "-"}
  </p>

  <p>
    <strong>Total Marks:</strong>{" "}
    {pattern?.marks ?? "-"}
  </p>

  <p>
    <strong>Duration:</strong>{" "}
    {pattern?.duration ?? "-"}
  </p>
</div>


      {/* CARD 3 – SPECIALITY */}
      <div className="overview-cardd">
        <h3>Our Speciality</h3>

        <ul>
          {exam.speciality.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

    </div>


        {/* PROGRAM BUTTONS */}
        <h2 className="section-title">Programs we provide</h2>

        <div className="program-buttons">
          {modules.map(module => (
            <button
              key={module.id}
              className={selectedModule === module.id ? "active" : ""}
              onClick={() => setSelectedModule(module.id)}
            >
              {module.title}
            </button>
          ))}
        </div>

        {/* PROGRAM FEATURES */}
        <div className="program-features">
          <h3>{activeModule.title} includes:</h3>

          <div className="features-grid">
            {activeModule.features.map((feature, i) => (
              <div key={i} className="feature-item">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="course-filters">
  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search courses..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="course-search"
  />

  {/* COURSE TYPE FILTER */}
  <select
    value={courseTypeFilter}
    onChange={(e) => setCourseTypeFilter(e.target.value)}
    className="course-type-filter"
  >
    <option value="all">All Courses</option>
    <option value="Full Course">Full Course</option>
    <option value="Subject-wise Course">Subject-wise</option>
    <option value="Topic-wise Course">Topic-wise</option>
  </select>
</div>

        
{/* COURSES GRID */}
<div className="courses-grid">
  {filteredCourses.map(course => {

  // {streamCourses
  //   .filter(c => c.moduleId === selectedModule)
  //   .map(course => {
      const instructor = instructors.find(
        i => i.id === course.instructorId
      );

      return (
        <div key={course.id} className="course-card-new">
          
          {/* IMAGE */}
          <div className="course-image">
            <img
              src={course.image || examVisual}
              alt={course.title}
            />
          </div>

          {/* CONTENT */}
          <div className="course-content">
            <h3 className="course-title">{course.title}</h3>

            <p className="course-instructor">
               {course.tag}
            </p>
             {activeStream && (
          <p className="stream-name">
            🎓 {activeStream.name}
          </p>
        )}

            <div className="course-meta">
           <span>
            {course.totalVideos != null
              ? `🎥 ${course.totalVideos} Vedios`
              : course.totalTests != null
              ? `📝 ${course.totalTests} Tests`
              : `❓ ${course.totalQuestions} Questions`}
          </span>

              <span>📘 {course.courseType}</span>
            </div>

            <button
              className="view-course-btn"
            onClick={() =>
            navigate(
              activeStream
                ? `/course/${course.id}/stream/${activeStream.id}`
                : `/course/${course.id}`
            )
          }            >
              View Course →
            </button>
          </div>
        </div>
      );
    })}
</div>


      </div>
    </div>



  </div>
);

};

export default ExamDetails;
