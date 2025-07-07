
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDisplayDate = (dateString: string) => {
  try {
    // Parse da string de data ISO
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
