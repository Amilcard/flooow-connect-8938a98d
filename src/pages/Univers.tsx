import { UniversSection } from "@/components/UniversSection";
import PageLayout from "@/components/PageLayout";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Univers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');

  return (
    <PageLayout>
      <div className="container px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nos Univers</h1>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6">
          Découvrez toutes nos activités organisées par thématiques : Sport, Culture, Apprentissage, Loisirs et Vacances.
        </p>

        {/* Univers Cards */}
        <UniversSection />

        {/* Additional content based on selected category */}
        {selectedCategory && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              Activités {selectedCategory}
            </h2>
            <p className="text-muted-foreground">
              Filtrage des activités par catégorie à implémenter...
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Univers;
