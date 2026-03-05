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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, language } = useLanguage();
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
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles && studentRoles.length > 0) {
        const studentIds = studentRoles.map(r => r.user_id);
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", studentIds);

        if (!profiles) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

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
        title: t.adminStudents.error,
        description: t.adminStudents.cannotLoadStudents,
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
      const { data: globalData } = await supabase
        .from("game_globals")
        .select("total_xp, global_level")
        .eq("user_id", student.id)
        .maybeSingle();

      const { data: streak } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", student.id)
        .maybeSingle();

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

      const { data: courseStars } = await supabase
        .from("course_progress")
        .select("total_stars")
        .eq("user_id", student.id);

      if (courseStars && courseStars.length > 0) {
        totalPoints = courseStars.reduce((sum, course) => sum + (course.total_stars || 0), 0);
      }

      setStudentStats({
        total_xp: globalData?.total_xp || 0,
        level: globalData?.global_level || 1,
        total_points: totalPoints,
        current_streak: streak?.current_streak || 0,
        completed_lessons: totalCompletedLessons,
      });
    } catch (error) {
      console.error("Error loading student stats:", error);
      toast({
        title: t.adminStudents.error,
        description: t.adminStudents.cannotLoadStudentInfo,
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
        title: t.adminStudents.success,
        description: classIdToUpdate 
          ? t.adminStudents.assignedToClass
          : t.adminStudents.removedFromClass,
      });

      setShowAssignModal(false);
      setSelectedClassId("none");
      await loadStudents();
    } catch (error: any) {
      console.error("Failed to assign class:", error);
      toast({
        title: t.adminStudents.error,
        description: error.message || t.adminStudents.cannotAssign,
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
                <p className="text-sm text-muted-foreground">{t.adminStudents.totalStudents}</p>
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
                <p className="text-sm text-muted-foreground">{t.adminStudents.hasClass}</p>
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
                <p className="text-sm text-muted-foreground">{t.adminStudents.noClass}</p>
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
            <CardTitle>{t.adminStudents.studentList}</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.adminStudents.searchPlaceholder}
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
              {t.adminStudents.noStudentsFound}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.adminStudents.student}</TableHead>
                  <TableHead>{t.adminStudents.class}</TableHead>
                  <TableHead>{t.adminStudents.grade}</TableHead>
                  <TableHead>{t.adminStudents.school}</TableHead>
                  <TableHead>{t.adminStudents.email}</TableHead>
                  <TableHead className="text-right">{t.adminStudents.actions}</TableHead>
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
                          {t.adminStudents.assignClass}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewStudentDetail(student)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t.adminStudents.view}
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
            <DialogTitle>{t.adminStudents.studentInfo}</DialogTitle>
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
                  <p className="text-sm text-muted-foreground">{selectedStudent.email || t.adminStudents.noEmail}</p>
                  {selectedStudent.class_name && (
                    <p className="text-sm text-primary mt-1">{t.adminStudents.classLabel} {selectedStudent.class_name}</p>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">{t.adminStudents.personalInfo}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t.adminStudents.gradeLabel}</p>
                    <p className="font-medium">{selectedStudent.grade || t.adminStudents.notUpdated}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.adminStudents.schoolLabel}</p>
                    <p className="font-medium">{selectedStudent.school || t.adminStudents.notUpdated}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.adminStudents.phone}</p>
                    <p className="font-medium">{selectedStudent.phone || t.adminStudents.notUpdated}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t.adminStudents.birthDate}</p>
                    <p className="font-medium">
                      {selectedStudent.birth_date 
                        ? new Date(selectedStudent.birth_date).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")
                        : t.adminStudents.notUpdated}
                    </p>
                  </div>
                  {selectedStudent.address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">{t.adminStudents.address}</p>
                      <p className="font-medium">{selectedStudent.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">{t.adminStudents.learningStats}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-primary">{studentStats?.level || 1}</p>
                    <p className="text-xs text-muted-foreground">{t.adminStudents.level}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{studentStats?.total_xp || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.adminStudents.totalXP}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">{studentStats?.total_points || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.adminStudents.points}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-orange-600">{studentStats?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.adminStudents.streak}</p>
                  </div>
                  <div className="col-span-2 p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-600">{studentStats?.completed_lessons || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.adminStudents.lessonsCompleted}</p>
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
            <DialogTitle>{t.adminStudents.assignClassTitle}</DialogTitle>
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
                <Label htmlFor="class">{t.adminStudents.selectClass}</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(value) => {
                    console.log("Selected class:", value);
                    setSelectedClassId(value);
                  }}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder={t.adminStudents.selectClassPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground italic">{t.adminStudents.noClassOption}</span>
                    </SelectItem>
                    {classes.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {t.adminStudents.noClassesYet}
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
                    {t.adminStudents.currentClass} <span className="font-medium text-primary">{assigningStudent.class_name}</span>
                  </p>
                )}
                {!assigningStudent?.class_name && (
                  <p className="text-sm text-muted-foreground">
                    {t.adminStudents.studentNoClass}
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
              {t.adminStudents.cancel}
            </Button>
            <Button onClick={handleAssignClass} disabled={isAssigning}>
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.adminStudents.saving}
                </>
              ) : (
                t.adminStudents.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsTab;
