
-- Remover a tabela de horários específicos que criamos antes
DROP TABLE IF EXISTS public.delivery_time_slots;

-- Alterar a tabela schedules para usar ID sequencial (mantendo a estrutura atual)
-- Primeiro, criar uma nova tabela com a estrutura desejada
CREATE TABLE public.schedules_new (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplier_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  vehicle_type TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  observations TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copiar dados existentes (se houver)
INSERT INTO public.schedules_new (user_id, supplier_name, scheduled_date, scheduled_time, vehicle_type, delivery_type, observations, status, rejection_reason, created_at, updated_at)
SELECT user_id, supplier_name, scheduled_date, scheduled_time, vehicle_type, delivery_type, observations, status, rejection_reason, created_at, updated_at
FROM public.schedules;

-- Remover a tabela antiga
DROP TABLE public.schedules;

-- Renomear a nova tabela
ALTER TABLE public.schedules_new RENAME TO schedules;

-- Recriar as políticas RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules" ON public.schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules" ON public.schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all schedules" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all schedules" ON public.schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
