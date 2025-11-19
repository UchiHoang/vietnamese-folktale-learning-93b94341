import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { User, Settings, Award, BarChart3, Users, BookOpen } from "lucide-react";

interface Profile {
  id: string;
  display_name: string;
  avatar: string;
  school?: string;
  grade?: string;
}

interface GameProgress {
  total_xp: number;
  total_points: number;
  level: number;
  earned_badges: any[];
}

interface UserRole {
  role: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    school: "",
    grade: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await loadProfile(session.user.id);
      await loadGameProgress(session.user.id);
      await loadUserRole(session.user.id);
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    setProfile(data);
    setFormData({
      display_name: data.display_name || "",
      school: data.school || "",
      grade: data.grade || "",
    });
  };

  const loadGameProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from("game_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error loading game progress:", error);
      return;
    }

    if (data) {
      setGameProgress({
        total_xp: data.total_xp,
        total_points: data.total_points,
        level: data.level,
        earned_badges: Array.isArray(data.earned_badges) ? data.earned_badges : []
      });
    }
  };

  const loadUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error loading user role:", error);
      return;
    }

    setUserRole(data.role);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: formData.display_name,
        school: formData.school,
        grade: formData.grade,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: "Đã cập nhật thông tin cá nhân",
    });

    setEditing(false);
    await loadProfile(profile.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === "teacher" || userRole === "admin";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl">
                {profile?.avatar || "👤"}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold mb-2">
                  {profile?.display_name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {isAdmin ? "Giáo viên" : "Học sinh"}
                  </span>
                  {profile?.grade && (
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
                      Lớp {profile.grade}
                    </span>
                  )}
                </div>
                {profile?.school && (
                  <p className="text-muted-foreground">{profile.school}</p>
                )}
              </div>

              <Button
                variant={editing ? "outline" : "default"}
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </Card>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Thống kê
              </TabsTrigger>
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </TabsTrigger>
            </TabsList>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {gameProgress?.total_xp || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng XP</div>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {gameProgress?.total_points || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Điểm</div>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {gameProgress?.level || 1}
                  </div>
                  <div className="text-sm text-muted-foreground">Cấp độ</div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Huy hiệu đã đạt được
                </h3>
                <div className="flex flex-wrap gap-4">
                  {gameProgress?.earned_badges && gameProgress.earned_badges.length > 0 ? (
                    gameProgress.earned_badges.map((badge, index) => (
                      <div
                        key={index}
                        className="text-5xl hover-scale cursor-pointer"
                        title={`Huy hiệu ${index + 1}`}
                      >
                        {badge}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Chưa có huy hiệu nào</p>
                  )}
                </div>
              </Card>

              {isAdmin && (
                <Card className="p-6 mt-4">
                  <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Quản lý giáo viên
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Quản lý học sinh
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Quản lý bài giảng
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card className="p-6">
                <h3 className="text-xl font-heading font-bold mb-4">
                  Thông tin cá nhân
                </h3>
                
                {editing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Tên hiển thị</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="school">Trường học</Label>
                      <Input
                        id="school"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        placeholder="Tên trường học của bạn"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Lớp</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="Ví dụ: 1, 2, 3..."
                      />
                    </div>

                    <Button onClick={handleUpdateProfile} className="w-full">
                      Lưu thay đổi
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Tên hiển thị</Label>
                      <p className="text-lg">{profile?.display_name}</p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Trường học</Label>
                      <p className="text-lg">{profile?.school || "Chưa cập nhật"}</p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Lớp</Label>
                      <p className="text-lg">{profile?.grade ? `Lớp ${profile.grade}` : "Chưa cập nhật"}</p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Vai trò</Label>
                      <p className="text-lg">{isAdmin ? "Giáo viên" : "Học sinh"}</p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6">
                <h3 className="text-xl font-heading font-bold mb-4">
                  Cài đặt tài khoản
                </h3>
                
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={async () => {
                      const { error } = await supabase.auth.resetPasswordForEmail(
                        profile?.id || "",
                        { redirectTo: `${window.location.origin}/auth?reset=true` }
                      );
                      
                      if (error) {
                        toast({
                          title: "Lỗi",
                          description: "Không thể gửi email đặt lại mật khẩu",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      toast({
                        title: "Thành công",
                        description: "Vui lòng kiểm tra email để đặt lại mật khẩu",
                      });
                    }}
                  >
                    Đổi mật khẩu
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/");
                    }}
                  >
                    Đăng xuất
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
