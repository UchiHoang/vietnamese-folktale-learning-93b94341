import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen, Upload, Search, FileText, Download } from "lucide-react";
import LibraryGrid from "@/components/library/LibraryGrid";
import LibraryUploadModal from "@/components/library/LibraryUploadModal";

const GRADES = [
  { id: "all", label: "Tất cả lớp" },
  { id: "mam-non", label: "Mầm non" },
  { id: "lop-1", label: "Lớp 1" },
  { id: "lop-2", label: "Lớp 2" },
  { id: "lop-3", label: "Lớp 3" },
  { id: "lop-4", label: "Lớp 4" },
  { id: "lop-5", label: "Lớp 5" },
];

const SORT_OPTIONS = [
  { id: "created_at_desc", label: "Mới nhất" },
  { id: "created_at_asc", label: "Cũ nhất" },
  { id: "download_count_desc", label: "Tải nhiều nhất" },
  { id: "title_asc", label: "A → Z" },
  { id: "title_desc", label: "Z → A" },
];

interface LibraryStats {
  totalDocuments: number;
  totalDownloads: number;
}

const LibraryTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [sortBy, setSortBy] = useState("created_at_desc");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [stats, setStats] = useState<LibraryStats>({ totalDocuments: 0, totalDownloads: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("library_documents")
        .select("id, download_count");

      if (!error && data) {
        const totalDocuments = data.length;
        const totalDownloads = data.reduce((sum, doc) => sum + (doc.download_count || 0), 0);
        setStats({ totalDocuments, totalDownloads });
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Quản lý thư viện</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý tài liệu tham khảo cho học sinh
                </p>
              </div>
            </div>
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Tải lên tài liệu
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tài liệu</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <Download className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng lượt tải</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDownloads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Grade Filter */}
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {GRADES.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <LibraryGrid
            selectedGrade={selectedGrade}
            searchQuery={searchQuery}
            sortBy={sortBy}
            isTeacher={true}
            refreshTrigger={refreshTrigger}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <LibraryUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={handleUploadSuccess}
        grades={GRADES.filter((g) => g.id !== "all")}
      />
    </div>
  );
};

export default LibraryTab;
