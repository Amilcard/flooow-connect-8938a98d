import PageLayout from '@/components/PageLayout';

const MentionsLegales = () => {
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Mentions légales</h1>
        <p className="text-sm text-muted-foreground mb-4">Informations légales concernant InKlusif Flooow.</p>

        <section className="prose max-w-none">
          <h2>Éditeur</h2>
          <p>InKlusif Flooow — Adresse — SIRET: 000 000 000</p>

          <h2>Hébergement</h2>
          <p>Le site est hébergé par un prestataire tiers.</p>

          <h2>Contact</h2>
          <p>support@flooow.fr</p>
        </section>
      </main>
    </PageLayout>
  );
};

export default MentionsLegales;
