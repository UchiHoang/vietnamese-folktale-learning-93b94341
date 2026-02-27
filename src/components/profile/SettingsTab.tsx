import { Bell, Volume2, Moon, Globe, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useStudyTimeLimit } from "@/hooks/useStudyTimeLimit";
import { useEffect, useState } from "react";

const SettingsTab = () => {
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

  return (
    <div className="space-y-6">
      {/* Time Control Card */}
      <Card className="p-6 border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Kiểm soát thời gian</h3>
            <p className="text-sm text-muted-foreground">Giới hạn thời gian học mỗi ngày cho bé</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Bật giới hạn thời gian</Label>
              <p className="text-sm text-muted-foreground">Nhắc nhở bé nghỉ ngơi khi hết giờ</p>
            </div>
            <Switch
              checked={limitEnabled}
              onCheckedChange={handleToggleLimit}
              disabled={loading}
            />
          </div>

          {/* Radio options */}
          {limitEnabled && (
            <>
              <div className="bg-muted/50 rounded-xl p-4">
                <Label className="font-medium text-sm mb-3 block">Thời gian tối đa mỗi ngày</Label>
                <RadioGroup
                  value={String(limitMinutes)}
                  onValueChange={handleLimitChange}
                  className="grid grid-cols-2 gap-3"
                >
                  {[30, 60, 90, 120].map((mins) => (
                    <label
                      key={mins}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        limitMinutes === mins
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={String(mins)} />
                      <span className="font-medium">{mins} phút</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hôm nay đã học</span>
                  <span className="font-semibold">
                    {todayTimeSpent}/{dailyLimit ?? limitMinutes} phút
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
                {progressPercent >= 80 && progressPercent < 100 && (
                  <p className="text-xs text-amber-600">⚠️ Sắp hết thời gian học hôm nay!</p>
                )}
                {progressPercent >= 100 && (
                  <p className="text-xs text-red-500">🎉 Đã đạt giới hạn thời gian hôm nay!</p>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Original settings */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-6">Cài đặt ứng dụng</h3>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="font-medium">Thông báo</Label>
                <p className="text-sm text-muted-foreground">Nhận thông báo nhắc nhở học tập</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <Label className="font-medium">Âm thanh</Label>
                <p className="text-sm text-muted-foreground">Bật âm thanh trong game</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <Label className="font-medium">Chế độ tối</Label>
                <p className="text-sm text-muted-foreground">Sử dụng giao diện tối</p>
              </div>
            </div>
            <Switch />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <Label className="font-medium">Ngôn ngữ</Label>
                <p className="text-sm text-muted-foreground">Chọn ngôn ngữ hiển thị</p>
              </div>
            </div>
            <Select defaultValue="vi">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Chọn ngôn ngữ" />
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
        <h3 className="font-bold text-xl mb-4">Về ứng dụng</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Phiên bản: 1.0.0</p>
          <p>© 2024 Toán học vui. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>
            <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;
