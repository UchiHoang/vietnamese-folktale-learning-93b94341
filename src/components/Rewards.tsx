import { ALL_ACHIEVEMENTS } from "@/data/achievements";
import { motion } from "framer-motion";
import { Award, Trophy, Star, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Lấy 6 thành tựu nổi bật nhất để giới thiệu
const FEATURED_ACHIEVEMENTS = [
  ALL_ACHIEVEMENTS.find(a => a.id === "first-lesson")!,
  ALL_ACHIEVEMENTS.find(a => a.id === "streak-7")!,
  ALL_ACHIEVEMENTS.find(a => a.id === "xp-500")!,
  ALL_ACHIEVEMENTS.find(a => a.id === "perfect-lesson")!,
  ALL_ACHIEVEMENTS.find(a => a.id === "level-10")!,
  ALL_ACHIEVEMENTS.find(a => a.id === "badges-10")!,
];

const Rewards = () => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-highlight/30 to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 text-6xl opacity-10"
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >🏆</motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-5xl opacity-10"
          animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >⭐</motion.div>
        <motion.div
          className="absolute top-1/2 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12 space-y-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mx-auto mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Award className="h-4 w-4" />
            </motion.div>
            <span>{t.rewards.badgeLabel}</span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {t.rewards.title}
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t.rewards.description} <span className="text-primary font-semibold">{t.rewards.descHighlight}</span> {t.rewards.descSuffix}
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-muted-foreground">{t.rewards.statsAchievements}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 text-orange-500" />
              <span className="text-muted-foreground">{t.rewards.statsCategories}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">{t.rewards.statsAutoUnlock}</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {FEATURED_ACHIEVEMENTS.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              variants={badgeVariants}
              whileHover={{ y: -10, scale: 1.05, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-card rounded-2xl p-6 card-shadow text-center space-y-3 group cursor-pointer relative overflow-hidden transition-colors duration-300 hover:bg-highlight/60"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-highlight/80 to-secondary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.div 
                className="text-5xl relative z-10"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                {achievement.icon}
              </motion.div>
              <div className="relative z-10">
                <div className="font-heading font-bold text-sm group-hover:text-primary transition-colors duration-300">
                  {achievement.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors duration-300">
                  {achievement.description}
                </div>
              </div>
              <motion.div
                className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >✨</motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" className="group">
            <Link to="/profile?tab=stats">
              {t.rewards.viewAll}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Rewards;
