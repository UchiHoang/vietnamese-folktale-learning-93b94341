import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Building, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminProfileTabProps {
  profile: any;
  userId: string | null;
}

const AdminProfileTab = ({ profile, userId }: AdminProfileTabProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    school: profile?.school || "",
    address: profile?.address || "",
    province: profile?.province || "",
    district: profile?.district || "",
    ward: profile?.ward || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          phone: formData.phone,
          school: formData.school,
          address: formData.address,
          province: formData.province,
          district: formData.district,
          ward: formData.ward,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: t.adminProfile.success,
        description: t.adminProfile.successDesc,
      });
    } catch (error: any) {
      toast({
        title: t.adminProfile.error,
        description: error.message || t.adminProfile.cannotUpdate,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.adminProfile.title}</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.adminProfile.basicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.adminProfile.fullName}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.display_name}
                  onChange={(e) => handleChange("display_name", e.target.value)}
                  className="pl-10"
                  placeholder={t.adminProfile.fullNamePlaceholder}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.adminProfile.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.adminProfile.phone}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="pl-10"
                  placeholder={t.adminProfile.phonePlaceholder}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.adminProfile.school}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.school}
                  onChange={(e) => handleChange("school", e.target.value)}
                  className="pl-10"
                  placeholder={t.adminProfile.schoolPlaceholder}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.adminProfile.address}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.adminProfile.province}</Label>
              <Input
                value={formData.province}
                onChange={(e) => handleChange("province", e.target.value)}
                placeholder={t.adminProfile.provincePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.adminProfile.district}</Label>
              <Input
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder={t.adminProfile.districtPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.adminProfile.ward}</Label>
              <Input
                value={formData.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
                placeholder={t.adminProfile.wardPlaceholder}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.adminProfile.detailedAddress}</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t.adminProfile.detailedAddressPlaceholder}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? t.adminProfile.saving : t.adminProfile.save}
        </Button>
      </div>
    </div>
  );
};

export default AdminProfileTab;
