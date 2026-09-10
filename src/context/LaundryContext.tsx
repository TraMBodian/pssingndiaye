import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Order, 
  Customer, 
  ServiceArticle, 
  SMSNotification, 
  MonthlyRevenue, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  AdminUser
} from '../types';
import { 
  INITIAL_ARTICLES, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_SMS_LOGS, 
  MONTHLY_REVENUE_HISTORY 
} from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface LaundryContextType {
  // Auth state
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateAdminProfile: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: AdminUser['role'];
  }) => { success: boolean; error?: string };

  orders: Order[];
  customers: Customer[];
  articles: ServiceArticle[];
  smsLogs: SMSNotification[];
  monthlyStats: MonthlyRevenue[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  autoSmsOnStatusChange: boolean;
  setAutoSmsOnStatusChange: (enabled: boolean) => void;
  
  // Modals & Selection
  isNewOrderModalOpen: boolean;
  setIsNewOrderModalOpen: (open: boolean) => void;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;
  selectedOrderForSms: Order | null;
  setSelectedOrderForSms: (order: Order | null) => void;
  selectedCustomerForHistory: Customer | null;
  setSelectedCustomerForHistory: (customer: Customer | null) => void;
  activeToast: { message: string; type: 'success' | 'info' | 'sms' } | null;
  clearToast: () => void;

  // Actions
  createNewOrder: (orderData: {
    clientId: string;
    items: { articleId: string; quantity: number; notes?: string }[];
    isExpress: boolean;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    sendSmsImmediately: boolean;
  }) => Order;

  updateOrderStatus: (orderId: string, nextStatus: OrderStatus, notifySms?: boolean) => void;
  sendAutomaticStatusSms: (order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus) => SMSNotification;
  getStatusDisplayLabel: (status: OrderStatus) => string;
  updatePayment: (orderId: string, status: PaymentStatus, paidAmount: number, method?: PaymentMethod) => void;
  sendSms: (orderId: string, customMessage?: string, type?: SMSNotification['type']) => SMSNotification;
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'createdAt' | 'lastVisitDate'>) => Customer;
  updateCustomer: (customerId: string, data: Partial<Customer>) => void;
  resetAllData: () => void;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin authentication state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const isAuthenticated = !!currentUser;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase Auth n’est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.' };
    }
    if (!cleanEmail) {
      return { success: false, error: 'Veuillez saisir votre identifiant ou adresse email.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Veuillez saisir votre mot de passe.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const syncUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        setCurrentUser(null);
        return;
      }
      const metadata = user.user_metadata || {};
      const firstName = typeof metadata.first_name === 'string' ? metadata.first_name : '';
      const lastName = typeof metadata.last_name === 'string' ? metadata.last_name : '';
      const name = `${firstName} ${lastName}`.trim() || user.email || 'Utilisateur Supabase';
      setCurrentUser({
        id: user.id,
        name,
        email: user.email || '',
        role: metadata.role === 'GERANT' ? 'GERANT' : 'ADMIN',
        lastLogin: new Date().toISOString()
      });
    };

    void supabase.auth.getSession().then(({ data }) => syncUser(data.session?.user || null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user || null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const updateAdminProfile = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: AdminUser['role'];
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Aucun compte administrateur connecté.' };
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password?.trim();

    if (!firstName || !lastName || !email) {
      return { success: false, error: 'Le prénom, le nom et l’email sont obligatoires.' };
    }
    if (password !== undefined && password.length > 0 && password.length < 6) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }

    const updatedUser: AdminUser = {
      ...currentUser,
      name: `${firstName} ${lastName}`,
      email,
      role: data.role
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('laundry_admin_user', JSON.stringify(updatedUser));
      const saved = localStorage.getItem('laundry_admin_credentials');
      const previous = saved ? JSON.parse(saved) : null;
      localStorage.setItem('laundry_admin_credentials', JSON.stringify({
        email,
        password: password || previous?.password || 'admin2026'
      }));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    setActiveToast({ message: 'Profil administrateur mis à jour.', type: 'success' });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('laundry_admin_user');
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    if (supabase) void supabase.auth.signOut();
    setActiveToast({
      message: 'Vous êtes maintenant déconnecté.',
      type: 'info'
    });
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('laundry_orders_v1');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('laundry_customers_v1');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [articles] = useState<ServiceArticle[]>(INITIAL_ARTICLES);

  const [smsLogs, setSmsLogs] = useState<SMSNotification[]>(() => {
    try {
      const saved = localStorage.getItem('laundry_sms_v1');
      return saved ? JSON.parse(saved) : INITIAL_SMS_LOGS;
    } catch {
      return INITIAL_SMS_LOGS;
    }
  });

  const [monthlyStats] = useState<MonthlyRevenue[]>(MONTHLY_REVENUE_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');

  // Automatic SMS on status change toggle
  const [autoSmsOnStatusChange, setAutoSmsOnStatusChange] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('laundry_auto_sms_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('laundry_auto_sms_enabled', JSON.stringify(autoSmsOnStatusChange));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [autoSmsOnStatusChange]);

  // Modals state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [selectedOrderForSms, setSelectedOrderForSms] = useState<Order | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'sms' } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('laundry_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('laundry_customers_v1', JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('laundry_sms_v1', JSON.stringify(smsLogs));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [smsLogs]);

  const showToast = (message: string, type: 'success' | 'info' | 'sms' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const clearToast = () => setActiveToast(null);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'createdAt' | 'lastVisitDate'>): Customer => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString(),
      lastVisitDate: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Nouveau client ajouté : ${newCustomer.fullName}`, 'success');
    return newCustomer;
  };

  const updateCustomer = (customerId: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...data } : c));
  };

  const createNewOrder = ({
    clientId,
    items: inputItems,
    isExpress,
    paidAmount,
    paymentStatus,
    paymentMethod,
    notes,
    sendSmsImmediately
  }: {
    clientId: string;
    items: { articleId: string; quantity: number; notes?: string }[];
    isExpress: boolean;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    sendSmsImmediately: boolean;
  }): Order => {
    const customer = customers.find(c => c.id === clientId);
    if (!customer) {
      throw new Error('Client introuvable');
    }

    const orderNumberInt = 105 + orders.length;
    const ref = `CMD-2026-${orderNumberInt}`;
    const trackingCode = `TRK-${Math.floor(1000 + Math.random() * 9000)}`;

    let calculatedTotal = 0;
    let maxDays = 2;
    let totalPieces = 0;

    const detailedItems = inputItems.map(item => {
      const art = articles.find(a => a.id === item.articleId);
      const unitPrice = art ? art.price : 5.0;
      calculatedTotal += unitPrice * item.quantity;
      totalPieces += item.quantity;
      if (art && art.estimatedDays > maxDays) {
        maxDays = art.estimatedDays;
      }
      return {
        articleId: item.articleId,
        articleName: art ? art.name : 'Article',
        unitPrice,
        quantity: item.quantity,
        notes: item.notes || ''
      };
    });

    if (isExpress) {
      calculatedTotal = calculatedTotal * 1.25; // +25% express charge
      maxDays = Math.max(1, Math.round(maxDays / 2));
    }

    // Round to 2 decimal places
    calculatedTotal = Math.round(calculatedTotal * 100) / 100;
    const tax = Math.round((calculatedTotal * 0.20 / 1.20) * 100) / 100;

    const now = new Date();
    const readyDate = new Date();
    readyDate.setDate(now.getDate() + (isExpress ? 1 : maxDays));
    readyDate.setHours(17, 0, 0, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      referenceNumber: ref,
      clientId: customer.id,
      clientName: customer.fullName,
      clientPhone: customer.phone,
      clientEmail: customer.email,
      items: detailedItems,
      totalAmount: calculatedTotal,
      taxAmount: tax,
      paidAmount,
      paymentStatus,
      paymentMethod,
      status: 'DEPOSEE',
      isExpress,
      createdAt: now.toISOString(),
      estimatedReadyDate: readyDate.toISOString(),
      trackingCode,
      notes: notes || '',
      hangerCount: totalPieces,
      bagCount: Math.ceil(totalPieces / 4)
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update customer metrics
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        const newTotalSpent = Math.round((c.totalSpent + paidAmount) * 100) / 100;
        const newOrdersCount = c.ordersCount + 1;
        const loyalty: Customer['loyaltyLevel'] = newOrdersCount > 10 ? 'VIP' : newOrdersCount > 3 ? 'REGULIER' : 'NOUVEAU';
        return {
          ...c,
          totalSpent: newTotalSpent,
          ordersCount: newOrdersCount,
          loyaltyLevel: loyalty,
          lastVisitDate: now.toISOString()
        };
      }
      return c;
    }));

    // Auto send confirmation SMS if requested
    if (sendSmsImmediately) {
      sendSms(newOrder.id, undefined, 'CONFIRMATION');
    }

    showToast(`Commande ${newOrder.referenceNumber} créée avec succès !`, 'success');
    return newOrder;
  };

  const getStatusDisplayLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'DEPOSEE':
        return 'Déposée / Enregistrée';
      case 'TRAITEMENT':
        return 'En cours de lavage & détachage';
      case 'REPASSAGE':
        return 'En cours de repassage & finition';
      case 'PRETE':
        return 'Prête à être récupérée';
      case 'LIVREE':
        return 'Livrée & Retirée';
      default:
        return status;
    }
  };

  const sendAutomaticStatusSms = (order: Order, previousStatus: OrderStatus, nextStatus: OrderStatus): SMSNotification => {
    const clientFirstName = order.clientName.split(' ')[0] || 'Client';
    const newStatusLabel = getStatusDisplayLabel(nextStatus);
    const pinCode = order.trackingCode.replace('TRK-', '');
    const trackingUrl = `https://lndry.app/t/${order.trackingCode}`;

    let message = '';
    if (nextStatus === 'PRETE') {
      message = `✨ Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande n° ${order.referenceNumber} change de statut : "${newStatusLabel}" ! Vos articles vous attendent au comptoir. Code retrait : ${pinCode}. Suivi : ${trackingUrl}`;
    } else if (nextStatus === 'TRAITEMENT') {
      message = `🫧 Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande n° ${order.referenceNumber} change de statut : "${newStatusLabel}". Vos textiles sont pris en charge avec soin. Suivi : ${trackingUrl}`;
    } else if (nextStatus === 'REPASSAGE') {
      message = `👔 Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande n° ${order.referenceNumber} change de statut : "${newStatusLabel}". Finition et contrôle qualité en cours. Suivi : ${trackingUrl}`;
    } else if (nextStatus === 'LIVREE') {
      message = `✅ Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande n° ${order.referenceNumber} est passée au statut : "${newStatusLabel}". Merci pour votre confiance et à très bientôt !`;
    } else {
      message = `🧺 Blanchisserie Pro: Bonjour ${clientFirstName}, votre commande n° ${order.referenceNumber} est enregistrée sous le statut : "${newStatusLabel}". Suivi : ${trackingUrl}`;
    }

    const newSms: SMSNotification = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      orderReference: order.referenceNumber,
      clientPhone: order.clientPhone,
      clientName: order.clientName,
      message,
      sentAt: new Date().toISOString(),
      status: 'DELIVRE',
      type: nextStatus === 'PRETE' ? 'PRETE_RETRAIT' : 'CHANGEMENT_STATUT',
      previousStatus,
      newStatus: nextStatus
    };

    setSmsLogs(prev => [newSms, ...prev]);

    showToast(
      `📱 SMS automatique envoyé à ${order.clientName} (${order.clientPhone}) : Commande ${order.referenceNumber} ➔ "${newStatusLabel}"`,
      'sms'
    );

    return newSms;
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus, notifySms = true) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;
    if (existingOrder.status === nextStatus) return;

    const previousStatus = existingOrder.status;
    const now = new Date();

    const updatedOrder: Order = {
      ...existingOrder,
      status: nextStatus,
      actualReadyDate: nextStatus === 'PRETE' ? now.toISOString() : existingOrder.actualReadyDate,
      deliveredDate: nextStatus === 'LIVREE' ? now.toISOString() : existingOrder.deliveredDate,
      paymentStatus: nextStatus === 'LIVREE' && existingOrder.paidAmount < existingOrder.totalAmount ? 'PAYE' : existingOrder.paymentStatus,
      paidAmount: nextStatus === 'LIVREE' ? existingOrder.totalAmount : existingOrder.paidAmount
    };

    setOrders(prev => prev.map(order => order.id === orderId ? updatedOrder : order));

    const newStatusLabel = getStatusDisplayLabel(nextStatus);

    // Automatic SMS trigger on any status change
    if (notifySms && autoSmsOnStatusChange) {
      sendAutomaticStatusSms(updatedOrder, previousStatus, nextStatus);
    } else {
      showToast(`Statut mis à jour : ${newStatusLabel}`, 'info');
    }
  };

  const updatePayment = (orderId: string, status: PaymentStatus, paidAmount: number, method?: PaymentMethod) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: status,
          paidAmount,
          paymentMethod: method || o.paymentMethod
        };
      }
      return o;
    }));
    showToast(`Paiement mis à jour : ${paidAmount.toFixed(2)} € (${status})`, 'success');
  };

  const sendSms = (orderId: string, customMessage?: string, type: SMSNotification['type'] = 'PRETE_RETRAIT'): SMSNotification => {
    const order = orders.find(o => o.id === orderId);
    const clientName = order ? order.clientName : 'Client';
    const clientPhone = order ? order.clientPhone : '+33 6 00 00 00 00';
    const ref = order ? order.referenceNumber : 'CMD';
    const trackingCode = order ? order.trackingCode : 'TRK-0000';
    const itemCount = order ? order.items.reduce((s, i) => s + i.quantity, 0) : 1;

    let defaultMsg = '';
    if (type === 'PRETE_RETRAIT') {
      defaultMsg = `✨ Blanchisserie Pro: Bonjour ${clientName.split(' ')[0]}, votre commande #${ref} (${itemCount} article${itemCount > 1 ? 's' : ''}) est prête au comptoir ! Suivi en direct: https://lndry.app/t/${trackingCode}. Code retrait: ${trackingCode.replace('TRK-', '')}`;
    } else if (type === 'CONFIRMATION') {
      defaultMsg = `🧺 Blanchisserie Pro: Bonjour ${clientName.split(' ')[0]}, commande #${ref} bien reçue (${order?.isExpress ? 'Service EXPRESS 24H' : 'Standard'}). Suivi temps réel: https://lndry.app/t/${trackingCode}`;
    } else if (type === 'EN_TRAITEMENT') {
      defaultMsg = `🫧 Blanchisserie Pro: Vos vêtements de la commande #${ref} sont actuellement en cours de lavage délicat et détachage pro.`;
    } else if (type === 'CHANGEMENT_STATUT') {
      defaultMsg = `📢 Blanchisserie Pro: Bonjour ${clientName.split(' ')[0]}, votre commande #${ref} a été mise à jour. Suivi direct: https://lndry.app/t/${trackingCode}`;
    } else {
      defaultMsg = `⏰ Blanchisserie Pro: Rappel amical, votre commande #${ref} vous attend au pressing (ouvert jusqu'à 19h30). À très vite !`;
    }

    const message = customMessage || defaultMsg;
    const newSms: SMSNotification = {
      id: `sms-${Date.now()}`,
      orderId,
      orderReference: ref,
      clientPhone,
      clientName,
      message,
      sentAt: new Date().toISOString(),
      status: 'DELIVRE',
      type
    };

    setSmsLogs(prev => [newSms, ...prev]);
    showToast(`📱 SMS envoyé avec succès à ${clientName} (${clientPhone})`, 'sms');
    return newSms;
  };

  const resetAllData = () => {
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSmsLogs(INITIAL_SMS_LOGS);
    localStorage.removeItem('laundry_orders_v1');
    localStorage.removeItem('laundry_customers_v1');
    localStorage.removeItem('laundry_sms_v1');
    showToast('Données réinitialisées avec succès aux valeurs de démonstration', 'info');
  };

  return (
    <LaundryContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        updateAdminProfile,
        orders,
        customers,
        articles,
        smsLogs,
        monthlyStats,
        searchQuery,
        setSearchQuery,
        autoSmsOnStatusChange,
        setAutoSmsOnStatusChange,
        isNewOrderModalOpen,
        setIsNewOrderModalOpen,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        selectedOrderForSms,
        setSelectedOrderForSms,
        selectedCustomerForHistory,
        setSelectedCustomerForHistory,
        activeToast,
        clearToast,
        createNewOrder,
        updateOrderStatus,
        sendAutomaticStatusSms,
        getStatusDisplayLabel,
        updatePayment,
        sendSms,
        addCustomer,
        updateCustomer,
        resetAllData
      }}
    >
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
