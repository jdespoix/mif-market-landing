import { useState, useEffect } from 'react';
import { Search, MapPin, Package, Globe, Phone, Mail, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

interface Producer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  products: string[];
  categories: string[];
  description: string;
  website: string;
  logo_url: string;
}

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const regions = [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
    'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
    'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
    'Pays de la Loire', "Provence-Alpes-Côte d'Azur"
  ];

  const categories = [
    'Fruits et Légumes', 'Viandes et Charcuteries', 'Produits Laitiers',
    'Boulangerie et Pâtisserie', 'Boissons', 'Épicerie Fine',
    'Poissons et Fruits de Mer', 'Miel et Produits de la Ruche'
  ];

  useEffect(() => {
    fetchProducers();
  }, []);

  useEffect(() => {
    filterProducers();
  }, [searchTerm, selectedRegion, selectedCategory, producers]);

  const fetchProducers = async () => {
    try {
      const { data, error } = await supabase
        .from('producers')
        .select('*')
        .eq('is_visible', true)
        .order('company_name');

      if (error) throw error;
      setProducers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des producteurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducers = () => {
    let filtered = [...producers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.company_name?.toLowerCase().includes(term) ||
        p.products?.some(prod => prod.toLowerCase().includes(term)) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter(p => p.region === selectedRegion);
    }

    if (selectedCategory) {
      filtered = filtered.filter(p =>
        p.categories?.includes(selectedCategory)
      );
    }

    setFilteredProducers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002654] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du répertoire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#002654] to-[#1E88C7] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-colors"
          >
            <Home size={18} />
            <span className="text-sm font-medium">Retour à l'accueil</span>
          </button>
          <h1 className="text-4xl font-bold mb-4">Répertoire des Producteurs</h1>
          <p className="text-xl text-white/90">Découvrez nos producteurs locaux engagés</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, produit, description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              >
                <option value="">Toutes les régions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedRegion || selectedCategory) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-[#1E88C7] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-[#002654]">{filteredProducers.length}</span> producteur(s) trouvé(s)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducers.map((producer) => (
            <div
              key={producer.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {producer.logo_url && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={producer.logo_url}
                    alt={producer.company_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002654] mb-2">
                  {producer.company_name}
                </h3>

                {producer.contact_name && (
                  <p className="text-gray-600 text-sm mb-3">
                    Contact: {producer.contact_name}
                  </p>
                )}

                {producer.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {producer.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {producer.city && producer.region && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-[#1E88C7]" />
                      <span>{producer.city}, {producer.region}</span>
                    </div>
                  )}

                  {producer.products && producer.products.length > 0 && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Package size={16} className="mr-2 mt-0.5 flex-shrink-0 text-[#1E88C7]" />
                      <span className="line-clamp-2">{producer.products.join(', ')}</span>
                    </div>
                  )}
                </div>

                {producer.categories && producer.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {producer.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#002654]/10 text-[#002654] text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {producer.phone && (
                    <a
                      href={`tel:${producer.phone}`}
                      className="flex items-center text-sm text-gray-600 hover:text-[#1E88C7] transition-colors"
                    >
                      <Phone size={16} className="mr-2" />
                      {producer.phone}
                    </a>
                  )}

                  {producer.email && (
                    <a
                      href={`mailto:${producer.email}`}
                      className="flex items-center text-sm text-gray-600 hover:text-[#1E88C7] transition-colors"
                    >
                      <Mail size={16} className="mr-2" />
                      {producer.email}
                    </a>
                  )}

                  {producer.website && (
                    <a
                      href={producer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-[#1E88C7] hover:underline"
                    >
                      <Globe size={16} className="mr-2" />
                      Visiter le site
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducers.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun producteur trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
