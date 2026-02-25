import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Users, Award, BookOpen, Loader2, Calendar } from "lucide-react";

interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

interface TopStudent {
  name: string;
  xp: number;
  level: number;
}

interface DailyActivityRow {
  activity_date: string;
  xp_earned: number;
  points_earned: number;
  lessons_completed: number;
  time_spent_minutes: number;
  user_id: string;
}

interface GradeCompletion {
  grade: string;
  totalStudents: number;
  activeStudents: number;
  totalStages: number;
  avgAccuracy: number;
  color: string;
}

const GRADE_COLORS: Record<string, string> = {
  "Mầm non": "#ec4899",
  "Lớp 1": "#3b82f6",
  "Lớp 2": "#22c55e",
  "Lớp 3": "#f59e0b",
  "Lớp 4": "#8b5cf6",
  "Lớp 5": "#ef4444",
  "Chưa xác định": "#94a3b8",
  "Khác": "#6b7280",
};

const GRADE_LABELS: Record<string, string> = {
  preschool: "Mầm non",
  grade1: "Lớp 1",
  grade2: "Lớp 2",
  grade3: "Lớp 3",
  grade4: "Lớp 4",
  grade5: "Lớp 5",
};

const COURSE_TO_GRADE: Record<string, string> = {
  "grade0": "Mầm non",
  "grade1": "Lớp 1",
  "grade2": "Lớp 2",
  "grade3": "Lớp 3",
  "grade4": "Lớp 4",
  "grade5": "Lớp 5",
};

type TimePeriod = "7d" | "30d" | "90d" | "all";

