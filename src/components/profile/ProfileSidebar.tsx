import { User, TrendingUp, Settings, Lock, BookOpen, LogOut, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: {
    display_name: string;
    avatar: string;
    grade?: string;
  } | null;
  streak: number;
  onLogout: () => void;
  onAvatarUpdate?: () => void;
}

const ProfileSidebar = ({ 
  activeTab, 
  onTabChange, 
  profile, 
  streak,
  onLogout,
  onAvatarUpdate 
}: ProfileSidebarProps) => {
  const menuItems = [
    { id: "info", label: "Thông tin cá nhân", icon: User },
    { id: "stats", label: "Thống kê", icon: TrendingUp },
    { id: "settings", label: "Cài đặt", icon: Settings },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
    { id: "courses", label: "Khóa học của bạn", icon: BookOpen },
  ];

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 h-fit">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-5xl border-4 border-background shadow-md">
            {profile?.avatar || "👤"}
          </div>
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-1.5 shadow-lg">
              <Flame className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <h2 className="mt-4 text-xl font-bold text-foreground">
          {profile?.display_name || "Người dùng"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {profile?.grade ? `Khối ${profile.grade}` : "Chưa cập nhật"}
        </p>
        
        <button 
          onClick={onAvatarUpdate}
          className="mt-3 px-4 py-2 text-sm font-medium text-primary border-2 border-primary/30 rounded-full hover:bg-primary/10 transition-colors"
        >
          Cập nhật avatar
        </button>

        {/* Streak Display */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {streak} ngày liên tục
          </span>
        </div>
      </div>

      {/* Dotted line separator */}
      <div className="border-t-2 border-dashed border-muted my-4"></div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
              activeTab === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
        
        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-all mt-2"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
