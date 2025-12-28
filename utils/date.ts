import { startOfDay, startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Retorna a data de hoje no formato YYYY-MM-DD, respeitando o horário local.
 * Garante que se for 23h, ainda é "hoje".
 */
export const getTodayLocal = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma data para YYYY-MM-DD respeitando o horário local.
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses são 0-indexados
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Retorna o início da semana (Segunda-feira) baseado na data fornecida.
 * O padrão do date-fns para startOfWeek é Domingo (0), então ajustamos para Segunda (1).
 */
export const getStartOfWeekLocal = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Gera os dias da semana a partir de uma data inicial.
 */
export const generateWeekDays = (startOfWeekDate: Date) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfWeekDate, i);
    const dateString = format(day, 'yyyy-MM-dd');
    
    // Capitalizar a primeira letra do dia da semana (seg, ter -> Seg, Ter)
    const dayNameRaw = format(day, 'EEE', { locale: ptBR });
    const dayName = dayNameRaw.charAt(0).toUpperCase() + dayNameRaw.slice(1).replace('.', '');

    days.push({
      date: dateString,
      dayName: dayName,
      dayNumber: format(day, 'd'),
      isToday: isSameDay(day, today),
      originalDate: day,
    });
  }
  return days;
};

/**
 * Converte uma string YYYY-MM-DD para um objeto Date (meia-noite local).
 */
export const parseDateLocal = (dateString: string): Date => {
  // Adiciona T00:00:00 para garantir que seja tratado como local time no construtor Date,
  // mas date-fns parseISO também é uma opção. O construtor com T00:00:00 funciona bem para local.
  // Melhor ainda: usar year, month, day para criar a data sem offset confuso.
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
