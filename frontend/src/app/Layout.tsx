import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#8B5CF6] selection:text-white font-sans">
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
