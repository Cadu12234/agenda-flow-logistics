
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Mail } from 'lucide-react';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const RejectionDialog = ({ 
  open, 
  onOpenChange, 
  rejectionReason, 
  onReasonChange, 
  onConfirm, 
  isLoading 
}: RejectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Informe o motivo da rejeição:</p>
          <Textarea
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Motivo da rejeição..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading || !rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Confirmar Rejeição'}
              {isLoading && <Mail className="h-4 w-4 ml-2 animate-pulse" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;
