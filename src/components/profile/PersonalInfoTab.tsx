import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileData {
  display_name: string;
  email?: string;
  phone?: string;
  grade?: string;
  class_name?: string;
  school?: string;
  ward?: string;
  district?: string;
  province?: string;
  birth_date?: string;
  address?: string;
  gender?: string;
}

interface PersonalInfoTabProps {
  profile: ProfileData | null;
  isAdmin: boolean;
  onUpdate: (data: Partial<ProfileData>) => Promise<void>;
}

const GRADE_OPTIONS = [
  { value: "Mầm non", label: "Mầm non" },
  { value: "Lớp 1", label: "Lớp 1" },
  { value: "Lớp 2", label: "Lớp 2" },
  { value: "Lớp 3", label: "Lớp 3" },
  { value: "Lớp 4", label: "Lớp 4" },
  { value: "Lớp 5", label: "Lớp 5" },
];

const InfoField = ({ label, value, notUpdated }: { label: string; value: string | undefined; notUpdated?: string }) => (
  <div className="space-y-1">
    <Label className="text-sm text-muted-foreground">{label}:</Label>
    <p className="font-medium text-foreground">{value || notUpdated || "N/A"}</p>
  </div>
);

const PersonalInfoTab = ({ profile, isAdmin, onUpdate }: PersonalInfoTabProps) => {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    display_name: profile?.display_name || "",
    phone: profile?.phone || "",
    grade: profile?.grade || "",
    class_name: profile?.class_name || "",
    school: profile?.school || "",
    ward: profile?.ward || "",
    district: profile?.district || "",
    province: profile?.province || "",
    birth_date: profile?.birth_date || "",
    address: profile?.address || "",
    gender: profile?.gender || "",
  });

  const handleChange = (name: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await onUpdate(formData);
    setEditing(false);
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">{t.personalInfo.title}</h2>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)} className="flex items-center gap-2">
            {t.personalInfo.update} <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.fullName}:</Label>
            <Input
              value={formData.display_name || ""}
              onChange={(e) => handleChange("display_name", e.target.value)}
              placeholder={t.personalInfo.enterName}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.birthDate}:</Label>
            <Input
              type="date"
              value={formData.birth_date || ""}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.gender}:</Label>
            <Select value={formData.gender || ""} onValueChange={(v) => handleChange("gender", v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t.personalInfo.selectGender} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nam">{t.personalInfo.male}</SelectItem>
                <SelectItem value="Nữ">{t.personalInfo.female}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.phone}:</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder={t.personalInfo.enterPhone}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.email}:</Label>
            <Input value={profile?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.accountType}:</Label>
            <Input value={isAdmin ? t.personalInfo.teacher : t.personalInfo.student} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.address}:</Label>
            <Input
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t.personalInfo.enterAddress}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.grade}:</Label>
            <Select value={formData.grade || ""} onValueChange={(v) => handleChange("grade", v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t.personalInfo.selectGrade} />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.ward}:</Label>
            <Input
              value={formData.ward || ""}
              onChange={(e) => handleChange("ward", e.target.value)}
              placeholder={t.personalInfo.enterWard}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.class}:</Label>
            <Input
              value={formData.class_name || ""}
              onChange={(e) => handleChange("class_name", e.target.value)}
              placeholder={t.personalInfo.classPlaceholder}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.district}:</Label>
            <Input
              value={formData.district || ""}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder={t.personalInfo.enterDistrict}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.school}:</Label>
            <Input
              value={formData.school || ""}
              onChange={(e) => handleChange("school", e.target.value)}
              placeholder={t.personalInfo.schoolPlaceholder}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">{t.personalInfo.province}:</Label>
            <Input
              value={formData.province || ""}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder={t.personalInfo.enterProvince}
              className="bg-background"
            />
          </div>
          
          <div className="md:col-span-2 flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditing(false)}>{t.personalInfo.cancel}</Button>
            <Button onClick={handleSave}>{t.personalInfo.saveChanges}</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label={t.personalInfo.fullName} value={profile?.display_name} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.birthDate} value={profile?.birth_date} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.gender} value={profile?.gender} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.phone} value={profile?.phone} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.email} value={profile?.email} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.accountType} value={isAdmin ? t.personalInfo.teacher : t.personalInfo.student} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.address} value={profile?.address} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.grade} value={profile?.grade} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.ward} value={profile?.ward} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.class} value={profile?.class_name} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.district} value={profile?.district} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.school} value={profile?.school} notUpdated={t.personalInfo.notUpdated} />
          <InfoField label={t.personalInfo.province} value={profile?.province} notUpdated={t.personalInfo.notUpdated} />
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;
