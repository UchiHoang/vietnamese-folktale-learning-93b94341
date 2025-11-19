import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onRoleChange?: (role: "student" | "teacher" | "admin") => void;
  currentRole?: "student" | "teacher" | "admin";
}

const Header = ({ onRoleChange, currentRole = "student" }: HeaderProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Đã đăng xuất",
        description: "Hẹn gặp lại bạn!"
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
          <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">
            Trang chủ
          </Link>
          <Link to="/lessons" className="text-foreground hover:text-primary font-medium transition-colors">
            Bài giảng
          </Link>
          <Link to="#about" className="text-foreground hover:text-primary font-medium transition-colors">
            Giới thiệu
          </Link>
          <Link to="#classes" className="text-foreground hover:text-primary font-medium transition-colors">
            Lớp học
          </Link>
          <Link to="#leaderboard" className="text-foreground hover:text-primary font-medium transition-colors">
            Xếp hạng
          </Link>
          <Link to="#contact" className="text-foreground hover:text-primary font-medium transition-colors">
            Liên hệ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden md:flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{profile?.avatar || '👤'}</AvatarFallback>
                  </Avatar>
                  <span>{profile?.display_name || user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="hidden md:flex" asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          <Link to="/" className="block py-2 text-foreground hover:text-primary">
            Trang chủ
          </Link>
          <Link to="/lessons" className="block py-2 text-foreground hover:text-primary">
            Bài giảng
          </Link>
          <Link to="#about" className="block py-2 text-foreground hover:text-primary">
            Giới thiệu
          </Link>
          <Link to="#classes" className="block py-2 text-foreground hover:text-primary">
            Lớp học
          </Link>
          <Link to="#leaderboard" className="block py-2 text-foreground hover:text-primary">
            Xếp hạng
          </Link>
          <Link to="#contact" className="block py-2 text-foreground hover:text-primary">
            Liên hệ
          </Link>
          {user ? (
            <>
              <div className="py-2 border-t">
                <p className="text-sm font-medium">{profile?.display_name || user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button className="w-full" variant="destructive" onClick={handleLogout}>
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
