import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2, FileText, AlertCircle } from "lucide-react";
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

interface LibraryViewerModalProps {
  document: LibraryDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LibraryViewerModal = ({
  document,
  open,
  onOpenChange,
}: LibraryViewerModalProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document || !open) {
      setFileUrl(null);
      setIsLoading(true);
      setError(null);
      return;
    }

    const fetchFileUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: urlError } = await supabase.storage
          .from("library-documents")
          .createSignedUrl(document.file_path, 3600); // 1 hour expiry

        if (urlError) throw urlError;
        setFileUrl(data.signedUrl);
      } catch (err) {
        console.error("Error getting file URL:", err);
        setError("Không thể tải file. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileUrl();
  }, [document, open]);

  const handleDownload = async () => {
    if (!document) return;

    try {
      const { data, error } = await supabase.storage
        .from("library-documents")
        .download(document.file_path);

      if (error) throw error;

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
    }
  };

  const handleOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const canPreview = document?.file_type === "pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="pr-8 line-clamp-1">
            {document?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Đang tải tài liệu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                <p className="text-destructive">{error}</p>
              </div>
            </div>
          ) : canPreview && fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              className="flex-1 w-full rounded-lg border bg-muted"
              title={document?.title}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Không thể xem trực tiếp
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  File {document?.file_type.toUpperCase()} không hỗ trợ xem trực tiếp trên trình duyệt. 
                  Vui lòng tải về hoặc mở trong tab mới.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleOpenInNewTab} disabled={!fileUrl}>
            <ExternalLink className="h-4 w-4" />
            Mở tab mới
          </Button>
          <Button className="flex-1 gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Tải xuống
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryViewerModal;
