import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Exams from "./pages/Exams";
import ExamDetails from "./pages/ExamDetails.jsx";
import BuyNow from "./pages/BuyNow";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import DemoOtpLogin from "./pages/DemoOtpLogin.jsx";
import Instructions from "./pages/Instructions.jsx";
import SolutionsPage from "./pages/SolutionsPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css"
import ExamPage from "./pages/ExamPage.jsx";




function App() {

  return (

    <BrowserRouter>
    <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:examId" element={<ExamDetails />} />
        <Route path="/exams/:examId/stream/:streamId" element={<ExamDetails />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
        <Route path="/course/:courseId/stream/:streamId" element={<CourseDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mock/:category" element={<DemoOtpLogin />} />

      <Route path="/instructions" element={<ProtectedRoute><Instructions showStartButton={true} /> </ProtectedRoute>} />
      <Route path="/mock-test" element={<ProtectedRoute><ExamPage />  </ProtectedRoute>} />
      <Route path="/solutions" element={<ProtectedRoute><SolutionsPage /></ProtectedRoute>} />
      <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/buy/:courseId" element={<BuyNow />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App
