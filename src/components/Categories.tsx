import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Palette, Plane, GraduationCap } from "lucide-react";

const categories = [
  {
    icon: Dumbbell,
    title: "Sport",
    description: "Football, natation, danse, arts martiaux...",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Palette,
    title: "Culture",
    description: "Musique, théâtre, arts plastiques...",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Plane,
    title: "Vacances",
    description: "Colonies, camps, séjours découverte...",
    color: "from-accent to-orange-600",
  },
  {
    icon: GraduationCap,
    title: "Soutien scolaire",
    description: "Accompagnement, cours particuliers...",
    color: "from-green-500 to-green-600",
  },
];

const Categories = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-foreground">Découvrez nos activités</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des centaines d'activités pour tous les âges et tous les centres d'intérêt
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.title}
                className="group cursor-pointer border-border hover:border-primary/20 transition-all duration-300 hover:shadow-elegant-lg hover:-translate-y-1"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
