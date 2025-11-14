import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Users, MapPin, Tag } from 'lucide-react';

export default function StatsSection() {
  const [producerCount, setProducerCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('producers')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setProducerCount(count);
      }
    };

    fetchCount();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-[#002654] to-[#1E88C7] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-[#F5C542] font-semibold text-xs tracking-wide">EN AVANT-PREMIÈRE</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Une communauté qui grandit chaque jour
          </h2>
          <p className="text-blue-100 mb-2">
            Rejoignez les producteurs pionniers qui préparent la beta
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <span className="px-3 py-1 bg-[#F5C542] text-[#002654] font-bold rounded-full">
              Beta T1 2026
            </span>
            <span className="px-3 py-1 bg-white/20 text-white font-bold rounded-full">
              Lancement T2 2026
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-16 h-16 bg-[#ED2939] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold mb-2 text-[#F5C542]">{producerCount}+</div>
            <p className="text-blue-100">Producteurs référencés</p>
          </div>

          <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-16 h-16 bg-[#1E88C7] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold mb-2 text-[#F5C542]">18</div>
            <p className="text-blue-100">Régions couvertes</p>
          </div>

          <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-16 h-16 bg-[#ED2939] rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl font-bold mb-2 text-[#F5C542]">25+</div>
            <p className="text-blue-100">Catégories de produits</p>
          </div>
        </div>
      </div>
    </section>
  );
}
