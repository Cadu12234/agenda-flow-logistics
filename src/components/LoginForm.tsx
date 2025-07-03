
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSent, setRegistrationSent] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await login(email, password);
        
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message || "Credenciais inválidas. Tente novamente.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo ao sistema!",
          });
        }
      } else {
        const { error } = await register(email, password);
        
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message || "Erro ao criar conta.",
            variant: "destructive"
          });
        } else {
          setRegistrationSent(true);
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar sua conta antes de fazer login.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSent) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/lovable-uploads/71d3def1-1b00-4aac-aa00-f732b9b115a6.png')`
          }}
        />
        
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Mail className="h-5 w-5" />
              Confirme seu Email
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 text-center">
            <p className="mb-4">
              Um link de confirmação foi enviado para seu email. 
              Por favor, clique no link para ativar sua conta.
            </p>
            <Button
              onClick={() => {
                setRegistrationSent(false);
                setIsLogin(true);
              }}
              variant="outline"
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('/lovable-uploads/71d3def1-1b00-4aac-aa00-f732b9b115a6.png')`
        }}
      />
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <User className="h-5 w-5" />
            {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-gray-300 focus:border-green-500"
              />
              {!isLogin && (
                <p className="text-xs text-gray-600">
                  * Emails @mmm.com têm acesso completo ao sistema
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="border-gray-300 focus:border-green-500"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LoginForm;
