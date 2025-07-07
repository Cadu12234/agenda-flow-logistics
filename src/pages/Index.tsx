
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import SchedulingSystem from '@/components/SchedulingSystem';
import ApprovalDashboard from '@/components/ApprovalDashboard';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { isAuthenticated, userProfile } = useAuth();

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <Hero setActiveSection={setActiveSection} />;
      case 'schedule':
        return <SchedulingSystem />;
      case 'dashboard':
        // Only admin users can access dashboard
        return userProfile?.is_admin ? <ApprovalDashboard /> : <Hero setActiveSection={setActiveSection} />;
      default:
        return <Hero setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="pt-16">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default Index;
