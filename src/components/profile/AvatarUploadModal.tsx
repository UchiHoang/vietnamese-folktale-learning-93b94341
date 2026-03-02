import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSave: (avatar: string) => void;
}

const EMOJI_AVATARS = [
  "👤", "👦", "👧", "👨", "👩", "🧒", "👶", "🧒",
  "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
  "🐸", "🐵", "🐔", "🐧", "🦉", "🦄", "🐲", "🐳",
  "🌟", "⭐", "🌈", "🎭", "🎨", "📚", "🎮", "🏆",
  "🎓", "🎪", "🎯", "🚀", "✨", "💎", "🌸", "🌺",
];

const AvatarUploadModal = ({ open, onClose, currentAvatar, onSave }: AvatarUploadModalProps) => {
  const { t } = useLanguage();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "👤");
  const [activeTab, setActiveTab] = useState("emoji");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUrlAvatar = selectedAvatar?.startsWith("http");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: t.avatarModal.uploadError, description: t.avatarModal.fileError, variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t.avatarModal.uploadError, description: t.avatarModal.sizeError, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(t.avatarModal.loginError);

      const userId = session.user.id;
      const filePath = `${userId}/avatar`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster
      const url = `${publicUrl}?t=${Date.now()}`;
      setPreviewUrl(url);
      setSelectedAvatar(url);
      toast({ title: t.avatarModal.uploadSuccess, description: t.avatarModal.uploadSuccessDesc });
    } catch (error: any) {
      toast({ title: t.avatarModal.uploadError, description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  const displayAvatar = isUrlAvatar || previewUrl;
  const avatarSrc = isUrlAvatar ? selectedAvatar : previewUrl;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.avatarModal.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emoji">{t.avatarModal.emoji}</TabsTrigger>
            <TabsTrigger value="upload">{t.avatarModal.upload}</TabsTrigger>
          </TabsList>

          <TabsContent value="emoji" className="mt-4">
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_AVATARS.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => { setSelectedAvatar(emoji); setPreviewUrl(null); }}
                  className={cn(
                    "w-10 h-10 text-2xl rounded-lg flex items-center justify-center transition-all hover:bg-muted",
                    selectedAvatar === emoji && !previewUrl && "bg-primary/20 ring-2 ring-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center gap-4 py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? t.avatarModal.uploading : t.avatarModal.selectImage}
              </Button>
              <p className="text-xs text-muted-foreground">{t.avatarModal.uploadHint}</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        <div className="flex items-center justify-center gap-4 py-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{t.avatarModal.preview}</p>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl border-4 border-background shadow-lg overflow-hidden">
              {displayAvatar && avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                selectedAvatar
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>{t.avatarModal.cancel}</Button>
          <Button onClick={handleSave} disabled={uploading}>{t.avatarModal.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadModal;
