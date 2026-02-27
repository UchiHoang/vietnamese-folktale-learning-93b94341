import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const PasswordTab = () => {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: t.passwordTab.minChars, met: newPassword.length >= 8 },
    { label: t.passwordTab.hasUppercase, met: /[A-Z]/.test(newPassword) },
    { label: t.passwordTab.hasLowercase, met: /[a-z]/.test(newPassword) },
    { label: t.passwordTab.hasNumber, met: /[0-9]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!allRequirementsMet) {
      toast({ title: t.passwordTab.error, description: t.passwordTab.requirementNotMet, variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: t.passwordTab.error, description: t.passwordTab.mismatchError, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: t.passwordTab.success, description: t.passwordTab.successMsg });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: t.passwordTab.error, description: error.message || t.passwordTab.cannotChange, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t.passwordTab.title}</h2>
            <p className="text-sm text-muted-foreground">{t.passwordTab.description}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current">{t.passwordTab.currentPassword}</Label>
            <div className="relative">
              <Input id="current" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t.passwordTab.currentPasswordPlaceholder} className="pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new">{t.passwordTab.newPassword}</Label>
            <div className="relative">
              <Input id="new" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.passwordTab.newPasswordPlaceholder} className="pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {newPassword.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium mb-2">{t.passwordTab.requirements}</p>
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                  <span className={req.met ? "text-green-600" : "text-muted-foreground"}>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">{t.passwordTab.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.passwordTab.confirmPasswordPlaceholder}
                className={`pr-10 ${confirmPassword.length > 0 ? passwordsMatch ? "border-green-500 focus-visible:ring-green-500" : "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-sm text-destructive">{t.passwordTab.passwordMismatch}</p>
            )}
          </div>

          <Button onClick={handleChangePassword} disabled={loading || !allRequirementsMet || !passwordsMatch} className="w-full mt-4">
            {loading ? t.passwordTab.processing : t.passwordTab.changePassword}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300 mb-3">{t.passwordTab.securityTips}</h3>
        <ul className="space-y-2 text-sm text-blue-600/80 dark:text-blue-400/80">
          <li>• {t.passwordTab.tip1}</li>
          <li>• {t.passwordTab.tip2}</li>
          <li>• {t.passwordTab.tip3}</li>
          <li>• {t.passwordTab.tip4}</li>
        </ul>
      </Card>
    </div>
  );
};

export default PasswordTab;
