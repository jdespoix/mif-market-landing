import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Send, Plus, Calendar, CheckCircle, XCircle, Clock, LogOut, ArrowLeft, Users } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  template?: {
    name: string;
    subject: string;
  };
}

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

    loadCampaigns();
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          template:email_templates(name, subject)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: Clock },
      scheduled: { label: 'Programmé', color: 'bg-blue-100 text-blue-800', icon: Calendar },
      sending: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: Send },
      sent: { label: 'Envoyé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
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
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 hover:text-[#002654] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[#002654]">Campagnes Email</h1>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des campagnes</h2>
            <p className="text-gray-600">Créez et suivez vos campagnes d'emailing</p>
          </div>
          <button
            onClick={() => navigate('/admin/campaigns/create')}
            className="flex items-center gap-2 bg-[#002654] text-white px-6 py-3 rounded-lg hover:bg-[#003875] transition-colors"
          >
            <Plus size={20} />
            Nouvelle campagne
          </button>
        </div>

        <div className="space-y-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    {campaign.description && (
                      <p className="text-gray-600 mb-3">{campaign.description}</p>
                    )}
                    {campaign.template && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Modèle:</span> {campaign.template.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Destinataires</div>
                      <div className="text-lg font-semibold text-gray-800">{campaign.total_recipients}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Envoyés</div>
                      <div className="text-lg font-semibold text-gray-800">{campaign.sent_count}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Échecs</div>
                      <div className="text-lg font-semibold text-gray-800">{campaign.failed_count}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        {campaign.sent_at ? 'Envoyé le' : campaign.scheduled_at ? 'Programmé' : 'Créé le'}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {campaign.sent_at
                          ? new Date(campaign.sent_at).toLocaleDateString('fr-FR')
                          : campaign.scheduled_at
                          ? new Date(campaign.scheduled_at).toLocaleDateString('fr-FR')
                          : new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Send size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Aucune campagne créée</p>
            <button
              onClick={() => navigate('/admin/campaigns/create')}
              className="text-[#1E88C7] hover:text-[#002654] transition-colors"
            >
              Créer votre première campagne
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
