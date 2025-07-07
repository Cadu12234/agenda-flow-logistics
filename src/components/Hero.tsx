import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
interface HeroProps {
  setActiveSection: (section: string) => void;
}
const Hero = ({
  setActiveSection
}: HeroProps) => {
  return <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20" style={{
      backgroundImage: `url('/lovable-uploads/71d3def1-1b00-4aac-aa00-f732b9b115a6.png')`
    }} />
      
      {/* Logo 3M - moved to top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <img src="/lovable-uploads/3e10f7e1-b8e3-433a-a3ba-3f806662c90e.png" alt="3M Logo" className="h-12 opacity-80" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sistema de Agendamento
            <span className="text-green-400 block">Inteligente</span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"></p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => setActiveSection('schedule')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Entrega
            </Button>
            <Button size="lg" variant="outline" onClick={() => setActiveSection('dashboard')} className="border-2 border-green-400 text-green-400 hover:bg-green-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
              <Users className="mr-2 h-5 w-5" />
              Painel Gestor
            </Button>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Agendamento Fácil</h3>
              <p className="text-gray-300">Fornecedores podem agendar horários disponíveis de forma intuitiva</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aprovação Rápida</h3>
              <p className="text-gray-300">Sistema de aprovação em tempo real para otimizar o fluxo</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gestão de Tempo</h3>
              <p className="text-gray-300">Controle total sobre horários e reagendamentos</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;