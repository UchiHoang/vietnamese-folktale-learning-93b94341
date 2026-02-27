import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Moon, Globe, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminSettingsTab = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.adminSettings.title}</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t.adminSettings.notifications}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.emailNotifications}</Label>
              <p className="text-sm text-muted-foreground">{t.adminSettings.emailNotificationsDesc}</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.weeklyReports}</Label>
              <p className="text-sm text-muted-foreground">{t.adminSettings.weeklyReportsDesc}</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.studentAlerts}</Label>
              <p className="text-sm text-muted-foreground">{t.adminSettings.studentAlertsDesc}</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t.adminSettings.appearance}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.darkMode}</Label>
              <p className="text-sm text-muted-foreground">{t.adminSettings.darkModeDesc}</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t.adminSettings.language}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.displayLanguage}</Label>
              <p className="text-sm text-muted-foreground">Tiếng Việt / English</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.adminSettings.security}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.adminSettings.twoFactor}</Label>
              <p className="text-sm text-muted-foreground">{t.adminSettings.twoFactorDesc}</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;
