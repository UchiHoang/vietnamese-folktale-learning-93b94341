import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

interface Grade {
  id: string;
  label: string;
}

interface LibraryUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  grades: Grade[];
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const getFileType = (mimeType: string): string => {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/msword") return "doc";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (mimeType === "text/plain") return "txt";
  return "unknown";
};

const LibraryUploadModal = ({
  open,
  onOpenChange,
  onSuccess,
  grades,
}: LibraryUploadModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGrade("");
    setFile(null);
    setShowSuccess(false);
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast({
        title: "Định dạng không hỗ trợ",
        description: "Chỉ hỗ trợ file PDF, DOC, DOCX và TXT.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: "File quá lớn",
        description: "Kích thước file tối đa là 50MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !grade) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin và chọn file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const filePath = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("library-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { error: dbError } = await supabase.from("library_documents").insert({
        title,
        description: description || null,
        grade,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: getFileType(file.type),
        uploaded_by: session.user.id,
      });

      if (dbError) throw dbError;

      // Show success animation
      setShowSuccess(true);
      
      toast({
        title: "Tải lên thành công",
        description: `"${title}" đã được thêm vào thư viện.`,
      });

      // Delay closing to show animation
      setTimeout(() => {
        resetForm();
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi tải lên",
        description: "Không thể tải file lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setShowSuccess(false);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md bg-card">
        {/* Confetti Effect */}
        <AnimatePresence>
          {showSuccess && (
            <div className="fixed inset-0 pointer-events-none z-[100]">
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={200}
                gravity={0.3}
                colors={['#22c55e', '#16a34a', '#4ade80', '#86efac', '#fbbf24', '#f59e0b']}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-card/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4"
              >
                <CheckCircle className="w-12 h-12 text-primary" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-foreground mb-2"
              >
                Tải lên thành công!
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Tài liệu đã được thêm vào thư viện</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tải lên tài liệu</DialogTitle>
          <DialogDescription>
            Thêm tài liệu mới vào thư viện cho học sinh tham khảo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all overflow-hidden ${
              dragActive
                ? "border-primary bg-primary/10"
                : file 
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p 
                    className="font-medium text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap" 
                    title={file.name}
                    style={{ maxWidth: 'calc(100%)' }}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Kéo thả file hoặc click để chọn
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, TXT (tối đa 50MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Tiêu đề *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
              required
              className="border-border bg-background focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về tài liệu (không bắt buộc)"
              rows={3}
              className="border-border bg-background focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 resize-none"
            />
          </div>

          {/* Grade Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lớp học *</Label>
            <Select value={grade} onValueChange={setGrade} required>
              <SelectTrigger className="border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0">
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.id} className="focus:bg-accent">
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gap-2 bg-primary hover:bg-primary/90" 
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Tải lên
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LibraryUploadModal;
