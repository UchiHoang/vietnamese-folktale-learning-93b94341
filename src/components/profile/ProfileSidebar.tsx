import { User, TrendingUp, Settings, Lock, BookOpen, LogOut, Flame, BarChart3, Camera, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const menuItems = [
    { id: "info", label: t.profilePage.sidebar.personalInfo, icon: User },
    { id: "stats", label: t.profilePage.sidebar.statsAchievements, icon: TrendingUp },
    { id: "analytics", label: t.profilePage.sidebar.learningAnalytics, icon: BarChart3 },
    { id: "activity", label: t.profilePage.sidebar.yourActivity, icon: History },
    { id: "settings", label: t.profilePage.sidebar.settings, icon: Settings },
    { id: "password", label: t.profilePage.sidebar.changePassword, icon: Lock },
    { id: "courses", label: t.profilePage.sidebar.yourCourses, icon: BookOpen },
  ];

  // Check if avatar is an emoji (short string with emoji pattern)
  const isEmojiAvatar = !profile?.avatar || 
    (profile.avatar.length <= 4 && /\p{Emoji}/u.test(profile.avatar));
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 h-fit">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            {isEmojiAvatar ? (
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-4xl">
                {profile?.avatar || "👤"}
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={profile?.avatar} alt={profile?.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold">
                  {getInitials(profile?.display_name || "U")}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {/* Avatar update overlay */}
          <button
            onClick={onAvatarUpdate}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
          
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-1.5 shadow-lg">
              <Flame className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <h2 className="mt-4 text-xl font-bold text-foreground">
          {profile?.display_name || t.profilePage.user}
        </h2>
        <p className="text-sm text-muted-foreground">
          {profile?.grade ? `${t.profilePage.gradePrefix} ${profile.grade}` : t.profilePage.notUpdated}
        </p>

        {/* Streak Display */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {streak} {t.profilePage.consecutiveDays}
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
          <span>{t.profilePage.logout}</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
