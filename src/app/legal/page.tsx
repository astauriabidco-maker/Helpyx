export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentions Légales</h1>
          
          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Éditeur de la plateforme</h2>
              <div className="space-y-2">
                <p><strong>Helpyx SAS</strong></p>
                <p>123 Avenue de la Technologie</p>
                <p>75008 Paris, France</p>
                <p>Email : contact@helpyx.com</p>
                <p>Téléphone : +33 1 23 45 67 89</p>
                <p>SIRET : 123 456 789 00012</p>
                <p>TVA intracommunautaire : FR12345678901</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Directeur de la publication</h2>
              <p>M. Jean Dupont, Directeur Général</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Hébergement</h2>
              <div className="space-y-2">
                <p><strong>Vercel Inc.</strong></p>
                <p>440 N Barranca Ave #4133</p>
                <p>Covina, CA 91723</p>
                <p>États-Unis</p>
                <p>Email : support@vercel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Propriété intellectuelle</h2>
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
                et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris les 
                représentations iconographiques et photographiques.
              </p>
              <p className="mt-2">
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
                formellement interdite, sauf autorisation expresse du directeur de la publication.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Cookies</h2>
              <p>
                Ce site utilise des cookies nécessaires à son bon fonctionnement et des cookies de mesure 
                d'audience. Vous pouvez vous opposer à l'utilisation de ces cookies à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Limitation de responsabilité</h2>
              <p>
                Helpyx s'efforce de fournir sur ce site des informations aussi précises que possible. 
                Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et 
                des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers 
                partenaires qui lui fournissent ces informations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Loi applicable</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <div className="mt-2 space-y-1">
                <p>Email : legal@helpyx.com</p>
                <p>Adresse postale : Helpyx SAS, 123 Avenue de la Technologie, 75008 Paris</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}