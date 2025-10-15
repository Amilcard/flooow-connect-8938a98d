import PageLayout from '@/components/PageLayout';

const RGPD = () => {
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">RGPD & Protection des données</h1>
        <p className="text-sm text-muted-foreground mb-4">Informations relatives au respect du Règlement Général sur la Protection des Données (RGPD).</p>

        <section className="prose max-w-none">
          <h2>Responsable de traitement</h2>
          <p>InKlusif Flooow est responsable du traitement des données collectées via la plateforme.</p>

          <h2>Base légale</h2>
          <p>Les traitements reposent sur l'exécution du contrat, le consentement, ou des obligations légales.</p>

          <h2>Durées de conservation</h2>
          <p>Les données sont conservées le temps nécessaire à la fourniture du service et conformément aux obligations légales.</p>

          <h2>Contact</h2>
          <p>Pour exercer vos droits, contactez-nous via la page contact.</p>
        </section>
      </main>
    </PageLayout>
  );
};

export default RGPD;
