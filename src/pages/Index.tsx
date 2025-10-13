import { SearchBar } from "@/components/SearchBar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ActivityCarousel } from "@/components/ActivityCarousel";
import { ActivitySection } from "@/components/ActivitySection";

// Mock data - À remplacer par les vraies données du backend
const featuredActivities = [
  {
    id: "1",
    title: "Stage de Football",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop",
    distance: "1.2 km",
    ageRange: "8-12 ans",
    category: "Sport",
    price: 45,
    hasAccessibility: true,
    hasFinancialAid: true,
  },
  {
    id: "2",
    title: "Atelier Peinture",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    distance: "2.5 km",
    ageRange: "6-14 ans",
    category: "Loisir",
    price: 25,
    hasFinancialAid: true,
  },
  {
    id: "3",
    title: "Club de Natation",
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=600&fit=crop",
    distance: "800 m",
    ageRange: "7-15 ans",
    category: "Sport",
    price: 60,
    hasAccessibility: true,
  },
];

const nearbyActivities = [
  {
    id: "4",
    title: "Danse Classique",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&h=600&fit=crop",
    distance: "500 m",
    ageRange: "5-10 ans",
    category: "Loisir",
    price: 35,
    hasFinancialAid: true,
  },
  {
    id: "5",
    title: "Basket-ball",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
    distance: "900 m",
    ageRange: "9-14 ans",
    category: "Sport",
    price: 40,
    hasAccessibility: true,
  },
];

const budgetActivities = [
  {
    id: "6",
    title: "Bibliothèque - Heure du conte",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop",
    distance: "1.8 km",
    ageRange: "4-8 ans",
    category: "Loisir",
    price: 0,
    hasAccessibility: true,
    hasFinancialAid: false,
  },
  {
    id: "7",
    title: "Atelier Jardinage",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
    distance: "3.2 km",
    ageRange: "6-12 ans",
    category: "Loisir",
    price: 15,
    hasFinancialAid: true,
  },
];

const healthActivities = [
  {
    id: "8",
    title: "Yoga Adapté",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    distance: "1.5 km",
    ageRange: "8-16 ans",
    category: "Santé",
    price: 30,
    hasAccessibility: true,
    hasFinancialAid: true,
  },
  {
    id: "9",
    title: "Kinéball",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
    distance: "2.1 km",
    ageRange: "7-13 ans",
    category: "Sport",
    price: 35,
    hasAccessibility: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar onFilterClick={() => console.log("Filter clicked")} />
      
      <main className="container px-4 py-6 space-y-8">
        <section aria-label="Activités en vedette">
          <h1 className="text-2xl font-bold mb-4">Découvrez nos activités</h1>
          <ActivityCarousel 
            activities={featuredActivities}
            onActivityClick={(id) => console.log("Activity clicked:", id)}
          />
        </section>

        <ActivitySection
          title="Activités à proximité"
          activities={nearbyActivities}
          onSeeAll={() => console.log("See all nearby")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Petits budgets"
          activities={budgetActivities}
          onSeeAll={() => console.log("See all budget")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />

        <ActivitySection
          title="Activités Santé"
          activities={healthActivities}
          onSeeAll={() => console.log("See all health")}
          onActivityClick={(id) => console.log("Activity clicked:", id)}
        />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
