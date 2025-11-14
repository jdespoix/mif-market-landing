import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { LogOut, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: string;
  updated_at: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    loadSettings();
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'logo_url')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLogoUrl(data.value);
        setPreviewUrl(data.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier doit faire moins de 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          value: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('key', 'logo_url');

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      alert('Logo mis à jour avec succès');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Erreur lors du téléversement du logo');
      setPreviewUrl(logoUrl);
    } finally {
      setUploading(false);
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
              <h1 className="text-xl font-bold text-[#002654]">Paramètres du site</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#002654] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au tableau de bord
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Logo du site</h3>
            <p className="text-sm text-gray-600 mt-1">Gérer le logo affiché sur le site public</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Logo actuel
                </label>
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 flex items-center justify-center min-h-[200px]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo"
                      className="max-h-40 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Aucun logo</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full max-w-md">
                <label
                  htmlFor="logo-upload"
                  className={`
                    flex items-center justify-center gap-3 w-full px-6 py-4
                    border-2 border-dashed border-gray-300 rounded-lg
                    cursor-pointer hover:border-[#1E88C7] hover:bg-blue-50
                    transition-all duration-200
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Téléversement en cours...' : 'Choisir un nouveau logo'}
                  </span>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPG, PNG ou WEBP. Maximum 5 MB.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">URL du logo</h4>
              <input
                type="text"
                value={logoUrl}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
