export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">Conditions Générales de Vente et d&apos;Utilisation (CGVU)</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        
        {/* Preamble / Legal Info */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-white/10 pb-2">Préambule et Mentions Légales</h2>
          <p className="mb-4">
            Les présentes Conditions Générales de Vente et d&apos;Utilisation (ci-après &quot;CGVU&quot;) régissent l&apos;utilisation de la plateforme de billetterie en ligne <strong>Eventi</strong>, exploitée par la société <strong>STIKY CONSULTING</strong>.
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
            En achetant un billet sur Eventi, le client (ci-après &quot;l&apos;Utilisateur&quot; ou &quot;l&apos;Acheteur&quot;) déclare avoir pris connaissance et accepté sans réserve les présentes CGVU.
          </p>
        </section>

        {/* 1. Objet */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Objet du Service</h2>
          <p>
            Eventi est une plateforme intermédiaire de billetterie qui met en relation des organisateurs d&apos;événements (spectacles, concerts, événements sportifs, etc.) et des acheteurs. Eventi agit au nom et pour le compte des Organisateurs. Par conséquent, Eventi n&apos;est pas l&apos;organisateur des événements (sauf mention contraire explicite) et ne porte pas la responsabilité du déroulement de l&apos;événement lui-même.
          </p>
        </section>

        {/* 2. Commandes et Billets */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Commandes et Billets</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Processus d&apos;achat :</strong> L&apos;Utilisateur sélectionne l&apos;événement, le type de billet et la quantité souhaitée. Il doit fournir des informations exactes (nom, email, téléphone) pour la bonne réception des billets.</li>
            <li><strong>Confirmation :</strong> La commande n&apos;est définitive qu&apos;après validation du paiement. Un email de confirmation contenant les billets électroniques (QR Codes) est envoyé à l&apos;adresse fournie.</li>
            <li><strong>Validité :</strong> Chaque billet est unique et valide pour une seule entrée (sauf pass multi-jours). Il ne doit être ni dupliqué ni revendu à un prix supérieur à sa valeur faciale.</li>
          </ul>
        </section>

        {/* 3. Prix et Paiement */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Prix et Paiement</h2>
          <p className="mb-4">
            Les prix des billets sont indiqués en <strong>Dinars Tunisiens (TND)</strong>, toutes taxes comprises (TTC).
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Frais de service :</strong> Des frais de gestion ou de service peuvent être ajoutés au prix du billet. Ces frais sont clairement indiqués avant la validation de la commande.</li>
            <li><strong>Paiement sécurisé :</strong> Le règlement s&apos;effectue en ligne par carte bancaire (nationale ou internationale) via une plateforme de paiement sécurisée. Les données bancaires sont cryptées et ne sont pas conservées par Eventi.</li>
          </ul>
        </section>

        {/* 4. Politique de Remboursement (CRUCIAL) */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 border-l-4 border-l-primary">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Politique de Remboursement et Annulation</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">4.1 Absence de Droit de Rétractation</h3>
              <p>
                Conformément à la législation en vigueur concernant la vente de prestations de services de loisirs fournies à une date ou selon une périodicité déterminée, <strong>les billets de spectacles et d&apos;événements ne font pas l&apos;objet d&apos;un droit de rétractation</strong>. Toute commande est ferme et définitive.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">4.2 Annulation ou Report par l&apos;Organisateur</h3>
              <p>
                En cas d&apos;annulation ou de report de l&apos;événement de la part de l&apos;Organisateur :
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Annulation définitive :</strong> Le remboursement de la valeur nominale du billet (hors frais de service éventuels) sera effectué automatiquement ou sur demande, selon les instructions de l&apos;Organisateur.</li>
                <li><strong>Report :</strong> Si l&apos;événement est reporté, les billets restent généralement valables pour la nouvelle date. Si l&apos;Acheteur ne peut pas assister à la nouvelle date, il pourra demander un remboursement dans le délai fixé par l&apos;Organisateur.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">4.3 Procédure de Remboursement</h3>
              <p>
                Les demandes de remboursement doivent être adressées au service client d&apos;Eventi (contact@evanti.tn) ou directement à l&apos;Organisateur si indiqué. Eventi procèdera au remboursement uniquement après avoir reçu les fonds correspondants de la part de l&apos;Organisateur.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Accès à l'Événement */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Accès à l&apos;Événement</h2>
          <p>
            L&apos;Organisateur se réserve le droit de contrôler l&apos;identité du porteur du billet à l&apos;entrée du lieu. L&apos;Acheteur doit s&apos;assurer d&apos;imprimer son billet ou de pouvoir le présenter sur son smartphone.
            <br /><br />
            L&apos;acquisition d&apos;un billet emporte adhésion au règlement intérieur du lieu de l&apos;événement. Toute personne ne respectant pas ce règlement pourra se voir refuser l&apos;entrée sans remboursement.
          </p>
        </section>

        {/* 6. Responsabilité */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Responsabilité</h2>
          <p>
            Eventi intervient uniquement en tant qu&apos;intermédiaire technique. Sa responsabilité ne saurait être engagée pour :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Le déroulement artistique ou sportif de l&apos;événement ;</li>
            <li>La modification du programme, de la distribution ou des horaires ;</li>
            <li>Les incidents survenant lors de l&apos;événement.</li>
          </ul>
          <p className="mt-2">
            La responsabilité d&apos;Eventi est limitée au montant de la commande. Eventi ne saurait être tenu responsable des dommages indirects.
          </p>
        </section>

        {/* 7. Données Personnelles */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Données Personnelles</h2>
          <p>
            Les informations collectées sont nécessaires au traitement des commandes et à la gestion de la relation commerciale. Conformément à la loi organique n° 2004-63 relative à la protection des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;opposition aux données vous concernant.
            Pour plus de détails, consultez notre <a href="/privacy-policy" className="text-primary hover:underline">Politique de Confidentialité</a>.
          </p>
        </section>

        {/* 8. Droit Applicable */}
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Droit Applicable et Litiges</h2>
          <p>
            Les présentes CGVU sont soumises au droit tunisien. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut d&apos;accord amiable, les tribunaux compétents de <strong>Sousse</strong> seront seuls compétents.
          </p>
        </section>

      </div>
    </div>
  );
}
