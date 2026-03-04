import { Bell, Volume2, Moon, Globe, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useStudyTimeLimit } from "@/hooks/useStudyTimeLimit";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSound } from "@/contexts/SoundContext";

const SettingsTab = () => {
  const { t, language, setLanguage } = useLanguage();
  const { soundEnabled, setSoundEnabled, playSound } = useSound();
  const { settings, todayTimeSpent, dailyLimit, updateSettings, loading } = useStudyTimeLimit();
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limitMinutes, setLimitMinutes] = useState<number>(60);

  useEffect(() => {
    if (settings) {
      setLimitEnabled(settings.limit_enabled);
      setLimitMinutes(settings.daily_limit_minutes ?? 60);
    }
  }, [settings]);

  const handleToggleLimit = async (checked: boolean) => {
    setLimitEnabled(checked);
    await updateSettings(checked, limitMinutes);
  };

  const handleLimitChange = async (value: string) => {
    const mins = parseInt(value);
    setLimitMinutes(mins);
    await updateSettings(limitEnabled, mins);
  };

  const progressPercent = dailyLimit ? Math.min(100, (todayTimeSpent / dailyLimit) * 100) : 0;

  const timeOptions = [
    { mins: 30, emoji: "⏱️", label: t.settingsTab.time30m },
    { mins: 60, emoji: "🕐", label: t.settingsTab.time1h },
    { mins: 90, emoji: "🕜", label: t.settingsTab.time1h30 },
    { mins: 120, emoji: "🕑", label: t.settingsTab.time2h },
  ];

  return (
    <div className="space-y-6">
      {/* Time Control Card */}
      <Card className="p-6 border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{t.settingsTab.healthClock}</h3>
            <p className="text-sm text-muted-foreground">{t.settingsTab.healthClockDesc}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">{t.settingsTab.enableTimeLimit}</Label>
              <p className="text-sm text-muted-foreground">{t.settingsTab.enableTimeLimitDesc}</p>
            </div>
            <Switch checked={limitEnabled} onCheckedChange={handleToggleLimit} disabled={loading} />
          </div>

          {limitEnabled && (
            <>
              <div className="bg-muted/50 rounded-xl p-4">
                <Label className="font-medium text-sm mb-3 block">{t.settingsTab.maxTimePerDay}</Label>
                <div className="flex gap-2">
                  {timeOptions.map(({ mins, emoji, label }) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleLimitChange(String(mins))}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all cursor-pointer ${
                        limitMinutes === mins
                          ? "border-primary bg-primary/10 shadow-sm scale-105"
                          : "border-transparent bg-background hover:border-primary/20 hover:bg-primary/5"
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className={`text-sm font-semibold ${limitMinutes === mins ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.settingsTab.todayLearned}</span>
                  <span className="font-semibold">
                    {todayTimeSpent}/{dailyLimit ?? limitMinutes} {t.settingsTab.minutes}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                {progressPercent >= 80 && progressPercent < 100 && (
                  <p className="text-xs text-amber-600">{t.settingsTab.almostDone}</p>
                )}
                {progressPercent >= 100 && (
                  <p className="text-xs text-red-500">{t.settingsTab.limitReached}</p>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Original settings */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-6">{t.settingsTab.appSettings}</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">{t.settingsTab.notifications}</Label>
                <p className="text-sm text-muted-foreground">{t.settingsTab.notificationsDesc}</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <Label className="font-medium">{t.settingsTab.sound}</Label>
                <p className="text-sm text-muted-foreground">{t.settingsTab.soundDesc}</p>
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={(checked) => {
                setSoundEnabled(checked);
                if (checked) playSound("click");
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <Label className="font-medium">{t.settingsTab.darkMode}</Label>
                <p className="text-sm text-muted-foreground">{t.settingsTab.darkModeDesc}</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Label className="font-medium">{t.settingsTab.language}</Label>
                <p className="text-sm text-muted-foreground">{t.settingsTab.languageDesc}</p>
              </div>
            </div>
            <Select value={language} onValueChange={(v) => setLanguage(v as "vi" | "en")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t.settingsTab.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4">{t.settingsTab.aboutApp}</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{t.settingsTab.version}</p>
          <p>{t.settingsTab.copyright}</p>
          <div className="flex gap-4">
            <a href="#" className="text-primary hover:underline">{t.settingsTab.termsOfService}</a>
            <a href="#" className="text-primary hover:underline">{t.settingsTab.privacyPolicy}</a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;
