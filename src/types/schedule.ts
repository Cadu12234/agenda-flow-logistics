
export interface ScheduleRequest {
  id: number;
  supplier_name: string;
  scheduled_date: string;
  scheduled_time: string;
  vehicle_type: string;
  delivery_type: string;
  purchase_order: string;
  pallet_quantity: number;
  observations: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  user_id: string;
  updated_at: string | null;
}
