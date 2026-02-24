export default function CGVPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">Conditions Générales de Vente (CGV)</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        
        {/* Preamble / Legal Info */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-white/10 pb-2">Préambule et Mentions Légales</h2>
          <p className="mb-4">
            Les présentes Conditions Générales de Vente (ci-après &quot;CGV&quot;) régissent la vente de billets sur la plateforme en ligne <strong>Eventi</strong>, exploitée par la société <strong>STIKY CONSULTING</strong>.
          </p>
          <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg">
            <div>
              <p className="font-semibold text-foreground">Dénomination Sociale :</p>
              <p>STIKY CONSULTING</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Matricule Fiscale :</p>
              <p>1786714/C/A/M/000</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Siège Social :</p>
              <p>Imb. Essedik APP 22 Rue Ribat, Sousse, Tunisie</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Contact :</p>
              <p>Tél : (+216) 95 66 4444</p>
              <p>Email : contact@evanti.tn</p>
            </div>
          </div>
          <p className="mt-4">
            L&apos;achat de billets implique l&apos;acceptation sans réserve des présentes CGV par le client.
          </p>
        </section>

        {/* 1. Objet */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Objet</h2>
          <p>
            Eventi agit en tant qu&apos;intermédiaire de billetterie au nom et pour le compte des organisateurs d&apos;événements. Les présentes CGV concernent uniquement la vente de billetterie et non l&apos;événement lui-même, qui reste sous la responsabilité exclusive de l&apos;Organisateur.
          </p>
        </section>

        {/* 2. Tarifs et Commandes */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Tarifs et Commandes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Les prix des billets sont indiqués en <strong>Dinars Tunisiens (TND)</strong>, toutes taxes comprises.</li>
            <li>Eventi se réserve le droit de modifier les prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de l&apos;enregistrement des commandes.</li>
            <li>La validation de la commande vaut acceptation définitive des prix et des descriptions des produits disponibles à la vente.</li>
          </ul>
        </section>

        {/* 3. Paiement Sécurisé */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Paiement Sécurisé</h2>
          <p>
            Le règlement des achats s&apos;effectue par carte bancaire. Les transactions sont sécurisées par un protocole de cryptage SSL. Les coordonnées bancaires de l&apos;Utilisateur ne transitent jamais en clair sur le réseau et ne sont pas conservées par Eventi.
          </p>
        </section>

        {/* 4. Obtention des Billets */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Obtention des Billets</h2>
          <p>
            Dès la validation du paiement, les billets sont envoyés à l&apos;adresse électronique renseignée lors de la commande sous forme de e-billets (PDF avec QR Code). Ils sont également accessibles depuis l&apos;espace personnel de l&apos;Utilisateur sur le site Eventi.
          </p>
        </section>

        {/* 5. Politique de Remboursement et Rétractation (Focus) */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Annulation et Remboursement</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">5.1 Pas de Droit de Rétractation</h3>
              <p>
                Conformément aux dispositions légales en vigueur, la vente de billets de spectacles et d&apos;événements de loisirs n&apos;est pas soumise au droit de rétractation. <strong>Toute commande est ferme et définitive.</strong>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">5.2 Annulation de l&apos;Événement</h3>
              <p>
                En cas d&apos;annulation définitive de l&apos;événement par l&apos;Organisateur, le remboursement du prix du billet (hors frais de gestion éventuels) sera effectué selon les modalités définies par l&apos;Organisateur. Eventi ne procèdera au remboursement qu&apos;après réception des fonds de la part de l&apos;Organisateur.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">5.3 Report de l&apos;Événement</h3>
              <p>
                En cas de report, les billets restent valables pour la nouvelle date. Si l&apos;Acheteur ne peut pas assister à la date de report, il pourra demander le remboursement dans le délai imparti par l&apos;Organisateur.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Responsabilité */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Responsabilité</h2>
          <p>
            Eventi n&apos;est pas responsable du déroulement de l&apos;événement (modification de programme, horaires, incidents). Sa responsabilité se limite à la délivrance conforme des billets commandés.
          </p>
        </section>

        {/* 7. Droit Applicable */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Droit Applicable</h2>
          <p>
            Les présentes CGV sont soumises à la loi tunisienne. Tout litige relatif à leur interprétation ou leur exécution relève de la compétence exclusive des tribunaux de Sousse.
          </p>
        </section>

      </div>
    </div>
  );
}
