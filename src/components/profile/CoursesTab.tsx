import { Play, CheckCircle, Lock, BookOpen, Star, Zap, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
  grade: number;
  gradeDisplay: string;
  totalLessons: number;
  image: string;
  route: string;
  color: string;
  bgLight: string;
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
    bgLight: "bg-pink-50 dark:bg-pink-950/20",
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
    bgLight: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    id: "grade2-trangquynh",
    name: "Trạng Quỳnh đi thi",
    description: "Rèn luyện tư duy logic cùng Trạng Quỳnh",
    grade: 2,
    gradeDisplay: "Lớp 2",
    totalLessons: 15,
    image: "🎭",
    route: "/classroom/trangquynh",
    color: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50 dark:bg-green-950/20",
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
    bgLight: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    id: "grade4-giong",
    name: "Thánh Gióng bay về trời",
    description: "Theo chân Thánh Gióng chiến đấu cứu dân",
    grade: 4,
    gradeDisplay: "Lớp 4",
    totalLessons: 15,
    image: "🐎",
    route: "/classroom/grade4",
    color: "from-purple-500 to-violet-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    id: "grade5-trangnguyen",
    name: "Bảo vệ đất nước cùng Trạng Nguyên",
    description: "Cùng Trạng Nguyên bảo vệ đất nước bằng trí tuệ",
    grade: 5,
    gradeDisplay: "Lớp 5",
    totalLessons: 15,
    image: "🏛️",
    route: "/classroom/grade5",
    color: "from-red-500 to-pink-500",
    bgLight: "bg-red-50 dark:bg-red-950/20",
  },
];

interface CourseProgressData {
  course_id: string;
  completed_nodes: (string | number)[];
  total_xp: number;
  total_stars: number;
  current_node: number;
}

