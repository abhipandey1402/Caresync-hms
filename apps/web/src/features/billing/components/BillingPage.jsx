import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  FileBadge2,
  FilePlus2,
  Filter,
  IndianRupee,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const STATUS_LABELS = {
  all: 'All',
  draft: 'Draft',
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  cancelled: 'Cancelled'
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  unpaid: 'bg-amber-50 text-amber-700 border-amber-200',
  partial: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
};

const DELIVERY_STYLES = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  queued: 'bg-amber-50 text-amber-700 border-amber-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200'
};

const PAYMENT_MODES = ['cash', 'upi', 'card', 'cheque', 'insurance', 'online'];
const BILL_TYPES = ['opd', 'ipd', 'pharmacy', 'procedure', 'other'];

const FALLBACK_BILLS = [
  {
    _id: 'sample-bill-1',
    billNumber: '202604-0042',
    gstInvoiceNumber: '10AABCS1429B1Z5/2627/202604-0042',
    status: 'partial',
    type: 'opd',
    patientId: { _id: 'patient-1', name: 'Ramesh Kumar', uhid: 'P-00012', phone: '9876543210' },
    lineItems: [
      { description: 'Consultation', quantity: 1, rate: 20000, gstRate: 0, totalAmount: 20000 },
      { description: 'ECG', quantity: 1, rate: 30000, gstRate: 12, totalAmount: 33600 }
    ],
    subtotal: 50000,
    totalTax: 3600,
    taxBreakup: { cgst: 1800, sgst: 1800, igst: 0 },
    discount: 5000,
    total: 48600,
    amountPaid: 20000,
    balance: 28600,
    invoiceDeliveryStatus: 'failed',
    payments: [{ mode: 'upi', amount: 20000, reference: 'UPI12345678', timestamp: '2026-04-24T09:00:00.000Z' }],
    createdAt: '2026-04-24T08:30:00.000Z',
    finalizedAt: '2026-04-24T08:35:00.000Z'
  },
  {
    _id: 'sample-bill-2',
    billNumber: '202604-0041',
    gstInvoiceNumber: '10AABCS1429B1Z5/2627/202604-0041',
    status: 'paid',
    type: 'procedure',
    patientId: { _id: 'patient-2', name: 'Sangeeta Devi', uhid: 'P-00011', phone: '9811111111' },
    lineItems: [{ description: 'Minor procedure', quantity: 1, rate: 250000, gstRate: 12, totalAmount: 280000 }],
    subtotal: 250000,
    totalTax: 30000,
    taxBreakup: { cgst: 15000, sgst: 15000, igst: 0 },
    discount: 0,
    total: 280000,
    amountPaid: 280000,
    balance: 0,
    invoiceDeliveryStatus: 'sent',
    payments: [{ mode: 'card', amount: 280000, reference: 'CARD-9918', timestamp: '2026-04-24T07:25:00.000Z' }],
    createdAt: '2026-04-24T07:10:00.000Z',
    finalizedAt: '2026-04-24T07:15:00.000Z'
  },
  {
    _id: 'sample-bill-3',
    billNumber: '202604-0040',
    gstInvoiceNumber: null,
    status: 'draft',
    type: 'opd',
    patientId: { _id: 'patient-3', name: 'Aman Singh', uhid: 'P-00010', phone: '9822222222' },
    lineItems: [{ description: 'Follow-up consultation', quantity: 1, rate: 15000, gstRate: 0, totalAmount: 15000 }],
    subtotal: 15000,
    totalTax: 0,
    taxBreakup: { cgst: 0, sgst: 0, igst: 0 },
    discount: 0,
    total: 15000,
    amountPaid: 0,
    balance: 15000,
    invoiceDeliveryStatus: 'pending',
    payments: [],
    createdAt: '2026-04-24T06:40:00.000Z',
    finalizedAt: null
  }
];

