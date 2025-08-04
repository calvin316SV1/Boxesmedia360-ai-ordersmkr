
import { OrderStatus, ProgressStep } from './types';

export const KANBAN_COLUMNS: { title: string; status: OrderStatus }[] = [
  { title: 'Nuevo Pedido', status: OrderStatus.NUEVO },
  { title: 'Pendiente', status: OrderStatus.PENDIENTE },
  { title: 'En Progreso', status: OrderStatus.EN_PROGRESO },
  { title: 'Terminado', status: OrderStatus.TERMINADO },
];

export const DEFAULT_PROGRESS_STEPS: ProgressStep[] = [
    { id: 1, label: 'Avance Inicial - Diseño Digital', weight: 20, completed: false },
    { id: 2, label: 'Revisión con Cliente', weight: 20, completed: false },
    { id: 3, label: 'Ajuste y Revisión Interna (Pre-producción)', weight: 30, completed: false },
    { id: 4, label: 'Doble Checklist de Procesos y Producción', weight: 20, completed: false },
    { id: 5, label: 'Entrega y Aprobación Final', weight: 10, completed: false },
];