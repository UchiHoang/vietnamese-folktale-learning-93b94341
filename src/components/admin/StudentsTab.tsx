import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, TrendingUp, Award, Eye, UserPlus, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  display_name: string;
  avatar: string;
  grade?: string;
  email?: string;
  school?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  class_id?: string;
  class_name?: string;
}

interface StudentStats {
  total_xp: number;
  level: number;
  total_points: number;
  current_streak: number;
  completed_lessons: number;
}

interface Class {
  id: string;
  name: string;
  grade: string;
}

const GRADE_DISPLAY: Record<string, string> = {
  "grade0": "Mầm non",
  "grade1": "Lớp 1",
  "grade2": "Lớp 2",
  "grade3": "Lớp 3",
  "grade4": "Lớp 4",
  "grade5": "Lớp 5",
};

const StudentsTab = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    
    try {
      // Get all student user IDs
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles && studentRoles.length > 0) {
        const studentIds = studentRoles.map(r => r.user_id);
        
        // Load profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", studentIds);

        if (!profiles) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        // Load classes separately
        const classIds = profiles
          .map(p => p.class_id)
          .filter((id): id is string => id != null);

        let classesMap: Record<string, string> = {};
        
        if (classIds.length > 0) {
          const { data: classesData } = await supabase
            .from("classes")
            .select("id, name")
            .in("id", classIds);

          if (classesData) {
            classesMap = classesData.reduce((acc, cls) => {
              acc[cls.id] = cls.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        // Transform data to include class_name
        const studentsWithClass = profiles.map((profile: any) => ({
          ...profile,
          class_name: profile.class_id ? classesMap[profile.class_id] : undefined,
        }));

        setStudents(studentsWithClass);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách học sinh",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name, grade")
      .order("name");

    setClasses(data || []);
  };

  const viewStudentDetail = async (student: Student) => {
    setSelectedStudent(student);
    
    try {
      // Load student stats from game_globals (primary source)
      const { data: globalData } = await supabase
        .from("game_globals")
        .select("total_xp, global_level")
        .eq("user_id", student.id)
        .maybeSingle();

      // Load from game_progress as fallback
      const { data: gameProgress } = await supabase
        .from("game_progress")
        .select("total_xp, level, total_points")
        .eq("user_id", student.id)
        .maybeSingle();

      // Load streak data
      const { data: streak } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", student.id)
        .maybeSingle();

      // Load completed lessons from course_progress
      const { data: courseProgress } = await supabase
        .from("course_progress")
        .select("completed_nodes")
        .eq("user_id", student.id);

      let totalCompletedLessons = 0;
      let totalPoints = 0;

      if (courseProgress && courseProgress.length > 0) {
        courseProgress.forEach((course: any) => {
          const nodes = Array.isArray(course.completed_nodes) ? course.completed_nodes : [];
          totalCompletedLessons += nodes.length;
        });
      }

      // Calculate total points from course_progress
      const { data: courseStars } = await supabase
        .from("course_progress")
        .select("total_stars")
        .eq("user_id", student.id);

      if (courseStars && courseStars.length > 0) {
        totalPoints = courseStars.reduce((sum, course) => sum + (course.total_stars || 0), 0);
      }

      setStudentStats({
        total_xp: globalData?.total_xp || gameProgress?.total_xp || 0,
        level: globalData?.global_level || gameProgress?.level || 1,
        total_points: totalPoints || gameProgress?.total_points || 0,
        current_streak: streak?.current_streak || 0,
        completed_lessons: totalCompletedLessons,
      });
    } catch (error) {
      console.error("Error loading student stats:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin học sinh",
        variant: "destructive",
      });
    }

    setShowDetailModal(true);
  };

  const handleOpenAssignModal = (student: Student) => {
    setAssigningStudent(student);
    setSelectedClassId(student.class_id || "none");
    setShowAssignModal(true);
  };

  const handleAssignClass = async () => {
    if (!assigningStudent) return;

    setIsAssigning(true);
    try {
      const classIdToUpdate = selectedClassId === "none" ? null : selectedClassId;
      
      const { error } = await supabase
        .from("profiles")
        .update({
          class_id: classIdToUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assigningStudent.id);

      if (error) {
        console.error("Error updating class:", error);
        throw error;
      }

      toast({
        title: "Thành công",
        description: classIdToUpdate 
          ? "Đã gán học sinh vào lớp"
          : "Đã xóa học sinh khỏi lớp",
      });

      setShowAssignModal(false);
      setSelectedClassId("none");
      await loadStudents();
    } catch (error: any) {
      console.error("Failed to assign class:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gán lớp",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmojiAvatar = (avatar?: string) => !avatar || 
    (avatar.length <= 4 && /\p{Emoji}/u.test(avatar));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã có lớp</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.class_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chưa có lớp</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => !s.class_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Danh sách học sinh</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy học sinh nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Khối</TableHead>
                  <TableHead>Trường</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {isEmojiAvatar(student.avatar) ? (
                            <AvatarFallback className="bg-primary/10 text-lg">
                              {student.avatar || "👤"}
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback>{student.display_name?.[0]}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <span className="font-medium">{student.display_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.class_name ? (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                          {student.class_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{student.grade || "—"}</TableCell>
                    <TableCell>{student.school || "—"}</TableCell>
                    <TableCell>{student.email || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignModal(student)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Gán lớp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewStudentDetail(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin học sinh</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {isEmojiAvatar(selectedStudent.avatar) ? (
                    <AvatarFallback className="bg-primary/10 text-2xl">
                      {selectedStudent.avatar || "👤"}
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={selectedStudent.avatar} />
                      <AvatarFallback>{selectedStudent.display_name?.[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedStudent.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email || "Chưa có email"}</p>
                  {selectedStudent.class_name && (
                    <p className="text-sm text-primary mt-1">Lớp: {selectedStudent.class_name}</p>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">Thông tin cá nhân</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Khối</p>
                    <p className="font-medium">{selectedStudent.grade || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trường</p>
                    <p className="font-medium">{selectedStudent.school || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{selectedStudent.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày sinh</p>
                    <p className="font-medium">
                      {selectedStudent.birth_date 
                        ? new Date(selectedStudent.birth_date).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                  {selectedStudent.address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">{selectedStudent.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Thống kê học tập</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{studentStats?.level || 1}</p>
                    <p className="text-xs text-muted-foreground">Cấp độ</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{studentStats?.total_xp || 0}</p>
                    <p className="text-xs text-muted-foreground">Tổng XP</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{studentStats?.total_points || 0}</p>
                    <p className="text-xs text-muted-foreground">Điểm số</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-orange-600">{studentStats?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Chuỗi ngày</p>
                  </div>
                  <div className="col-span-2 p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-600">{studentStats?.completed_lessons || 0}</p>
                    <p className="text-xs text-muted-foreground">Bài đã hoàn thành</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Class Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gán lớp học</DialogTitle>
          </DialogHeader>
          {assigningStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  {isEmojiAvatar(assigningStudent.avatar) ? (
                    <AvatarFallback className="bg-primary/10 text-lg">
                      {assigningStudent.avatar || "👤"}
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={assigningStudent.avatar} />
                      <AvatarFallback>{assigningStudent.display_name?.[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{assigningStudent.display_name}</p>
                  <p className="text-sm text-muted-foreground">{assigningStudent.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Chọn lớp học</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(value) => {
                    console.log("Selected class:", value);
                    setSelectedClassId(value);
                  }}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Chọn lớp học..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground italic">Không có lớp</span>
                    </SelectItem>
                    {classes.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Chưa có lớp học nào
                      </div>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {GRADE_DISPLAY[cls.grade] || cls.grade}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {assigningStudent?.class_name && (
                  <p className="text-sm text-muted-foreground">
                    Lớp hiện tại: <span className="font-medium text-primary">{assigningStudent.class_name}</span>
                  </p>
                )}
                {!assigningStudent?.class_name && (
                  <p className="text-sm text-muted-foreground">
                    Học sinh chưa có lớp
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignModal(false)}
              disabled={isAssigning}
            >
              Hủy
            </Button>
            <Button onClick={handleAssignClass} disabled={isAssigning}>
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsTab;
