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
import { TrendingUp, Users, Award, BookOpen, Loader2, Calendar, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "@/contexts/LanguageContext";

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

const ReportsTab = () => {
  const { t } = useLanguage();

  const periodLabel = (period: TimePeriod) => {
    switch (period) {
      case "7d": return t.adminReports.period7d;
      case "30d": return t.adminReports.period30d;
      case "90d": return t.adminReports.period90d;
      case "all": return t.adminReports.periodAll;
    }
  };

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

      let totalCompleted = 0;
      courseProgressRes.data?.forEach((p: any) => {
        const nodes = Array.isArray(p.completed_nodes) ? p.completed_nodes : [];
        totalCompleted += nodes.length;
      });
      setTotalLessonsCompleted(totalCompleted);

      const actData = activityRes.data || [];
      setDailyActivity(actData as DailyActivityRow[]);
      if (actData.length > 0) {
        const totalTime = actData.reduce((s, a: any) => s + (a.time_spent_minutes || 0), 0);
        setAverageStudyTime(Math.round(totalTime / actData.length));
      } else {
        setAverageStudyTime(0);
      }

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

      const globalData = globalProgressRes.data;
      if (globalData && globalData.length > 0) {
        const userIds = globalData.map((g) => g.user_id);
        const { data: profilesData } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        setTopStudents(globalData.map((p) => {
          const prof = profilesData?.find((pr) => pr.id === p.user_id);
          return { name: prof?.display_name || t.adminReports.studentLabel, xp: p.total_xp || 0, level: p.global_level || 1 };
        }));
      } else {
        setTopStudents([]);
      }

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

  const trendData = useMemo(() => {
    if (dailyActivity.length === 0) return [];

    const dateMap: Record<string, { xp: number; lessons: number; minutes: number; users: Set<string> }> = {};
    dailyActivity.forEach((a) => {
      if (!dateMap[a.activity_date]) dateMap[a.activity_date] = { xp: 0, lessons: 0, minutes: 0, users: new Set() };
      dateMap[a.activity_date].xp += a.xp_earned;
      dateMap[a.activity_date].lessons += a.lessons_completed;
      dateMap[a.activity_date].minutes += a.time_spent_minutes;
      dateMap[a.activity_date].users.add(a.user_id);
    });

    const dates = Object.keys(dateMap).sort();
    if (dates.length > 60) {
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
        [t.adminReports.lessonsCompletedChart]: data.lessons,
        [t.adminReports.studyMinutes]: data.minutes,
        [t.adminReports.studentsLabel]: data.users.size,
      }));
    }

    return dates.map((date) => ({
      date: formatDate(date),
      XP: dateMap[date].xp,
      [t.adminReports.lessonsCompletedChart]: dateMap[date].lessons,
      [t.adminReports.studyMinutes]: dateMap[date].minutes,
      [t.adminReports.studentsLabel]: dateMap[date].users.size,
    }));
  }, [dailyActivity, t]);

  const buildExportData = () => {
    const summary = [
      ["Bao cao & Thong ke - " + periodLabel(period)],
      ["Ngay xuat", new Date().toLocaleDateString("vi-VN")],
      [],
      ["Tong hoc sinh", totalStudents],
      ["So lop hoc", totalClasses],
      ["Bai hoan thanh", totalLessonsCompleted],
      ["Thoi gian hoc TB (phut)", averageStudyTime],
    ];
    const gradeRows = gradeCompletions.map((gc) => ({
      "Khoi lop": gc.grade, "So HS hoat dong": gc.activeStudents,
      "Tong luot choi": gc.totalStages, "Do chinh xac TB (%)": gc.avgAccuracy,
    }));
    const topRows = topStudents.map((s, i) => ({
      "Hang": i + 1, "Ten": s.name, "XP": s.xp, "Level": s.level,
    }));
    const distRows = gradeDistribution.map((g) => ({
      "Khoi": g.name, "So hoc sinh": g.value,
    }));
    const trendRows = trendData.map((td) => ({
      "Ngay": td.date, "XP": td.XP,
    }));
    return { summary, gradeRows, topRows, distRows, trendRows };
  };

  const exportExcel = () => {
    const { summary, gradeRows, topRows, distRows, trendRows } = buildExportData();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Tong quan");
    if (gradeRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gradeRows), "Theo khoi");
    if (topRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topRows), "Top HS");
    if (distRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(distRows), "Phan bo");
    if (trendRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trendRows), "Xu huong");
    XLSX.writeFile(wb, `bao-cao-${period}-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportPDF = () => {
    const { gradeRows, topRows, distRows } = buildExportData();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bao cao & Thong ke", 14, 20);
    doc.setFontSize(11);
    doc.text("Thoi gian: " + periodLabel(period), 14, 28);
    doc.text("Ngay xuat: " + new Date().toLocaleDateString("vi-VN"), 14, 34);

    doc.setFontSize(13);
    doc.text("Tong quan", 14, 46);
    autoTable(doc, {
      startY: 50,
      head: [["Chi so", "Gia tri"]],
      body: [
        ["Tong hoc sinh", String(totalStudents)],
        ["So lop hoc", String(totalClasses)],
        ["Bai hoan thanh", String(totalLessonsCompleted)],
        ["Thoi gian hoc TB", averageStudyTime + " phut"],
      ],
      theme: "grid", headStyles: { fillColor: [59, 130, 246] },
    });

    let lastY = (doc as any).lastAutoTable?.finalY ?? 70;

    if (gradeRows.length) {
      const y1 = lastY + 10;
      doc.text("Theo khoi lop", 14, y1);
      autoTable(doc, {
        startY: y1 + 4,
        head: [["Khoi", "HS", "Luot choi", "Chinh xac (%)"]],
        body: gradeRows.map((r) => [r["Khoi lop"], r["So HS hoat dong"], r["Tong luot choi"], r["Do chinh xac TB (%)"]]),
        theme: "grid", headStyles: { fillColor: [34, 197, 94] },
      });
      lastY = (doc as any).lastAutoTable?.finalY ?? lastY + 40;
    }

    if (topRows.length) {
      const y2 = lastY + 10;
      doc.text("Top hoc sinh", 14, y2);
      autoTable(doc, {
        startY: y2 + 4,
        head: [["Hang", "Ten", "XP", "Level"]],
        body: topRows.map((r) => [r["Hang"], r["Ten"], r["XP"], r["Level"]]),
        theme: "grid", headStyles: { fillColor: [245, 158, 11] },
      });
      lastY = (doc as any).lastAutoTable?.finalY ?? lastY + 40;
    }

    if (distRows.length) {
      const y3 = lastY + 10;
      doc.text("Phan bo hoc sinh", 14, y3);
      autoTable(doc, {
        startY: y3 + 4,
        head: [["Khoi", "So hoc sinh"]],
        body: distRows.map((r) => [r["Khoi"], r["So hoc sinh"]]),
        theme: "grid", headStyles: { fillColor: [139, 92, 246] },
      });
    }

    doc.save("bao-cao-" + period + "-" + new Date().toISOString().split("T")[0] + ".pdf");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter & export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t.adminReports.title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t.adminReports.period7d}</SelectItem>
              <SelectItem value="30d">{t.adminReports.period30d}</SelectItem>
              <SelectItem value="90d">{t.adminReports.period90d}</SelectItem>
              <SelectItem value="all">{t.adminReports.periodAll}</SelectItem>
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
                <p className="text-sm text-muted-foreground">{t.adminReports.totalStudents}</p>
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
                <p className="text-sm text-muted-foreground">{t.adminReports.totalClasses}</p>
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
                <p className="text-sm text-muted-foreground">{t.adminReports.lessonsCompleted}</p>
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
                <p className="text-sm text-muted-foreground">{t.adminReports.avgStudyTime}</p>
                <p className="text-2xl font-bold">{averageStudyTime} {t.adminReports.minutes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📈 {t.adminReports.activityTrend} ({periodLabel(period)})</CardTitle>
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
                <Line type="monotone" dataKey={t.adminReports.lessonsCompletedChart} stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={t.adminReports.studentsLabel} stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t.adminReports.noActivityData}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Completion & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 {t.adminReports.completionByGrade}</CardTitle>
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
                        if (name === "avgAccuracy") return [`${value}%`, t.adminReports.avgAccuracy];
                        if (name === "totalStages") return [value, t.adminReports.totalPlays];
                        if (name === "activeStudents") return [value, t.adminReports.activeStudents];
                        return [value, name];
                      }}
                    />
                    <Legend formatter={(v) => v === "avgAccuracy" ? `${t.adminReports.avgAccuracy} (%)` : v === "totalStages" ? t.adminReports.totalPlays : t.adminReports.studentsLabel} />
                    <Bar dataKey="totalStages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="totalStages" />
                    <Bar dataKey="avgAccuracy" fill="#22c55e" radius={[4, 4, 0, 0]} name="avgAccuracy" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gradeCompletions.map((gc) => (
                    <div key={gc.grade} className="p-3 rounded-lg bg-muted/50 text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: gc.color }} />
                      <p className="text-xs font-semibold">{gc.grade}</p>
                      <p className="text-lg font-bold text-primary">{gc.avgAccuracy}%</p>
                      <p className="text-xs text-muted-foreground">{gc.activeStudents} HS · {gc.totalStages} {t.adminReports.plays}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t.adminReports.noCompletionData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.adminReports.studentDistribution}</CardTitle>
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
                      formatter={(value: number) => [`${value} ${t.adminReports.students}`, t.adminReports.quantity]}
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
                <p>{t.adminReports.noDistributionData}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.adminReports.top5Students}</CardTitle>
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
                    formatter={(value: number) => [`${value} XP`, t.adminReports.totalXPLabel]}
                  />
                  <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} name="XP" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t.adminReports.noRankingData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.adminReports.detailedRanking}</CardTitle>
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
              <div className="text-center py-8 text-muted-foreground">{t.adminReports.noRankingData}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="text-indigo-700 dark:text-indigo-300">📊 {t.adminReports.overallAnalysis}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-indigo-600/80 dark:text-indigo-400/80">
            <li>• {t.adminReports.totalStudentsUsing.replace("{count}", String(totalStudents))}</li>
            <li>• {t.adminReports.classesCreated.replace("{count}", String(totalClasses))}</li>
            <li>• {t.adminReports.lessonsCompletedTotal.replace("{count}", String(totalLessonsCompleted))}</li>
            <li>• {t.adminReports.avgTimePerDay.replace("{time}", String(averageStudyTime))}</li>
            {gradeCompletions.length > 0 && (
              <li>• {t.adminReports.highestAccuracy
                .replace("{grade}", gradeCompletions.reduce((max, c) => c.avgAccuracy > max.avgAccuracy ? c : max).grade)
                .replace("{accuracy}", String(gradeCompletions.reduce((max, c) => c.avgAccuracy > max.avgAccuracy ? c : max).avgAccuracy))
              }</li>
            )}
            {gradeDistribution.length > 0 && (
              <li>• {t.adminReports.mostStudentsGrade.replace("{grade}", gradeDistribution.reduce((max, curr) => curr.value > max.value ? curr : max).name)}</li>
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
