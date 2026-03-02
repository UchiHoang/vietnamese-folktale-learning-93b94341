import { Users, BookOpen, BarChart3, Settings, LogOut, User, FolderOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: {
    display_name: string;
    avatar?: string;
  } | null;
  onLogout: () => void;
}

const AdminSidebar = ({ activeTab, onTabChange, profile, onLogout }: AdminSidebarProps) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: "students", label: t.adminSidebar.students, icon: Users },
    { id: "classes", label: t.adminSidebar.classes, icon: BookOpen },
    { id: "library", label: t.adminSidebar.library, icon: FolderOpen },
    { id: "comments", label: t.adminSidebar.comments, icon: MessageSquare },
    { id: "reports", label: t.adminSidebar.reports, icon: BarChart3 },
    { id: "profile", label: t.adminSidebar.profile, icon: User },
    { id: "settings", label: t.adminSidebar.settings, icon: Settings },
  ];

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
        <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-md">
          {isEmojiAvatar ? (
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-3xl">
              {profile?.avatar || "👤"}
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={profile?.avatar} alt={profile?.display_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold">
                {getInitials(profile?.display_name || "T")}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <h2 className="mt-4 text-xl font-bold text-foreground">
          {profile?.display_name || t.adminSidebar.teacher}
        </h2>
        <span className="px-3 py-1 mt-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
          {t.adminSidebar.teacher}
        </span>
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
          <span>{t.adminSidebar.logout}</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
