import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Truck, Calendar, CheckCircle, Menu, X, User, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}
const Navigation = ({
  activeSection,
  setActiveSection
}: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userProfile,
    logout
  } = useAuth();
  const navItems = [{
    id: 'home',
    label: 'Início',
    icon: Truck,
    path: '/'
  }, {
    id: 'schedule',
    label: 'Agendar',
    icon: Calendar,
    path: '/#schedule'
  }, ...(userProfile?.is_admin ? [{
    id: 'dashboard',
    label: 'Painel',
    icon: CheckCircle,
    path: '/#dashboard'
  }, {
    id: 'reports',
    label: 'Relatórios',
    icon: BarChart3,
    path: '/reports'
  }] : [])];
  const handleNavigation = (item: any) => {
    if (item.path.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        setActiveSection(item.id);
      }, 100);
    } else {
      navigate(item.path);
    }
  };
  const handleLogout = async () => {
    await logout();
    navigate('/');
    setActiveSection('home');
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-red-600 text-sm">Agendamento 3M Itapetininga</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || item.id === activeSection && location.pathname === '/';
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} onClick={() => handleNavigation(item)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>;
          })}
            
            {/* User Info */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{userProfile?.email}</span>
                {userProfile?.is_admin && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Admin</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || item.id === activeSection && location.pathname === '/';
            return <Button key={item.id} variant={isActive ? "default" : "ghost"} onClick={() => {
              handleNavigation(item);
              setIsMenuOpen(false);
            }} className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 justify-start ${isActive ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>;
          })}
              
              {/* Mobile User Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{userProfile?.email}</span>
                  {userProfile?.is_admin && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Admin</span>}
                </div>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navigation;