import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserRole } from "@/data/mockData";
import { motion } from "framer-motion";

const FAQ = () => {
  const { t } = useLanguage();
  const [currentRole, setCurrentRole] = useState<UserRole>("student");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-5 w-5" />
            <span className="font-semibold">{t.faqPage.title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{t.faqPage.title}</h1>
          <p className="text-muted-foreground text-lg">{t.faqPage.subtitle}</p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {t.faqPage.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
            >
              <AccordionItem value={`faq-${index}`} className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="text-base font-semibold hover:no-underline text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
