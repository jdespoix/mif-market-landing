import { Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('https://raw.githubusercontent.com/jdespoix/mif-market-landing/main/public/LogoMifMarket2025.jpg');

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'logo_url')
        .maybeSingle();

      if (data?.value) {
        setLogoUrl(data.value);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  };

  return (
    <footer className="bg-[#002654] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <img
              src={logoUrl}
              alt="MIF Market Logo"
              className="h-24 w-auto mb-4"
            />
            <p className="text-blue-100 leading-relaxed mb-3">
              La marketplace 100% Made in France dédiée aux produits alimentaires français de qualité.
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-[#1E88C7] font-semibold">
                Beta : T1 2026
              </p>
              <p className="text-[#F5C542] font-semibold">
                Lancement officiel : T2 2026
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Liens utiles</h4>
            <ul className="space-y-2 text-blue-100">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#F5C542] transition-colors text-left">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/directory')} className="hover:text-[#F5C542] transition-colors text-left">
                  Répertoire des producteurs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-[#F5C542] transition-colors text-left">
                  Accès Producteur
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-[#F5C542] transition-colors">
                  Charte du producteur
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@mifmarket.fr" className="hover:text-[#F5C542] transition-colors">
                  contact@mifmarket.fr
                </a>
              </div>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1E88C7] transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1E88C7] transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1E88C7] transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 text-center">
          <p className="text-blue-100 text-sm">
            © {currentYear} MIF Market. Tous droits réservés. 100% Made in France.
          </p>
          <p className="text-[#1E88C7] text-xs mt-2">
            Projet en cours de développement - Beta prévue T1 2026 - Lancement officiel T2 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
