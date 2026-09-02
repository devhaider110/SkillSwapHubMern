import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ============================================================
// PUBLIC PAGES
// ============================================================

import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import Search from './pages/Search';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

import Explore from './pages/Explore';
import HowItWorks from './pages/HowItWorks';
import Community from './pages/Community';
import About from './pages/About';

// ============================================================
// USER PAGES
// ============================================================

import Dashboard from './pages/Dashboard';
import MySkills from './pages/MySkills';
import Requests from './pages/Requests';
import Recommendations from './pages/Recommendations';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import Meeting from './pages/Meeting';
import ScheduleSession from './pages/ScheduleSession';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Progress from './pages/Progress';

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSkills from './pages/admin/AdminSkills';
import AdminSwaps from './pages/admin/AdminSwaps';

import HelpCenter from './pages/HelpCenter';
import Blog from './pages/Blog';
import FAQs from './pages/FAQs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ============================================================
// RESOURCES
// ============================================================

import Resources from './pages/Resources';

// ============================================================
// QUIZZES
// ============================================================

import Quizzes from './pages/Quizzes';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';

// ============================================================
// COMMUNITY
// ============================================================

import PostDetails from './pages/PostDetails'; // ✅ Added

// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-300 rounded-full animate-spin border-t-indigo-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ============================================================
// APP ROUTES
// ============================================================

function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/community" element={<Community />} />
      <Route path="/about" element={<About />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/search" element={<Search />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ======================================================
          COMMUNITY POST DETAILS (Protected)
      ====================================================== */}

      <Route
        path="/community/post/:id"
        element={
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        }
      />

      {/* ======================================================
          USER PROTECTED ROUTES
      ====================================================== */}

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
      <Route path="/quizzes/create" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
      <Route path="/quizzes/:id" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
      <Route path="/quizzes/:id/results/:attemptId" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />

      {/* ======================================================
          LEARNING SESSIONS
      ====================================================== */}

      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/sessions/schedule" element={<ProtectedRoute><ScheduleSession /></ProtectedRoute>} />
      <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetails /></ProtectedRoute>} />
      <Route path="/sessions/:id/meeting" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />

      {/* ======================================================
          SETTINGS
      ====================================================== */}

      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* ======================================================
          ANALYTICS (Admin Only)
      ====================================================== */}

      <Route path="/analytics" element={<ProtectedRoute adminOnly={true}><Analytics /></ProtectedRoute>} />

      {/* ======================================================
          RESOURCES
      ====================================================== */}

      <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />

      {/* ======================================================
          LEARNING PROGRESS
      ====================================================== */}

      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />

      {/* ======================================================
          ADMIN ROUTES
      ====================================================== */}

      <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute adminOnly={true}><AdminSkills /></ProtectedRoute>} />
      <Route path="/admin/swaps" element={<ProtectedRoute adminOnly={true}><AdminSwaps /></ProtectedRoute>} />

      {/* ======================================================
          404 FALLBACK
      ====================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;