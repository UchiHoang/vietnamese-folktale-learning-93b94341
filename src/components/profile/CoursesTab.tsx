import { Play, CheckCircle, Lock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GameProgress {
  total_xp: number;
  level: number;
  current_node: number;
  completed_nodes: string[];
}

interface CoursesTabProps {
  gameProgress: GameProgress | null;
}

interface Course {
  id: string;
  name: string;
  description: string;
  grade: number; // 0 = Mầm non, 1-5 = Lớp 1-5
  gradeDisplay: string;
  totalLessons: number;
  image: string;
  route: string;
  color: string;
}

const ALL_COURSES: Course[] = [
  {
    id: "preschool-cucuoi",
    name: "Hành trình Chú Cuội Cung Trăng",
    description: "Cuội và Thỏ Ngọc cùng đếm số và hình khối để bay lên trăng",
    grade: 0,
    gradeDisplay: "Mầm non",
    totalLessons: 15,
    image: "🌙",
    route: "/classroom/preschool",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "grade1-zodiac",
    name: "Tí và cuộc đua 12 Con Giáp",
    description: "Cùng Tí khám phá toán học qua hành trình 12 con giáp",
    grade: 1,
    gradeDisplay: "Lớp 1",
    totalLessons: 15,
    image: "🐭",
    route: "/classroom/grade1",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "grade2-trangquynh",
    name: "Trạng Quỳnh đi thi",
    description: "Rèn luyện tư duy logic cùng Trạng Quỳnh",
    grade: 2,
    gradeDisplay: "Lớp 2",
    totalLessons: 20,
    image: "🎭",
    route: "/classroom/trangquynh",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "grade3-songhong",
    name: "Sơn Tinh - Thủy Tinh",
    description: "Cuộc chiến giữa Sơn Tinh và Thủy Tinh qua toán học",
    grade: 3,
    gradeDisplay: "Lớp 3",
    totalLessons: 15,
    image: "⚡",
    route: "/classroom/songhong",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "grade4-giong",
    name: "Thánh Gióng bay về trời",
    description: "Theo chân Thánh Gióng chiến đấu cứu dân",
    grade: 4,
    gradeDisplay: "Lớp 4",
    totalLessons: 20,
    image: "🐎",
    route: "/classroom/grade4",
    color: "from-purple-500 to-violet-500",
  },
  {
    id: "grade5-trangnguyen",
    name: "Bảo vệ đất nước cùng Trạng Nguyên",
    description: "Cùng Trạng Nguyên bảo vệ đất nước bằng trí tuệ",
    grade: 5,
    gradeDisplay: "Lớp 5",
    totalLessons: 25,
    image: "🏛️",
    route: "/classroom/grade5",
    color: "from-red-500 to-pink-500",
  },
];

interface CourseProgressData {
  course_id: string;
  completed_nodes: (string | number)[];
  total_xp: number;
  total_stars: number;
  current_node: number;
  extra_data?: any;
}

const CoursesTab = ({ gameProgress }: CoursesTabProps) => {
  const navigate = useNavigate();
  const [userGrade, setUserGrade] = useState<number>(2); // Default: Lớp 2
  const [loading, setLoading] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState<Record<string, CourseProgressData>>({});
  
  const completedNodes = (gameProgress?.completed_nodes as string[]) || [];

  // Load user's current grade and all courses progress
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load profile grade
        const { data: profile } = await supabase
          .from("profiles")
          .select("grade")
          .eq("id", user.id)
          .single();

        if (profile?.grade) {
          // Parse grade string like "Lớp 2" -> 2, "Mầm non" -> 0
          const gradeStr = profile.grade.toLowerCase();
          if (gradeStr.includes("mầm") || gradeStr.includes("mam")) {
            setUserGrade(0);
          } else {
            const match = gradeStr.match(/(\d+)/);
            if (match) {
              setUserGrade(parseInt(match[1]));
            }
          }
        } else {
          // Fallback: estimate grade from level
          const level = gameProgress?.level || 1;
          if (level < 5) setUserGrade(0);
          else if (level < 10) setUserGrade(1);
          else if (level < 15) setUserGrade(2);
          else if (level < 20) setUserGrade(3);
          else if (level < 25) setUserGrade(4);
          else setUserGrade(5);
        }

        // Load all course progress
        const { data: coursesData } = await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", user.id);

        if (coursesData) {
          const progressMap: Record<string, CourseProgressData> = {};
          coursesData.forEach((course: any) => {
            // completed_nodes can be array of numbers or strings
            const completedNodes = Array.isArray(course.completed_nodes) 
              ? course.completed_nodes 
              : [];
            
            progressMap[course.course_id] = {
              course_id: course.course_id,
              completed_nodes: completedNodes,
              total_xp: course.total_xp || 0,
              total_stars: course.total_stars || 0,
              current_node: course.current_node || 0,
            };
          });
          setCoursesProgress(progressMap);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [gameProgress]);

  // Determine course status based on ACTUAL progress from database
  const getCourseStatus = (courseId: string, courseGrade: number, totalLessons: number) => {
    const courseData = coursesProgress[courseId];
    
    if (courseData) {
      const completedCount = courseData.completed_nodes.length;
      
      // Nếu đã hoàn thành tất cả các màn
      if (completedCount >= totalLessons) {
        return "completed";
      }
      
      // Nếu đã chơi ít nhất 1 màn
      if (completedCount > 0) {
        return "in-progress";
      }
    }
    
    // Chưa có progress: check nếu grade cao hơn user grade thì lock
    if (courseGrade > userGrade) {
      return "locked";
    }
    
    // Grade thấp hơn hoặc bằng user grade nhưng chưa chơi → available to start
    return "available";
  };

  // Calculate level from XP (200 XP per level)
  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 200) + 1;
  };

  // Get progress for a specific course
  const getCourseProgress = (courseId: string, totalLessons: number) => {
    // Use courseId directly from database format
    const courseData = coursesProgress[courseId];

    if (courseData) {
      const completed = courseData.completed_nodes.length;
      const percentage = Math.min((completed / totalLessons) * 100, 100);
      const courseLevel = calculateLevel(courseData.total_xp);
      
      return {
        completed,
        total: totalLessons,
        percentage: Math.round(percentage),
        xp: courseData.total_xp,
        stars: courseData.total_stars,
        level: courseLevel,
        currentNode: courseData.current_node,
      };
    }

    // Fallback to default
    return {
      completed: 0,
      total: totalLessons,
      percentage: 0,
      xp: 0,
      stars: 0,
      level: 1,
      currentNode: 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lộ trình học tập</h2>
          <p className="text-sm text-muted-foreground">
            Bạn đang học: <span className="font-semibold text-primary">
              {ALL_COURSES.find(c => c.grade === userGrade)?.gradeDisplay}
            </span>
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <BookOpen className="h-4 w-4 mr-1" />
          {completedNodes.length} bài đã hoàn thành
        </Badge>
      </div>

      {/* Courses List */}
      <div className="grid gap-4">
        {ALL_COURSES.map((course) => {
          const progress = getCourseProgress(course.id, course.totalLessons);
          const status = getCourseStatus(course.id, course.grade, course.totalLessons);
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isInProgress = status === "in-progress";
          const isAvailable = status === "available";

          return (
            <Card
              key={course.id}
              className={`p-5 transition-all ${
                !isLocked
                  ? "hover:shadow-lg cursor-pointer"
                  : "opacity-60"
              }`}
              onClick={() => !isLocked && navigate(course.route)}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Course Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl shrink-0 relative`}>
                  {course.image}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{course.name}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      {course.gradeDisplay}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-500 hover:bg-green-600 shrink-0">
                        ✓ Đã hoàn thành
                      </Badge>
                    )}
                    {isInProgress && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 shrink-0">
                        📚 Đang học
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge variant="outline" className="shrink-0">
                        🔒 Chưa mở
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {course.description}
                  </p>

                  {/* Progress Bar for in-progress and completed courses */}
                  {(isInProgress || isCompleted || (isAvailable && progress.completed > 0)) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          <span className="font-semibold">{progress.completed}/{course.totalLessons}</span> màn đã hoàn thành
                        </span>
                        <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                          {progress.percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={progress.percentage} 
                        className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`}
                      />
                      {(progress.xp > 0 || progress.level > 1 || progress.stars > 0) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-primary">Lv.{progress.level}</span>
                          </span>
                          {progress.xp > 0 && (
                            <span className="flex items-center gap-1">
                              ⚡ <span className="font-medium">{progress.xp}</span> XP
                            </span>
                          )}
                          {progress.stars > 0 && (
                            <span className="flex items-center gap-1">
                              ⭐ <span className="font-medium">{progress.stars}</span> sao
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isLocked && (
                    <p className="text-xs text-muted-foreground italic">
                      {course.grade > 0 ? (
                        <>🔒 Hoàn thành {ALL_COURSES.find(c => c.grade === course.grade - 1)?.gradeDisplay || "khóa trước"} để mở khóa</>
                      ) : (
                        <>🔒 Khóa học chưa mở</>
                      )}
                    </p>
                  )}
                  
                  {isAvailable && progress.completed === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      📚 Sẵn sàng để bắt đầu hành trình mới!
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="shrink-0 sm:self-center w-full sm:w-auto">
                  {isCompleted ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(course.route);
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full sm:w-auto bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                    >
                      Xem lại <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : isInProgress ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(course.route);
                      }}
                      size="sm"
                      className="gap-2 w-full sm:w-auto"
                    >
                      Tiếp tục <Play className="h-4 w-4" />
                    </Button>
                  ) : isAvailable ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(course.route);
                      }}
                      size="sm"
                      variant="default"
                      className="gap-2 w-full sm:w-auto"
                    >
                      Bắt đầu <Play className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled 
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Lock className="h-4 w-4" />
                      Chưa mở
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Learning Stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <h3 className="font-bold text-lg mb-4">Tổng quan tiến độ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-xl">
            <div className="text-2xl font-bold text-primary">{completedNodes.length}</div>
            <div className="text-xs text-muted-foreground">Bài đã hoàn thành</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-xl">
            <div className="text-2xl font-bold text-green-500">
              {ALL_COURSES.filter(c => getCourseStatus(c.id, c.grade, c.totalLessons) === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground">Khóa hoàn thành</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-500">
              {ALL_COURSES.filter(c => getCourseStatus(c.id, c.grade, c.totalLessons) === "in-progress").length}
            </div>
            <div className="text-xs text-muted-foreground">Khóa đang học</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-xl">
            <div className="text-2xl font-bold text-orange-500">{gameProgress?.level || 1}</div>
            <div className="text-xs text-muted-foreground">Cấp độ hiện tại</div>
          </div>
        </div>
      </Card>

      {/* Motivation Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-2">
          🌟 Tiếp tục phấn đấu!
        </h3>
        <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
          {(() => {
            const inProgressCourses = ALL_COURSES.filter(c => 
              getCourseStatus(c.id, c.grade, c.totalLessons) === "in-progress"
            );
            const completedCount = ALL_COURSES.filter(c => 
              getCourseStatus(c.id, c.grade, c.totalLessons) === "completed"
            ).length;
            
            if (completedCount === ALL_COURSES.length) {
              return <>🎉 Chúc mừng! Bạn đã hoàn thành tất cả {ALL_COURSES.length} khóa học. Hãy tiếp tục ôn luyện để củng cố kiến thức nhé!</>;
            }
            
            if (inProgressCourses.length > 0) {
              return <>Bạn đang học rất tốt! Hãy hoàn thành <strong>{inProgressCourses[0].name}</strong> để tiếp tục hành trình.</>;
            }
            
            return <>Hãy bắt đầu khóa học đầu tiên để bắt đầu hành trình toán học thú vị!</>;
          })()}
        </p>
      </Card>
    </div>
  );
};

export default CoursesTab;
