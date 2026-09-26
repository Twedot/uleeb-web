import { Navigate, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Hero from './components/Hero';
import MissionBand from './components/MissionBand';
import StickyScroll from './components/StickyScroll';
import ListingParade from './components/ListingParade';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import Login from './pages/Login';
import LoginPhone from './pages/LoginPhone';
import AccountType from './pages/AccountType';
import ProfileSetup from './pages/ProfileSetup';
import LandlordSetup from './pages/LandlordSetup';
import Discover from './pages/Discover';
import Properties from './pages/Properties';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import PropertyDetail from './pages/PropertyDetail';
import MyPropertyDetail from './pages/MyPropertyDetail';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Plans from './pages/Plans';
import Trust from './pages/Trust';
import EditProfile from './pages/EditProfile';
import SavedHomes from './pages/SavedHomes';
import RequestDetail from './pages/RequestDetail';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

function Landing() {
  return (
    <>
      <Nav />
      <Hero />
      <MissionBand />
      <StickyScroll />
      <ListingParade />
      <CTASection />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login-phone" element={<LoginPhone />} />
      <Route
        path="/account-type"
        element={
          <ProtectedRoute>
            <AccountType />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/landlord-setup"
        element={
          <ProtectedRoute>
            <LandlordSetup />
          </ProtectedRoute>
        }
      />
      {/* Old placeholder route — anything still pointing at /home lands on
          the real app shell instead of a 404. */}
      <Route path="/home" element={<Navigate to="/profile" replace />} />

      <Route
        path="/property/:id"
        element={
          <ProtectedRoute>
            <PropertyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-properties/:id"
        element={
          <ProtectedRoute>
            <MyPropertyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-property"
        element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-properties/:id/edit"
        element={
          <ProtectedRoute>
            <EditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <Plans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trust"
        element={
          <ProtectedRoute>
            <Trust />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-homes"
        element={
          <ProtectedRoute>
            <SavedHomes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute>
            <RequestDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/discover" element={<Discover />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
