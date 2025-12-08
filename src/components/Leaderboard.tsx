import { useState, useEffect } from "react";
import { Crown, Trophy, Medal, Loader2, RefreshCw } from "lucide-react";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const GRADE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "grade2-trangquynh", label: "Lớp 2 - Trạng Quỳnh" },
  { value: "grade1", label: "Lớp 1" },
  { value: "grade3", label: "Lớp 3" },
  { value: "grade4", label: "Lớp 4" },
  { value: "grade5", label: "Lớp 5" },
];

const PERIOD_OPTIONS = [
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm này" },
  { value: "all", label: "Toàn bộ" },
];

const Leaderboard = () => {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const { entries, isLoading, error, fetchLeaderboard } = useLeaderboard();

  useEffect(() => {
    const grade = selectedGrade === "all" ? null : selectedGrade;
    fetchLeaderboard(grade, selectedPeriod, 10);
  }, [selectedGrade, selectedPeriod, fetchLeaderboard]);

  const handleRefresh = () => {
    const grade = selectedGrade === "all" ? null : selectedGrade;
    fetchLeaderboard(grade, selectedPeriod, 10);
  };

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3, 10);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "scale-110 -translate-y-4";
      case 2:
        return "scale-100 -translate-y-2";
      case 3:
        return "scale-95";
      default:
        return "";
    }
  };

  const getRankBadge = (rank: number) => {
    const badges = {
      1: "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.5)]",
      2: "bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)]",
      3: "bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_20px_rgba(217,119,6,0.4)]",
    };
    return badges[rank as keyof typeof badges] || "";
  };

  const getGradeLabel = () => {
    const grade = GRADE_OPTIONS.find(g => g.value === selectedGrade);
    return grade?.label || "Tất cả";
  };

  // Empty state when no entries
  const EmptyState = () => (
    <div className="text-center py-16">
      <Trophy className="w-16 h-16 mx-auto text-sky-300 mb-4" />
      <h3 className="text-xl font-heading font-bold text-white mb-2">
        Chưa có dữ liệu xếp hạng
      </h3>
      <p className="text-white/70 mb-4">
        Hãy là người đầu tiên chinh phục bảng xếp hạng!
      </p>
    </div>
  );

  // Loading state
  const LoadingState = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
      <span className="ml-3 text-white text-lg">Đang tải bảng xếp hạng...</span>
    </div>
  );

  return (
    <section id="leaderboard" className="py-16 md:py-24 relative overflow-hidden">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 -z-10" />
      
      {/* Cloud decorations */}
      <div className="absolute top-10 left-10 w-32 h-16 bg-white/60 rounded-full blur-sm animate-float" />
      <div className="absolute top-20 right-20 w-40 h-20 bg-white/50 rounded-full blur-sm animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-32 left-1/4 w-36 h-18 bg-white/40 rounded-full blur-sm animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-lg">
              Bảng xếp hạng
            </h2>
            <p className="text-lg md:text-xl text-white/90 drop-shadow">
              Vinh danh những học sinh xuất sắc nhất
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[200px] bg-white/90 backdrop-blur">
                <SelectValue placeholder="Chọn khối" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] bg-white/90 backdrop-blur">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/90 backdrop-blur hover:bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Top label */}
          <div className="text-center mb-12">
            <div className="inline-block bg-lime-300 px-8 py-3 rounded-full shadow-lg">
              <span className="font-heading font-bold text-lg text-gray-800">
                Top 10 - {getGradeLabel()}
              </span>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className="text-center py-16 text-white">
              <p className="text-red-200 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="secondary">
                Thử lại
              </Button>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <div className="relative mb-16 min-h-[400px] flex items-end justify-center gap-8 px-4">
                  {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((student, idx) => {
                    if (!student) return null;
                    const actualRank = student.rank;
                    
                    return (
                      <div
                        key={student.userId}
                        className={`flex flex-col items-center ${getRankStyle(actualRank)} transition-all animate-fade-in`}
                        style={{ animationDelay: `${idx * 200}ms` }}
                      >
                        {/* Crown for first place */}
                        {actualRank === 1 && (
                          <Crown className="h-12 w-12 text-yellow-400 mb-2 drop-shadow-lg animate-pulse" />
                        )}

                        {/* Avatar with rank badge - with float animation */}
                        <div className="relative mb-4 animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${getRankBadge(actualRank)} flex items-center justify-center border-4 border-white shadow-2xl`}>
                            <span className="text-4xl">{student.avatar}</span>
                          </div>
                          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${getRankBadge(actualRank)} flex items-center justify-center border-3 border-white font-bold text-2xl text-white`}>
                            {actualRank}
                          </div>
                        </div>

                        {/* Student info - with float animation */}
                        <div className="text-center mb-3 px-2 animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                          <h3 className="font-heading font-bold text-base md:text-lg text-white drop-shadow-md mb-1">
                            {student.displayName}
                          </h3>
                          <p className="text-xs md:text-sm text-white/80 drop-shadow">
                            {student.school || "Học sinh"}
                          </p>
                          <p className="text-lg font-bold text-yellow-300 mt-1">
                            {student.totalPoints.toLocaleString()} điểm
                          </p>
                        </div>

                        {/* Floating Island platform */}
                        <div className="relative animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                          <img 
                            src="/assets/floating-island.png" 
                            alt="Floating Island" 
                            className="w-36 h-32 md:w-44 md:h-36 object-contain drop-shadow-2xl"
                          />
                          <div className="absolute inset-x-0 top-1/3 text-center">
                            <span className="font-bold text-5xl md:text-6xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                              {actualRank}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Remaining ranks (4-10) */}
              {remaining.length > 0 && (
                <div className="max-w-4xl mx-auto space-y-3 pb-8">
                  {remaining.map((student, index) => (
                    <div
                      key={student.userId}
                      className="bg-white/90 backdrop-blur rounded-2xl p-4 md:p-6 flex items-center gap-4 hover:bg-white transition-all hover:scale-[1.02] shadow-lg animate-fade-in"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted font-bold text-lg">
                        {String(student.rank).padStart(2, '0')}
                      </div>

                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                        {student.avatar}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-heading font-bold text-base md:text-lg">
                          {student.displayName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.school || "Học sinh"}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xl md:text-2xl font-bold text-primary">
                          {student.totalPoints.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">điểm</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
