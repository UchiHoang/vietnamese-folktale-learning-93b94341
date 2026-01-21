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
      <DialogContent className="max-w-5xl w-[70vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-sm border-2 overflow-hidden">
        {/* Header Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b bg-card/80 backdrop-blur-sm rounded-t-lg">
          <div className="flex items-center gap-4 flex-1 min-w-0 pr-12">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="p-0 space-y-1">
                <DialogTitle className="text-lg font-semibold line-clamp-1 text-left">
                  {document?.title}
                </DialogTitle>
                {document?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {document.description}
                  </p>
                )}
              </DialogHeader>
            </div>
          </div>
          
          {/* Action Buttons in Header */}
          <div className="flex items-center gap-3 flex-shrink-0 mr-8">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 h-9 px-4"
              onClick={handleOpenInNewTab} 
              disabled={!fileUrl}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Mở tab mới</span>
            </Button>
            <Button 
              size="sm"
              className="gap-2 h-9 px-4 bg-green-600 hover:bg-green-700"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Tải xuống</span>
            </Button>
          </div>
        </div>

        {/* Main Content - PDF Viewer */}
        <div className="flex-1 min-h-0 bg-muted/30 overflow-hidden rounded-b-lg">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Đang tải tài liệu...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-medium">{error}</p>
                <p className="text-sm text-muted-foreground mt-1">Vui lòng thử lại sau</p>
              </div>
            </div>
          ) : canPreview && fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full border-0 rounded-b-lg"
              title={document?.title}
              style={{ minHeight: '100%' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Không thể xem trực tiếp
                </h3>
                <p className="text-muted-foreground mb-6">
                  File <span className="font-medium text-foreground">{document?.file_type.toUpperCase()}</span> không hỗ trợ xem trực tiếp trên trình duyệt. 
                  Vui lòng tải về hoặc mở trong tab mới để xem nội dung.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="gap-2"
                    onClick={handleOpenInNewTab} 
                    disabled={!fileUrl}
                  >
                    <ExternalLink className="h-5 w-5" />
                    Mở tab mới
                  </Button>
                  <Button 
                    size="lg"
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleDownload}
                  >
                    <Download className="h-5 w-5" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryViewerModal;
