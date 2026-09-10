export type OrderStatus = 
  | 'DEPOSEE'       // Reçue / Enregistrée au comptoir
  | 'TRAITEMENT'    // En cours de lavage / détachage
  | 'REPASSAGE'     // Repassage & Contrôle qualité
  | 'PRETE'         // Prête pour retrait (SMS envoyé)
  | 'LIVREE';       // Récupérée par le client

export type PaymentStatus = 'PAYE' | 'ACOMPTE' | 'EN_ATTENTE';
export type PaymentMethod = 'CARTE' | 'ESPECES' | 'VIREMENT' | 'EN_LIGNE';

export type ServiceCategory = 
  | 'pressing'      // Pressing & Nettoyage à sec
  | 'lavage'        // Lavage au kilo / Linge au poids
  | 'repassage'     // Repassage délicat
  | 'literie'       // Couettes, Draps, Ameublement
  | 'cuir_tapis';   // Cuir, Tapis & Pièces spéciales

export interface ServiceArticle {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  iconName?: string;
  estimatedDays: number;
  description?: string;
}

export interface OrderItem {
  articleId: string;
  articleName: string;
  unitPrice: number;
  quantity: number;
  notes?: string; // e.g. "Tache vin rouge sur manche", "Bouton cassé"
}

export interface SMSNotification {
  id: string;
  orderId: string;
  clientPhone: string;
  clientName: string;
  message: string;
  sentAt: string;
  status: 'DELIVRE' | 'EN_COURS' | 'ECHEC';
  type: 'CONFIRMATION' | 'EN_TRAITEMENT' | 'PRETE_RETRAIT' | 'RAPPEL_RETRAIT' | 'CHANGEMENT_STATUT';
  orderReference?: string;
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
}

export interface Order {
  id: string;
  referenceNumber: string; // e.g., CMD-2026-104
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount: number; // TVA 20%
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  status: OrderStatus;
  isExpress: boolean; // +25% or rush 24h
  createdAt: string;
  estimatedReadyDate: string;
  actualReadyDate?: string;
  deliveredDate?: string;
  trackingCode: string; // e.g. TRK-8942
  notes?: string;
  hangerCount?: number;
  bagCount?: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  loyaltyLevel: 'NOUVEAU' | 'REGULIER' | 'VIP';
  totalSpent: number;
  ordersCount: number;
  preferences?: string; // e.g. "Amidon léger", "Pas d'adoucissant"
  createdAt: string;
  lastVisitDate: string;
}

export interface MonthlyRevenue {
  month: string; // e.g. "Avr 2026", "Mai 2026"
  revenue: number;
  ordersCount: number;
  pressingRevenue: number;
  lavageRevenue: number;
  literieRevenue: number;
  expressRevenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GERANT';
  lastLogin?: string;
}
