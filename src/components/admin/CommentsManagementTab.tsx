import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Trash2,
  ExternalLink,
  Loader2,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Grade options
const GRADES = [
  { id: "all", label: "Tất cả lớp" },
  { id: "L1", label: "Lớp 1" },
  { id: "L2", label: "Lớp 2" },
  { id: "L3", label: "Lớp 3" },
  { id: "L4", label: "Lớp 4" },
  { id: "L5", label: "Lớp 5" },
];

const SEMESTERS = [
  { id: "all", label: "Tất cả học kỳ" },
  { id: "1", label: "Học kỳ 1" },
  { id: "2", label: "Học kỳ 2" },
];

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  topic_id: string;
  parent_id: string | null;
  is_admin_reply: boolean;
}

interface CommentWithDetails extends Comment {
  display_name: string;
  avatar: string;
  topic_title: string;
  lesson_id: string;
  semester: number;
  replies_count: number;
}

interface Topic {
  id: string;
  title: string;
  lesson_id: string;
  semester: number;
}

interface Stats {
  totalComments: number;
  pendingReplies: number;
  repliedToday: number;
}

const CommentsManagementTab = () => {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalComments: 0, pendingReplies: 0, repliedToday: 0 });
  
  // Filters
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  // Fetch topics for filter dropdown
  const fetchTopics = useCallback(async () => {
    const { data, error } = await supabase
      .from("topics")
      .select("id, title, lesson_id, semester")
      .order("lesson_id")
      .order("semester")
      .order("order_index");

    if (!error && data) {
      setTopics(data);
    }
  }, []);

  // Get filtered topics based on current grade/semester selection
  const getFilteredTopicIds = useCallback(() => {
    let filtered = [...topics];
    
    if (selectedGrade !== "all") {
      filtered = filtered.filter(t => t.lesson_id === selectedGrade);
    }
    
    if (selectedSemester !== "all") {
      filtered = filtered.filter(t => t.semester === parseInt(selectedSemester));
    }
    
    return filtered;
  }, [topics, selectedGrade, selectedSemester]);

  // Update filtered topics when grade/semester changes
  useEffect(() => {
    const filtered = getFilteredTopicIds();
    setFilteredTopics(filtered);
    
    // Reset topic selection if current selection is not in filtered list
    if (selectedTopic !== "all" && !filtered.find(t => t.id === selectedTopic)) {
      setSelectedTopic("all");
    }
  }, [getFilteredTopicIds, selectedTopic]);

  // Fetch comments with filters
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build topic IDs to filter - compute directly from topics to avoid stale state
      let topicIds: string[] = [];
      
      if (selectedTopic !== "all") {
        topicIds = [selectedTopic];
      } else if (selectedGrade !== "all" || selectedSemester !== "all") {
        // Filter topics directly here to ensure we have the latest data
        let filtered = [...topics];
        
        if (selectedGrade !== "all") {
          filtered = filtered.filter(t => t.lesson_id === selectedGrade);
        }
        
        if (selectedSemester !== "all") {
          filtered = filtered.filter(t => t.semester === parseInt(selectedSemester));
        }
        
        topicIds = filtered.map(t => t.id);
        
        // If no topics match the filter, return empty results
        if (topicIds.length === 0) {
          setComments([]);
          setStats({ totalComments: 0, pendingReplies: 0, repliedToday: 0 });
          setIsLoading(false);
          return;
        }
      }

      // Fetch comments (parent comments only - no parent_id)
      let query = supabase
        .from("comments")
        .select("*")
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (topicIds.length > 0) {
        query = query.in("topic_id", topicIds);
      }

      const { data: commentsData, error: commentsError } = await query;

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setStats({ totalComments: 0, pendingReplies: 0, repliedToday: 0 });
        setIsLoading(false);
        return;
      }

      // Get unique user IDs and topic IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const commentTopicIds = [...new Set(commentsData.map(c => c.topic_id))];
      const commentIds = commentsData.map(c => c.id);

      // Fetch profiles, topics, and replies count in parallel
      const [profilesResult, topicsResult, repliesResult] = await Promise.all([
        supabase.from("profiles").select("id, display_name, avatar").in("id", userIds),
        supabase.from("topics").select("id, title, lesson_id, semester").in("id", commentTopicIds),
        supabase.from("comments").select("parent_id, is_admin_reply").in("parent_id", commentIds),
      ]);

      // Create maps
      const profilesMap = new Map(
        profilesResult.data?.map(p => [p.id, { display_name: p.display_name, avatar: p.avatar }]) || []
      );
      const topicsMap = new Map(
        topicsResult.data?.map(t => [t.id, { title: t.title, lesson_id: t.lesson_id, semester: t.semester }]) || []
      );

      // Count replies and check if has admin reply
      const repliesCountMap = new Map<string, number>();
      const hasAdminReplyMap = new Map<string, boolean>();
      
      repliesResult.data?.forEach(reply => {
        if (reply.parent_id) {
          repliesCountMap.set(reply.parent_id, (repliesCountMap.get(reply.parent_id) || 0) + 1);
          if (reply.is_admin_reply) {
            hasAdminReplyMap.set(reply.parent_id, true);
          }
        }
      });

      // Build comments with details
      const commentsWithDetails: CommentWithDetails[] = commentsData.map(comment => {
        const profile = profilesMap.get(comment.user_id);
        const topic = topicsMap.get(comment.topic_id);
        
        return {
          ...comment,
          display_name: profile?.display_name || "Ẩn danh",
          avatar: profile?.avatar || "👤",
          topic_title: topic?.title || "Bài học",
          lesson_id: topic?.lesson_id || "",
          semester: topic?.semester || 1,
          replies_count: repliesCountMap.get(comment.id) || 0,
        };
      });

      setComments(commentsWithDetails);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pendingReplies = commentsWithDetails.filter(c => !hasAdminReplyMap.has(c.id)).length;
      const repliedToday = repliesResult.data?.filter(r => 
        r.is_admin_reply && new Date(r.parent_id || "") >= today
      ).length || 0;

      setStats({
        totalComments: commentsWithDetails.length,
        pendingReplies,
        repliedToday: repliesResult.data?.filter(r => r.is_admin_reply).length || 0,
      });

    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải bình luận",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedSemester, selectedTopic, topics, toast]);

  // Handle admin reply
  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập",
          variant: "destructive",
        });
        return;
      }

      // Get the topic_id from the parent comment
      const parentComment = comments.find(c => c.id === commentId);
      if (!parentComment) return;

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          topic_id: parentComment.topic_id,
          content: replyContent.trim(),
          parent_id: commentId,
          is_admin_reply: true,
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã gửi phản hồi",
      });

      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error("Error posting reply:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi phản hồi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      toast({
        title: "Đã xóa",
        description: "Bình luận đã được xóa",
      });

      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bình luận",
        variant: "destructive",
      });
    }
  };

  // Handle key press for inline reply
  const handleKeyPress = (e: React.KeyboardEvent, commentId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply(commentId);
    }
  };

  // Get grade label from lesson_id
  const getGradeLabel = (lessonId: string) => {
    const grade = GRADES.find(g => g.id === lessonId);
    return grade?.label || lessonId;
  };

  // Initial fetch
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (topics.length > 0 || selectedGrade === "all") {
      fetchComments();
    }
  }, [fetchComments, topics.length, selectedGrade]);

  // Check if avatar is emoji
  const isEmojiAvatar = (avatar: string) => {
    return !avatar || avatar.length <= 2 || !avatar.startsWith("http");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Quản lý bình luận</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xem và phản hồi câu hỏi của học sinh
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchComments()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng bình luận</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chờ phản hồi</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingReplies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã phản hồi</p>
                <p className="text-2xl font-bold text-foreground">{stats.repliedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Phân loại</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Grade Filter */}
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Semester Filter */}
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Topic Filter */}
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bài học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bài học</SelectItem>
                {filteredTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách bình luận ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có bình luận nào</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-border">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Comment Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        {isEmojiAvatar(comment.avatar) ? (
                          <AvatarFallback className="text-lg">
                            {comment.avatar || "👤"}
                          </AvatarFallback>
                        ) : (
                          <AvatarImage src={comment.avatar} alt={comment.display_name} />
                        )}
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        {/* User info and lesson link */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">
                            {comment.display_name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            đã bình luận tại bài
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {comment.topic_title}
                          </Badge>
                        </div>
                        
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span>{getGradeLabel(comment.lesson_id)}</span>
                          <span>•</span>
                          <span>Học kỳ {comment.semester}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                          {comment.replies_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{comment.replies_count} phản hồi</span>
                            </>
                          )}
                        </div>
                        
                        {/* Comment content */}
                        <p className="text-foreground mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/lessons?topic=${comment.topic_id}`, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Xem bài học
                          </Button>
                          
                          <Button
                            variant={replyingTo === comment.id ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Trả lời
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Xóa
                          </Button>
                        </div>
                        
                        {/* Inline Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 flex gap-2">
                            <Input
                              placeholder="Nhập câu trả lời và nhấn Enter..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, comment.id)}
                              disabled={isSubmitting}
                              className="flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              disabled={isSubmitting || !replyContent.trim()}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentsManagementTab;
