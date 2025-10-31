import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isLogin ? "Đăng nhập thành công!" : "Đăng ký thành công!",
      description: isLogin 
        ? "Chào mừng bạn quay trở lại!" 
        : "Tài khoản của bạn đã được tạo thành công."
    });
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Đăng nhập bằng Google",
      description: "Tính năng đang được phát triển"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--primary)) 35px, hsl(var(--primary)) 36px)`,
          }}
        />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Welcome Message & Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8 text-center">
            <div className="relative bg-gradient-to-br from-background/80 to-card/80 backdrop-blur-sm rounded-3xl p-12 border-4 border-primary/20 shadow-2xl">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-secondary rounded-full opacity-60 blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full opacity-40 blur-2xl" />
              
              <div className="relative space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
                  <GraduationCap className="w-14 h-14 text-primary" />
                </div>
                
                <div className="bg-card/90 rounded-2xl p-6 shadow-lg border-2 border-primary/10">
                  <p className="text-base leading-relaxed text-foreground font-medium">
                    Chào mừng bạn đến với<br />
                    cổng đăng nhập của<br />
                    <span className="text-2xl font-heading font-bold text-primary block mt-2">
                      Trang Nguyễn Education,<br />
                      TNMath & VNMF
                    </span>
                  </p>
                </div>

                {/* Decorative mascot placeholder */}
                <div className="flex items-end justify-center gap-8 pt-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/30">
                    <span className="text-4xl">🦁</span>
                  </div>
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center border-4 border-secondary/30">
                    <span className="text-5xl">👦</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-card/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-primary/20 overflow-hidden">
              <div className="p-8 md:p-10 space-y-6">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-4">
                  <div className="inline-flex items-center gap-2">
                    <GraduationCap className="h-10 w-10 text-primary" />
                    <span className="text-2xl font-heading font-bold text-primary">
                      VietEdu Odyssey
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-heading font-bold">
                    {isLogin ? "Đăng nhập" : "Đăng ký"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isLogin 
                      ? "Chào mừng bạn quay trở lại!" 
                      : "Tạo tài khoản mới để bắt đầu học"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Tên đăng nhập"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary"
                    />
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="h-12 rounded-xl border-2 focus:border-primary"
                      />
                    </div>
                  )}

                  <div className="space-y-2 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2 relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                        className="h-12 rounded-xl border-2 focus:border-primary pr-12"
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                          Ghi nhớ đăng nhập
                        </label>
                      </div>
                      <button type="button" className="text-sm text-primary hover:underline font-medium">
                        Quên mật khẩu?
                      </button>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold rounded-xl bg-destructive hover:bg-destructive/90 text-white"
                  >
                    {isLogin ? "Đăng nhập" : "Đăng ký"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full h-12 text-base font-bold rounded-xl border-2 border-destructive text-destructive hover:bg-destructive/5"
                  >
                    {isLogin ? "Tạo tài khoản" : "Đã có tài khoản? Đăng nhập"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">Hoặc</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-12 rounded-xl border-2 gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-bold text-destructive">Đăng nhập bằng Google</span>
                </Button>

                <div className="text-center pt-4">
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary font-medium">
                    ← Quay về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
