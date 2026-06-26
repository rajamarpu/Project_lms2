import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthProvider } from "@/store/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

const Home = lazy(() => import("@/pages/Home"));
const Courses = lazy(() => import("@/pages/Courses/Courses"));
const CourseDetails = lazy(() => import("@/pages/Courses/CourseDetails"));
const CreateCourse = lazy(() => import("@/pages/Courses/CreateCourse"));
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));
const LearningPaths = lazy(() => import("@/pages/Courses/LearningPaths"));
const LearningPathDetails = lazy(() => import("@/pages/Courses/LearningPathDetails"));
const CoursePlayer = lazy(() => import("@/pages/Courses/CoursePlayer"));
const LearningWork = lazy(() => import("@/pages/Courses/LearningWork"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const RoleSelection = lazy(() => import("@/pages/Auth/RoleSelection"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/Auth/ResetPassword"));
const InstructorPortal = lazy(() => import("@/pages/Portal/InstructorPortal"));
const ManageCourse = lazy(() => import("@/pages/Portal/ManageCourse"));
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const CertificatesList = lazy(() => import("@/pages/Certificate/CertificatesList"));
const Certificate = lazy(() => import("@/pages/Certificate/Certificate"));
const Wishlist = lazy(() => import("@/pages/Courses/Wishlist"));
const VerifyCertificate = lazy(() => import("@/pages/Certificate/VerifyCertificate"));
const infoPage = (name: string) => lazy(() => import("@/pages/InfoPages").then((module) => ({ default: module[name as keyof typeof module] as ComponentType })));
const featurePage = (name: string) => lazy(() => import("@/pages/FeaturePages").then((module) => ({ default: module[name as keyof typeof module] as ComponentType })));
const Features = infoPage('Features'); const Notifications = infoPage('Notifications'); const Settings = infoPage('Settings'); const Support = infoPage('Support');
const AITutors = featurePage('AITutors'); const Community = featurePage('Community'); const CommunityTopic = featurePage('CommunityTopic');

const RouteLoader = () => <div className="container grid min-h-[55vh] place-items-center" role="status" aria-live="polite"><div className="w-full max-w-4xl space-y-4"><div className="skeleton-block h-9 w-52" /><div className="skeleton-block h-24 w-full" /><div className="grid gap-4 md:grid-cols-3"><div className="skeleton-block h-56" /><div className="skeleton-block h-56" /><div className="skeleton-block h-56" /></div><span className="sr-only">Loading page</span></div></div>;

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<RouteLoader />}><Routes>
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
            <Route path="/register/role" element={<RoleSelection />} />
            <Route path="/verify/:verificationId" element={<VerifyCertificate />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/learn/:id" element={<CoursePlayer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learning-paths" element={<LearningPaths />} />
              <Route path="/learning-paths/:id" element={<LearningPathDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/certificates" element={<CertificatesList />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/certificate/:courseId" element={<Certificate />} />
              <Route path="/courses/:courseId/work" element={<LearningWork />} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:topicId" element={<CommunityTopic />} />
              <Route path="/ai-tutors" element={<AITutors />} />
              <Route path="/paths/:id" element={<LearningPathDetails />} />
            </Route>
            <Route element={<ProtectedRoute roles={["admin", "instructor"]} />}>
              <Route path="/courses/new" element={<CreateCourse />} />
              <Route path="/portal" element={<InstructorPortal />} />
              <Route path="/portal/courses/:id" element={<ManageCourse />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};
