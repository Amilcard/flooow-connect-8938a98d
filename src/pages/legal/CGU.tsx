import PageLayout from '@/components/PageLayout';

const CGU = () => {
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Conditions Générales d'utilisation (CGU)</h1>
        <p className="text-sm text-muted-foreground mb-4">Règles et conditions d'utilisation de la plateforme.</p>

        <section className="prose max-w-none">
          <h2>Accès au service</h2>
          <p>L'accès à la plateforme est soumis aux présentes conditions.</p>

          <h2>Responsabilités</h2>
          <p>Nous déclinons toute responsabilité pour les informations fournies par les organismes externes.</p>
        </section>
      </main>
    </PageLayout>
  );
};

export default CGU;
