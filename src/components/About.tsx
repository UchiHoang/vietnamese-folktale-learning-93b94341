import { BookOpen, Heart, Trophy } from "lucide-react";

const About = () => {
  const benefits = [
    {
      icon: BookOpen,
      title: "Cho học sinh",
      description: "Học tập vui vẻ qua trò chơi và câu chuyện dân gian, phát triển tư duy logic và sáng tạo"
    },
    {
      icon: Heart,
      title: "Cho phụ huynh",
      description: "Theo dõi tiến độ học tập của con, an tâm với nội dung giáo dục chất lượng và an toàn"
    },
    {
      icon: Trophy,
      title: "Cho giáo viên",
      description: "Công cụ hỗ trợ giảng dạy hiệu quả, quản lý lớp học dễ dàng và đánh giá kết quả cụ thể"
    }
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-gradient-to-br from-muted/30 to-highlight/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            Sứ mệnh của chúng tôi
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            VietEdu Odyssey mang đến trải nghiệm học tập độc đáo, kết hợp giáo dục hiện đại 
            với văn hóa dân gian Việt Nam. Chúng tôi tin rằng học qua chơi là cách tốt nhất 
            để trẻ em phát triển toàn diện và yêu thích việc học.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 card-shadow hover-lift space-y-4 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
