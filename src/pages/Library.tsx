import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibraryGrid from "@/components/library/LibraryGrid";
import LibraryUploadModal from "@/components/library/LibraryUploadModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GRADES = [
  { id: "all", label: "Tất cả" },
  { id: "mam-non", label: "Mầm non" },
  { id: "lop-1", label: "Lớp 1" },
  { id: "lop-2", label: "Lớp 2" },
  { id: "lop-3", label: "Lớp 3" },
  { id: "lop-4", label: "Lớp 4" },
  { id: "lop-5", label: "Lớp 5" },
];

const Library = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thư viện...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Thư viện Tài liệu
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kho tài liệu học tập phong phú theo từng cấp lớp. Xem trực tiếp hoặc tải về để học tập.
          </p>
        </div>

        {/* Search and Upload */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {isTeacher && (
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Tải lên tài liệu
            </Button>
          )}
        </div>

        {/* Grade Tabs */}
        <Tabs value={selectedGrade} onValueChange={setSelectedGrade} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
            {GRADES.map((grade) => (
              <TabsTrigger
                key={grade.id}
                value={grade.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {grade.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Documents Grid */}
        <LibraryGrid
          selectedGrade={selectedGrade}
          searchQuery={searchQuery}
          isTeacher={isTeacher}
          refreshTrigger={refreshTrigger}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      </main>
      <Footer />

      {/* Upload Modal */}
      <LibraryUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={handleUploadSuccess}
        grades={GRADES.filter(g => g.id !== "all")}
      />
    </div>
  );
};

export default Library;
