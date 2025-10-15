import PageLayout from '@/components/PageLayout';

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Politique de confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Cette page décrit comment InKlusif Flooow collecte, utilise et protège vos informations personnelles.
        </p>

        <section className="prose max-w-none">
          <h2>1. Données collectées</h2>
          <p>Nous collectons les informations que vous fournissez lors de la création de compte, 
          lors de réservations et via nos formulaires de contact (nom, email, téléphone, informations sur les enfants).</p>

          <h2>2. Finalités</h2>
          <p>Nous utilisons ces données pour fournir le service, gérer les réservations, communiquer avec vous et améliorer la plateforme.</p>

          <h2>3. Partage</h2>
          <p>Nous ne partageons pas vos données personnelles avec des tiers sans votre consentement, sauf si requis par la loi ou pour fournir le service (ex : organismes proposant l'activité).</p>

          <h2>4. Vos droits</h2>
          <p>Vous pouvez accéder, corriger, demander la suppression ou l'export de vos données en contactant notre support.</p>

          <h2>5. Sécurité</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données.</p>
        </section>
      </main>
    </PageLayout>
  );
};

export default PrivacyPolicy;
