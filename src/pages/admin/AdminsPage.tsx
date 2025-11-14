import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Shield, Plus, Trash2, LogOut, ArrowLeft, AlertCircle } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

export default function AdminsPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
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

    if (!roleData || roleData.role !== 'super_admin') {
      navigate('/admin/dashboard');
      return;
    }

    setCurrentUserRole(roleData.role);
    loadAdmins();
  };

  const loadAdmins = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      const adminsList: Admin[] = [];
      for (const role of rolesData || []) {
        const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
        if (userData.user) {
          adminsList.push({
            id: role.user_id,
            email: userData.user.email || '',
            role: role.role as 'admin' | 'super_admin',
            created_at: role.created_at,
          });
        }
      }

      setAdmins(adminsList);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
            role: formData.role,
          });

        if (roleError) throw roleError;

        alert('Administrateur créé avec succès');
        setShowModal(false);
        setFormData({ email: '', password: '', role: 'admin' });
        loadAdmins();
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      alert('Erreur lors de la création: ' + error.message);
    }
  };

  const handleDelete = async (adminId: string, adminEmail: string) => {
    if (adminEmail === 'jdespoix@gmail.com') {
      alert('Impossible de supprimer le super administrateur principal');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet administrateur ?`)) {
      return;
    }

    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', adminId);

      if (roleError) throw roleError;

      const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
      if (authError) throw authError;

      loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Erreur lors de la suppression');
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
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 hover:text-[#002654] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-[#002654]">Gestion des administrateurs</h1>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Administrateurs</h2>
            <p className="text-gray-600">Gérez les accès administrateurs du système</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#002654] text-white px-6 py-3 rounded-lg hover:bg-[#003875] transition-colors"
          >
            <Plus size={20} />
            Ajouter un admin
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                      {admin.email === 'jdespoix@gmail.com' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Protégé
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.role === 'super_admin' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Super Admin
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {admin.email !== 'jdespoix@gmail.com' && (
                      <button
                        onClick={() => handleDelete(admin.id, admin.email)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="text-center py-12">
              <Shield size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun administrateur</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Note importante:</p>
              <p>Le compte super administrateur (jdespoix@gmail.com) ne peut pas être supprimé. Il s'agit d'une protection système.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Ajouter un administrateur</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                >
                  <option value="admin">Administrateur</option>
                  <option value="super_admin">Super Administrateur</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ email: '', password: '', role: 'admin' });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#002654] text-white rounded-lg hover:bg-[#003875] transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
