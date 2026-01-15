export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
          
          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Introduction</h2>
              <p>
                Helpyx SAS ("Helpyx", "nous", "notre") s'engage à protéger la vie privée et les données 
                personnelles de ses utilisateurs. Cette politique de confidentialité explique comment nous 
                collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez 
                notre plateforme Helpyx.
              </p>
              <p className="mt-2">
                Cette politique s'applique à tous les utilisateurs de la plateforme Helpyx, y compris 
                les clients, les employés des clients et les visiteurs de notre site web.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Données collectées</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informations de compte</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Nom, prénom et adresse email</li>
                    <li>Mot de passe (chiffré)</li>
                    <li>Rôle et permissions au sein de votre organisation</li>
                    <li>Informations de profil (photo, numéro de téléphone)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Données d'utilisation</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Historique des connexions et sessions</li>
                    <li>Actions effectuées sur la plateforme</li>
                    <li>Tickets créés et traités</li>
                    <li>Préférences et paramètres</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Données techniques</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Adresse IP et type de navigateur</li>
                    <li>Type d'appareil et système d'exploitation</li>
                    <li>Pages visitées et temps de consultation</li>
                    <li>Cookies et technologies similaires</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Utilisation des données</h2>
              <p>Nous utilisons vos données pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Fournir nos services</strong> : Traiter les tickets, gérer les comptes utilisateurs</li>
                <li><strong>Améliorer nos services</strong> : Analyser l'utilisation pour optimiser la plateforme</li>
                <li><strong>Support client</strong> : Répondre à vos questions et résoudre les problèmes</li>
                <li><strong>Sécurité</strong> : Détecter et prévenir les activités frauduleuses</li>
                <li><strong>Communication</strong> : Vous envoyer des informations importantes sur votre compte</li>
                <li><strong>Conformité</strong> : Respecter nos obligations légales et réglementaires</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Base légale du traitement</h2>
              <p>Nous traitons vos données personnelles sur les bases légales suivantes :</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Consentement</strong> : Pour les cookies et marketing</li>
                <li><strong>Contrat</strong> : Pour exécuter nos obligations contractuelles</li>
                <li><strong>Obligation légale</strong> : Pour respecter la loi (facturation, etc.)</li>
                <li><strong>Intérêt légitime</strong> : Pour la sécurité et l'amélioration des services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Partage des données</h2>
              <p>Nous ne partageons vos données que dans les cas suivants :</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Avec votre consentement</strong> : Lorsque vous nous autorisez explicitement</li>
                <li><strong>Prestataires de services</strong> : Hébergement, paiement, support technique</li>
                <li><strong>Autorités compétentes</strong> : En cas d'obligation légale</li>
                <li><strong>Transfert d'entreprise</strong> : En cas de fusion, acquisition ou cession</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées 
                pour protéger vos données contre la perte, l'accès non autorisé, la modification ou la destruction.
              </p>
              <p className="mt-2">
                Ces mesures incluent le chiffrement SSL/TLS, l'authentification forte, les sauvegardes 
                régulières et la limitation des accès aux données.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Droit d'accès</strong> : Connaître les données que nous détenons sur vous</li>
                <li><strong>Droit de rectification</strong> : Corriger les données inexactes</li>
                <li><strong>Droit d'effacement</strong> : Demander la suppression de vos données</li>
                <li><strong>Droit de limitation</strong> : Limiter le traitement de vos données</li>
                <li><strong>Droit de portabilité</strong> : Recevoir vos données dans un format lisible</li>
                <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-2">
                Pour exercer ces droits, contactez-nous à : privacy@helpyx.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Conservation des données</h2>
              <p>
                Nous conservons vos données uniquement aussi longtemps que nécessaire pour les finalités 
                pour lesquelles elles ont été collectées, conformément à nos obligations légales.
              </p>
              <p className="mt-2">
                Les durées de conservation varient selon le type de données : données de compte 
                (pendant la durée du contrat), données de support (3 ans), données analytiques (13 mois).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Cookies</h2>
              <p>
                Notre site utilise des cookies pour améliorer votre expérience et analyser l'utilisation 
                de notre plateforme. Vous pouvez gérer vos préférences cookies via notre bandeau cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Transferts internationaux</h2>
              <p>
                Vos données peuvent être transférées en dehors de l'Union Européenne vers des pays 
                assurant un niveau de protection adéquat, notamment via les clauses contractuelles types 
                de la Commission Européenne.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Modifications</h2>
              <p>
                Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications 
                seront publiées sur cette page et vous serez informé des changements importants.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
              </p>
              <div className="mt-2 space-y-1">
                <p>Email : privacy@helpyx.com</p>
                <p>Adresse postale : Helpyx SAS, 123 Avenue de la Technologie, 75008 Paris</p>
                <p>Téléphone : +33 1 23 45 67 89</p>
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