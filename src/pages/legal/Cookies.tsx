import PageLayout from '@/components/PageLayout';

const Cookies = () => {
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Cookies</h1>
        <p className="text-sm text-muted-foreground mb-4">Explication de l'utilisation des cookies et comment les gérer.</p>

        <section className="prose max-w-none">
          <h2>Types de cookies</h2>
          <p>Nous utilisons des cookies essentiels, analytiques et de performance pour améliorer la plateforme.</p>

          <h2>Gérer les cookies</h2>
          <p>Vous pouvez configurer ou désactiver les cookies via les paramètres de votre navigateur.</p>
        </section>
      </main>
    </PageLayout>
  );
};

export default Cookies;
