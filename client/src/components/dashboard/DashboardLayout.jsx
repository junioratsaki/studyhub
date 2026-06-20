import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavMobile from '../shared/NavMobile';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-iuc-dark text-white flex">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Navigation Mobile */}
      <NavMobile />
    </div>
  );
};

export default DashboardLayout;
