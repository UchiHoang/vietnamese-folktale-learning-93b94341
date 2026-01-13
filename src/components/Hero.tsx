import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { motion } from "framer-motion";

const Hero = () => {
  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1] as const
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.15,
        duration: 0.5
      }
    })
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-highlight to-secondary/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 text-4xl"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          ⭐
        </motion.div>
        <motion.div 
          className="absolute top-40 right-20 text-3xl"
          animate={floatingAnimation}
        >
          📚
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-1/4 text-2xl"
          animate={{ y: [-5, 15, -5], x: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🎯
        </motion.div>
        <motion.div 
          className="absolute top-1/3 right-1/3 text-3xl opacity-60"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div 
          className="absolute bottom-20 right-1/4 text-2xl"
          animate={{ y: [-5, 10, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🏆
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span>Học qua chơi - Vui là chính!</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Hành trình học tập <br />
              <motion.span 
                className="text-primary inline-block"
                animate={{ 
                  textShadow: ["0 0 0px hsl(var(--primary))", "0 0 20px hsl(var(--primary) / 0.5)", "0 0 0px hsl(var(--primary))"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                kỳ diệu
              </motion.span> cùng <br />
              văn hóa Việt
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Khám phá toán học và ngôn ngữ qua những câu chuyện dân gian Việt Nam đầy màu sắc và thú vị
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="text-lg group relative overflow-hidden">
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  Bắt đầu chơi
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" variant="outline" className="text-lg">
                  Khám phá lớp học
                </Button>
              </motion.div>
            </motion.div>

            <div className="flex items-center gap-8 pt-4">
              {[
                { value: "5000+", label: "Học sinh" },
                { value: "200+", label: "Giáo viên" },
                { value: "50+", label: "Trường học" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  variants={statsVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="cursor-default"
                >
                  <motion.div 
                    className="text-3xl font-bold text-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.div 
              className="aspect-video rounded-3xl overflow-hidden card-shadow"
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={heroBanner}
                alt="Học qua chơi với văn hóa Việt"
                className="w-full h-full object-cover"
              />
              {/* Shine effect overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />
            </motion.div>
            
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full opacity-50 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-full opacity-50 blur-2xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
            
            {/* Floating badge */}
            <motion.div
              className="absolute -top-6 -left-6 bg-card rounded-2xl p-3 shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">4.9/5</span>
              </div>
            </motion.div>
            
            {/* Floating students count */}
            <motion.div
              className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-3 shadow-lg border"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold">Online</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