const getStartDate = (period: TimePeriod): string | null => {
  if (period === "all") return null;
  const d = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

const periodLabel = (period: TimePeriod) => {
  switch (period) {
    case "7d": return "7 ngày qua";
    case "30d": return "30 ngày qua";
    case "90d": return "90 ngày qua";
    case "all": return "Tất cả";
  }
};

const ReportsTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>("30d");
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);
  const [averageStudyTime, setAverageStudyTime] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityRow[]>([]);
  const [gradeCompletions, setGradeCompletions] = useState<GradeCompletion[]>([]);

  useEffect(() => {
    loadReportData();
  }, [period]);

  const loadReportData = async () => {
    setIsLoading(true);
    const startDate = getStartDate(period);

    try {
      // Parallel queries
      const [
        { count: studentCount },
        { count: classCount },
        courseProgressRes,
        activityRes,
        studentRolesRes,
        globalProgressRes,
        stageHistoryRes,
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("classes").select("*", { count: "exact", head: true }),
        supabase.from("course_progress").select("completed_nodes"),
        startDate
          ? supabase.from("daily_activity").select("activity_date, xp_earned, points_earned, lessons_completed, time_spent_minutes, user_id").gte("activity_date", startDate).order("activity_date")
          : supabase.from("daily_activity").select("activity_date, xp_earned, points_earned, lessons_completed, time_spent_minutes, user_id").order("activity_date"),
        supabase.from("user_roles").select("user_id").eq("role", "student"),
        supabase.from("game_globals").select("user_id, total_xp, global_level").gt("total_xp", 0).order("total_xp", { ascending: false }).limit(5),
        startDate
          ? supabase.from("stage_history").select("user_id, course_id, correct_answers, total_questions, score, created_at").gte("created_at", startDate)
          : supabase.from("stage_history").select("user_id, course_id, correct_answers, total_questions, score, created_at"),
      ]);

      setTotalStudents(studentCount || 0);
      setTotalClasses(classCount || 0);

      // Lessons completed
      let totalCompleted = 0;
      courseProgressRes.data?.forEach((p: any) => {
        const nodes = Array.isArray(p.completed_nodes) ? p.completed_nodes : [];
        totalCompleted += nodes.length;
      });
      setTotalLessonsCompleted(totalCompleted);

      // Daily activity & average time
      const actData = activityRes.data || [];
      setDailyActivity(actData as DailyActivityRow[]);
      if (actData.length > 0) {
        const totalTime = actData.reduce((s, a: any) => s + (a.time_spent_minutes || 0), 0);
        setAverageStudyTime(Math.round(totalTime / actData.length));
      } else {
        setAverageStudyTime(0);
      }

      // Grade distribution
      const studentRoles = studentRolesRes.data;
      if (studentRoles && studentRoles.length > 0) {
        const studentIds = studentRoles.map((r) => r.user_id);
        const { data: profiles } = await supabase.from("profiles").select("grade").in("id", studentIds);
        
        const gradeCounts: Record<string, number> = {};
        let unknownCount = 0;
        profiles?.forEach((profile) => {
          const grade = (profile.grade || "").trim();
          if (!grade) { unknownCount++; return; }
          let matched = false;
          for (const [key, label] of Object.entries(GRADE_LABELS)) {
            const gradeNum = key.replace("grade", "");
            if (grade.toLowerCase().includes(gradeNum) || grade.toLowerCase().includes(label.toLowerCase())) {
              gradeCounts[label] = (gradeCounts[label] || 0) + 1;
              matched = true;
              break;
            }
          }
          if (!matched) unknownCount++;
        });
        if (unknownCount > 0) gradeCounts["Chưa xác định"] = unknownCount;

        const distribution = Object.entries(gradeCounts).map(([name, value]) => ({
          name, value, color: GRADE_COLORS[name] || GRADE_COLORS["Khác"],
        }));
        setGradeDistribution(distribution.length > 0 ? distribution : []);
      }

      // Top students
      const globalData = globalProgressRes.data;
      if (globalData && globalData.length > 0) {
        const userIds = globalData.map((g) => g.user_id);
        const { data: profilesData } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        setTopStudents(globalData.map((p) => {
          const prof = profilesData?.find((pr) => pr.id === p.user_id);
          return { name: prof?.display_name || "Học sinh", xp: p.total_xp || 0, level: p.global_level || 1 };
        }));
      } else {
        setTopStudents([]);
      }

      // Grade completion from stage_history
      const stageData = stageHistoryRes.data || [];
      const gradeMap: Record<string, { users: Set<string>; totalStages: number; totalAcc: number; accCount: number }> = {};
      stageData.forEach((r: any) => {
        const coursePrefix = (r.course_id || "").split("-")[0];
        const gradeName = COURSE_TO_GRADE[coursePrefix];
        if (!gradeName) return;
        if (!gradeMap[gradeName]) gradeMap[gradeName] = { users: new Set(), totalStages: 0, totalAcc: 0, accCount: 0 };
        gradeMap[gradeName].users.add(r.user_id);
        gradeMap[gradeName].totalStages++;
        if (r.total_questions > 0) {
          gradeMap[gradeName].totalAcc += (r.correct_answers / r.total_questions) * 100;
          gradeMap[gradeName].accCount++;
        }
      });

      const completions: GradeCompletion[] = Object.entries(gradeMap).map(([grade, data]) => ({
        grade,
        totalStudents: data.users.size,
        activeStudents: data.users.size,
        totalStages: data.totalStages,
        avgAccuracy: data.accCount > 0 ? Math.round(data.totalAcc / data.accCount) : 0,
        color: GRADE_COLORS[grade] || "#6b7280",
      }));
      setGradeCompletions(completions.sort((a, b) => {
        const order = ["Mầm non", "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
        return order.indexOf(a.grade) - order.indexOf(b.grade);
      }));

    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregate daily activity into weekly/daily trend data
  const trendData = useMemo(() => {
    if (dailyActivity.length === 0) return [];

    // Group by date, summing across all users
    const dateMap: Record<string, { xp: number; lessons: number; minutes: number; users: Set<string> }> = {};
    dailyActivity.forEach((a) => {
      if (!dateMap[a.activity_date]) dateMap[a.activity_date] = { xp: 0, lessons: 0, minutes: 0, users: new Set() };
      dateMap[a.activity_date].xp += a.xp_earned;
      dateMap[a.activity_date].lessons += a.lessons_completed;
      dateMap[a.activity_date].minutes += a.time_spent_minutes;
      dateMap[a.activity_date].users.add(a.user_id);
    });

    // If more than 60 data points, aggregate weekly
    const dates = Object.keys(dateMap).sort();
    if (dates.length > 60) {
      // Weekly aggregation
      const weekMap: Record<string, { xp: number; lessons: number; minutes: number; users: Set<string> }> = {};
      dates.forEach((date) => {
        const d = new Date(date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split("T")[0];
        if (!weekMap[key]) weekMap[key] = { xp: 0, lessons: 0, minutes: 0, users: new Set() };
        weekMap[key].xp += dateMap[date].xp;
        weekMap[key].lessons += dateMap[date].lessons;
        weekMap[key].minutes += dateMap[date].minutes;
        dateMap[date].users.forEach((u) => weekMap[key].users.add(u));
      });
      return Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, data]) => ({
        date: formatDate(date),
        XP: data.xp,
        "Bài hoàn thành": data.lessons,
        "Phút học": data.minutes,
        "Học sinh": data.users.size,
      }));
    }

    return dates.map((date) => ({
      date: formatDate(date),
      XP: dateMap[date].xp,
      "Bài hoàn thành": dateMap[date].lessons,
      "Phút học": dateMap[date].minutes,
      "Học sinh": dateMap[date].users.size,
    }));
  }, [dailyActivity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Báo cáo & Thống kê</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="90d">90 ngày qua</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số lớp học</p>
                <p className="text-2xl font-bold">{totalClasses}</p>
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
                <p className="text-sm text-muted-foreground">Bài hoàn thành</p>
                <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian TB</p>
                <p className="text-2xl font-bold">{averageStudyTime} phút</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Xu hướng hoạt động ({periodLabel(period)})</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="XP" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Bài hoàn thành" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Học sinh" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có dữ liệu hoạt động trong khoảng thời gian này</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Completion & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Tỷ lệ hoàn thành theo khối lớp</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeCompletions.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={gradeCompletions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="grade" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "avgAccuracy") return [`${value}%`, "Độ chính xác TB"];
                        if (name === "totalStages") return [value, "Tổng lượt chơi"];
                        if (name === "activeStudents") return [value, "Học sinh hoạt động"];
                        return [value, name];
                      }}
                    />
                    <Legend formatter={(v) => v === "avgAccuracy" ? "Độ chính xác TB (%)" : v === "totalStages" ? "Tổng lượt chơi" : "Học sinh"} />
                    <Bar dataKey="totalStages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="totalStages" />
                    <Bar dataKey="avgAccuracy" fill="#22c55e" radius={[4, 4, 0, 0]} name="avgAccuracy" />
                  </BarChart>
                </ResponsiveContainer>
                {/* Detail cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gradeCompletions.map((gc) => (
                    <div key={gc.grade} className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: gc.color }} />
                      <p className="text-xs font-semibold">{gc.grade}</p>
                      <p className="text-lg font-bold text-primary">{gc.avgAccuracy}%</p>
                      <p className="text-xs text-muted-foreground">{gc.activeStudents} HS · {gc.totalStages} lượt</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có dữ liệu hoàn thành theo khối</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố học sinh theo khối</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value} học sinh`, "Số lượng"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4">
                  {gradeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có dữ liệu phân bố khối</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 học sinh xuất sắc theo XP</CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStudents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} XP`, "Tổng XP"]}
                  />
                  <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} name="XP" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có dữ liệu xếp hạng</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bảng xếp hạng chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length > 0 ? (
              <div className="space-y-3">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-gray-400 text-white" : index === 2 ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Level {student.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{student.xp}</p>
                      <p className="text-sm text-muted-foreground">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu xếp hạng</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="text-indigo-700 dark:text-indigo-300">📊 Phân tích tổng quan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-indigo-600/80 dark:text-indigo-400/80">
            <li>• Tổng số <strong>{totalStudents}</strong> học sinh đang sử dụng hệ thống</li>
            <li>• Có <strong>{totalClasses}</strong> lớp học đã được tạo</li>
            <li>• Học sinh đã hoàn thành <strong>{totalLessonsCompleted}</strong> bài học</li>
            <li>• Thời gian học trung bình: <strong>{averageStudyTime} phút/ngày</strong></li>
            {gradeCompletions.length > 0 && (
              <li>• Độ chính xác cao nhất: <strong>{gradeCompletions.reduce((max, c) => c.avgAccuracy > max.avgAccuracy ? c : max).grade} ({gradeCompletions.reduce((max, c) => c.avgAccuracy > max.avgAccuracy ? c : max).avgAccuracy}%)</strong></li>
            )}
            {gradeDistribution.length > 0 && (
              <li>• Khối có nhiều học sinh nhất: <strong>{gradeDistribution.reduce((max, curr) => curr.value > max.value ? curr : max).name}</strong></li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default ReportsTab;
