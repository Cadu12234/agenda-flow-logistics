
import { Card, CardContent } from "@/components/ui/card";
import { ScheduleRequest } from '@/types/schedule';
import StatusBadge from './StatusBadge';
import { formatDisplayDate } from '@/utils/dateUtils';

interface ProcessedRequestCardProps {
  request: ScheduleRequest;
}

const ProcessedRequestCard = ({ request }: ProcessedRequestCardProps) => {
  return (
    <Card className="opacity-75 hover:opacity-100 transition-opacity">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{request.supplier_name}</p>
              <p className="text-sm text-gray-600">
                {formatDisplayDate(request.scheduled_date)} às {request.scheduled_time}
              </p>
              <p className="text-sm text-gray-500">
                OC: {request.purchase_order} | Pallets: {request.pallet_quantity}
              </p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessedRequestCard;
