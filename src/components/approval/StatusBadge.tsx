
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Aprovado
      </Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
        <XCircle className="h-3 w-3 mr-1" />
        Rejeitado
      </Badge>;
    default:
      return null;
  }
};

export default StatusBadge;
