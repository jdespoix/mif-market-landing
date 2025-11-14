import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Upload, FileText, Download, AlertCircle, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';

interface ImportHistory {
  id: string;
  filename: string;
  source: 'csv' | 'google_sheets';
  total_rows: number;
  imported_rows: number;
  failed_rows: number;
  created_at: string;
}

export default function ImportPage() {
  const navigate = useNavigate();
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

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

    loadImportHistory();
  };

  const loadImportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setImportHistory(data || []);
    } catch (error) {
      console.error('Error loading import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSVPreview(selectedFile);
    } else {
      alert('Veuillez sélectionner un fichier CSV valide');
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      setPreviewData(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        let importedCount = 0;
        let failedCount = 0;
        const errors: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          try {
            const { error } = await supabase
              .from('producers')
              .insert({
                company_name: row.company_name || row.entreprise || 'Non spécifié',
                contact_name: row.contact_name || row.contact || '',
                email: row.email || row.mail || '',
                phone: row.phone || row.telephone || '',
                address: row.address || row.adresse || '',
                postal_code: row.postal_code || row.code_postal || '',
                city: row.city || row.ville || '',
                region: row.region || '',
                description: row.description || '',
                website: row.website || row.site_web || '',
                is_visible: false,
              });

            if (error) {
              failedCount++;
              errors.push({ line: i + 1, error: error.message });
            } else {
              importedCount++;
            }
          } catch (err: any) {
            failedCount++;
            errors.push({ line: i + 1, error: err.message });
          }
        }

        await supabase.from('import_history').insert({
          filename: file.name,
          source: 'csv',
          total_rows: lines.length - 1,
          imported_rows: importedCount,
          failed_rows: failedCount,
          errors: errors,
          imported_by: user?.id,
        });

        alert(`Import terminé: ${importedCount} réussis, ${failedCount} échecs`);
        setFile(null);
        setPreviewData([]);
        loadImportHistory();
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Erreur lors de l\'import du fichier');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'company_name,contact_name,email,phone,address,postal_code,city,region,description,website\n' +
      'Exemple SARL,Jean Dupont,contact@exemple.fr,0123456789,123 rue exemple,75001,Paris,Ile-de-France,Description de l\'activité,https://exemple.fr';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_producteurs.csv';
    a.click();
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
              <h1 className="text-xl font-bold text-[#002654]">Import de données</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Importer des producteurs</h2>

              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-[#1E88C7] hover:text-[#002654] transition-colors"
                >
                  <Download size={18} />
                  Télécharger le modèle CSV
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 bg-[#002654] text-white px-6 py-3 rounded-lg hover:bg-[#003875] transition-colors"
                >
                  <FileText size={20} />
                  Sélectionner un fichier CSV
                </label>
                {file && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Fichier sélectionné:</p>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  </div>
                )}
              </div>

              {previewData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Aperçu des données</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-3 py-2 text-gray-800">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="mt-4 w-full bg-[#ED2939] text-white px-6 py-3 rounded-lg hover:bg-[#c91f2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? 'Import en cours...' : 'Lancer l\'import'}
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Colonnes attendues:</p>
                    <p>company_name, contact_name, email, phone, address, postal_code, city, region, description, website</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Historique des imports</h2>
              <div className="space-y-4">
                {importHistory.map((history) => (
                  <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-800">{history.filename}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(history.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-lg font-semibold text-gray-800">{history.total_rows}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle size={12} />
                          Réussis
                        </div>
                        <div className="text-lg font-semibold text-green-600">{history.imported_rows}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle size={12} />
                          Échecs
                        </div>
                        <div className="text-lg font-semibold text-red-600">{history.failed_rows}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {importHistory.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucun import effectué</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
