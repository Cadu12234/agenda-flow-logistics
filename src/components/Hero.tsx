
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('/lovable-uploads/71d3def1-1b00-4aac-aa00-f732b9b115a6.png')`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sistema de Logística
            <span className="text-green-600 block">Inteligente</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Gerencie agendamentos de fornecedores com eficiência. 
            Agende, aprove e coordene entregas em tempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Entrega
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
            >
              <Users className="mr-2 h-5 w-5" />
              Painel Gestor
            </Button>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Agendamento Fácil</h3>
              <p className="text-gray-600">Fornecedores podem agendar horários disponíveis de forma intuitiva</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aprovação Rápida</h3>
              <p className="text-gray-600">Sistema de aprovação em tempo real para otimizar o fluxo</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Tempo</h3>
              <p className="text-gray-600">Controle total sobre horários e reagendamentos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
