import { MapPin, Award, TrendingUp, Shield } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Visibilité nationale',
    description: 'Faites connaître votre savoir-faire auprès de milliers de consommateurs engagés dans le Made in France'
  },
  {
    icon: MapPin,
    title: 'Classement par région et catégorie',
    description: 'Référencement organisé pour être facilement trouvé par les acheteurs de votre territoire'
  },
  {
    icon: Award,
    title: 'Accès anticipé à la marketplace',
    description: '3 mois offerts lors du lancement officiel (T2 2026) pour tous les producteurs inscrits avant la beta'
  },
  {
    icon: Shield,
    title: 'Référencement Made in France',
    description: 'Intégrez un réseau de producteurs engagés dans la qualité, la traçabilité et l\'authenticité'
  }
];

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-3 px-4 py-2 bg-gradient-to-r from-[#1E88C7]/20 to-[#ED2939]/20 rounded-full border border-[#1E88C7]/30">
            <span className="text-[#002654] font-bold text-sm tracking-wide">BETA T1 2026 • LANCEMENT OFFICIEL T2 2026</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#002654] mb-4">
            Pourquoi s'inscrire dès maintenant ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez la communauté des producteurs français qui font vivre le terroir et l'excellence alimentaire
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-[#ED2939] relative overflow-hidden group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E88C7] to-[#002654] rounded-lg flex items-center justify-center mb-6">
                <benefit.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#002654] mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
