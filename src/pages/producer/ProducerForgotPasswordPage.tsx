import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProducerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResetLink('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-reset-link`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/producer/reset-password`,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la génération du lien');
      }

      setResetLink(data.resetLink);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002654] to-[#1E88C7] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#002654] mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">Espace Producteur MIF Market</p>
        </div>

        {resetLink ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold mb-2">Lien de réinitialisation généré !</p>
              <p className="text-sm mb-3">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            </div>
            <a
              href={resetLink}
              className="block w-full bg-[#ED2939] hover:bg-[#c91f2f] text-white py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Réinitialiser mon mot de passe
            </a>
            <button
              onClick={() => navigate('/producer/login')}
              className="w-full bg-[#1E88C7] hover:bg-[#1674a8] text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88C7] focus:border-transparent"
                placeholder="votre@email.fr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ED2939] hover:bg-[#c91f2f] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/producer/login')}
            className="text-[#1E88C7] hover:underline text-sm"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
