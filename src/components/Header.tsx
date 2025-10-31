import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onRoleChange?: (role: "student" | "teacher" | "admin") => void;
  currentRole?: "student" | "teacher" | "admin";
}

const Header = ({ onRoleChange, currentRole = "student" }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Role Switcher */}
          <select
            value={currentRole}
            onChange={(e) => onRoleChange?.(e.target.value as any)}
            className="hidden md:block px-3 py-1.5 text-sm rounded-lg border bg-background font-medium"
          >
            <option value="student">Học sinh</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Quản trị</option>
          </select>

          <Button className="hidden md:flex" asChild>
            <Link to="/auth">Đăng nhập</Link>
          </Button>

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
          <select
            value={currentRole}
            onChange={(e) => onRoleChange?.(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border bg-background"
          >
            <option value="student">Học sinh</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Quản trị</option>
          </select>
          <Button className="w-full" asChild>
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
