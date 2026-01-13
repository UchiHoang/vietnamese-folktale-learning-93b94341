import { userProfile } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { User, Star, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePreview = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <User className="h-4 w-4" />
            <span>Hồ sơ mẫu</span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="max-w-2xl mx-auto bg-card rounded-2xl card-shadow overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" }}
          whileHover={{ y: -5 }}
        >
          {/* Animated gradient header */}
          <motion.div 
            className="h-32 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          >
            {/* Floating particles */}
            <motion.div
              className="absolute top-4 left-1/4 text-white/30 text-2xl"
              animate={{ y: [-5, 5, -5], rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute bottom-4 right-1/3 text-white/20 text-xl"
              animate={{ y: [5, -5, 5], rotate: [360, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              🏆
            </motion.div>
          </motion.div>
          
          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-6">
              <motion.div 
                className="flex-shrink-0"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <motion.div 
                  className="w-32 h-32 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-6xl card-shadow relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {userProfile.avatar}
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex-1 pt-16 md:pt-20"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-heading font-bold mb-1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      {userProfile.name}
                    </motion.h3>
                    <motion.p 
                      className="text-base text-muted-foreground flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      <User className="h-4 w-4" />
                      {userProfile.level}
                    </motion.p>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="group relative overflow-hidden">
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                      <Sparkles className="h-4 w-4 mr-2" />
                      Xem hồ sơ đầy đủ
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="grid grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="bg-muted/50 rounded-xl p-4 text-center group cursor-pointer"
                whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-primary flex items-center justify-center gap-1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <TrendingUp className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {userProfile.points}
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Tổng điểm
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-muted/50 rounded-xl p-4 text-center group cursor-pointer"
                whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--secondary) / 0.2)" }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-primary"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  {userProfile.badges.length}
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Huy hiệu
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <h4 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-5 w-5 text-primary" />
                </motion.div>
                Huy hiệu đã đạt được
              </h4>
              <div className="flex gap-3">
                {userProfile.badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    className="text-4xl cursor-pointer"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: 0.7 + index * 0.1, 
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      scale: 1.3, 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {badge}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfilePreview;
