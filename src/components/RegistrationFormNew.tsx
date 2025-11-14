import { useState, FormEvent } from 'react';
import { supabase } from '../config/supabase';
import { regions, productCategories } from '../data/formOptions';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface FormData {
  company_name: string;
  contact_name: string;
  email: string;
  password: string;
  password_confirm: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  region: string;
  products: string;
  categories: string[];
  description: string;
  website: string;
  charter_accepted: boolean;
}

export default function RegistrationFormNew() {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_name: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    region: '',
    products: '',
    categories: [],
    description: '',
    website: '',
    charter_accepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.charter_accepted) {
      setErrorMessage('Vous devez accepter la charte du producteur MIF pour vous inscrire');
      setSubmitStatus('error');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      setSubmitStatus('error');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'producer'
          });

        if (roleError) throw roleError;

        const productsArray = formData.products.split(',').map(p => p.trim()).filter(p => p);

        const { error: producerError } = await supabase
          .from('producers')
          .insert({
            user_id: authData.user.id,
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            postal_code: formData.postal_code,
            city: formData.city,
            region: formData.region,
            products: productsArray,
            categories: formData.categories,
            description: formData.description,
            website: formData.website,
            is_visible: true
          });

        if (producerError) throw producerError;

        await supabase.auth.signOut();

        setSubmitStatus('success');
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          password: '',
          password_confirm: '',
          phone: '',
          address: '',
          postal_code: '',
          city: '',
          region: '',
          products: '',
          categories: [],
          description: '',
          website: '',
          charter_accepted: false
        });
      }
    } catch (error: any) {
      if (error.code === '23505') {
        setErrorMessage('Cette adresse email est déjà enregistrée');
      } else {
        setErrorMessage(error.message || 'Une erreur est survenue lors de l\'inscription');
      }
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
          Inscription réussie !
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Votre compte producteur a été créé avec succès dans le répertoire MIF Market.
        </p>
        <div className="bg-gradient-to-r from-[#1E88C7]/10 to-[#ED2939]/10 border-2 border-[#F5C542] rounded-lg p-5 mb-6">
          <p className="text-[#002654] font-bold text-lg mb-3 text-center">
            Prochaines étapes
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-[#1E88C7] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                Connectez-vous à votre <strong>espace producteur</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#ED2939] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                Complétez et gérez votre <strong>fiche producteur</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#F5C542] font-bold">•</span>
              <p className="text-gray-700 text-sm">
                Apparaissez dans le <strong>répertoire public</strong>
              </p>
            </div>
          </div>
        </div>
        <a
          href="/producer/login"
          className="inline-block bg-[#1E88C7] hover:bg-[#002654] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Me connecter
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
      <div className="mb-8 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-[#002654] mb-2">
          Inscription Producteur
        </h3>
        <p className="text-gray-600">
          Créez votre compte et rejoignez le répertoire national MIF Market
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
          <label htmlFor="company_name" className="block text-sm font-semibold text-[#002654] mb-2">
            Nom de l'entreprise <span className="text-[#ED2939]">*</span>
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="contact_name" className="block text-sm font-semibold text-[#002654] mb-2">
            Nom du contact <span className="text-[#ED2939]">*</span>
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
          />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#002654] mb-2">
              Mot de passe <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password_confirm" className="block text-sm font-semibold text-[#002654] mb-2">
              Confirmer le mot de passe <span className="text-[#ED2939]">*</span>
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-[#002654] mb-2">
            Adresse
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="postal_code" className="block text-sm font-semibold text-[#002654] mb-2">
              Code postal
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-[#002654] mb-2">
              Ville
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
            />
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent bg-white"
            >
              <option value="">Sélectionnez</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#002654] mb-2">
            Catégories de produits <span className="text-[#ED2939]">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {productCategories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.categories.includes(category)
                    ? 'bg-[#002654] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="products" className="block text-sm font-semibold text-[#002654] mb-2">
            Produits (séparés par des virgules)
          </label>
          <input
            type="text"
            id="products"
            name="products"
            value={formData.products}
            onChange={handleChange}
            placeholder="Ex: Tomates, Courgettes, Salades"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-[#002654] mb-2">
            Description de votre activité
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-[#002654] mb-2">
            Site web
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002654] focus:border-transparent"
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
            'Créer mon compte producteur'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour votre référencement dans le répertoire MIF Market.
        </p>
      </div>
    </form>
  );
}
