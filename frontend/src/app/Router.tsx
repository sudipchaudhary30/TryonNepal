import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from '@/pages/Home';
import TryOn from '@/pages/TryOn';
import Community from '@/pages/Community';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tryon" element={<TryOn />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

// import { Navigate, Route, Routes } from 'react-router-dom';
// import Layout from './Layout';
// import Home from '@/pages/Home';
// import TryOn from '@/pages/TryOn';
// import Community from '@/pages/Community';
// import Login from '@/pages/Login';
// import Register from '@/pages/Register';
// import Profile from '@/pages/Profile';

// export default function Router() {
//   return (
//     <Routes>
//       {/* Pages that get the navbar */}
//       <Route element={<Layout />}>
//         <Route path="/" element={<Home />} />
//         <Route path="/tryon" element={<TryOn />} />
//         <Route path="/community" element={<Community />} />
//         <Route path="/profile" element={<Profile />} />
//       </Route>

//       {/* Pages without the navbar */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }