import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-iuc-dark border-t border-white/10 pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {currentYear} Institut Universitaire de la Côte. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            Fait avec <span className="text-iuc-red">♥</span> pour les étudiants de l'IUC
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
