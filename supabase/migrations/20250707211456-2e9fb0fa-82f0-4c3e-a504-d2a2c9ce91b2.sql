-- Add new required fields to schedules table
ALTER TABLE public.schedules 
ADD COLUMN purchase_order TEXT NOT NULL DEFAULT '',
ADD COLUMN pallet_quantity INTEGER NOT NULL DEFAULT 0;