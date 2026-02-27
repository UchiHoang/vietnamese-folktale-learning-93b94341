import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, FileText, ExternalLink, Calendar, Clock, Trash2, Filter } from "lucide-react";
import { format, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type TimeFilter = "all" | "week" | "month";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  topic_id: string;
  is_admin_reply: boolean;
  topic_title?: string;
  lesson_title?: string;
  lesson_id?: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  topic_id: string;
  topic_title?: string;
  lesson_title?: string;
  lesson_id?: string;
}

interface Topic {
  id: string;
  title: string;
  lesson_id: string;
  lessons?: { id: string; title: string };
}

export const ActivityTab = () => {
  const { t } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filterByTime = useCallback((date: string, filter: TimeFilter): boolean => {
    if (filter === "all") return true;
    const itemDate = new Date(date);
    const now = new Date();
    if (filter === "week") return isAfter(itemDate, startOfWeek(now, { weekStartsOn: 1 }));
    if (filter === "month") return isAfter(itemDate, startOfMonth(now));
    return true;
  }, []);

  const filteredComments = useMemo(() => comments.filter(c => filterByTime(c.created_at, timeFilter)), [comments, timeFilter, filterByTime]);
  const filteredNotes = useMemo(() => notes.filter(n => filterByTime(n.updated_at, timeFilter)), [notes, timeFilter, filterByTime]);

  const fetchTopics = useCallback(async () => {
    const { data, error } = await supabase.from("topics").select("id, title, lesson_id, lessons(id, title)");
    if (!error && data) setTopics(data as Topic[]);
    return data as Topic[] || [];
  }, []);

  const fetchComments = useCallback(async (topicsData: Topic[]) => {
    setIsLoadingComments(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("comments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setComments((data || []).map(comment => {
        const topic = topicsData.find(t => t.id === comment.topic_id);
        return { ...comment, topic_title: topic?.title || t.activityTab.unknownLesson, lesson_title: topic?.lessons?.title || "", lesson_id: topic?.lesson_id || "" };
      }));
    } catch (error) { console.error("Error fetching comments:", error); }
    finally { setIsLoadingComments(false); }
  }, [t]);

  const fetchNotes = useCallback(async (topicsData: Topic[]) => {
    setIsLoadingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      setNotes((data || []).map(note => {
        const topic = topicsData.find(t => t.id === note.topic_id);
        return { ...note, topic_title: topic?.title || t.activityTab.unknownLesson, lesson_title: topic?.lessons?.title || "", lesson_id: topic?.lesson_id || "" };
      }));
    } catch (error) { console.error("Error fetching notes:", error); }
    finally { setIsLoadingNotes(false); }
  }, [t]);

  useEffect(() => {
    const loadData = async () => {
      const topicsData = await fetchTopics();
      await Promise.all([fetchComments(topicsData), fetchNotes(topicsData)]);
    };
    loadData();
  }, [fetchTopics, fetchComments, fetchNotes]);

  const handleViewLesson = (lessonId: string, topicId: string, tab?: string) => {
    const tabParam = tab ? `&tab=${tab}` : "";
    navigate(`/lessons?grade=${lessonId}&topic=${topicId}${tabParam}`);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast({ title: t.activityTab.deleted, description: t.activityTab.commentDeleted });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: t.passwordTab.error, description: t.activityTab.cannotDeleteComment, variant: "destructive" });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({ title: t.activityTab.deleted, description: t.activityTab.noteDeleted });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: t.passwordTab.error, description: t.activityTab.cannotDeleteNote, variant: "destructive" });
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => content.length <= maxLength ? content : content.slice(0, maxLength) + "...";

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t.activityTab.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.activityTab.filterByTime}</span>
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.activityTab.allTime}</SelectItem>
              <SelectItem value="week">{t.activityTab.thisWeek}</SelectItem>
              <SelectItem value="month">{t.activityTab.thisMonth}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t.activityTab.comments} ({filteredComments.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t.activityTab.notes} ({filteredNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t.activityTab.loadingComments}</span>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{comments.length === 0 ? t.activityTab.noComments : t.activityTab.noCommentsInPeriod}</p>
                <p className="text-sm mt-2">{comments.length === 0 ? t.activityTab.joinDiscussion : t.activityTab.tryOtherPeriod}</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredComments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">
                            {t.activityTab.commentAt}{" "}
                            <span className="font-medium text-foreground">{comment.topic_title}</span>
                          </p>
                          {comment.lesson_title && <p className="text-xs text-muted-foreground mt-0.5">{comment.lesson_title}</p>}
                        </div>
                        {comment.is_admin_reply && (
                          <Badge variant="secondary" className="bg-admin-reply text-primary shrink-0">{t.activityTab.teacherReply}</Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3 whitespace-pre-wrap">{truncateContent(comment.content)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm", { locale: viLocale })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleViewLesson(comment.lesson_id || "", comment.topic_id)}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />{t.activityTab.viewLesson}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="notes">
            {isLoadingNotes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t.activityTab.loadingNotes}</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{notes.length === 0 ? t.activityTab.noNotes : t.activityTab.noNotesInPeriod}</p>
                <p className="text-sm mt-2">{notes.length === 0 ? t.activityTab.takeNotes : t.activityTab.tryOtherPeriod}</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">
                            {t.activityTab.noteAt}{" "}
                            <span className="font-medium text-foreground">{note.topic_title}</span>
                          </p>
                          {note.lesson_title && <p className="text-xs text-muted-foreground mt-0.5">{note.lesson_title}</p>}
                        </div>
                      </div>
                      <div className="text-sm mb-3 whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{truncateContent(note.content, 200)}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {t.activityTab.created} {format(new Date(note.created_at), "dd/MM/yyyy", { locale: viLocale })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t.activityTab.edited} {format(new Date(note.updated_at), "dd/MM/yyyy HH:mm", { locale: viLocale })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleViewLesson(note.lesson_id || "", note.topic_id, "notes")}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />{t.activityTab.viewAndEdit}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
