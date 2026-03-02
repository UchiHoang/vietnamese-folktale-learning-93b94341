import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import { AchievementDefinition, EarnedAchievement } from "@/data/achievements";
import { format } from "date-fns";
import { vi as viLocale } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface AchievementCardProps {
  achievement: AchievementDefinition;
  earnedData?: EarnedAchievement;
  index?: number;
}

export const AchievementCard = ({
  achievement,
  earnedData,
  index = 0,
}: AchievementCardProps) => {
  const { t, language } = useLanguage();
  const isEarned = !!earnedData;

  const getCategoryLabel = (category: AchievementDefinition["category"]): string => {
    switch (category) {
      case "learning": return t.achievementGrid.categoryLearning;
      case "activity": return t.achievementGrid.categoryActivity;
      case "game": return t.achievementGrid.categoryGame;
      case "social": return t.achievementGrid.categorySocial;
      default: return category;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={isEarned ? { scale: 1.05, y: -5 } : {}}
            className={`
              relative flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer
              ${isEarned
                ? "bg-gradient-to-br from-primary/15 to-primary/5 hover:shadow-lg hover:shadow-primary/20 border border-primary/20"
                : "bg-muted/50 border border-transparent"
              }
            `}
          >
            {isEarned && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            )}
            <div className={`relative ${!isEarned && "grayscale opacity-40"}`}>
              <motion.span
                className="text-4xl block"
                animate={isEarned ? { y: [0, -3, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
              >
                {achievement.icon}
              </motion.span>
            </div>
            <span className={`text-xs text-center font-medium mt-2 line-clamp-2 ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
              {achievement.name}
            </span>
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] rounded-xl">
                <Lock className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-primary">{getCategoryLabel(achievement.category)}</p>
            {earnedData && (
              <p className="text-xs text-primary">
                {t.achievementGrid.earnedAt}: {format(new Date(earnedData.earned_at), "dd/MM/yyyy", { locale: language === "vi" ? viLocale : enUS })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
