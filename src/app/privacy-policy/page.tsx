export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">Politique de Confidentialité</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Collecte des Informations</h2>
          <p>
            Nous recueillons des informations lorsque vous vous inscrivez sur notre site, lorsque vous vous connectez à votre compte, faites un achat, participez à un concours, et / ou lorsque vous vous déconnectez. Les informations recueillies incluent votre nom, votre adresse e-mail, numéro de téléphone, et / ou carte de crédit.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Utilisation des Informations</h2>
          <p className="mb-4">Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
            <li>Fournir un contenu publicitaire personnalisé</li>
            <li>Améliorer notre site Web</li>
            <li>Améliorer le service client et vos besoins de prise en charge</li>
            <li>Vous contacter par e-mail</li>
            <li>Administrer un concours, une promotion, ou une enquête</li>
          </ul>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Confidentialité du Commerce en Ligne</h2>
          <p>
            Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour n&apos;importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et / ou une transaction, comme par exemple pour expédier une commande.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Divulgation à des Tiers</h2>
          <p>
            Nous ne vendons, n&apos;échangeons et ne transférons pas vos informations personnelles identifiables à des tiers. Cela ne comprend pas les tierce parties de confiance qui nous aident à exploiter notre site Web ou à mener nos affaires, tant que ces parties conviennent de garder ces informations confidentielles.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Protection des Informations</h2>
          <p>
            Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne. Nous protégeons également vos informations hors ligne.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Consentement</h2>
          <p>
            En utilisant notre site, vous consentez à notre politique de confidentialité.
          </p>
        </section>
      </div>
    </div>
  );
}
