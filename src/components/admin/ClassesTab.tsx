import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Users, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Class {
  id: string;
  name: string;
  grade: string;
  teacher_id: string;
  description?: string;
  created_at: string;
  student_count?: number;
}

const GRADES = [
  { value: "preschool", label: "Mầm non" },
  { value: "grade1", label: "Lớp 1" },
  { value: "grade2", label: "Lớp 2" },
  { value: "grade3", label: "Lớp 3" },
  { value: "grade4", label: "Lớp 4" },
  { value: "grade5", label: "Lớp 5" },
];

const ClassesTab = () => {
  const { t } = useLanguage();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const { data: classesData, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const classesWithCount = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id);

          return { ...cls, student_count: count || 0 };
        })
      );

      setClasses(classesWithCount);
    } catch (error: any) {
      toast({
        title: t.adminClasses.error,
        description: error.message || t.adminClasses.cannotSave,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        grade: cls.grade,
        description: cls.description || "",
      });
    } else {
      setEditingClass(null);
      setFormData({ name: "", grade: "", description: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ name: "", grade: "", description: "" });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.grade) {
      toast({
        title: t.adminClasses.error,
        description: t.adminClasses.fillRequired,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update({
            name: formData.name,
            grade: formData.grade,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingClass.id);

        if (error) throw error;

        toast({
          title: t.adminClasses.success,
          description: t.adminClasses.classUpdated,
        });
      } else {
        const { error } = await supabase.from("classes").insert({
          name: formData.name,
          grade: formData.grade,
          description: formData.description,
          teacher_id: user.id,
        });

        if (error) throw error;

        toast({
          title: t.adminClasses.success,
          description: t.adminClasses.classCreated,
        });
      }

      handleCloseModal();
      loadClasses();
    } catch (error: any) {
      toast({
        title: t.adminClasses.error,
        description: error.message || t.adminClasses.cannotSave,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm(t.adminClasses.confirmDelete)) return;

    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) throw error;

      toast({
        title: t.adminClasses.success,
        description: t.adminClasses.classDeleted,
      });

      loadClasses();
    } catch (error: any) {
      toast({
        title: t.adminClasses.error,
        description: error.message || t.adminClasses.cannotDelete,
        variant: "destructive",
      });
    }
  };

  const getGradeLabel = (grade: string) => {
    return GRADES.find((g) => g.value === grade)?.label || grade;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.adminClasses.title}</h2>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          {t.adminClasses.createNew}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.adminClasses.totalClasses}</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.adminClasses.totalStudents}</p>
                <p className="text-2xl font-bold">
                  {classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.adminClasses.avgStudents}</p>
                <p className="text-2xl font-bold">
                  {classes.length > 0
                    ? Math.round(
                        classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0) /
                          classes.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.adminClasses.classList}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.adminClasses.noClasses}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.adminClasses.className}</TableHead>
                  <TableHead>{t.adminClasses.grade}</TableHead>
                  <TableHead>{t.adminClasses.studentCount}</TableHead>
                  <TableHead>{t.adminClasses.description}</TableHead>
                  <TableHead className="text-right">{t.adminClasses.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {getGradeLabel(cls.grade)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {cls.student_count || 0}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cls.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(cls)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cls.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? t.adminClasses.editClass : t.adminClasses.createClass}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t.adminClasses.classNameLabel}</Label>
              <Input
                id="name"
                placeholder={t.adminClasses.classNamePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="grade">{t.adminClasses.gradeLabel}</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.adminClasses.selectGrade} />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">{t.adminClasses.descriptionLabel}</Label>
              <Textarea
                id="description"
                placeholder={t.adminClasses.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={isSaving}>
              {t.adminClasses.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.adminClasses.saving}
                </>
              ) : (
                t.adminClasses.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassesTab;
