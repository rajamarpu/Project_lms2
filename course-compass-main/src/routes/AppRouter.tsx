import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses/Courses";
import CourseDetails from "@/pages/Courses/CourseDetails";
import CreateCourse from "@/pages/Courses/CreateCourse";
import Dashboard from "@/pages/Dashboard/Dashboard";
import LearningPaths from "@/pages/Courses/LearningPaths";
import LearningPathDetails from "@/pages/Courses/LearningPathDetails";
import CoursePlayer from "@/pages/Courses/CoursePlayer";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import InstructorPortal from "@/pages/Portal/InstructorPortal";
import ManageCourse from "@/pages/Portal/ManageCourse";
import Profile from "@/pages/Profile/Profile";
import CertificatesList from "@/pages/Certificate/CertificatesList";
import { AuthProvider } from "@/store/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { Features, Notifications, Settings, Support } from "@/pages/InfoPages";
import LearningWork from "@/pages/Courses/LearningWork";
import VerifyCertificate from "@/pages/Certificate/VerifyCertificate";
import { AITutors, Community, CommunityTopic, LiveSessions, QuestionPractice } from "@/pages/FeaturePages";

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* All pages share Navbar/Footer via MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/features" element={<Features />} />
            <Route path="/support" element={<Support />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:id" element={<LearningPathDetails />} />
            <Route path="/verify/:verificationId" element={<VerifyCertificate />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/learn/:id" element={<CoursePlayer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/certificates" element={<CertificatesList />} />
              <Route path="/certificate/:courseId" element={<CertificatesList />} />
              <Route path="/courses/:courseId/work" element={<LearningWork />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:topicId" element={<CommunityTopic />} />
              <Route path="/live-sessions" element={<LiveSessions />} />
              <Route path="/ai-tutors" element={<AITutors />} />
              <Route path="/questions" element={<QuestionPractice />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/courses/new" element={<CreateCourse />} />
              <Route path="/portal" element={<InstructorPortal />} />
              <Route path="/portal/courses/:id" element={<ManageCourse />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
