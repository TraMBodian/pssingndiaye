import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Banknote, 
  UserPlus, 
  MessageSquare, 
  Receipt, 
  Check,
  Search
} from 'lucide-react';
import { useLaundry } from '../context/LaundryContext';
import { ServiceCategory, PaymentStatus, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SelectedCartItem {
  articleId: string;
  quantity: number;
  notes: string;
}

export const NewOrderModal: React.FC = () => {
  const { 
    isNewOrderModalOpen, 
    setIsNewOrderModalOpen, 
    articles, 
    customers, 
    addCustomer, 
    createNewOrder,
    setSelectedOrderForInvoice
  } = useLaundry();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // New customer inline form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPreferences, setNewCustPreferences] = useState('');

  // Articles & Cart
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [cartItems, setCartItems] = useState<SelectedCartItem[]>([
    { articleId: articles[0]?.id || 'art-1', quantity: 3, notes: '' },
    { articleId: articles[4]?.id || 'art-5', quantity: 1, notes: 'Détachage col' }
  ]);

  // Pricing & Options
  const [isExpress, setIsExpress] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAYE');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARTE');
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [sendSmsImmediately, setSendSmsImmediately] = useState(true);

  if (!isNewOrderModalOpen) return null;

  // Filtered categories
  const categories: { id: ServiceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous les articles' },
    { id: 'pressing', label: 'Pressing' },
    { id: 'lavage', label: 'Lavage au kilo' },
    { id: 'repassage', label: 'Repassage' },
    { id: 'literie', label: 'Couettes & Literie' },
    { id: 'cuir_tapis', label: 'Cuir & Tapis' },
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  // Cart operations
  const addItemToCart = (articleId: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.articleId === articleId);
      if (existing) {
        return prev.map(item => 
          item.articleId === articleId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { articleId, quantity: 1, notes: '' }];
    });
  };

  const updateItemQuantity = (articleId: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.articleId === articleId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedCartItem[];
    });
  };

  const updateItemNote = (articleId: string, note: string) => {
    setCartItems(prev => prev.map(item => item.articleId === articleId ? { ...item, notes: note } : item));
  };

  const removeItem = (articleId: string) => {
    setCartItems(prev => prev.filter(item => item.articleId !== articleId));
  };

  // Calculations
  const rawSubtotal = cartItems.reduce((sum, item) => {
    const art = articles.find(a => a.id === item.articleId);
    return sum + (art ? art.price * item.quantity : 0);
  }, 0);

  const expressSurcharge = isExpress ? rawSubtotal * 0.25 : 0;
  const totalAmount = Math.round((rawSubtotal + expressSurcharge) * 100) / 100;
  const totalPieces = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const created = addCustomer({
      fullName: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '.')}@client.fr`,
      loyaltyLevel: 'NOUVEAU',
      preferences: newCustPreferences
    });

    setSelectedCustomerId(created.id);
    setIsCreatingCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustPreferences('');
  };

  const handleSubmitOrder = (andPrintInvoice = false) => {
    if (!selectedCustomerId) {
      alert('Veuillez sélectionner ou créer un client');
      return;
    }
    if (cartItems.length === 0) {
      alert('Veuillez ajouter au moins un article au panier');
      return;
    }

    let paid = totalAmount;
    if (paymentStatus === 'ACOMPTE') {
      paid = depositAmount > 0 ? depositAmount : Math.round(totalAmount / 2);
    } else if (paymentStatus === 'EN_ATTENTE') {
      paid = 0;
    }

    const createdOrder = createNewOrder({
      clientId: selectedCustomerId,
      items: cartItems,
      isExpress,
      paidAmount: paid,
      paymentStatus,
      paymentMethod,
      notes: orderNotes,
      sendSmsImmediately
    });

    setIsNewOrderModalOpen(false);
    if (andPrintInvoice) {
      setSelectedOrderForInvoice(createdOrder);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="new-order-modal-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Nouvelle Facture & Enregistrement Commande
              </h2>
              <p className="text-xs text-slate-500">
                Génération de facture détaillée avec suivi SMS automatique
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewOrderModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Client & Articles selection (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-5">
            
            {/* 1. Client selection Section */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>Client assigné</span>
                  {activeCustomer?.loyaltyLevel === 'VIP' && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      ★ Client VIP
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(!isCreatingCustomer)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isCreatingCustomer ? 'Choisir client existant' : '+ Nouveau client'}
                </button>
              </div>

              {isCreatingCustomer ? (
                /* Fast inline customer creation */
                <form onSubmit={handleCreateCustomer} className="space-y-3 bg-white p-3 rounded-lg border border-sky-200">
                  <div className="text-xs font-semibold text-sky-900">Enregistrer un nouveau client :</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      required
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      className="text-xs p-2 rounded border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="N° Téléphone (pour SMS) *"
                      required
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      className="text-xs p-2 rounded border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Adresse e-mail (facultatif)"
                      value={newCustEmail}
                      onChange={e => setNewCustEmail(e.target.value)}
                      className="text-xs p-2 rounded border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Préférences (ex: cintre, amidon doux)"
                      value={newCustPreferences}
                      onChange={e => setNewCustPreferences(e.target.value)}
                      className="text-xs p-2 rounded border border-slate-200 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCustomer(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-sky-600 text-white font-medium rounded hover:bg-sky-700"
                    >
                      Enregistrer le client
                    </button>
                  </div>
                </form>
              ) : (
                /* Customer Picker */
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrer parmi les clients par nom ou téléphone..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <select
                    id="select-customer"
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {filteredCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} — {c.phone} {c.loyaltyLevel === 'VIP' ? '(VIP)' : ''}
                      </option>
                    ))}
                  </select>
                  {activeCustomer && (
                    <div className="flex items-center justify-between text-[11px] text-slate-700 pt-0.5 px-1">
                      <span>SMS vers : <strong>{activeCustomer.phone}</strong></span>
                      {activeCustomer.preferences && (
                        <span className="italic text-slate-700">Note: {activeCustomer.preferences}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Article Catalog Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catalogue Prestations & Tarifs
                </label>
                <span className="text-xs text-slate-700">Cliquez pour ajouter</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto p-0.5">
                {filteredArticles.map(art => {
                  const inCart = cartItems.find(i => i.articleId === art.id);
                  return (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => addItemToCart(art.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between group relative ${
                        inCart 
                          ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-300' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {inCart && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}
                      <div>
                        <div className="font-semibold text-xs text-slate-900 group-hover:text-sky-700 line-clamp-1">
                          {art.name}
                        </div>
                        <div className="text-[11px] text-slate-700 line-clamp-1 mt-0.5">
                          {art.description}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          {formatCurrency(art.price)}
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          ~{art.estimatedDays}j
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Additional options & notes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950">Option Service Express 24h</div>
                    <div className="text-[11px] text-amber-700">Traitement prioritaire (+25% sur total HT)</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExpress}
                    onChange={e => setIsExpress(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarques particulières (détachage spécifique, réserve état...)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Taches de sauce sur chemise blanche, boutons dorés fragiles..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Invoicing Summary, Cart & Payment (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Panier & Lignes de Facture</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-800 font-semibold">
                    {totalPieces} pièce{totalPieces > 1 ? 's' : ''}
                  </span>
                </h3>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Vider
                  </button>
                )}
              </div>

              {/* Items in Cart */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Aucun vêtement sélectionné.<br />Sélectionnez des articles à gauche.
                  </div>
                ) : (
                  cartItems.map(item => {
                    const art = articles.find(a => a.id === item.articleId);
                    if (!art) return null;
                    const lineTotal = art.price * item.quantity;
                    return (
                      <div 
                        key={item.articleId}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-xs font-bold text-slate-800">{art.name}</div>
                            <div className="text-[11px] text-slate-700">
                              {formatCurrency(art.price)} / unité
                            </div>
                          </div>
                          <div className="text-xs font-bold text-slate-900 text-right">
                            {formatCurrency(lineTotal)}
                          </div>
                        </div>

                        {/* Controls: Stepper & Per-item note */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder="Détail / tache..."
                            value={item.notes}
                            onChange={e => updateItemNote(item.articleId, e.target.value)}
                            className="flex-1 text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded placeholder:text-slate-400"
                          />
                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.articleId, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.articleId, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.articleId)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Règlement de la facture
                </div>

                {/* Payment status options */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PAYE')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      paymentStatus === 'PAYE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Payé (Comptant)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus('ACOMPTE');
                      if (depositAmount === 0) setDepositAmount(Math.round(totalAmount / 2));
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      paymentStatus === 'ACOMPTE'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Acompte partiel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('EN_ATTENTE')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                      paymentStatus === 'EN_ATTENTE'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Au retrait
                  </button>
                </div>

                {/* Acompte input if selected */}
                {paymentStatus === 'ACOMPTE' && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs text-slate-600">Montant acompte versé :</label>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max={totalAmount}
                        value={depositAmount}
                        onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-1.5 rounded border border-slate-200 pr-6 font-bold text-slate-800"
                      />
                      <span className="absolute right-2 top-1.5 text-xs text-slate-400">€</span>
                    </div>
                  </div>
                )}

                {/* Payment method selector */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">Moyen :</span>
                  <div className="flex gap-1.5 flex-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARTE')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border flex items-center justify-center gap-1 ${
                        paymentMethod === 'CARTE' ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" /> CB
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ESPECES')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border flex items-center justify-center gap-1 ${
                        paymentMethod === 'ESPECES' ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-3 h-3" /> Espèces
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('VIREMENT')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium border flex items-center justify-center gap-1 ${
                        paymentMethod === 'VIREMENT' ? 'bg-sky-50 text-sky-700 border-sky-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Virement
                    </button>
                  </div>
                </div>
              </div>

              {/* SMS real-time trigger checkbox */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-sky-50/70 border border-sky-200">
                <input
                  id="sms-auto-notify"
                  type="checkbox"
                  checked={sendSmsImmediately}
                  onChange={e => setSendSmsImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="sms-auto-notify" className="text-xs text-sky-950 font-medium cursor-pointer">
                  Envoyer un <strong>SMS de confirmation</strong> avec lien de suivi temps réel au client
                </label>
              </div>

              {/* Financial Totals Breakdown */}
              <div className="space-y-1.5 pt-1 text-xs text-slate-600 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Sous-total HT :</span>
                  <span>{formatCurrency(Math.round((totalAmount / 1.20) * 100) / 100)}</span>
                </div>
                {isExpress && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Majoration Express 24h (+25%) :</span>
                    <span>+{formatCurrency(expressSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>TVA (20%) :</span>
                  <span>{formatCurrency(Math.round((totalAmount * 0.20 / 1.20) * 100) / 100)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span className="text-base text-sky-700">{formatCurrency(totalAmount)}</span>
                </div>
                {paymentStatus === 'ACOMPTE' && (
                  <div className="flex justify-between text-xs font-semibold text-rose-600 pt-0.5">
                    <span>Reste à percevoir au retrait :</span>
                    <span>{formatCurrency(Math.max(0, totalAmount - depositAmount))}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                id="btn-submit-order-only"
                disabled={cartItems.length === 0}
                onClick={() => handleSubmitOrder(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-98 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>

              <button
                type="button"
                id="btn-submit-order-and-print"
                disabled={cartItems.length === 0}
                onClick={() => handleSubmitOrder(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>Enregistrer & Facture</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