const EMPTY_LINE_ITEM = {
  serviceId: '',
  name: '',
  qty: 1,
  rate: '',
  gstRate: 0,
  hsnCode: ''
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format((Number(amount) || 0) / 100);

const formatDateTime = (value) => {
  if (!value) return 'Not available';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCompactDate = (value) => {
  if (!value) return 'Not finalized';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
};

const buildStatusSummary = (bills) => ({
  totalBilled: bills.reduce((sum, bill) => sum + (bill.total || 0), 0),
  amountPaid: bills.reduce((sum, bill) => sum + (bill.amountPaid || 0), 0),
  outstanding: bills.reduce((sum, bill) => sum + (bill.balance || 0), 0),
  failedDeliveryCount: bills.filter((bill) => bill.invoiceDeliveryStatus === 'failed').length
});

const getApiPayload = (response) => response?.data?.data || [];

const normalizePatientResults = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const getBillTitle = (bill) => bill.patientId?.name || bill.billNumber || 'Bill';

const buildLineItemPreview = (item) => {
  const quantity = Number(item.qty) || 0;
  const rate = Math.round((Number(item.rate) || 0) * 100);
  const gstRate = Number(item.gstRate) || 0;
  const baseAmount = quantity * rate;
  const gstAmount = Math.round(baseAmount * (gstRate / 100));

  return {
    baseAmount,
    gstAmount,
    totalAmount: baseAmount + gstAmount
  };
};

const BillingMetricCard = ({ icon: Icon, title, value, tone = 'green', meta }) => {
  const toneClasses = {
    green: 'bg-[#F7FBF8] border-[#D6E6DB] text-brand-green',
    gold: 'bg-[#FFF9EF] border-[#F2DEB5] text-[#C47C00]',
    blue: 'bg-[#F5F9FF] border-[#D9E5F9] text-[#2358C8]',
    rose: 'bg-[#FFF6F6] border-[#F2D6D6] text-[#D04747]'
  };

  return (
    <div className={cn('h-[156px] rounded-[18px] border p-5 shadow-sm transition-all', toneClasses[tone])}>
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 w-full">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B]">{title}</p>
            {meta ? <p className="mt-1 text-xs font-medium leading-tight text-[#4A6258] line-clamp-2">{meta}</p> : null}
          </div>
        </div>

        <div className="mt-auto pt-5">
          <p className="break-words text-[26px] font-bold leading-none text-[#0F1F17] sm:text-[30px]">{value}</p>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ value }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]',
      STATUS_STYLES[value] || 'bg-slate-100 text-slate-700 border-slate-200'
    )}
  >
    {STATUS_LABELS[value] || value}
  </span>
);

const DeliveryPill = ({ value }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize',
      DELIVERY_STYLES[value] || 'bg-slate-100 text-slate-700 border-slate-200'
    )}
  >
    {value || 'pending'}
  </span>
);

