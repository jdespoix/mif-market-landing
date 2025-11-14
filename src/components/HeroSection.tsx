import { ChevronDown, LogIn, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

interface HeroSectionProps {
  onScrollToForm: () => void;
}

export default function HeroSection({ onScrollToForm }: HeroSectionProps) {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('/LogoMifMarket2025.jpg');

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
    <section className="relative bg-gradient-to-br from-[#002654] via-[#003875] to-[#1E88C7] text-white py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#ED2939] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1E88C7] rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => navigate('/directory')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-colors"
          >
            <Users size={18} />
            <span className="text-sm font-medium">Répertoire</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-colors"
          >
            <LogIn size={18} />
            <span className="text-sm font-medium">Accès Producteur</span>
          </button>
        </div>

        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <img
              src={logoUrl}
              alt="MIF Market Logo"
              className="h-32 md:h-40 w-auto"
            />
          </div>

          <div className="inline-block mb-6 px-5 py-2 bg-gradient-to-r from-[#ED2939] to-[#F5C542] rounded-full shadow-lg">
            <span className="text-white font-bold text-sm tracking-wide">100% MADE IN FRANCE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Répertoire National des<br />
            <span className="text-[#ED2939]">Producteurs Français</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
            Référencez votre savoir-faire, gratuitement, dans la base nationale MIF Market
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-[#F5C542]/50">
              <p className="text-[#F5C542] font-bold text-sm">
                Beta : T1 2026
              </p>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <p className="text-white font-bold text-sm">
                Lancement officiel : T2 2026
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={onScrollToForm}
              className="group bg-[#ED2939] hover:bg-[#c91f2f] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              Je rejoins l'aventure MIF Market
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1E88C7] rounded-full"></div>
              <span>Visibilité nationale</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1E88C7] rounded-full"></div>
              <span>Classement par région</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1E88C7] rounded-full"></div>
              <span>3 mois offerts à l'ouverture</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
