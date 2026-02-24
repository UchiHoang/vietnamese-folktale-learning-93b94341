import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import LibraryGrid from "@/components/library/LibraryGrid";
import LibraryUploadModal from "@/components/library/LibraryUploadModal";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, BookOpen, Search, Sparkles, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADES = [
  { id: "all", label: "Tất cả", icon: "📚" },
  { id: "mam-non", label: "Mầm non", icon: "🌸" },
  { id: "lop-1", label: "Lớp 1", icon: "🎒" },
  { id: "lop-2", label: "Lớp 2", icon: "✏️" },
  { id: "lop-3", label: "Lớp 3", icon: "📖" },
  { id: "lop-4", label: "Lớp 4", icon: "🎓" },
  { id: "lop-5", label: "Lớp 5", icon: "🏆" },
];

const SORT_OPTIONS = [
  { id: "created_at_desc", label: "Mới nhất" },
  { id: "created_at_asc", label: "Cũ nhất" },
  { id: "download_count_desc", label: "Tải nhiều nhất" },
  { id: "title_asc", label: "Tên A-Z" },
  { id: "title_desc", label: "Tên Z-A" },
];

const Library = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at_desc");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate(`/auth?redirect=/library`);
        return;
      }

      setIsAuthenticated(true);

      // Check if user is teacher/admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData && (roleData.role === "teacher" || roleData.role === "admin")) {
        setIsTeacher(true);
      }

      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate(`/auth?redirect=/library`);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-secondary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Đang tải thư viện...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 mb-6">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-secondary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-3">
            Thư viện Tài liệu
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kho tài liệu học tập phong phú theo từng cấp lớp. Xem trực tiếp hoặc tải về để học tập.
          </p>
        </motion.div>

        {/* Search Bar - Row 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
            <Input
              placeholder="Tìm kiếm tài liệu theo tên, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-base rounded-xl border-2 border-muted/50 focus:border-primary/50 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Grade Buttons + Sort + Upload - Row 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          {/* Grade Buttons - Left */}
          <div className="flex flex-wrap gap-2">
            {GRADES.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade(grade.id)}
                className={`
                  gap-1.5 rounded-full px-4 py-2 font-medium transition-all duration-300
                  ${selectedGrade === grade.id 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105" 
                    : "bg-card/80 hover:bg-primary/10 hover:border-primary/50 border-2"
                  }
                `}
              >
                <span>{grade.icon}</span>
                <span>{grade.label}</span>
              </Button>
            ))}
          </div>

          {/* Sort + Upload - Right */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] gap-2 rounded-full border-2 bg-card/80 hover:bg-muted/50 transition-colors">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Upload Button */}
            {isTeacher && (
              <Button 
                onClick={() => setShowUploadModal(true)} 
                className="gap-2 rounded-full px-6 py-5 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground shadow-lg shadow-secondary/25 transition-all duration-300 hover:scale-105"
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">Tải lên tài liệu</span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Documents Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <LibraryGrid
            selectedGrade={selectedGrade}
            searchQuery={searchQuery}
            sortBy={sortBy}
            isTeacher={isTeacher}
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
          />
        </motion.div>
      </main>
      <Footer />

      {/* Upload Modal */}
      <LibraryUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={handleUploadSuccess}
        grades={GRADES.filter(g => g.id !== "all")}
      />
    </PageTransition>
  );
};

export default Library;
