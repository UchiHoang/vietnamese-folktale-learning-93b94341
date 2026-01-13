import { BookOpen, Heart, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const benefits = [
    {
      icon: BookOpen,
      title: "Cho học sinh",
      description: "Học tập vui vẻ qua trò chơi và câu chuyện dân gian, phát triển tư duy logic và sáng tạo",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Heart,
      title: "Cho phụ huynh",
      description: "Theo dõi tiến độ học tập của con, an tâm với nội dung giáo dục chất lượng và an toàn",
      color: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Trophy,
      title: "Cho giáo viên",
      description: "Công cụ hỗ trợ giảng dạy hiệu quả, quản lý lớp học dễ dàng và đánh giá kết quả cụ thể",
      color: "from-amber-500/20 to-orange-500/20"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-muted/30 to-highlight/30 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-3xl opacity-20"
          animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          📖
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-2xl opacity-20"
          animate={{ y: [10, -10, 10], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          🎓
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-6 mb-16"
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
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <span>Về chúng tôi</span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Sứ mệnh của chúng tôi
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            VietEdu Odyssey mang đến trải nghiệm học tập độc đáo, kết hợp giáo dục hiện đại 
            với văn hóa dân gian Việt Nam. Chúng tôi tin rằng học qua chơi là cách tốt nhất 
            để trẻ em phát triển toàn diện và yêu thích việc học.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
              }}
              className={`bg-card rounded-2xl p-8 card-shadow space-y-4 relative overflow-hidden group cursor-pointer`}
            >
              {/* Gradient overlay on hover */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              
              <motion.div 
                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center relative z-10"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <benefit.icon className="h-7 w-7 text-primary" />
              </motion.div>
              
              <h3 className="text-xl font-heading font-bold relative z-10">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed relative z-10">
                {benefit.description}
              </p>
              
              {/* Decorative corner */}
              <motion.div
                className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
