import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserRole } from "@/data/mockData";

const UserGuide = () => {
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
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">{t.userGuidePage.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{t.userGuidePage.title}</h1>
          <p className="text-muted-foreground text-lg">{t.userGuidePage.subtitle}</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {t.userGuidePage.sections.map((section, index) => (
            <AccordionItem key={index} value={`section-${index}`} className="border rounded-xl px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default UserGuide;
