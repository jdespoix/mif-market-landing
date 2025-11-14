import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { ArrowLeft, LogOut, Users, Mail, Calendar, Send } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface Producer {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
}

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [selectedProducers, setSelectedProducers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    schedule_type: 'immediate',
    scheduled_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    if (!roleData || roleData.role !== 'admin') {
      await supabase.auth.signOut();
      navigate('/login');
      return;
    }

    loadData();
  };

  const loadData = async () => {
    try {
      const [templatesRes, producersRes] = await Promise.all([
        supabase.from('email_templates').select('*').order('name'),
        supabase.from('producers').select('id, email, company_name, contact_name').order('company_name'),
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (producersRes.error) throw producersRes.error;

      setTemplates(templatesRes.data || []);
      setProducers(producersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProducer = (id: string) => {
    setSelectedProducers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProducers(producers.map(p => p.id));
  };

  const deselectAll = () => {
    setSelectedProducers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducers.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!formData.template_id) {
      alert('Veuillez sélectionner un modèle d\'email');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const status = formData.schedule_type === 'immediate' ? 'draft' : 'scheduled';
      const scheduledAt = formData.schedule_type === 'scheduled' ? formData.scheduled_at : null;

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: formData.name,
          description: formData.description,
          template_id: formData.template_id,
          status: status,
          scheduled_at: scheduledAt,
          total_recipients: selectedProducers.length,
          created_by: user?.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const selectedProducersData = producers.filter(p => selectedProducers.includes(p.id));
      const recipients = selectedProducersData.map(producer => ({
        campaign_id: campaign.id,
        producer_id: producer.id,
        email: producer.email,
        company_name: producer.company_name,
        first_name: producer.contact_name || '',
        status: 'pending',
      }));

      const { error: recipientsError } = await supabase
        .from('campaign_recipients')
        .insert(recipients);

      if (recipientsError) throw recipientsError;

      alert('Campagne créée avec succès !');
      navigate('/admin/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Erreur lors de la création de la campagne');
    } finally {
      setSaving(false);
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/campaigns')}
                className="text-gray-600 hover:text-[#002654] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[#002654]">Créer une campagne</h1>
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
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations de la campagne</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la campagne
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                    placeholder="Ex: Newsletter Janvier 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                    placeholder="Description de la campagne"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle d'email
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  >
                    <option value="">Sélectionner un modèle</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.subject}
                      </option>
                    ))}
                  </select>
                  {templates.length === 0 && (
                    <p className="mt-2 text-sm text-red-600">
                      Aucun modèle disponible. Créez-en un d'abord.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Programmation</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="immediate"
                      checked={formData.schedule_type === 'immediate'}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                      className="text-[#1E88C7] focus:ring-[#1E88C7]"
                    />
                    <span className="text-sm text-gray-700">Brouillon (envoi manuel)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="scheduled"
                      checked={formData.schedule_type === 'scheduled'}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                      className="text-[#1E88C7] focus:ring-[#1E88C7]"
                    />
                    <span className="text-sm text-gray-700">Programmer l'envoi</span>
                  </label>
                </div>

                {formData.schedule_type === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure d'envoi
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      required={formData.schedule_type === 'scheduled'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Destinataires</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-[#1E88C7] hover:text-[#002654] transition-colors"
                  >
                    Tout sélectionner
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-sm text-[#1E88C7] hover:text-[#002654] transition-colors"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {producers.map(producer => (
                  <label
                    key={producer.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducers.includes(producer.id)}
                      onChange={() => toggleProducer(producer.id)}
                      className="text-[#1E88C7] focus:ring-[#1E88C7] rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{producer.company_name}</div>
                      <div className="text-xs text-gray-500">{producer.email}</div>
                    </div>
                  </label>
                ))}
              </div>

              {producers.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucun producteur disponible</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Résumé</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Destinataires</div>
                    <div className="text-xl font-bold text-gray-800">{selectedProducers.length}</div>
                  </div>
                </div>

                {formData.template_id && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Mail className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-600">Modèle sélectionné</div>
                      <div className="text-sm font-medium text-gray-800">
                        {templates.find(t => t.id === formData.template_id)?.name}
                      </div>
                    </div>
                  </div>
                )}

                {formData.schedule_type === 'scheduled' && formData.scheduled_at && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Envoi programmé</div>
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(formData.scheduled_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || selectedProducers.length === 0 || !formData.template_id}
                  className="w-full flex items-center justify-center gap-2 bg-[#002654] text-white px-6 py-3 rounded-lg hover:bg-[#003875] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  {saving ? 'Création...' : 'Créer la campagne'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
