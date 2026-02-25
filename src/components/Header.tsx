import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap, LogOut, User, Shield, Moon, Sun, Library, Home, BookOpen, Info, Users, Trophy, Phone } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  onRoleChange?: (role: "student" | "teacher" | "admin") => void;
  currentRole?: "student" | "teacher" | "admin";
}

const Header = ({ onRoleChange, currentRole = "student" }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // dùng đúng kiểu state như yêu cầu
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

// Smooth scroll to section
const scrollToSection = useCallback((sectionId: string) => {
  // If not on home page, navigate to home first then scroll
  if (location.pathname !== "/") {
    navigate("/");
    // Wait for navigation then scroll
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  } else {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  setMobileMenuOpen(false);
}, [location.pathname, navigate]);


  // Load profile + role
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadUserRole(session.user.id);
      } else {
        setProfile(null);
        setUserRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(data);
  };

  const loadUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    setUserRole(data?.role || null);
  };

  const isTeacherOrAdmin = userRole === "admin" || userRole === "teacher";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Đã đăng xuất",
        description: "Hẹn gặp lại bạn!",
      });
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover-scale">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-2xl font-heading font-bold text-primary">
            VietEdu Odyssey
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5">
        <Home className="h-4 w-4" />
            Trang chủ
          </Link>


          <button 
            onClick={() => scrollToSection("about")} 
            className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="h-4 w-4" />
            Giới thiệu
            </button>
          <Link to="/lessons" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Bài giảng
          </Link>
          <button 
            onClick={() => scrollToSection("classes")} 
            className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            Lớp học
            </button>
            <Link to="/library" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5">
            <Library className="h-4 w-4" />
            Thư viện
          </Link>
          <button 
            onClick={() => scrollToSection("leaderboard")} 
            className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="h-4 w-4" />
            Xếp hạng
            </button>
          <button 
            onClick={() => scrollToSection("contact")} 
            className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            Liên hệ
            </button>
        </nav>

        {/* User + Mobile toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar?.startsWith("http") ? (
                      <AvatarImage src={profile.avatar} alt={profile.display_name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="text-sm">
                      {profile?.avatar?.startsWith("http") ? "👤" : (profile?.avatar || "👤")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{profile?.display_name || user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>

                {isTeacherOrAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Quản trị giáo viên
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="hidden md:flex" asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          <Link to="/" className="flex items-center gap-2 py-2 text-foreground hover:text-primary">
            <Home className="h-4 w-4" />
            Trang chủ
          </Link>
         
          <button 
            onClick={() => scrollToSection("about")} 
            className="flex items-center gap-2 py-2 text-foreground hover:text-primary w-full text-left"
          >
            <Info className="h-4 w-4" />
            Giới thiệu
            </button>
          <Link to="/lessons" className="flex items-center gap-2 py-2 text-foreground hover:text-primary">
            <BookOpen className="h-4 w-4" />
            Bài giảng
          </Link>
          <button 
            onClick={() => scrollToSection("classes")} 
            className="flex items-center gap-2 py-2 text-foreground hover:text-primary w-full text-left"
          >
            <Users className="h-4 w-4" />
            Lớp học
          </button>
            <Link to="/library" className="flex items-center gap-2 py-2 text-foreground hover:text-primary">
            <Library className="h-4 w-4" />
            Thư viện
          </Link>
          <button 
            onClick={() => scrollToSection("leaderboard")} 
            className="flex items-center gap-2 py-2 text-foreground hover:text-primary w-full text-left"
          >
            <Trophy className="h-4 w-4" />
            Xếp hạng
            </button>
          <button 
            onClick={() => scrollToSection("contact")} 
            className="flex items-center gap-2 py-2 text-foreground hover:text-primary w-full text-left"
          >
            <Phone className="h-4 w-4" />
            Liên hệ
          </button>


          {user ? (
            <>
              <div className="py-2 border-t">
                <p className="text-sm font-medium">
                  {profile?.display_name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <Link to="/profile" className="block py-2 text-foreground hover:text-primary">
                Hồ sơ cá nhân
              </Link>

              {isTeacherOrAdmin && (
                <Link to="/admin" className="block py-2 text-primary font-medium">
                  Quản trị giáo viên
                </Link>
              )}

              <Button className="w-full mt-2" variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button className="w-full" asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
