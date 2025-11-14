import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Users, Eye, EyeOff, LogOut, Trash2, Mail, Upload, Send, Plus, Edit, Ban, Shield, Settings } from 'lucide-react';

interface Producer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  is_visible: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface Stats {
  totalProducers: number;
  visibleProducers: number;
  hiddenProducers: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProducers: 0,
    visibleProducers: 0,
    hiddenProducers: 0,
  });
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    postal_code: '',
    city: '',
    region: '',
    description: '',
    website: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      await supabase.auth.signOut();
      navigate('/login');
      return;
    }

    setUser(user);
    setUserRole(roleData.role);
    loadProducers();
  };

  const loadProducers = async () => {
    try {
      const { data, error } = await supabase
        .from('producers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducers(data || []);

      const stats = {
        totalProducers: data?.length || 0,
        visibleProducers: data?.filter(p => p.is_visible).length || 0,
        hiddenProducers: data?.filter(p => !p.is_visible).length || 0,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading producers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('producers')
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      loadProducers();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('producers')
        .update({ is_blocked: !currentBlocked })
        .eq('id', id);

      if (error) throw error;

      loadProducers();
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const deleteProducer = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce producteur ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('producers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadProducers();
    } catch (error) {
      console.error('Error deleting producer:', error);
    }
  };

  const handleEditProducer = (producer: Producer) => {
    setEditingProducer(producer);
    setFormData({
      company_name: producer.company_name,
      contact_name: producer.contact_name || '',
      email: producer.email,
      phone: producer.phone || '',
      address: '',
      postal_code: '',
      city: producer.city || '',
      region: producer.region || '',
      description: '',
      website: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProducer) {
        const { error } = await supabase
          .from('producers')
          .update({
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            region: formData.region,
          })
          .eq('id', editingProducer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('producers')
          .insert({
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            postal_code: formData.postal_code,
            city: formData.city,
            region: formData.region,
            description: formData.description,
            website: formData.website,
            is_visible: false,
          });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingProducer(null);
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        postal_code: '',
        city: '',
        region: '',
        description: '',
        website: '',
      });
      loadProducers();
    } catch (error) {
      console.error('Error saving producer:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-[#002654]">Administration Répertoire Producteurs</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-[#ED2939] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
          <p className="text-gray-600">Vue d'ensemble des inscriptions de producteurs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {userRole === 'super_admin' && (
            <button
              onClick={() => navigate('/admin/admins')}
              className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
            >
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Administrateurs</h3>
                <p className="text-sm text-gray-600">Gérer les admins</p>
              </div>
            </button>
          )}
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="p-3 bg-slate-100 rounded-lg">
              <Settings className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Paramètres</h3>
              <p className="text-sm text-gray-600">Logo et configuration</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/templates')}
            className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Modèles d'emails</h3>
              <p className="text-sm text-gray-600">Gérer les templates</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/campaigns')}
            className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Campagnes</h3>
              <p className="text-sm text-gray-600">Créer et suivre les envois</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/import')}
            className="flex items-center gap-4 bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="p-3 bg-amber-100 rounded-lg">
              <Upload className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Import de données</h3>
              <p className="text-sm text-gray-600">CSV / Google Sheets</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalProducers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total producteurs</h3>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.visibleProducers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Visibles</h3>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <EyeOff className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.hiddenProducers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Masqués</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Liste des producteurs</h3>
            <button
              onClick={() => {
                setEditingProducer(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-[#002654] text-white px-4 py-2 rounded-lg hover:bg-[#003875] transition-colors"
            >
              <Plus size={18} />
              Ajouter un producteur
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {producers.map((producer) => (
                  <tr key={producer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{producer.company_name}</div>
                      <div className="text-sm text-gray-500">{producer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{producer.contact_name || '-'}</div>
                      <div className="text-sm text-gray-500">{producer.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{producer.city || '-'}</div>
                      <div className="text-sm text-gray-500">{producer.region || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {producer.is_visible ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Visible
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Masqué
                          </span>
                        )}
                        {producer.is_blocked && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Bloqué
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProducer(producer)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => toggleVisibility(producer.id, producer.is_visible)}
                          className="text-[#1E88C7] hover:text-[#002654] transition-colors"
                          title={producer.is_visible ? 'Masquer' : 'Afficher'}
                        >
                          {producer.is_visible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => toggleBlock(producer.id, producer.is_blocked)}
                          className="text-orange-600 hover:text-orange-800 transition-colors"
                          title={producer.is_blocked ? 'Débloquer' : 'Bloquer'}
                        >
                          <Ban size={18} />
                        </button>
                        <button
                          onClick={() => deleteProducer(producer.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {producers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun producteur inscrit</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProducer ? 'Modifier le producteur' : 'Ajouter un producteur'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
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
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProducer(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#002654] text-white rounded-lg hover:bg-[#003875] transition-colors"
                >
                  {editingProducer ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
