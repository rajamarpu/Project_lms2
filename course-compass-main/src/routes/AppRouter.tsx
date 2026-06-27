import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider } from "@/store/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Lazy-loaded pages for code splitting
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/Auth/ResetPassword"));
const Courses = lazy(() => import("@/pages/Courses/Courses"));
const CourseDetails = lazy(() => import("@/pages/Courses/CourseDetails"));
const CoursePlayer = lazy(() => import("@/pages/Courses/CoursePlayer"));
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const CertificatesList = lazy(() => import("@/pages/Certificate/CertificatesList"));
const Certificate = lazy(() => import("@/pages/Certificate/Certificate"));
const VerifyCertificate = lazy(() => import("@/pages/Certificate/VerifyCertificate"));
const LearningWork = lazy(() => import("@/pages/Courses/LearningWork"));
const Wishlist = lazy(() => import("@/pages/Courses/Wishlist"));
const Payments = lazy(() => import("@/pages/Courses/Payments"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const LearningPaths = lazy(() => import("@/pages/Courses/LearningPaths"));
const LearningPathDetails = lazy(() => import("@/pages/Courses/LearningPathDetails"));
const CreateCourse = lazy(() => import("@/pages/Courses/CreateCourse"));
const InstructorPortal = lazy(() => import("@/pages/Portal/InstructorPortal"));
const ManageCourse = lazy(() => import("@/pages/Portal/ManageCourse"));

// Feature pages (lazy loaded)
const InfoPages = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Notifications })));
const SettingsPage = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Settings })));
const SupportPage = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Support })));
const FeaturesPage = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Features })));
const CommunityPage = lazy(() => import("@/pages/FeaturePages").then(m => ({ default: m.Community })));
const CommunityTopicPage = lazy(() => import("@/pages/FeaturePages").then(m => ({ default: m.CommunityTopic })));
const LiveSessionsPage = lazy(() => import("@/pages/FeaturePages").then(m => ({ default: m.LiveSessions })));
const AITutorsPage = lazy(() => import("@/pages/FeaturePages").then(m => ({ default: m.AITutors })));
const QuestionPracticePage = lazy(() => import("@/pages/FeaturePages").then(m => ({ default: m.QuestionPractice })));

// Loading fallback
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<LazyRoute><Home /></LazyRoute>} />
            <Route path="/login" element={<LazyRoute><Login /></LazyRoute>} />
            <Route path="/register" element={<LazyRoute><Register /></LazyRoute>} />
            <Route path="/forgot-password" element={<LazyRoute><ForgotPassword /></LazyRoute>} />
            <Route path="/reset-password/:id/:token" element={<LazyRoute><ResetPassword /></LazyRoute>} />
            <Route path="/courses" element={<LazyRoute><Courses /></LazyRoute>} />
            <Route path="/courses/:id" element={<LazyRoute><CourseDetails /></LazyRoute>} />
            <Route path="/features" element={<LazyRoute><FeaturesPage /></LazyRoute>} />
            <Route path="/support" element={<LazyRoute><SupportPage /></LazyRoute>} />
            <Route path="/learning-paths" element={<LazyRoute><LearningPaths /></LazyRoute>} />
            <Route path="/learning-paths/:id" element={<LazyRoute><LearningPathDetails /></LazyRoute>} />
            <Route path="/verify/:verificationId" element={<LazyRoute><VerifyCertificate /></LazyRoute>} />

            {/* Protected learner routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/learn/:id" element={<LazyRoute><CoursePlayer /></LazyRoute>} />
              <Route path="/dashboard" element={<LazyRoute><Dashboard /></LazyRoute>} />
              <Route path="/profile" element={<LazyRoute><Profile /></LazyRoute>} />
              <Route path="/notifications" element={<LazyRoute><InfoPages /></LazyRoute>} />
              <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
              <Route path="/certificates" element={<LazyRoute><CertificatesList /></LazyRoute>} />
              <Route path="/certificate/:courseId" element={<LazyRoute><Certificate /></LazyRoute>} />
              <Route path="/courses/:courseId/work" element={<LazyRoute><LearningWork /></LazyRoute>} />
              <Route path="/wishlist" element={<LazyRoute><Wishlist /></LazyRoute>} />
              <Route path="/payments" element={<LazyRoute><Payments /></LazyRoute>} />
              <Route path="/community" element={<LazyRoute><CommunityPage /></LazyRoute>} />
              <Route path="/community/:topicId" element={<LazyRoute><CommunityTopicPage /></LazyRoute>} />
              <Route path="/live-sessions" element={<LazyRoute><LiveSessionsPage /></LazyRoute>} />
              <Route path="/ai-tutors" element={<LazyRoute><AITutorsPage /></LazyRoute>} />
              <Route path="/questions" element={<LazyRoute><QuestionPracticePage /></LazyRoute>} />
            </Route>

            {/* Admin & Instructor routes */}
            <Route element={<ProtectedRoute roles={["admin", "instructor"]} />}>
              <Route path="/courses/new" element={<LazyRoute><CreateCourse /></LazyRoute>} />
              <Route path="/portal" element={<LazyRoute><InstructorPortal /></LazyRoute>} />
              <Route path="/portal/courses/:id" element={<LazyRoute><ManageCourse /></LazyRoute>} />
            </Route>
          </Route>

          <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
