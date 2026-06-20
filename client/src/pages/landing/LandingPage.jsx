import Header from '../../components/shared/Header';
import HeroSlider from '../../components/landing/HeroSlider';
import FeaturesSection from '../../components/landing/FeaturesSection';
import Footer from '../../components/shared/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-iuc-dark text-white font-sans selection:bg-iuc-red/30 selection:text-white">
      <Header />
      
      <main>
        <HeroSlider />
        <FeaturesSection />
        
        {/* About Section - Brief intro */}
        <section id="about" className="py-24 bg-iuc-gray border-t border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img 
                    src="/images/campus-denver.jpg" 
                    alt="Campus IUC" 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-iuc-dark/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="font-bold text-xl">Campus Logbessou</p>
                    <p className="text-gray-300 text-sm">Pôle d'Excellence</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  L'Innovation Pédagogique au Service de Votre Avenir
                </h2>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  L'Institut Universitaire de la Côte s'engage à fournir une éducation de qualité supérieure. Avec StudyHub, nous franchissons une nouvelle étape en intégrant l'Intelligence Artificielle pour accompagner nos étudiants de manière personnalisée.
                </p>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Que vous soyez en classe préparatoire, en cycle ingénieur ou en BTS, notre plateforme centralise toutes les ressources dont vous avez besoin pour exceller.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-2 border-iuc-red pl-4">
                    <h4 className="text-2xl font-bold text-white">10k+</h4>
                    <p className="text-gray-500 text-sm">Sujets disponibles</p>
                  </div>
                  <div className="border-l-2 border-iuc-green pl-4">
                    <h4 className="text-2xl font-bold text-white">24/7</h4>
                    <p className="text-gray-500 text-sm">Disponibilité de l'IA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
