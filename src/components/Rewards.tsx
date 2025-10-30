import { badges } from "@/data/mockData";

const Rewards = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-highlight/30 to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold">
            Huy hiệu & phần thưởng
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hoàn thành nhiệm vụ và thu thập các huy hiệu đặc biệt
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
          {badges.map((badge, index) => (
            <div
              key={badge.id}
              className="bg-card rounded-2xl p-6 card-shadow hover-lift text-center space-y-3 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                {badge.icon}
              </div>
              <div>
                <div className="font-heading font-bold text-sm">
                  {badge.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rewards;
