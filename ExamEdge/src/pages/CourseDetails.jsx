import { useParams, useNavigate } from "react-router-dom";

import courses from "../data/courses.json";
import courseStreams from "../data/courseStreams.json";
import instructors from "../data/instructors.json";
import exams from "../data/exams.json";
import modules from "../data/modules.json";
import examVisual from "../assets/online_lecturee.png";
import instructor1 from "../assets/instructor_image.jpg"
import "./CourseDetails.css";

const CourseDetails = () => {
  const { courseId,streamId } = useParams();
  const navigate = useNavigate();
// const baseCourse = courses.find(c => c.id === courseId);
// if (!baseCourse) return <p>Course not found</p>;

// const streamCourse = streamId
//   ? courseStreams.find(
//       cs => cs.courseId === courseId && cs.streamId === streamId
//     )
//   : null;

// const course = {
//   ...baseCourse,
//   ...(streamCourse || {})
// };
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
  { label: "Exam", value: exam?.name || course.examId },
  { label: "Course Type", value: course.courseType },
  { label: "Subjects", value: formatSubjects(course.subjects) },
  { label: "Difficulty", value: course.difficultyLevel },
  { label: "Best For", value: course.bestFor },
  { label: "Validity", value: course.validity },
  { label: "Total Topics", value: course.totalTopics },
  { label: "Total Videos", value: course.totalVideos },
  { label: "Total Questions", value: course.totalQuestions },
  { label: "Total Tests", value: course.totalTests }
].filter(item => item.value);


  return (
    <div className="course-details-page">

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

  <p className="hero-instructor">
    By {instructor?.name}
  </p>

  <div className="hero-stats">
    {course.totalVideos && <span>🎥 {course.totalVideos} Videos</span>}
    {course.totalTopics && <span>📚 {course.totalTopics} Topics</span>}
    {course.totalTests && <span>🧪 {course.totalTests} Tests</span>}
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

          {/* COURSE + INSTRUCTOR */}
          <div className="details-row">

            <section className="info-card">
        <h2>Course Details</h2>

        {courseDetails.map((item, index) => (
            <p key={index}>
            <strong>{item.label}:</strong> {item.value}
            </p>
        ))}

        {course.performanceTracking && (
            <p>
            <strong>Performance Tracking:</strong> Available
            </p>
        )}
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
