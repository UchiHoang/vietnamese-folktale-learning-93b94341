import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, FileType, Download, Eye, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LibraryDocument {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  download_count: number;
  created_at: string;
}

interface LibraryCardProps {
  document: LibraryDocument;
  isTeacher: boolean;
  onView: () => void;
  onDelete: () => Promise<boolean>;
}

const GRADE_LABELS: Record<string, string> = {
  "mam-non": "Mầm non",
  "lop-1": "Lớp 1",
  "lop-2": "Lớp 2",
  "lop-3": "Lớp 3",
  "lop-4": "Lớp 4",
  "lop-5": "Lớp 5",
};

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-8 w-8 text-destructive" />,
  doc: <FileType className="h-8 w-8 text-primary" />,
  docx: <FileType className="h-8 w-8 text-primary" />,
  txt: <FileText className="h-8 w-8 text-muted-foreground" />,
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const LibraryCard = ({ document, isTeacher, onView, onDelete }: LibraryCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("library-documents")
        .download(document.file_path);

      if (error) throw error;

      // Update download count
      await supabase
        .from("library_documents")
        .update({ download_count: document.download_count + 1 })
        .eq("id", document.id);

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Tải xuống thành công",
        description: `Đã tải "${document.title}"`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải file. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete();
    setIsDeleting(false);
    setShowDeleteDialog(false);

    if (success) {
      toast({
        title: "Đã xóa",
        description: "Tài liệu đã được xóa thành công.",
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 bg-card border-border h-full flex flex-col">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {FILE_ICONS[document.file_type] || <FileText className="h-8 w-8 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-1">
                  {GRADE_LABELS[document.grade] || document.grade}
                </span>
              </div>
            </div>
            {isTeacher && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa tài liệu
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title & Description - flex-grow to push buttons to bottom */}
          <div className="flex-grow">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
              {document.title}
            </h3>
            {document.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {document.description}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 mt-2">
            <span className="uppercase">{document.file_type}</span>
            <span>•</span>
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>{document.download_count} lượt tải</span>
          </div>

          {/* Actions - fixed at bottom */}
          <div className="flex gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={onView}
            >
              <Eye className="h-4 w-4" />
              Xem
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Tải xuống
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{document.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LibraryCard;
