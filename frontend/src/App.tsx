import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import GameDetail from './pages/GameDetail';
import Wishlist from './pages/Wishlist';
import Community from './pages/Community';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Affiliates from './pages/Affiliates';
import NexAi from './pages/NexAi';

export default function App() {
  return (
    <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/community" element={<Community />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/ai" element={<NexAi />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}