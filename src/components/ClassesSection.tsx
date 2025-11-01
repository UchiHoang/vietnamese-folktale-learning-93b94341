import ClassCard from "./ClassCard";
import { classes } from "@/data/mockData";

const ClassesSection = () => {
  return (
    <section id="classes" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            Chọn lớp học phù hợp
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mỗi cấp độ đều có những câu chuyện và thử thách riêng, giúp con phát triển toàn diện
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {classes.map((classItem, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ClassCard {...classItem} gameRoute={classItem.gameRoute} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassesSection;