const CoursesTab = ({ gameProgress }: CoursesTabProps) => {
  const navigate = useNavigate();
  const [userGrade, setUserGrade] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [coursesProgress, setCoursesProgress] = useState<Record<string, CourseProgressData>>({});

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [profileRes, coursesRes] = await Promise.all([
          supabase.from("profiles").select("grade").eq("id", user.id).single(),
          supabase.from("course_progress").select("*").eq("user_id", user.id),
        ]);

        if (profileRes.data?.grade) {
          const gradeStr = profileRes.data.grade.toLowerCase();
          if (gradeStr.includes("mầm") || gradeStr.includes("mam")) {
            setUserGrade(0);
          } else {
            const match = gradeStr.match(/(\d+)/);
            if (match) setUserGrade(parseInt(match[1]));
          }
        }

        if (coursesRes.data) {
          const progressMap: Record<string, CourseProgressData> = {};
          coursesRes.data.forEach((course: any) => {
            progressMap[course.course_id] = {
              course_id: course.course_id,
              completed_nodes: Array.isArray(course.completed_nodes) ? course.completed_nodes : [],
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

  const getCourseStatus = (courseId: string, courseGrade: number, totalLessons: number) => {
    const courseData = coursesProgress[courseId];
    if (courseData) {
      const completedCount = courseData.completed_nodes.length;
      if (completedCount >= totalLessons) return "completed";
      if (completedCount > 0) return "in-progress";
    }
    if (courseGrade > userGrade) return "locked";
    return "available";
  };

  const getCourseProgress = (courseId: string, totalLessons: number) => {
    const courseData = coursesProgress[courseId];
    if (courseData) {
      const completed = courseData.completed_nodes.length;
      const percentage = Math.min((completed / totalLessons) * 100, 100);
      return {
        completed,
        total: totalLessons,
        percentage: Math.round(percentage),
        xp: courseData.total_xp,
        stars: courseData.total_stars,
        currentNode: courseData.current_node,
      };
    }
    return { completed: 0, total: totalLessons, percentage: 0, xp: 0, stars: 0, currentNode: 0 };
  };

  // Aggregate stats from all courses
  const totalCompletedLessons = Object.values(coursesProgress).reduce(
    (sum, c) => sum + (Array.isArray(c.completed_nodes) ? c.completed_nodes.length : 0), 0
  );
  const totalStars = Object.values(coursesProgress).reduce((sum, c) => sum + c.total_stars, 0);
  const totalXpAllCourses = Object.values(coursesProgress).reduce((sum, c) => sum + c.total_xp, 0);
  const completedCourseCount = ALL_COURSES.filter(
    c => getCourseStatus(c.id, c.grade, c.totalLessons) === "completed"
  ).length;
  const inProgressCourseCount = ALL_COURSES.filter(
    c => getCourseStatus(c.id, c.grade, c.totalLessons) === "in-progress"
  ).length;

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
      <div>
        <h2 className="text-2xl font-bold mb-1">Lộ trình học tập</h2>
        <p className="text-sm text-muted-foreground">
          Bạn đang học:{" "}
          <span className="font-semibold text-primary">
            {ALL_COURSES.find(c => c.grade === userGrade)?.gradeDisplay || "Chưa chọn"}
          </span>
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: "Bài hoàn thành", value: totalCompletedLessons, color: "text-primary", bg: "bg-primary/10" },
          { icon: Star, label: "Tổng sao", value: totalStars, color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Zap, label: "Tổng XP", value: totalXpAllCourses, color: "text-blue-500", bg: "bg-blue-500/10" },
          { icon: Trophy, label: "Khóa hoàn thành", value: `${completedCourseCount}/${ALL_COURSES.length}`, color: "text-green-500", bg: "bg-green-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-3 text-center">
              <div className={`mx-auto w-9 h-9 rounded-full ${stat.bg} flex items-center justify-center mb-1.5`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {ALL_COURSES.map((course, index) => {
          const progress = getCourseProgress(course.id, course.totalLessons);
          const status = getCourseStatus(course.id, course.grade, course.totalLessons);
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const isInProgress = status === "in-progress";

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card
                className={`overflow-hidden transition-all border ${
                  isInProgress
                    ? "border-primary/30 shadow-md"
                    : isCompleted
                    ? "border-green-300 dark:border-green-800"
                    : isLocked
                    ? "opacity-50"
                    : "hover:shadow-md"
                } ${!isLocked ? "cursor-pointer" : ""}`}
                onClick={() => !isLocked && navigate(course.route)}
              >
                <div className="flex items-stretch">
                  {/* Left color bar */}
                  <div className={`w-1.5 shrink-0 bg-gradient-to-b ${course.color}`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start gap-3">
                      {/* Course Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl shrink-0 relative shadow-sm`}>
                        {course.image}
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <h3 className="font-bold text-base leading-tight">{course.name}</h3>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                            {course.gradeDisplay}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {course.description}
                        </p>

                        {/* Progress for active courses */}
                        {(isInProgress || isCompleted) && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                <span className="font-semibold text-foreground">{progress.completed}</span>/{progress.total} màn
                              </span>
                              <span className={`font-bold ${isCompleted ? "text-green-600" : "text-primary"}`}>
                                {progress.percentage}%
                              </span>
                            </div>
                            <Progress
                              value={progress.percentage}
                              className="h-1.5"
                            />
                            {/* Stats chips */}
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              {progress.stars > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="font-medium">{progress.stars}</span>
                                </span>
                              )}
                              {progress.xp > 0 && (
                                <span className="flex items-center gap-0.5">
                                  <Zap className="h-3 w-3 text-blue-500" />
                                  <span className="font-medium">{progress.xp}</span> XP
                                </span>
                              )}
                              {isInProgress && (
                                <span className="flex items-center gap-0.5">
                                  <TrendingUp className="h-3 w-3 text-primary" />
                                  Màn {progress.currentNode + 1}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status messages for non-active courses */}
                        {status === "available" && progress.completed === 0 && (
                          <p className="text-[11px] text-muted-foreground">
                            Sẵn sàng bắt đầu • {course.totalLessons} màn chơi
                          </p>
                        )}
                        {isLocked && (
                          <p className="text-[11px] text-muted-foreground">
                            🔒 Hoàn thành{" "}
                            {ALL_COURSES.find(c => c.grade === course.grade - 1)?.gradeDisplay || "khóa trước"}{" "}
                            để mở khóa
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 self-center">
                        {isCompleted ? (
                          <Button
                            onClick={(e) => { e.stopPropagation(); navigate(course.route); }}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30"
                          >
                            Ôn lại
                          </Button>
                        ) : isInProgress ? (
                          <Button
                            onClick={(e) => { e.stopPropagation(); navigate(course.route); }}
                            size="sm"
                            className="gap-1.5 text-xs"
                          >
                            Tiếp tục <Play className="h-3.5 w-3.5" />
                          </Button>
                        ) : status === "available" ? (
                          <Button
                            onClick={(e) => { e.stopPropagation(); navigate(course.route); }}
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs"
                          >
                            Bắt đầu <Play className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="gap-1 text-xs">
                            <Lock className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Motivation */}
      {inProgressCourseCount > 0 && (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            💪 Bạn đang học{" "}
            <strong className="text-foreground">
              {ALL_COURSES.filter(c => getCourseStatus(c.id, c.grade, c.totalLessons) === "in-progress")
                .map(c => c.name)
                .join(", ")}
            </strong>
            . Hãy tiếp tục để hoàn thành hành trình!
          </p>
        </Card>
      )}
    </div>
  );
};

export default CoursesTab;
