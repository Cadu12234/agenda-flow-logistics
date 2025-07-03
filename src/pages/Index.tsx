
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import SchedulingSystem from '@/components/SchedulingSystem';
import ApprovalDashboard from '@/components/ApprovalDashboard';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <Hero />;
      case 'schedule':
        return <SchedulingSystem />;
      case 'dashboard':
        return <ApprovalDashboard />;
      default:
        return <Hero />;
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
