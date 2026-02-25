import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, Clock, Target, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GameProgress {
  total_xp: number;
  total_points: number;
  level: number;
  completed_nodes: (string | number)[];
  global_level?: number;
  coins?: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_learning_days: number;
}

interface AnalyticsTabProps {
  gameProgress: GameProgress | null;
  streak: StreakData | null;
}

interface LevelHistoryRow {
  course_id: string;
  score: number;
  stars: number;
  duration_seconds: number;
  passed: boolean;
  created_at: string;
  node_index: number;
}

interface StageHistoryRow {
  course_id: string;
  stage_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  accuracy: number | null;
  xp_earned: number;
  created_at: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const COURSE_LABELS: Record<string, string> = {
  preschool: "Đếm số",
  grade1: "Tính toán cơ bản",
  grade2: "Phép cộng/trừ",
  grade3: "Hình học",
  grade4: "Đo lường",
  grade5: "Logic nâng cao",
};

const SKILL_LABELS: Record<string, string> = {
  preschool: "Đếm số",
  grade1: "Tính toán",
  grade2: "Cộng/Trừ",
  grade3: "Hình học",
  grade4: "Đo lường",
  grade5: "Logic",
};

const getCourseGroup = (courseId: string): string => {
  if (courseId.startsWith("preschool")) return "preschool";
  if (courseId.startsWith("grade1")) return "grade1";
  if (courseId.startsWith("grade2")) return "grade2";
  if (courseId.startsWith("grade3")) return "grade3";
  if (courseId.startsWith("grade4")) return "grade4";
  if (courseId.startsWith("grade5")) return "grade5";
  return "other";
};

const AnalyticsTab = ({ gameProgress, streak }: AnalyticsTabProps) => {
  const [levelHistory, setLevelHistory] = useState<LevelHistoryRow[]>([]);
  const [stageHistory, setStageHistory] = useState<StageHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [levelRes, stageRes] = await Promise.all([
        supabase
          .from("level_history")
          .select("course_id, score, stars, duration_seconds, passed, created_at, node_index")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("stage_history")
          .select("course_id, stage_id, score, correct_answers, total_questions, time_spent_seconds, accuracy, xp_earned, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (levelRes.data) setLevelHistory(levelRes.data);
      if (stageRes.data) setStageHistory(stageRes.data);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data by time range
  const filteredLevel = useMemo(() => {
    if (timeRange === "all") return levelHistory;
    const days = timeRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return levelHistory.filter(r => new Date(r.created_at) >= cutoff);
  }, [levelHistory, timeRange]);

  const filteredStage = useMemo(() => {
    if (timeRange === "all") return stageHistory;
    const days = timeRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return stageHistory.filter(r => new Date(r.created_at) >= cutoff);
  }, [stageHistory, timeRange]);

  // --- Chart data: XP & time by day ---
  const chartData = useMemo(() => {
    const byDate: Record<string, { xp: number; lessons: number; time: number }> = {};
    for (const r of filteredLevel) {
      const d = new Date(r.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      if (!byDate[d]) byDate[d] = { xp: 0, lessons: 0, time: 0 };
      byDate[d].xp += Number(r.score);
      byDate[d].lessons += 1;
      byDate[d].time += Math.round(r.duration_seconds / 60);
    }
    // Also include stage_history time
    for (const r of filteredStage) {
      const d = new Date(r.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      if (!byDate[d]) byDate[d] = { xp: 0, lessons: 0, time: 0 };
      byDate[d].time += Math.round(r.time_spent_seconds / 60);
      byDate[d].xp += r.xp_earned;
    }
    return Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
  }, [filteredLevel, filteredStage]);

  // --- Summary stats ---
  const totalXP = gameProgress?.total_xp || chartData.reduce((s, d) => s + d.xp, 0);
  const totalLessons = gameProgress?.completed_nodes?.length || chartData.reduce((s, d) => s + d.lessons, 0);
  const totalTime = chartData.reduce((s, d) => s + d.time, 0);

  // --- Skills Radar from level_history ---
  const skillsData = useMemo(() => {
    const groups: Record<string, { totalScore: number; count: number; maxScore: number }> = {};
    for (const r of levelHistory) {
      const g = getCourseGroup(r.course_id);
      if (g === "other") continue;
      if (!groups[g]) groups[g] = { totalScore: 0, count: 0, maxScore: 0 };
      groups[g].totalScore += Number(r.score);
      groups[g].count += 1;
      groups[g].maxScore = Math.max(groups[g].maxScore, Number(r.score));
    }
    // Also from stage_history
    for (const r of stageHistory) {
      const g = getCourseGroup(r.course_id);
      if (g === "other") continue;
      if (!groups[g]) groups[g] = { totalScore: 0, count: 0, maxScore: 0 };
      if (r.accuracy != null) {
        groups[g].totalScore += Number(r.accuracy);
        groups[g].count += 1;
        groups[g].maxScore = Math.max(groups[g].maxScore, 100);
      }
    }
    const allKeys = ["preschool", "grade1", "grade2", "grade3", "grade4", "grade5"];
    return allKeys.map(k => {
      const g = groups[k];
      let value = 0;
      if (g && g.count > 0) {
        // avg score as percentage of max
        const avg = g.totalScore / g.count;
        value = g.maxScore > 0 ? Math.round((avg / g.maxScore) * 100) : 0;
        value = Math.min(value, 100);
      }
      return { skill: SKILL_LABELS[k] || k, value, fullMark: 100 };
    });
  }, [levelHistory, stageHistory]);

  // --- Subject distribution from level_history ---
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const r of levelHistory) {
      const g = getCourseGroup(r.course_id);
      if (g === "other") continue;
      counts[g] = (counts[g] || 0) + 1;
      total++;
    }
    for (const r of stageHistory) {
      const g = getCourseGroup(r.course_id);
      if (g === "other") continue;
      counts[g] = (counts[g] || 0) + 1;
      total++;
    }
    if (total === 0) return [];
    return Object.entries(counts)
      .map(([key, count], i) => ({
        name: COURSE_LABELS[key] || key,
        value: Math.round((count / total) * 100),
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [levelHistory, stageHistory]);

  // --- Performance by time of day from stage_history ---
  const performanceByTime = useMemo(() => {
    const buckets: Record<string, { totalAcc: number; count: number }> = {
      morning: { totalAcc: 0, count: 0 },
      afternoon: { totalAcc: 0, count: 0 },
      evening: { totalAcc: 0, count: 0 },
    };
    for (const r of stageHistory) {
      const hour = new Date(r.created_at).getHours();
      const acc = r.accuracy != null ? Number(r.accuracy) : null;
      if (acc == null) continue;
      if (hour >= 6 && hour < 12) {
        buckets.morning.totalAcc += acc;
        buckets.morning.count += 1;
      } else if (hour >= 12 && hour < 18) {
        buckets.afternoon.totalAcc += acc;
        buckets.afternoon.count += 1;
      } else if (hour >= 18 && hour < 23) {
        buckets.evening.totalAcc += acc;
        buckets.evening.count += 1;
      }
    }
    return [
      { time: "Sáng (6-12h)", accuracy: buckets.morning.count > 0 ? Math.round(buckets.morning.totalAcc / buckets.morning.count) : 0, sessions: buckets.morning.count },
      { time: "Chiều (12-18h)", accuracy: buckets.afternoon.count > 0 ? Math.round(buckets.afternoon.totalAcc / buckets.afternoon.count) : 0, sessions: buckets.afternoon.count },
      { time: "Tối (18-22h)", accuracy: buckets.evening.count > 0 ? Math.round(buckets.evening.totalAcc / buckets.evening.count) : 0, sessions: buckets.evening.count },
    ];
  }, [stageHistory]);

  // --- Weekly comparison ---
  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);

    const thisWeekLevel = levelHistory.filter(r => new Date(r.created_at) >= thisWeekStart);
    const lastWeekLevel = levelHistory.filter(r => {
      const d = new Date(r.created_at);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    const thisWeekStage = stageHistory.filter(r => new Date(r.created_at) >= thisWeekStart);
    const lastWeekStage = stageHistory.filter(r => {
      const d = new Date(r.created_at);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    const twXP = thisWeekLevel.reduce((s, r) => s + Number(r.score), 0) + thisWeekStage.reduce((s, r) => s + r.xp_earned, 0);
    const lwXP = lastWeekLevel.reduce((s, r) => s + Number(r.score), 0) + lastWeekStage.reduce((s, r) => s + r.xp_earned, 0);
    const twTime = thisWeekLevel.reduce((s, r) => s + r.duration_seconds, 0) + thisWeekStage.reduce((s, r) => s + r.time_spent_seconds, 0);
    const lwTime = lastWeekLevel.reduce((s, r) => s + r.duration_seconds, 0) + lastWeekStage.reduce((s, r) => s + r.time_spent_seconds, 0);
    const twLessons = thisWeekLevel.length + thisWeekStage.length;
    const lwLessons = lastWeekLevel.length + lastWeekStage.length;

    const twAccArr = thisWeekStage.filter(r => r.accuracy != null).map(r => Number(r.accuracy));
    const lwAccArr = lastWeekStage.filter(r => r.accuracy != null).map(r => Number(r.accuracy));
    const twAcc = twAccArr.length > 0 ? Math.round(twAccArr.reduce((a, b) => a + b, 0) / twAccArr.length) : 0;
    const lwAcc = lwAccArr.length > 0 ? Math.round(lwAccArr.reduce((a, b) => a + b, 0) / lwAccArr.length) : 0;

    const delta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      avgXPPerDay: twLessons > 0 ? Math.round(twXP / 7) : 0,
      avgTimePerDay: Math.round(twTime / 60 / 7),
      accuracy: twAcc,
      lessonsCompleted: twLessons,
      deltaXP: delta(twXP, lwXP),
      deltaTime: delta(twTime, lwTime),
      deltaAcc: delta(twAcc, lwAcc),
      deltaLessons: delta(twLessons, lwLessons),
    };
  }, [levelHistory, stageHistory]);

  // --- Dynamic parent tips ---
  const parentTips = useMemo(() => {
    const tips: string[] = [];
    // Best time of day
    const bestTime = performanceByTime.reduce((best, cur) => cur.accuracy > best.accuracy ? cur : best, performanceByTime[0]);
    if (bestTime && bestTime.sessions > 0) {
      tips.push(`Con bạn học tốt nhất vào <strong>${bestTime.time}</strong> với độ chính xác ${bestTime.accuracy}%`);
    }
    // Streak
    tips.push(`Chuỗi học tập hiện tại: <strong>${streak?.current_streak || 0} ngày</strong> - Hãy khuyến khích con duy trì!`);
    // Weakest subject
    if (subjectData.length > 0) {
      const weakest = subjectData[subjectData.length - 1];
      tips.push(`Chủ đề cần cải thiện: <strong>${weakest.name}</strong> (chỉ chiếm ${weakest.value}% thời gian học)`);
    }
    // Avg time suggestion
    const avgMin = weeklyComparison.avgTimePerDay;
    if (avgMin < 30) {
      tips.push(`Gợi ý: Tăng thời gian học lên <strong>30 phút/ngày</strong> để đạt tiến độ tốt hơn (hiện tại: ${avgMin} phút/ngày)`);
    } else {
      tips.push(`Tuyệt vời! Con đang học trung bình <strong>${avgMin} phút/ngày</strong> - Hãy duy trì nhịp học này!`);
    }
    return tips;
  }, [performanceByTime, streak, subjectData, weeklyComparison]);

  const hasData = levelHistory.length > 0 || stageHistory.length > 0;

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <BookOpen className="h-10 w-10 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Phân tích học tập</h2>
          <p className="text-muted-foreground">Theo dõi tiến độ và hiệu suất học tập</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 ngày</TabsTrigger>
            <TabsTrigger value="30d">30 ngày</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng XP</p>
              <p className="text-2xl font-bold text-green-600">{totalXP}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bài đã học</p>
              <p className="text-2xl font-bold text-blue-600">{totalLessons}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thời gian học</p>
              <p className="text-2xl font-bold text-orange-600">{totalTime} phút</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chuỗi ngày</p>
              <p className="text-2xl font-bold text-purple-600">{streak?.current_streak || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills Radar Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Phân tích kỹ năng toán học
        </h3>
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Kỹ năng" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
              {skillsData.map((skill) => (
                <div key={skill.skill} className="text-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">{skill.skill}</p>
                  <p className="text-lg font-bold text-purple-600">{skill.value}%</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState message="Chưa có dữ liệu kỹ năng. Hãy chơi game để xem phân tích!" />
        )}
      </Card>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Progress Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tiến độ XP theo ngày
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="xp" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" name="XP" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Chưa có dữ liệu XP trong khoảng thời gian này" />
          )}
        </Card>

        {/* Time Spent Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Thời gian học (phút)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Phút" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Chưa có dữ liệu thời gian học trong khoảng thời gian này" />
          )}
        </Card>

        {/* Subject Distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Phân bổ chủ đề học
          </h3>
          {subjectData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {subjectData.map((subject) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span className="text-sm">{subject.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{subject.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="Chưa có dữ liệu chủ đề học tập" />
          )}
        </Card>

        {/* Performance by Time */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            Hiệu suất theo thời gian trong ngày
          </h3>
          {stageHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceByTime} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} className="text-xs" />
                <YAxis dataKey="time" type="category" width={100} className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="accuracy" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Độ chính xác %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Chưa có dữ liệu hiệu suất" />
          )}
        </Card>
      </div>

      {/* Weekly Comparison */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">So sánh tuần này với tuần trước</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "XP/ngày", value: weeklyComparison.avgXPPerDay, delta: weeklyComparison.deltaXP, unit: "" },
            { label: "Thời gian/ngày", value: `${weeklyComparison.avgTimePerDay} phút`, delta: weeklyComparison.deltaTime, unit: "" },
            { label: "Độ chính xác", value: `${weeklyComparison.accuracy}%`, delta: weeklyComparison.deltaAcc, unit: "" },
            { label: "Bài hoàn thành", value: weeklyComparison.lessonsCompleted, delta: weeklyComparison.deltaLessons, unit: "" },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
              {hasData ? (
                <p className={`text-xs ${item.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.delta >= 0 ? '+' : ''}{item.delta}% so với tuần trước
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Parent Tips */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
        <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-300 mb-3">
          📊 Gợi ý cho phụ huynh
        </h3>
        {hasData ? (
          <ul className="space-y-2 text-sm text-indigo-600/80 dark:text-indigo-400/80">
            {parentTips.map((tip, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: `• ${tip}` }} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
            Chưa có đủ dữ liệu để đưa ra gợi ý. Hãy khuyến khích con chơi game học tập để có phân tích chi tiết!
          </p>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsTab;
