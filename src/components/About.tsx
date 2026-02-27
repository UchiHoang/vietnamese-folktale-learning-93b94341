import { useState } from "react";
import {
  Play,
  Gamepad2,
  BookOpenCheck,
  ScrollText,
  LineChart,
  Clock,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight, floating } from "./animations";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const [audience, setAudience] = useState<"parent" | "student" | "teacher" | "school">("parent");
  const { t } = useLanguage();

  const icons = [LineChart, Clock, PiggyBank, ShieldCheck];
  const studentIcons = [Sparkles, Gamepad2, BookOpenCheck, ScrollText];
  const teacherIcons = [Clock, LineChart, Users, ShieldCheck];
  const schoolIcons = [Users, LineChart, Clock, ShieldCheck];

  const getIcons = (aud: typeof audience) => {
    switch (aud) {
      case "parent": return icons;
      case "student": return studentIcons;
      case "teacher": return teacherIcons;
      case "school": return schoolIcons;
    }
  };

  const getFeatures = (aud: typeof audience) => t.about[aud];

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-muted/30 to-highlight/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute inset-0 opacity-15">
          <Sparkles className="absolute top-12 left-1/4 h-8 w-8 text-primary/70" />
          <Play className="absolute bottom-16 right-1/4 h-10 w-10 text-accent/70" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center space-y-6 mb-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold"
            variants={fadeInUp}
          >
            {t.about.mission}
          </motion.h2>
          <motion.div variants={fadeInUp}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t.about.intro}
            </p>
          </motion.div>
        </motion.div>

        {/* Segmented audience selector */}
        <motion.div
          className="max-w-3xl mx-auto mb-10"
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="rounded-full bg-muted p-1 flex gap-2 justify-between shadow-inner shimmer-wrapper">
            {([
              { key: "parent" as const, label: t.about.tabs.parent },
              { key: "student" as const, label: t.about.tabs.student },
              { key: "teacher" as const, label: t.about.tabs.teacher },
              { key: "school" as const, label: t.about.tabs.school },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => setAudience(item.key)}
                className={`px-5 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                  audience === item.key
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "hover:bg-card hover:scale-105"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3
            className="text-2xl md:text-3xl font-heading font-bold text-center"
            variants={fadeInUp}
          >
            {t.about.unifiedTitle}
          </motion.h3>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {getFeatures(audience).map((f, idx) => {
              const Icon = getIcons(audience)[idx];
              return (
                <motion.div
                  key={idx}
                  className="flex gap-4 p-4 rounded-xl hover:bg-card/50 transition-all duration-300 hover:shadow-md group"
                  variants={idx % 2 === 0 ? fadeInLeft : fadeInRight}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1 group-hover:text-primary transition-colors">{f.title}</div>
                    <div className="text-muted-foreground">{f.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