const BillRowSkeleton = () => (
  <div className="grid gap-4 rounded-2xl border border-brand-border/70 bg-white px-4 py-4 lg:grid-cols-[1.2fr,0.8fr,0.7fr,0.7fr,0.6fr]">
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const BillingPage = () => {
  const { user, tenant } = useAuthStore();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submittingBill, setSubmittingBill] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    visitId: '',
    type: 'opd',
    discount: '',
    discountReason: '',
    isDraft: false,
    lineItems: [{ ...EMPTY_LINE_ITEM }]
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'upi',
    reference: '',
    note: ''
  });

  const filteredBills = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return bills.filter((bill) => {
      const matchesStatus = activeStatus === 'all' ? true : bill.status === activeStatus;
      const haystack = [
        bill.billNumber,
        bill.gstInvoiceNumber,
        bill.patientId?.name,
        bill.patientId?.uhid,
        bill.patientId?.phone
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [activeStatus, bills, searchTerm]);

  const selectedBill = useMemo(
    () => filteredBills.find((bill) => bill._id === selectedBillId) || filteredBills[0] || bills[0] || null,
    [bills, filteredBills, selectedBillId]
  );

  const summary = useMemo(() => buildStatusSummary(bills), [bills]);
  const overdueBills = useMemo(
    () => bills.filter((bill) => ['unpaid', 'partial'].includes(bill.status)).slice(0, 4),
    [bills]
  );

  useEffect(() => {
    if (location.pathname.endsWith('/billing/new')) {
      setComposerOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (selectedBill && selectedBill._id !== selectedBillId) {
      setSelectedBillId(selectedBill._id);
    }
  }, [selectedBill, selectedBillId]);

  useEffect(() => {
    let ignore = false;

    const loadBills = async () => {
      setLoading(true);

      try {
        const response = await api.get('/bills');
        if (ignore) return;

        const items = getApiPayload(response);
        setBills(Array.isArray(items) && items.length > 0 ? items : []);
        setUsingFallback(false);
      } catch (error) {
        if (ignore) return;

        setBills(FALLBACK_BILLS);
        setUsingFallback(true);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBills();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!patientQuery || patientQuery.trim().length < 2) {
      setPatientResults([]);
      return;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setPatientSearchLoading(true);

      try {
        const response = await api.get('/patients', {
          params: { q: patientQuery.trim(), limit: 6 }
        });

        if (!ignore) {
          setPatientResults(normalizePatientResults(response));
        }
      } catch {
        if (!ignore) {
          setPatientResults([]);
        }
      } finally {
        if (!ignore) {
          setPatientSearchLoading(false);
        }
      }
    }, 260);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [patientQuery]);

  const refreshBills = async () => {
    setRefreshing(true);

    try {
      const response = await api.get('/bills');
      const items = getApiPayload(response);
      setBills(Array.isArray(items) ? items : []);
      setUsingFallback(false);
      addToast('Billing ledger refreshed', 'success');
    } catch {
      addToast('Could not refresh billing data. Showing current view.', 'warning');
    } finally {
      setRefreshing(false);
    }
  };

  const resetComposer = () => {
    setForm({
      patientId: '',
      visitId: '',
      type: 'opd',
      discount: '',
      discountReason: '',
      isDraft: false,
      lineItems: [{ ...EMPTY_LINE_ITEM }]
    });
    setPatientQuery('');
    setPatientResults([]);
  };

  const closeComposer = () => {
    setComposerOpen(false);
    resetComposer();

    if (location.pathname.endsWith('/billing/new')) {
      navigate('/dashboard/billing', { replace: true });
    }
  };

  const updateLineItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addLineItem = () => {
    setForm((current) => ({
      ...current,
      lineItems: [...current.lineItems, { ...EMPTY_LINE_ITEM }]
    }));
  };

  const removeLineItem = (index) => {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.filter((_, itemIndex) => itemIndex !== index || current.lineItems.length === 1)
    }));
  };

  const composerPreview = useMemo(() => {
    const previews = form.lineItems.map(buildLineItemPreview);
    const subtotal = previews.reduce((sum, item) => sum + item.baseAmount, 0);
    const tax = previews.reduce((sum, item) => sum + item.gstAmount, 0);
    const discount = Math.round((Number(form.discount) || 0) * 100);

    return {
      subtotal,
      tax,
      total: Math.max(0, subtotal + tax - discount)
    };
  }, [form.discount, form.lineItems]);

  const submitBill = async (event) => {
    event.preventDefault();

    if (!form.patientId) {
      addToast('Select a patient before creating a bill', 'warning');
      return;
    }

    setSubmittingBill(true);

    try {
      const payload = {
        patientId: form.patientId,
        visitId: form.visitId || undefined,
        type: form.type,
        discount: Number(form.discount) || 0,
        discountReason: form.discountReason || undefined,
        isDraft: form.isDraft,
        lineItems: form.lineItems.map((item) => ({
          ...(item.serviceId ? { serviceId: item.serviceId } : {}),
          ...(item.name ? { name: item.name } : {}),
          qty: Number(item.qty) || 1,
          ...(item.rate !== '' ? { rate: Number(item.rate) || 0 } : {}),
          gstRate: Number(item.gstRate) || 0,
          ...(item.hsnCode ? { hsnCode: item.hsnCode } : {})
        }))
      };

      const response = await api.post('/bills', payload);
      const createdBill = response?.data?.data;

      setBills((current) => [createdBill, ...current.filter((bill) => bill._id !== createdBill._id)]);
      setSelectedBillId(createdBill._id);
      closeComposer();
      addToast(form.isDraft ? 'Draft bill saved' : 'Bill created and queued for invoice', 'success');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Could not create bill', 'error');
    } finally {
      setSubmittingBill(false);
    }
  };

  const openPaymentModal = () => {
    if (!selectedBill) return;

    setPaymentForm({
      amount: selectedBill.balance ? (selectedBill.balance / 100).toFixed(2) : '',
      mode: 'upi',
      reference: '',
      note: ''
    });
    setPaymentModalOpen(true);
  };

  const submitPayment = async (event) => {
    event.preventDefault();

    if (!selectedBill) return;

    setRecordingPayment(true);

    try {
      const response = await api.post(`/bills/${selectedBill._id}/payments`, {
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        reference: paymentForm.reference || undefined,
        note: paymentForm.note || undefined
      });

      const updatedBill = response?.data?.data;
      setBills((current) => current.map((bill) => (bill._id === updatedBill._id ? updatedBill : bill)));
      setPaymentModalOpen(false);
      addToast('Payment recorded successfully', 'success');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Could not record payment', 'error');
    } finally {
      setRecordingPayment(false);
    }
  };

  const downloadInvoice = async (billId) => {
    setInvoiceLoadingId(billId);

    try {
      const response = await api.get(`/bills/${billId}/invoice`);
      const url = response?.data?.data?.url;

      if (!url) {
        throw new Error('Invoice URL missing');
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Invoice is not ready yet', 'warning');
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const selectedPatient = patientResults.find((patient) => patient._id === form.patientId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Command Center"
        titleHi="रोज़ का collection desk"
        subtitle={`${tenant?.name || 'CareSync Clinic'} · ${user?.role || 'billing'} view`}
        actions={
          <>
            <button
              onClick={refreshBills}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17] transition-colors hover:bg-brand-muted"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setComposerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green"
            >
              <Plus size={16} />
              New Bill
            </button>
          </>
        }
      />

      {usingFallback ? (
        <div className="rounded-2xl border border-amber-200 bg-[#FFF7EA] px-4 py-3 text-sm font-medium text-[#8A5A05]">
          Live billing API is unavailable right now. The page is showing sample ledger data so the workspace remains usable.
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-[#D8E7DD] bg-[linear-gradient(135deg,#F8FCF7_0%,#FFFFFF_45%,#F2F8F4_100%)] p-5 shadow-sm sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_top_right,rgba(26,107,60,0.09),transparent_58%)] lg:block" />
        <div className="relative grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="green">GST Ready</Badge>
              <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4A6258] shadow-sm ring-1 ring-brand-border/80">
                <ShieldCheck size={14} className="shrink-0 text-brand-green" />
                <span className="break-all">Tenant GSTIN {tenant?.gstin || 'not configured'}</span>
              </span>
            </div>
            <div>
              <h2 className="max-w-2xl text-balance font-display text-[28px] leading-[1.02] text-[#0F1F17] sm:text-[32px] lg:text-[34px]">
                Keep collections fast, compliant, and visible before the reception desk gets crowded.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4A6258]">
                Draft bills, collect partial payments, re-open invoices, and keep WhatsApp delivery failures visible without switching screens.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
              <BillingMetricCard
                icon={Receipt}
                title="Billed"
                value={formatCurrency(summary.totalBilled)}
                meta={`${bills.length} bills in ledger`}
              />
              <BillingMetricCard
                icon={CircleDollarSign}
                title="Collected"
                value={formatCurrency(summary.amountPaid)}
                tone="blue"
                meta="Payments recorded"
              />
              <BillingMetricCard
                icon={Wallet}
                title="Outstanding"
                value={formatCurrency(summary.outstanding)}
                tone="gold"
                meta={`${overdueBills.length} bills need follow-up`}
              />
              <BillingMetricCard
                icon={AlertCircle}
                title="Delivery Issues"
                value={String(summary.failedDeliveryCount).padStart(2, '0')}
                tone="rose"
                meta="WhatsApp retries needed"
              />
            </div>
          </div>

          <div className="h-full">
            <div className="flex h-full flex-col rounded-[24px] border border-[#DCE9E0] bg-white/95 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4A6258]">Hot Queue</p>
                  <h3 className="mt-2 text-balance font-display text-2xl leading-tight text-[#0F1F17]">Outstanding Collections</h3>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7EA] text-[#C47C00]">
                  <AlertCircle size={22} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {overdueBills.length > 0 ? (
                  overdueBills.map((bill) => (
                    <button
                      key={bill._id}
                      onClick={() => setSelectedBillId(bill._id)}
                      className="flex w-full flex-col gap-3 rounded-2xl border border-brand-border/80 bg-[#FBFDFB] px-4 py-3 text-left transition-all hover:border-brand-green/40 hover:bg-[#F3F9F4] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0F1F17]">{getBillTitle(bill)}</p>
                        <p className="mt-1 break-words text-xs font-medium text-[#4A6258]">
                          {bill.billNumber} · {formatCompactDate(bill.createdAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-[#0F1F17]">{formatCurrency(bill.balance)}</p>
                        <p className="mt-1 text-xs text-[#4A6258]">{bill.status === 'partial' ? 'Partial paid' : 'Unpaid'}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-brand-border bg-[#FBFDFB] px-4 py-5 text-sm font-medium text-[#4A6258]">
                    No outstanding bills right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <DashboardCard
          title="Bill Ledger"
          titleHi="Search, filter, collect"
          noPadding
          className="overflow-hidden"
        >
          <div className="border-b border-brand-border bg-[#FBFDFB] px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-brand-border bg-white px-4 h-[36px]">
                <Search size={16} className="shrink-0 text-[#4A6258]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by bill no, patient, UHID, phone"
                  className="w-full border-0 bg-transparent text-sm text-[#0F1F17] outline-none placeholder:text-[#6E857B] leading-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-[36px] items-center gap-2 rounded-full bg-white px-3.5 text-xs font-bold text-[#4A6258] ring-1 ring-brand-border">
                  <Filter size={14} />
                  Status
                </span>
                {Object.keys(STATUS_LABELS).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className={cn(
                      'inline-flex h-[36px] items-center rounded-full border px-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-colors',
                      activeStatus === status
                        ? 'border-brand-green bg-brand-green text-white'
                        : 'border-brand-border bg-white text-[#4A6258] hover:border-brand-green/40 hover:text-brand-green'
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="hidden grid-cols-[1.2fr,0.8fr,0.7fr,0.7fr,0.6fr] gap-4 px-4 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B] lg:grid">
              <span>Bill</span>
              <span>Patient</span>
              <span>Total</span>
              <span>Status</span>
              <span>Delivery</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <>
                  <BillRowSkeleton />
                  <BillRowSkeleton />
                  <BillRowSkeleton />
                </>
              ) : filteredBills.length === 0 ? (
                <EmptyState
                  icon={<Receipt size={28} />}
                  title="कोई bill नहीं मिला"
                  titleEn="No bills match these filters"
                  description="Change the search or create a new bill from the command bar."
                  action={{ href: '/dashboard/billing/new', label: 'Create Bill' }}
                />
              ) : (
                filteredBills.map((bill) => (
                  <button
                    key={bill._id}
                    onClick={() => setSelectedBillId(bill._id)}
                    className={cn(
                      'grid w-full gap-4 rounded-[22px] border px-4 py-4 text-left transition-all lg:grid-cols-[1.2fr,0.8fr,0.7fr,0.7fr,0.6fr] lg:items-center',
                      selectedBill?._id === bill._id
                        ? 'border-brand-green bg-[#F3F9F4] shadow-sm'
                        : 'border-brand-border bg-white hover:border-brand-green/30 hover:bg-[#FBFDFB]'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-[#0F1F17]">{bill.billNumber}</p>
                        {bill.gstInvoiceNumber ? (
                          <span className="inline-flex h-6 items-center rounded-full bg-[#EDF8F0] px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">
                            GST
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-xs font-medium leading-5 text-[#4A6258]">
                        {bill.type?.toUpperCase()} · {formatDateTime(bill.finalizedAt || bill.createdAt)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="break-words font-bold text-[#0F1F17]">{bill.patientId?.name || 'Unknown patient'}</p>
                      <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                        {bill.patientId?.uhid || 'UHID unavailable'} {bill.patientId?.phone ? `· ${bill.patientId.phone}` : ''}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-[#0F1F17]">{formatCurrency(bill.total)}</p>
                      <p className="mt-1 text-xs text-[#4A6258]">Due {formatCurrency(bill.balance)}</p>
                    </div>

                    <div className="flex items-start lg:justify-start">
                      <StatusPill value={bill.status} />
                    </div>

                    <div className="flex items-start lg:justify-start">
                      <DeliveryPill value={bill.invoiceDeliveryStatus} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title={selectedBill ? `${selectedBill.billNumber} Snapshot` : 'Billing Snapshot'}
          titleHi="Selected bill details"
          className="h-full"
        >
          {loading && !selectedBill ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : !selectedBill ? (
            <EmptyState
              icon={<FileBadge2 size={26} />}
              title="बिल चुनें"
              titleEn="Choose a bill from the ledger"
              description="Bill tax breakup, invoice delivery, and payments will appear here."
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-[24px] border border-brand-border bg-[#FBFDFB] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6E857B]">Patient</p>
                    <h3 className="mt-2 break-words text-xl font-bold text-[#0F1F17]">{selectedBill.patientId?.name}</h3>
                    <p className="mt-1 break-words text-sm leading-6 text-[#4A6258]">
                      {selectedBill.patientId?.uhid || 'UHID unavailable'} · {selectedBill.patientId?.phone || 'Phone unavailable'}
                    </p>
                  </div>
                  <StatusPill value={selectedBill.status} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-border/80">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6E857B]">Total</p>
                    <p className="mt-2 text-lg font-bold text-[#0F1F17]">{formatCurrency(selectedBill.total)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-border/80">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6E857B]">Balance</p>
                    <p className="mt-2 text-lg font-bold text-[#0F1F17]">{formatCurrency(selectedBill.balance)}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => openPaymentModal()}
                    disabled={selectedBill.status === 'cancelled' || selectedBill.status === 'draft' || selectedBill.balance === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IndianRupee size={16} />
                    Record Payment
                  </button>
                  <button
                    onClick={() => downloadInvoice(selectedBill._id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17] transition-colors hover:bg-brand-muted"
                  >
                    {invoiceLoadingId === selectedBill._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Invoice
                  </button>
                  <Link
                    to="/dashboard/billing/new"
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17] transition-colors hover:bg-brand-muted"
                  >
                    <FilePlus2 size={16} />
                    Clone New
                  </Link>
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-border bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-xl text-[#0F1F17]">Tax & Delivery</h4>
                  <DeliveryPill value={selectedBill.invoiceDeliveryStatus} />
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex flex-col gap-2 rounded-2xl bg-[#FBFDFB] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <span className="font-medium text-[#4A6258]">GST Invoice No.</span>
                    <span className="break-all text-left font-bold leading-6 text-[#0F1F17] sm:max-w-[60%] sm:text-right">
                      {selectedBill.gstInvoiceNumber || 'Pending finalization'}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#FBFDFB] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">CGST</p>
                      <p className="mt-2 font-bold text-[#0F1F17]">{formatCurrency(selectedBill.taxBreakup?.cgst)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#FBFDFB] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">SGST</p>
                      <p className="mt-2 font-bold text-[#0F1F17]">{formatCurrency(selectedBill.taxBreakup?.sgst)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#FBFDFB] px-4 py-3 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">IGST</p>
                      <p className="mt-2 font-bold text-[#0F1F17]">{formatCurrency(selectedBill.taxBreakup?.igst)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-border bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-xl text-[#0F1F17]">Line Items</h4>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">
                    {selectedBill.lineItems?.length || 0} items
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedBill.lineItems?.map((item, index) => (
                    <div key={`${item.description}-${index}`} className="rounded-2xl bg-[#FBFDFB] px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words font-bold text-[#0F1F17]">{item.description}</p>
                          <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                            Qty {item.quantity} · GST {item.gstRate}% {item.hsnCode ? `· HSN ${item.hsnCode}` : ''}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold text-[#0F1F17] sm:text-right">{formatCurrency(item.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-border bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-xl text-[#0F1F17]">Payments</h4>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">
                    {selectedBill.payments?.length || 0} entries
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedBill.payments?.length ? (
                    selectedBill.payments.map((payment, index) => (
                      <div key={`${payment.timestamp}-${index}`} className="rounded-2xl bg-[#FBFDFB] px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-bold capitalize text-[#0F1F17]">{payment.mode}</p>
                            <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                              {payment.reference || 'No reference'} · {formatDateTime(payment.timestamp)}
                            </p>
                          </div>
                          <p className="shrink-0 font-bold text-[#0F1F17] sm:text-right">{formatCurrency(payment.amount)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-[#FBFDFB] px-4 py-6 text-sm font-medium text-[#4A6258]">
                      No payments recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      <Modal isOpen={composerOpen} onClose={closeComposer} title="Create Bill" className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <form onSubmit={submitBill} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
                <h3 className="font-display text-xl text-[#0F1F17]">Patient & Visit</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FormField label="Find Patient" hint="Search by name, phone, or UHID">
                    <div className="rounded-2xl border border-brand-border bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Search size={16} className="shrink-0 text-[#6E857B]" />
                        <input
                          value={patientQuery}
                          onChange={(event) => setPatientQuery(event.target.value)}
                          placeholder="Type at least 2 characters"
                          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#6E857B]"
                        />
                        {patientSearchLoading ? <Loader2 size={16} className="animate-spin text-brand-green" /> : null}
                      </div>
                    </div>
                  </FormField>

                  <FormField label="Bill Type">
                    <select
                      value={form.type}
                      onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                    >
                      {BILL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {patientResults.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {patientResults.map((patient) => (
                      <button
                        key={patient._id}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            patientId: patient._id
                          }))
                        }
                        className={cn(
                          'flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                          form.patientId === patient._id
                            ? 'border-brand-green bg-[#F3F9F4]'
                            : 'border-brand-border bg-white hover:border-brand-green/30'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-bold text-[#0F1F17]">{patient.name}</p>
                          <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                            {patient.uhid || 'UHID unavailable'} · {patient.phone || 'No phone'}
                          </p>
                        </div>
                        {form.patientId === patient._id ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-green" /> : <ArrowRight size={16} className="mt-0.5 shrink-0 text-[#6E857B]" />}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <FormField label="Selected Patient ID" hint={selectedPatient ? `${selectedPatient.name} selected` : 'Required'}>
                    <input
                      value={form.patientId}
                      onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
                      placeholder="Paste patient ObjectId if needed"
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none placeholder:text-[#6E857B]"
                    />
                  </FormField>

                  <FormField label="Visit ID" hint="Optional">
                    <input
                      value={form.visitId}
                      onChange={(event) => setForm((current) => ({ ...current, visitId: event.target.value }))}
                      placeholder="Attach OPD/IPD visit"
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none placeholder:text-[#6E857B]"
                    />
                  </FormField>
                </div>
              </div>

              <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-[#0F1F17]">Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-[#0F1F17]"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {form.lineItems.map((item, index) => {
                    const preview = buildLineItemPreview(item);

                    return (
                      <div key={`line-item-${index}`} className="rounded-[22px] border border-brand-border bg-white p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField label={`Item ${index + 1} Name`}>
                            <input
                              value={item.name}
                              onChange={(event) => updateLineItem(index, 'name', event.target.value)}
                              placeholder="Consultation / ECG / Procedure"
                              className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                            />
                          </FormField>

                          <FormField label="HSN / SAC">
                            <input
                              value={item.hsnCode}
                              onChange={(event) => updateLineItem(index, 'hsnCode', event.target.value)}
                              placeholder="999312"
                              className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                            />
                          </FormField>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <FormField label="Qty">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(event) => updateLineItem(index, 'qty', event.target.value)}
                              className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                            />
                          </FormField>

                          <FormField label="Rate (₹)">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.rate}
                              onChange={(event) => updateLineItem(index, 'rate', event.target.value)}
                              className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                            />
                          </FormField>

                          <FormField label="GST %">
                            <input
                              type="number"
                              min="0"
                              max="28"
                              value={item.gstRate}
                              onChange={(event) => updateLineItem(index, 'gstRate', event.target.value)}
                              className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                            />
                          </FormField>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#F7FBF8] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F1F17]">Item Preview</p>
                            <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                              Base {formatCurrency(preview.baseAmount)} + GST {formatCurrency(preview.gstAmount)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <p className="font-bold text-[#0F1F17]">{formatCurrency(preview.totalAmount)}</p>
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="rounded-xl border border-brand-border px-3 py-2 text-xs font-bold text-[#6E857B]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-brand-border bg-[#0F1F17] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Live Summary</p>
                    <h3 className="mt-1 font-display text-2xl">Bill Preview</h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm text-white/70">Subtotal</span>
                    <span className="font-bold">{formatCurrency(composerPreview.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm text-white/70">Tax</span>
                    <span className="font-bold">{formatCurrency(composerPreview.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm text-white/70">Discount</span>
                    <span className="font-bold">
                      {formatCurrency(Math.round((Number(form.discount) || 0) * 100))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-brand-gold/20 px-4 py-3">
                    <span className="text-sm font-bold text-white">Total</span>
                    <span className="text-xl font-bold">{formatCurrency(composerPreview.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
                <h3 className="font-display text-xl text-[#0F1F17]">Billing Controls</h3>
                <div className="mt-4 space-y-4">
                  <FormField label="Discount (₹)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))}
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                    />
                  </FormField>

                  <FormField label="Discount Reason" hint="Required if discount exceeds 20%">
                    <textarea
                      value={form.discountReason}
                      onChange={(event) => setForm((current) => ({ ...current, discountReason: event.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                    />
                  </FormField>

                  <label className="flex items-start justify-between gap-4 rounded-2xl border border-brand-border bg-white px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#0F1F17]">Save as Draft</p>
                      <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">Draft bills stay editable and won&apos;t queue invoice delivery.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.isDraft}
                      onChange={(event) => setForm((current) => ({ ...current, isDraft: event.target.checked }))}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-brand-border text-brand-green focus:ring-brand-green"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-brand-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[#4A6258]">
              Bills are created in rupees here and stored as paise by the API.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={closeComposer}
                className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17] sm:min-w-[112px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBill}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:min-w-[148px]"
              >
                {submittingBill ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {form.isDraft ? 'Save Draft' : 'Create Bill'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={submitPayment} className="space-y-4">
          <div className="rounded-2xl border border-brand-border bg-[#FBFDFB] p-4">
            <p className="break-words text-sm font-bold text-[#0F1F17]">{selectedBill ? getBillTitle(selectedBill) : 'Selected bill'}</p>
            <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
              Outstanding balance {selectedBill ? formatCurrency(selectedBill.balance) : '₹0.00'}
            </p>
          </div>

          <FormField label="Amount (₹)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
            />
          </FormField>

          <FormField label="Payment Mode">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentForm((current) => ({ ...current, mode }))}
                  className={cn(
                    'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold capitalize',
                    paymentForm.mode === mode
                      ? 'border-brand-green bg-[#F3F9F4] text-brand-green'
                      : 'border-brand-border bg-white text-[#4A6258]'
                  )}
                >
                  <CreditCard size={14} className="shrink-0" />
                  {mode}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Reference">
            <input
              value={paymentForm.reference}
              onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))}
              placeholder="UPI / card / cheque reference"
              className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
            />
          </FormField>

          <FormField label="Internal Note">
            <textarea
              value={paymentForm.note}
              onChange={(event) => setPaymentForm((current) => ({ ...current, note: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordingPayment}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {recordingPayment ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={16} />}
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
