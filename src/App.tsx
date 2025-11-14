import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DirectoryPage from './pages/DirectoryPage';
import UnifiedLoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import TemplatesPage from './pages/admin/TemplatesPage';
import CampaignsPage from './pages/admin/CampaignsPage';
import CreateCampaignPage from './pages/admin/CreateCampaignPage';
import ImportPage from './pages/admin/ImportPage';
import AdminsPage from './pages/admin/AdminsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ResetPasswordPage from './pages/admin/ResetPasswordPage';
import ProducerProfilePage from './pages/producer/ProducerProfilePage';
import ProducerForgotPasswordPage from './pages/producer/ProducerForgotPasswordPage';
import ProducerResetPasswordPage from './pages/producer/ProducerResetPasswordPage';
import QuickPasswordResetPage from './pages/admin/QuickPasswordResetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/login" element={<UnifiedLoginPage />} />
        <Route path="/admin/login" element={<UnifiedLoginPage />} />
        <Route path="/producer/login" element={<UnifiedLoginPage />} />
        <Route path="/emergency-reset" element={<QuickPasswordResetPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/templates" element={<TemplatesPage />} />
        <Route path="/admin/campaigns" element={<CampaignsPage />} />
        <Route path="/admin/campaigns/create" element={<CreateCampaignPage />} />
        <Route path="/admin/import" element={<ImportPage />} />
        <Route path="/admin/admins" element={<AdminsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/quick-reset" element={<QuickPasswordResetPage />} />
        <Route path="/producer/profile" element={<ProducerProfilePage />} />
        <Route path="/producer/forgot-password" element={<ProducerForgotPasswordPage />} />
        <Route path="/producer/reset-password" element={<ProducerResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
