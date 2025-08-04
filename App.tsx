import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import OrderModal from './components/OrderModal';
import OrderDetailModal from './components/OrderDetailModal';
import ProgressChecklistModal from './components/ProgressChecklistModal';
import { Order, OrderStatus, AIProjectPlan, ServiceType, ProductionLogEntry, AIProgressReport, ProgressStep } from './types';
import { generateProjectPlan, generateProgressReport } from './services/geminiService';
import { saveOrderToSheet } from './services/googleSheetService';
import { DEFAULT_PROGRESS_STEPS } from './constants';

const initialOrders: Order[] = [
  {
    id: 1,
    projectId: 'Prdct0001',
    projectName: 'Business Cards',
    clientName: 'Superior Filmzz',
    receptionDate: '2024-07-28',
    deliveryDate: '2024-08-05',
    amount: 160,
    description: 'High-quality business cards with a unique finish.',
    status: OrderStatus.NUEVO,
    serviceType: ServiceType.DIGITAL_IMPRESION,
    productionLog: [
        { timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Pedido recibido y confirmado con el cliente.' }
    ],
    aiProjectPlan: null,
    progressSteps: DEFAULT_PROGRESS_STEPS.map(step => ({...step}))
  },
  {
    id: 2,
    projectId: 'Prdct0002',
    projectName: 'Landing Page App',
    clientName: 'Tech Innovate',
    receptionDate: '2023-07-05',
    deliveryDate: '2023-08-01',
    amount: 3500,
    description: 'Página de aterrizaje para el lanzamiento de una nueva aplicación móvil. Debe ser responsive y atractiva.',
    status: OrderStatus.PENDIENTE,
    serviceType: ServiceType.DIGITAL,
    productionLog: [
        { timestamp: '2023-07-06T10:00:00Z', note: 'Kick-off meeting held with client.' },
        { timestamp: '2023-07-10T15:30:00Z', note: 'Wireframes sent for approval.' }
    ],
    aiProjectPlan: {
      phases: [
        { name: "Wireframing y UX", description: "Definir estructura y flujo de usuario.", duration: "3 días" },
        { name: "Diseño UI", description: "Crear una interfaz de alto impacto visual.", duration: "5 días" },
      ],
      milestones: [
        { name: "Aprobación de Wireframes", description: "El cliente aprueba el esqueleto de la página." },
      ],
      risks: [
        { risk: "Retraso en feedback del cliente.", mitigation: "Establecer reuniones de revisión semanales." }
      ],
      suggestions: [
        { type: "Technological", suggestion: "Usar animaciones sutiles con Framer Motion." }
      ]
    },
    progressSteps: DEFAULT_PROGRESS_STEPS.map((step, i) => ({...step, completed: i < 1}))
  },
  {
    id: 3,
    projectId: 'Prdct0003',
    projectName: 'Campaña de Anuncios',
    clientName: 'Urban Style',
    receptionDate: '2024-07-15',
    deliveryDate: '2024-08-15',
    amount: 2500,
    description: 'Creación y gestión de una campaña de anuncios en redes sociales.',
    status: OrderStatus.EN_PROGRESO,
    serviceType: ServiceType.DIGITAL,
    productionLog: [],
    aiProjectPlan: null,
    progressSteps: DEFAULT_PROGRESS_STEPS.map((step, i) => ({...step, completed: i < 2}))
  },
  {
    id: 4,
    projectId: 'Prdct0004',
    projectName: 'Diseño de Menú',
    clientName: 'Libros & Café',
    receptionDate: '2024-06-28',
    deliveryDate: '2024-07-15',
    amount: 450,
    description: 'Diseño e impresión de menú para una cafetería-librería.',
    status: OrderStatus.TERMINADO,
    serviceType: ServiceType.PRE_PRENSA,
    productionLog: [],
    aiProjectPlan: null,
    progressSteps: DEFAULT_PROGRESS_STEPS.map(step => ({...step, completed: true}))
  },
];

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForProgress, setSelectedOrderForProgress] = useState<Order | null>(null);


  const getNextId = useCallback(() => {
    if (orders.length === 0) return 1;
    return Math.max(...orders.map(o => o.id)) + 1;
  }, [orders]);

  const handleAddNewOrder = () => {
    setOrderToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };
  
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrderForDetail(order);
    setIsDetailModalOpen(true);
  };

  const handleOpenProgressModal = (order: Order) => {
    setSelectedOrderForProgress(order);
    setIsProgressModalOpen(true);
  }

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    }
  };
  
  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    let updatedOrder: Order | undefined;
    setOrders(prevOrders => {
        const newOrders = prevOrders.map(order => {
            if (order.id === orderId) {
                updatedOrder = { ...order, status: newStatus };
                return updatedOrder;
            }
            return order;
        });
        return newOrders;
    });

    if (updatedOrder) {
        await saveOrderToSheet(updatedOrder);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setIsProgressModalOpen(false);
    setOrderToEdit(null);
    setSelectedOrderForDetail(null);
    setSelectedOrderForProgress(null);
  };
  
  const handleGeneratePlan = useCallback(async (projectName: string, description: string): Promise<AIProjectPlan | null> => {
    try {
      const plan = await generateProjectPlan(projectName, description);
      return plan;
    } catch (error) {
      console.error("Error generating AI plan:", error);
      alert("Hubo un error al generar el plan con IA. Por favor, inténtalo de nuevo.");
      return null;
    }
  }, []);

  const handleSaveOrder = async (orderData: Omit<Order, 'id' | 'projectId' | 'progressSteps'>, isEditing: boolean) => {
    let savedOrder: Order;
    if (isEditing && orderToEdit) {
      savedOrder = { ...orderToEdit, ...orderData };
      setOrders(
        orders.map(order =>
          order.id === orderToEdit.id ? savedOrder : order
        )
      );
    } else {
      const newId = getNextId();
      savedOrder = {
        ...orderData,
        id: newId,
        projectId: `Prdct${String(newId).padStart(4, '0')}`,
        progressSteps: DEFAULT_PROGRESS_STEPS.map(step => ({...step})),
      };
      setOrders(prevOrders => [...prevOrders, savedOrder]);
    }
    await saveOrderToSheet(savedOrder);
  };
  
  const handleUpdateOrder = async (updatedOrder: Order) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrderForDetail(updatedOrder);
    await saveOrderToSheet(updatedOrder);
  };

  const handleAddProductionLog = async (orderId: number, note: string) => {
    const newLogEntry: ProductionLogEntry = {
        timestamp: new Date().toISOString(),
        note: note,
    };
    
    let updatedOrder: Order | undefined;
    const updateOrders = (prevOrders: Order[]) => 
        prevOrders.map(order => {
            if (order.id === orderId) {
                updatedOrder = {
                    ...order,
                    productionLog: [newLogEntry, ...order.productionLog],
                };
                if (selectedOrderForDetail?.id === orderId) {
                    setSelectedOrderForDetail(updatedOrder);
                }
                return updatedOrder;
            }
            return order;
        });

    setOrders(updateOrders);
    
    if (updatedOrder) {
        await saveOrderToSheet(updatedOrder);
    }
  };

  const handleUpdateProgress = async (orderId: number, newProgressSteps: ProgressStep[]) => {
      let updatedOrder: Order | undefined;
      setOrders(prevOrders => prevOrders.map(order => {
          if (order.id === orderId) {
              updatedOrder = { ...order, progressSteps: newProgressSteps };
              return updatedOrder;
          }
          return order;
      }));
      
      if (updatedOrder) {
          await saveOrderToSheet(updatedOrder);
      }
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ orders }, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "BoxesMedia360_Orders.json";
    link.click();
  };

  const handleGenerateProgressReport = useCallback(async (order: Order): Promise<AIProgressReport | null> => {
    try {
      const report = await generateProgressReport(order);
      return report;
    } catch (error) {
      console.error("Error generating AI progress report:", error);
      alert("Hubo un error al generar el reporte de progreso. Por favor, inténtalo de nuevo.");
      return null;
    }
  }, []);

  return (
    <div className="min-h-screen text-gray-200 selection:bg-fuchsia-500/50 bg-[#0d0d1a]">
       <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onAddNewOrder={handleAddNewOrder} onExport={handleExportJSON} />
        <main className="flex-grow flex justify-center py-6 px-4">
          <KanbanBoard 
            orders={orders} 
            onEditOrder={handleEditOrder}
            onViewDetails={handleViewOrderDetails}
            onOpenProgressModal={handleOpenProgressModal}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onGenerateReport={handleGenerateProgressReport}
          />
        </main>
      </div>
      {isEditModalOpen && (
        <OrderModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveOrder}
          orderToEdit={orderToEdit}
          onGeneratePlan={handleGeneratePlan}
        />
      )}
      {isDetailModalOpen && selectedOrderForDetail && (
        <OrderDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseModals}
            order={selectedOrderForDetail}
            onAddLog={handleAddProductionLog}
            onSave={handleUpdateOrder}
        />
      )}
      {isProgressModalOpen && selectedOrderForProgress && (
          <ProgressChecklistModal
            isOpen={isProgressModalOpen}
            onClose={handleCloseModals}
            order={selectedOrderForProgress}
            onSave={handleUpdateProgress}
          />
      )}
    </div>
  );
};

export default App;