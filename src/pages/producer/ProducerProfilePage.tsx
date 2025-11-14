import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Save, LogOut, Eye, EyeOff } from 'lucide-react';
import { regions, productCategories } from '../../data/formOptions';

interface ProducerProfile {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  region: string;
  products: string[];
  categories: string[];
  description: string;
  website: string;
  logo_url: string;
  is_visible: boolean;
}

export default function ProducerProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<ProducerProfile | null>(null);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!roleData || roleData.role !== 'producer') {
        navigate('/login');
        return;
      }

      const { data: producerData, error } = await supabase
        .from('producers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (producerData) {
        setProfile(producerData);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('producers')
        .update({
          company_name: profile.company_name,
          contact_name: profile.contact_name,
          phone: profile.phone,
          address: profile.address,
          postal_code: profile.postal_code,
          city: profile.city,
          region: profile.region,
          products: profile.products,
          categories: profile.categories,
          description: profile.description,
          website: profile.website,
          logo_url: profile.logo_url,
          is_visible: profile.is_visible,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/producer/login', { replace: true });
  };

  const handleProductsChange = (value: string) => {
    const productsArray = value.split(',').map(p => p.trim()).filter(p => p);
    setProfile(profile ? { ...profile, products: productsArray } : null);
  };

  const toggleCategory = (category: string) => {
    if (!profile) return;

    const categories = profile.categories || [];
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];

    setProfile({ ...profile, categories: newCategories });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002654] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profil introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#002654] to-[#1E88C7] text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mon Profil Producteur</h1>
            <p className="text-white/90 mt-1">{profile.company_name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-xl font-bold text-[#002654]">Informations de l'entreprise</h2>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, is_visible: !profile.is_visible })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                profile.is_visible
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {profile.is_visible ? <Eye size={20} /> : <EyeOff size={20} />}
              <span>{profile.is_visible ? 'Visible' : 'Masqué'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact
              </label>
              <input
                type="text"
                value={profile.contact_name || ''}
                onChange={(e) => setProfile({ ...profile, contact_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={profile.postal_code || ''}
                onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <select
                value={profile.region || ''}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              >
                <option value="">Sélectionnez une région</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégories de produits
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {productCategories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    profile.categories?.includes(category)
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produits (séparés par des virgules)
            </label>
            <input
              type="text"
              value={profile.products?.join(', ') || ''}
              onChange={(e) => handleProductsChange(e.target.value)}
              placeholder="Ex: Tomates, Courgettes, Salades"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description de votre activité
            </label>
            <textarea
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du logo
              </label>
              <input
                type="url"
                value={profile.logo_url || ''}
                onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/directory')}
              className="text-[#1E88C7] hover:underline"
            >
              Voir le répertoire
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#ED2939] hover:bg-[#c91f2f] text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
