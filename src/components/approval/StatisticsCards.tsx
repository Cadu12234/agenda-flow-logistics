
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScheduleRequest } from '@/types/schedule';

interface StatisticsCardsProps {
  scheduleRequests: ScheduleRequest[];
}

const StatisticsCards = ({ scheduleRequests }: StatisticsCardsProps) => {
  const pendingRequests = scheduleRequests.filter(req => req.status === 'pending');
  const approvedRequests = scheduleRequests.filter(req => req.status === 'approved');
  const rejectedRequests = scheduleRequests.filter(req => req.status === 'rejected');

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pendentes</p>
              <p className="text-3xl font-bold">{pendingRequests.length}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-100" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Aprovados</p>
              <p className="text-3xl font-bold">{approvedRequests.length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-100" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Rejeitados</p>
              <p className="text-3xl font-bold">{rejectedRequests.length}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-100" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
