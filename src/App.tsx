import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lessons from "./pages/Lessons";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import TrangQuynhGame from "./pages/TrangQuynhGame";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { ProtectedClassroom } from "./components/ProtectedClassroom";
import SongHongGame from "./pages/SongHongGame";
import PreschoolGame from "./pages/PreschoolGame";
import Grade1Game from "./pages/Grade1Game";
import Grade3Game from "./pages/Grade3Game";
import Grade4Game from "./pages/Grade4Game";
import Grade5Game from "./pages/Grade5Game";
import DataPage from "./pages/data";
import UserGuide from "./pages/UserGuide";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import StudyTimeLimitWrapper from "./components/game/StudyTimeLimitWrapper";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StudyTimeLimitWrapper />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lessons" element={<ProtectedClassroom><Lessons /></ProtectedClassroom>} />
          <Route path="/library" element={<Library />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/classroom/trangquynh" element={<TrangQuynhGame />} />
          <Route path="/classroom/songhong" element={<SongHongGame />} />
          <Route path="/classroom/preschool" element={<PreschoolGame />} />
          <Route path="/classroom/grade1" element={<Grade1Game />} />
          <Route path="/classroom/grade3" element={<Grade3Game />} />
          <Route path="/classroom/grade4" element={<Grade4Game />} />
          <Route path="/classroom/grade5" element={<Grade5Game />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
