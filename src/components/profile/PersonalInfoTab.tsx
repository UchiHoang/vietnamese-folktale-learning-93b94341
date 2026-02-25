import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";

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

const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="space-y-1">
    <Label className="text-sm text-muted-foreground">{label}:</Label>
    <p className="font-medium text-foreground">{value || "Chưa cập nhật"}</p>
  </div>
);

const PersonalInfoTab = ({ profile, isAdmin, onUpdate }: PersonalInfoTabProps) => {
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
        <h2 className="text-2xl font-bold text-primary">Thông tin cá nhân</h2>
        <Button
          variant="outline"
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="flex items-center gap-2"
        >
          {editing ? (
            "Lưu"
          ) : (
            <>
              Cập nhật <Pencil className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Họ tên:</Label>
            <Input
              value={formData.display_name || ""}
              onChange={(e) => handleChange("display_name", e.target.value)}
              placeholder="Nhập họ tên"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Ngày sinh:</Label>
            <Input
              type="date"
              value={formData.birth_date || ""}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Giới tính:</Label>
            <Select value={formData.gender || ""} onValueChange={(v) => handleChange("gender", v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nam">Nam</SelectItem>
                <SelectItem value="Nữ">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Điện Thoại:</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Nhập số điện thoại"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Email:</Label>
            <Input value={profile?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Loại tài khoản:</Label>
            <Input value={isAdmin ? "Giáo viên" : "Học sinh"} disabled className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Địa chỉ:</Label>
            <Input
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Nhập địa chỉ"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Khối:</Label>
            <Select value={formData.grade || ""} onValueChange={(v) => handleChange("grade", v)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Xã/Phường:</Label>
            <Input
              value={formData.ward || ""}
              onChange={(e) => handleChange("ward", e.target.value)}
              placeholder="Nhập xã/phường"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Lớp:</Label>
            <Input
              value={formData.class_name || ""}
              onChange={(e) => handleChange("class_name", e.target.value)}
              placeholder="VD: 2A1"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Quận:</Label>
            <Input
              value={formData.district || ""}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="Nhập quận/huyện"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Trường học:</Label>
            <Input
              value={formData.school || ""}
              onChange={(e) => handleChange("school", e.target.value)}
              placeholder="Tên trường học"
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Tỉnh:</Label>
            <Input
              value={formData.province || ""}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder="Nhập tỉnh/thành phố"
              className="bg-background"
            />
          </div>
          
          <div className="md:col-span-2 flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditing(false)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Họ tên" value={profile?.display_name} />
          <InfoField label="Ngày sinh" value={profile?.birth_date} />
          <InfoField label="Giới tính" value={profile?.gender} />
          <InfoField label="Điện Thoại" value={profile?.phone} />
          <InfoField label="Email" value={profile?.email} />
          <InfoField label="Loại tài khoản" value={isAdmin ? "Giáo viên" : "Học sinh"} />
          <InfoField label="Địa chỉ" value={profile?.address} />
          <InfoField label="Khối" value={profile?.grade} />
          <InfoField label="Xã/Phường" value={profile?.ward} />
          <InfoField label="Lớp" value={profile?.class_name} />
          <InfoField label="Quận" value={profile?.district} />
          <InfoField label="Trường học" value={profile?.school} />
          <InfoField label="Tỉnh" value={profile?.province} />
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;
