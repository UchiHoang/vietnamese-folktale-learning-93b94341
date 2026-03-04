import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserRole } from "@/data/mockData";

const PrivacyPolicy = () => {
  const { t } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>("student");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">{t.privacyPage.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{t.privacyPage.title}</h1>
          <p className="text-muted-foreground">{t.privacyPage.subtitle}</p>
        </div>

        <div className="space-y-8">
          {t.privacyPage.sections.map((section, index) => (
            <section key={index} className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-heading font-bold mb-3">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
