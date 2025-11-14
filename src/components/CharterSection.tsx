import { CheckCircle2 } from 'lucide-react';

const charterPoints = [
  'Engagement qualité : Production française avec des standards élevés',
  'Transparence totale : Traçabilité claire de nos produits et méthodes',
  'Authenticité garantie : Respect du savoir-faire traditionnel et artisanal',
  'Durabilité : Pratiques respectueuses de l\'environnement',
  'Éthique : Relations équitables avec tous les acteurs de la filière'
];

export default function CharterSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#1E88C7]/10 rounded-full">
            <span className="text-[#1E88C7] font-semibold text-sm tracking-wide">NOS VALEURS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#002654] mb-4">
            Charte du Producteur MIF Market
          </h2>
          <p className="text-lg text-gray-600">
            Un engagement commun pour l'excellence française
          </p>
          <p className="text-sm text-[#1E88C7] font-semibold mt-2">
            Beta T1 2026 • Lancement officiel T2 2026
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#002654] to-[#1E88C7] rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <div className="space-y-6">
            {charterPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-[#F5C542] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-lg leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-blue-100 text-center">
              En vous inscrivant, vous vous engagez à respecter ces principes fondamentaux qui font la force du Made in France
            </p>
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <p className="text-[#F5C542] text-center font-bold mb-1">
                Inscrivez-vous maintenant pour la beta !
              </p>
              <p className="text-blue-100 text-center text-sm">
                Accès prioritaire à la phase beta (T1 2026) + 3 mois offerts au lancement officiel (T2 2026)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
