export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8 text-foreground">Conditions d&apos;Utilisation</h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-white/10 pb-2">Informations Légales</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-foreground">Société :</p>
              <p>STIKY CONSULTING</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Matricule Fiscale :</p>
              <p>1786714/C/A/M/000</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Adresse :</p>
              <p>Imb. Essedik APP 22 Rue Ribat Sousse Tunisia</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Contact :</p>
              <p>Tél : 95 66 4444</p>
              <p>Email : contact@eventi.com</p>
            </div>
          </div>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptation des Conditions</h2>
          <p>
            En accédant à ce site web, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation, toutes les lois et réglementations applicables, et acceptez que vous êtes responsable du respect des lois locales applicables. Si vous n&apos;êtes pas d&apos;accord avec l&apos;un de ces termes, il vous est interdit d&apos;utiliser ou d&apos;accéder à ce site.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Licence d&apos;Utilisation</h2>
          <p className="mb-4">
            Il est permis de télécharger temporairement une copie du matériel (information ou logiciel) sur le site web d&apos;Eventi pour une visualisation transitoire personnelle et non commerciale uniquement. Il s&apos;agit de l&apos;octroi d&apos;une licence, non d&apos;un transfert de titre, et sous cette licence, vous ne pouvez pas :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modifier ou copier le matériel ;</li>
            <li>Utiliser le matériel à des fins commerciales ou pour toute exposition publique (commerciale ou non commerciale) ;</li>
            <li>Tenter de décompiler ou de désosser tout logiciel contenu sur le site web d&apos;Eventi ;</li>
            <li>Supprimer tout droit d&apos;auteur ou autre mention de propriété du matériel ; ou</li>
            <li>Transférer le matériel à une autre personne ou &quot;miroir&quot; du matériel sur un autre serveur.</li>
          </ul>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Clause de Non-responsabilité</h2>
          <p>
            Le matériel sur le site web d&apos;Eventi est fourni &quot;tel quel&quot;. Eventi ne donne aucune garantie, expresse ou implicite, et rejette et nie par la présente toutes les autres garanties, y compris, sans limitation, les garanties implicites ou conditions de qualité marchande, d&apos;adéquation à un usage particulier, ou de non-violation de la propriété intellectuelle ou autre violation des droits.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitations</h2>
          <p>
            En aucun cas, Eventi ou ses fournisseurs ne seront responsables de tout dommage (y compris, sans limitation, les dommages pour perte de données ou de profit, ou en raison d&apos;une interruption d&apos;activité) découlant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le matériel sur le site Internet d&apos;Eventi, même si Eventi ou un représentant autorisé d&apos;Eventi a été informé oralement ou par écrit de la possibilité de tels dommages.
          </p>
        </section>

        <section className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-white/5">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Révisions et Errata</h2>
          <p>
            Le matériel apparaissant sur le site web d&apos;Eventi pourrait inclure des erreurs techniques, typographiques ou photographiques. Eventi ne garantit pas que l&apos;un des matériaux sur son site web est exact, complet ou à jour. Eventi peut apporter des modifications au matériel contenu sur son site web à tout moment sans préavis.
          </p>
        </section>
      </div>
    </div>
  );
}
