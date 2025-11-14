import { useState, FormEvent } from 'react';
import { supabase, Producer } from '../config/supabase';
import { REGIONS, CATEGORIES } from '../data/formOptions';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState<Omit<Producer, 'id' | 'created_at' | 'updated_at' | 'status'>>({
    structure_name: '',
    contact_lastname: '',
    contact_firstname: '',
    email: '',
    phone: '',
    region: '',
    category: '',
    website: '',
    charter_accepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.charter_accepted) {
      setErrorMessage('Vous devez accepter la charte du producteur MIF pour vous inscrire');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('producers')
        .insert([formData]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('Cette adresse email est déjà enregistrée dans notre répertoire');
        } else {
          setErrorMessage('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
        }
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
        setFormData({
          structure_name: '',
          contact_lastname: '',
          contact_firstname: '',
          email: '',
          phone: '',
          region: '',
          category: '',
          website: '',
          charter_accepted: false
        });
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-[#1E88C7] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-[#002654] mb-4">
          Merci pour votre inscription !
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Votre inscription est enregistrée dans le répertoire national MIF Market.
        </p>
        <div className="bg-gradient-to-r from-[#1E88C7]/10 to-[#ED2939]/10 border-2 border-[#F5C542] rounded-lg p-5 mb-6">
          <p className="text-[#002654] font-bold text-lg mb-3 text-center">
            Avantages exclusifs membres pionniers
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[#1E88C7] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                <strong>Accès prioritaire à la beta</strong> dès T1 2026
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ED2939] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                <strong>3 mois offerts</strong> lors du lancement officiel (T2 2026)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F5C542] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                <strong>Influence directe</strong> sur le développement de la plateforme
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-8">
          Vous recevrez sous peu un mail de bienvenue avec toutes les informations concernant votre référencement.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="bg-[#1E88C7] hover:bg-[#002654] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Nouvelle inscription
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
      <div className="mb-8 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-[#002654] mb-2">
          Formulaire d'inscription
        </h3>
        <p className="text-gray-600">
          Inscrivez-vous dès maintenant au répertoire national des producteurs français
        </p>
      </div>

      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="structure_name" className="block text-sm font-semibold text-[#002654] mb-2">
            Nom de la structure <span className="text-[#ED2939]">*</span>
          </label>
          <input
            type="text"
            id="structure_name"
            name="structure_name"
            value={formData.structure_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
            placeholder="Ex: Ferme du Terroir"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contact_lastname" className="block text-sm font-semibold text-[#002654] mb-2">
              Nom du contact <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="text"
              id="contact_lastname"
              name="contact_lastname"
              value={formData.contact_lastname}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="contact_firstname" className="block text-sm font-semibold text-[#002654] mb-2">
              Prénom du contact <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="text"
              id="contact_firstname"
              name="contact_firstname"
              value={formData.contact_firstname}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#002654] mb-2">
              Email professionnel <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
              placeholder="contact@exemple.fr"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#002654] mb-2">
              Téléphone <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
              placeholder="06 12 34 56 78"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="region" className="block text-sm font-semibold text-[#002654] mb-2">
              Région <span className="text-[#ED2939]">*</span>
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all bg-white"
            >
              <option value="">Sélectionnez une région</option>
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-[#002654] mb-2">
              Catégorie d'activité <span className="text-[#ED2939]">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all bg-white"
            >
              <option value="">Sélectionnez une catégorie</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-[#002654] mb-2">
            Site web / Page Facebook / Instagram <span className="text-gray-400">(facultatif)</span>
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent transition-all"
            placeholder="https://..."
          />
        </div>

        <div className="bg-[#FAFAF8] p-6 rounded-lg border-l-4 border-[#1E88C7]">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="charter_accepted"
              name="charter_accepted"
              checked={formData.charter_accepted}
              onChange={handleChange}
              required
              className="mt-1 w-5 h-5 text-[#002654] border-gray-300 rounded focus:ring-[#002654]"
            />
            <label htmlFor="charter_accepted" className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-[#002654]">J'accepte la charte du producteur MIF</span> et m'engage à respecter les principes de qualité, transparence, authenticité et traçabilité du Made in France <span className="text-[#ED2939]">*</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !formData.charter_accepted}
          className="w-full bg-[#ED2939] hover:bg-[#c91f2f] disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            'Je me référence maintenant'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour votre référencement dans le répertoire MIF Market et pour vous tenir informé de l'actualité de la marketplace.
        </p>
      </div>
    </form>
  );
}
