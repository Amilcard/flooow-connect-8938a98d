import { UniversSection } from "@/components/UniversSection";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Univers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Nos Univers"
        subtitle="Découvrez toutes nos activités par thématiques"
        backFallback="/home"
      />

      <div className="max-w-5xl mx-auto px-4 py-6">

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
