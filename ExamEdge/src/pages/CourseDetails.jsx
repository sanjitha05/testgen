import { useParams, useNavigate } from "react-router-dom";

import courses from "../data/courses.json";
import courseStreams from "../data/courseStreams.json";
import instructors from "../data/instructors.json";
import Navbar from "../components/Navbar";
import exams from "../data/exams.json";
import modules from "../data/modules.json";
import examVisual from "../assets/online_lecturee.png";
import instructor1 from "../assets/instructor_image.jpg"
import "./CourseDetails.css";
import { ins } from "framer-motion/client";

const CourseDetails = () => {
  const { courseId,streamId } = useParams();
  const navigate = useNavigate();
const baseCourse = courses.find(c => c.id === courseId);
const standaloneCourse = courseStreams.find(cs => cs.id === courseId); // courseId might be a stream-course id
const streamCourse = streamId
  ? courseStreams.find(cs => (cs.courseId === courseId || cs.id === courseId) && cs.streamId === streamId)
  : null;

const course = streamCourse
  ? { ...(baseCourse || {}), ...streamCourse }
  : standaloneCourse || baseCourse;

if (!course) return <p>Course not found</p>;
 

  const exam = exams.find(e => e.id === course.examId);
  const instructor = instructors.find(i => i.id === course.instructorId);
  const module = modules.find(m => m.id === course.moduleId);
  const formatSubjects = subjects =>
    Array.isArray(subjects) ? subjects.join(", ") : subjects;

 

  const courseDetails = [
  { label: "Exam", value: exam?.name || course.examId, icon: "🎓" },
  { label: "Course Type", value: course.courseType, icon: "🏷️" },
  { label: "Subjects", value: formatSubjects(course.subjects), icon: "📖" },
  { label: "Difficulty", value: course.difficultyLevel, icon: "⚡" },
  { label: "Best For", value: course.bestFor, icon: "🎯" },
  { label: "Validity", value: course.validity, icon: "⏳" },
  { label: "Total Topics", value: course.totalTopics, icon: "📚" },
  { label: "Total Videos", value: course.totalVideos, icon: "🎥" },
  { label: "Total Questions", value: course.totalQuestions, icon: "❓" },
  { label: "Total Tests", value: course.totalTests, icon: "🧪" }
].filter(item => item.value);


  return (
    <div className="course-details-page">
      <Navbar />
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>

      {/* HERO */}
      <div className="course-hero">
<div className="course-hero-left">

  {/* TAG */}

  {course.tag && (
    <span className="course-tag">
      {course.courseType}
    </span>
  )}


  <h1>{course.title}</h1>

  {/* SHORT DESCRIPTION */}
  {course.shortDescription && (
    <p className="hero-description">
      {course.shortDescription}
    </p>
  )}
  {instructor && (
    <p className="hero-instructor">
    By {instructor?.name}
  </p> )}
  

  <div className="hero-stats">
    {course.totalVideos && <span>🎥 {course.totalVideos} Videos</span>}
    {course.totalTopics && <span>📚 {course.totalTopics} Topics</span>}
    {course.totalTests && <span>🧪 {course.totalTests} Tests</span>}
     {course.totalQuestions && <span>❓ {course.totalQuestions} Questions</span>}
  </div>

  <button
    className="hero-buy-btn"
    onClick={() => navigate(`/buy/${course.id}`)}
  >
    Buy Now
  </button>
</div>


        <div className="course-hero-right">
          <img src={course.image || examVisual} alt={course.title} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="course-info-layout">

        {/* LEFT */}
        <div className="course-main-details">
          
          {course.description && (
            <section className="info-card description-card">
              <h2>About this Course</h2>
              <p className="full-description">{course.description}</p>
            </section>
          )}

          {/* COURSE + INSTRUCTOR */}
          <div className="details-row">

            <section className="info-card">
        <h2>What's Included</h2>

        <div className="course-stats-grid">
          {courseDetails.map((item, index) => (
              <div key={index} className="stat-card">
                <span className="stat-icon">{item.icon}</span>
                <div className="stat-info">
                  <span className="stat-label">{item.label}</span>
                  <span className="stat-value">{item.value}</span>
                </div>
              </div>
          ))}
          {course.performanceTracking && (
              <div className="stat-card">
                <span className="stat-icon">📈</span>
                <div className="stat-info">
                  <span className="stat-label">Performance Tracking</span>
                  <span className="stat-value">Available</span>
                </div>
              </div>
          )}
        </div>
        </section>

                  {/* PROGRAM FEATURES */}
          {module && (
            <section className="info-card">
              <h2>{module.title} Features</h2>

                <div className="features-grid">
                {module.features.map((feature, i) => (
                    <div key={i} className="feature-item">
                    {feature}
                    </div>
                ))}
                </div>

            </section>
          )}


           

          </div>

           {/* {instructor && (
              <section className="info-card instructor-card">
                <h2>About our Instructor</h2>
                <div className="instructor-img">
                <img src={instructor.image || instructor1} alt="Instructor image"/>
                </div>
                <p><strong>Name:</strong> {instructor.name}</p>
                <p><strong>Experience:</strong> {instructor.experience}</p>
                <p><strong>Students Taught:</strong> {instructor.students}</p>
                <p><strong>Expertise:</strong> {instructor.expertise}</p>
              </section>
            )} */}



        </div>

        {/* RIGHT */}
        <div className="course-buy-panel">
          <p className="limited-offer">🔥 Limited Period Offer</p>
          <p className="course-price">{course.price}</p>

          <button
            className="buy-now-btn"
            onClick={() => navigate(`/buy/${course.id}`)}
          >
            Buy Course
          </button>

          <p className="trust-text">
            🔒 Secure Payment <br />
            ⭐ Trusted by 9,000+ Students
          </p>
        </div>

      </div>
    </div>
  );
};

export default CourseDetails;
