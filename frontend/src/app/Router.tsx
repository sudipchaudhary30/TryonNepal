import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from '@/pages/Home';
import TryOn from '@/pages/TryOn';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tryon" element={<TryOn />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
