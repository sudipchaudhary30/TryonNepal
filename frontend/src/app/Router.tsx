import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from '@/pages/Home';
import TryOn from '@/pages/TryOn';
import Wardrobe from '@/pages/Wardrobe';
import Community from '@/pages/Community';
import Showroom from '@/pages/Showroom';
import Profile from '@/pages/Profile';
import Design from '@/pages/Design';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tryon" element={<TryOn />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/design" element={<Design />} />
        <Route path="/community" element={<Community />} />
        <Route path="/showroom" element={<Showroom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
