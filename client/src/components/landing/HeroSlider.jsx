import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const IMAGES = [
  '/images/campus-a.jpg',
  '/images/campus-d.jpg',
  '/images/campus-denver.jpg'
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 5000); // Change l'image toutes les 5 secondes
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Images Slider */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{ 
              backgroundImage: `url(${IMAGES[currentIndex]})`,
              // Le scale-105 évite les bords blancs pendant le crossfade
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Overlay (50% opacity as requested) */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto pt-20">
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
        >
          Réussir à l'IUC grâce à <span className="text-iuc-green">l'IA</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl font-light"
        >
          Accédez aux sujets officiels et bénéficiez du tuteur IA pour exceller dans vos études.
        </motion.p>
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link 
            to="/register"
            className="bg-iuc-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all shadow-[0_0_20px_rgba(196,30,42,0.4)] hover:shadow-[0_0_30px_rgba(196,30,42,0.6)] flex items-center justify-center gap-2 group"
          >
            Explorer maintenant
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <a 
            href="#features"
            className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-lg text-lg border-2 border-white/30 hover:border-white transition-all flex items-center justify-center"
          >
            Découvrir plus
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 text-gray-400 italic text-sm md:text-base tracking-widest uppercase"
        >
          "IUC forme l'homme dans sa globalité"
        </motion.div>
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
        {IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              idx === currentIndex 
                ? 'w-8 bg-iuc-red' 
                : 'w-4 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
