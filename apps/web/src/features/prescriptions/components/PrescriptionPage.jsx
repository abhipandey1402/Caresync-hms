import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileClock,
  FilePlus2,
  FileSignature,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Stethoscope,
  Syringe,
  X
} from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const FREQUENCY_OPTIONS = [
  { code: 'OD', en: 'Once daily', hi: 'दिन में एक बार' },
  { code: 'BD', en: 'Twice daily', hi: 'दिन में दो बार' },
  { code: 'TDS', en: 'Thrice daily', hi: 'दिन में तीन बार' },
  { code: 'QDS', en: 'Four times daily', hi: 'दिन में चार बार' },
  { code: 'HS', en: 'At bedtime', hi: 'सोते समय' },
  { code: 'SOS', en: 'As needed', hi: 'जरूरत पड़ने पर' }
];

const ROUTE_OPTIONS = ['oral', 'iv', 'im', 'topical', 'inhalation'];

const EMPTY_MEDICINE = {
  medicineCode: '',
  name: '',
  genericName: '',
  dose: '1 tablet',
  frequency: 'OD',
  duration: '5 days',
  route: 'oral',
  instructions: 'After food',
  isSubstitutable: true
};

const EMPTY_LAB = { name: '', instructions: '' };

const FALLBACK_VISITS = [
  {
    _id: 'visit-1',
    tokenNumber: 38,
    chiefComplaint: 'Fever, sore throat, and mild headache',
    type: 'opd',
    status: 'in_consultation',
    visitDate: '2026-04-24T09:10:00.000Z',
    patientId: {
      _id: 'patient-1',
      name: 'Ramesh Kumar',
      uhid: 'P-00012',
      phone: '9876543210',
      gender: 'male',
      dateOfBirth: '1987-05-14T00:00:00.000Z'
    },
    vitals: {
      systolicBp: 130,
      diastolicBp: 85,
      temperatureF: 99.2,
      spo2: 97
    }
  },
  {
    _id: 'visit-2',
    tokenNumber: 39,
    chiefComplaint: 'Seasonal allergy with sneezing',
    type: 'follow_up',
    status: 'checked_in',
    visitDate: '2026-04-24T09:25:00.000Z',
    patientId: {
      _id: 'patient-2',
      name: 'Sangeeta Devi',
      uhid: 'P-00013',
      phone: '9811111111',
      gender: 'female',
      dateOfBirth: '1991-08-20T00:00:00.000Z'
    },
    vitals: {
      systolicBp: 120,
      diastolicBp: 80,
      temperatureF: 98.4,
      spo2: 99
    }
  }
];

const FALLBACK_TEMPLATES = [
  {
    _id: 'template-1',
    name: 'Fever Protocol',
    diagnosis: [{ icdCode: 'J06.9', name: 'Acute upper respiratory infection', type: 'primary' }],
    medicines: [
      { ...EMPTY_MEDICINE, name: 'Azithromycin 500mg', genericName: 'Azithromycin', duration: '5 days' },
      { ...EMPTY_MEDICINE, name: 'Paracetamol 500mg', genericName: 'Paracetamol', frequency: 'TDS', duration: '3 days', instructions: 'SOS fever' }
    ],
    labTests: [{ name: 'CBC', instructions: 'Fasting' }],
    advice: 'Rest for 3 days. Drink warm water. Avoid cold food.'
  }
];

const FALLBACK_PRESCRIPTIONS = [
  {
    _id: 'rx-1',
    visitId: { _id: 'visit-1', chiefComplaint: 'Fever, sore throat, and mild headache' },
    patientId: { name: 'Ramesh Kumar', uhid: 'P-00012', phone: '9876543210' },
    doctorId: { name: 'Dr. Rajesh Sharma', profile: { registrationNumber: 'MCI/12345' } },
    status: 'draft',
    version: 2,
    diagnosis: [{ icdCode: 'J06.9', name: 'Acute upper respiratory infection', type: 'primary' }],
    medicines: [{ ...EMPTY_MEDICINE, name: 'Azithromycin 500mg', genericName: 'Azithromycin' }],
    labTests: [],
    advice: 'Steam inhalation twice daily.',
    followUpDate: '2026-04-28T00:00:00.000Z',
    deliveryStatus: 'pending',
    createdAt: '2026-04-24T09:12:00.000Z',
    finalizedAt: null
  },
  {
    _id: 'rx-2',
    visitId: { _id: 'visit-older', chiefComplaint: 'Allergic rhinitis' },
    patientId: { name: 'Sangeeta Devi', uhid: 'P-00013', phone: '9811111111' },
    doctorId: { name: 'Dr. Rajesh Sharma', profile: { registrationNumber: 'MCI/12345' } },
    status: 'finalized',
    version: 1,
    diagnosis: [{ icdCode: 'J30.4', name: 'Allergic rhinitis', type: 'primary' }],
    medicines: [{ ...EMPTY_MEDICINE, name: 'Levocetirizine 5mg', genericName: 'Levocetirizine', frequency: 'HS', duration: '7 days' }],
    labTests: [],
    advice: 'Avoid dust exposure.',
    followUpDate: '2026-05-01T00:00:00.000Z',
    deliveryStatus: 'sent',
    pdfKey: 'prescriptions/tenant/rx-2.pdf',
    createdAt: '2026-04-23T11:00:00.000Z',
    finalizedAt: '2026-04-23T11:08:00.000Z'
  }
];

const STATUS_STYLES = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  finalized: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const DELIVERY_STYLES = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  queued: 'bg-blue-50 text-blue-700 border-blue-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200'
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not finalized';

const calcAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'NA';
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

const createBlankDraft = () => ({
  visitId: '',
  diagnosis: [],
  medicines: [{ ...EMPTY_MEDICINE }],
  labTests: [],
  advice: '',
  followUpDate: '',
  notes: ''
});

const PrescriptionStatusPill = ({ value }) => (
  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em]', STATUS_STYLES[value] || STATUS_STYLES.draft)}>
    {value}
  </span>
);

const DeliveryPill = ({ value }) => (
  <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize', DELIVERY_STYLES[value] || DELIVERY_STYLES.pending)}>
    {value || 'pending'}
  </span>
);

export const PrescriptionPage = () => {
  const { user, tenant } = useAuthStore();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  const [visits, setVisits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [draft, setDraft] = useState(createBlankDraft());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [diagnosisResults, setDiagnosisResults] = useState([]);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [medicineResults, setMedicineResults] = useState({});
  const [medicineLoadingIndex, setMedicineLoadingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [pdfLoadingId, setPdfLoadingId] = useState(null);

  const selectedVisit = useMemo(
    () => visits.find((visit) => visit._id === selectedVisitId) || visits[0] || null,
    [selectedVisitId, visits]
  );

  const recentForVisit = useMemo(
    () => prescriptions.find((item) => item.visitId?._id === selectedVisitId) || null,
    [prescriptions, selectedVisitId]
  );

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);

      try {
        const [queueResponse, templateResponse, prescriptionResponse] = await Promise.all([
          api.get('/opd/queue'),
          api.get('/rx-templates'),
          api.get('/prescriptions')
        ]);

        const visitItems = queueResponse?.data?.data || [];
        const templateItems = templateResponse?.data?.data || [];
        const prescriptionItems = prescriptionResponse?.data?.data || [];

        setVisits(visitItems);
        setTemplates(templateItems);
        setPrescriptions(prescriptionItems);
        setUsingFallback(false);

        const routeVisitId = searchParams.get('visit');
        const firstVisitId = routeVisitId || visitItems[0]?._id || '';
        setSelectedVisitId(firstVisitId);

        const existingDraft = prescriptionItems.find((item) => item.visitId?._id === firstVisitId);
        if (existingDraft) {
          setDraft({
            visitId: firstVisitId,
            diagnosis: existingDraft.diagnosis || [],
            medicines: existingDraft.medicines?.length ? existingDraft.medicines : [{ ...EMPTY_MEDICINE }],
            labTests: existingDraft.labTests || [],
            advice: existingDraft.advice || '',
            followUpDate: existingDraft.followUpDate ? String(existingDraft.followUpDate).slice(0, 10) : '',
            notes: existingDraft.notes || ''
          });
        } else {
          setDraft((current) => ({ ...current, visitId: firstVisitId }));
        }
      } catch {
        setVisits(FALLBACK_VISITS);
        setTemplates(FALLBACK_TEMPLATES);
        setPrescriptions(FALLBACK_PRESCRIPTIONS);
        setSelectedVisitId(FALLBACK_VISITS[0]?._id || '');
        setDraft({
          visitId: FALLBACK_VISITS[0]?._id || '',
          diagnosis: [],
          medicines: [{ ...EMPTY_MEDICINE }],
          labTests: [],
          advice: '',
          followUpDate: '',
          notes: ''
        });
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedVisitId) return;

    const existingDraft = prescriptions.find((item) => item.visitId?._id === selectedVisitId);
    if (existingDraft) {
      setDraft({
        visitId: selectedVisitId,
        diagnosis: existingDraft.diagnosis || [],
        medicines: existingDraft.medicines?.length ? existingDraft.medicines : [{ ...EMPTY_MEDICINE }],
        labTests: existingDraft.labTests || [],
        advice: existingDraft.advice || '',
        followUpDate: existingDraft.followUpDate ? String(existingDraft.followUpDate).slice(0, 10) : '',
        notes: existingDraft.notes || ''
      });
    } else {
      setDraft({
        visitId: selectedVisitId,
        diagnosis: [],
        medicines: [{ ...EMPTY_MEDICINE }],
        labTests: [],
        advice: '',
        followUpDate: '',
        notes: ''
      });
    }
  }, [prescriptions, selectedVisitId]);

  useEffect(() => {
    if (!diagnosisQuery || diagnosisQuery.trim().length < 2) {
      setDiagnosisResults([]);
      return;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setDiagnosisLoading(true);
      try {
        const response = await api.get('/diagnoses/search', { params: { q: diagnosisQuery.trim(), limit: 8 } });
        if (!ignore) {
          setDiagnosisResults(response?.data?.data || []);
        }
      } catch {
        if (!ignore) setDiagnosisResults([]);
      } finally {
        if (!ignore) setDiagnosisLoading(false);
      }
    }, 220);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [diagnosisQuery]);

  useEffect(() => {
    if (activeMedicineIndex === null) return;

    const row = draft.medicines[activeMedicineIndex];
    const query = row?.name?.trim();

    if (!query || query.length < 2) {
      setMedicineResults((current) => ({ ...current, [activeMedicineIndex]: [] }));
      return;
    }

    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      setMedicineLoadingIndex(activeMedicineIndex);
      try {
        const response = await api.get('/medicines/search', { params: { q: query, limit: 8 } });
        if (!ignore) {
          setMedicineResults((current) => ({ ...current, [activeMedicineIndex]: response?.data?.data || [] }));
        }
      } catch {
        if (!ignore) {
          setMedicineResults((current) => ({ ...current, [activeMedicineIndex]: [] }));
        }
      } finally {
        if (!ignore) setMedicineLoadingIndex(null);
      }
    }, 220);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeMedicineIndex, draft.medicines]);

  const refreshPage = async () => {
    setRefreshing(true);
    try {
      const [queueResponse, templateResponse, prescriptionResponse] = await Promise.all([
        api.get('/opd/queue'),
        api.get('/rx-templates'),
        api.get('/prescriptions')
      ]);
      setVisits(queueResponse?.data?.data || []);
      setTemplates(templateResponse?.data?.data || []);
      setPrescriptions(prescriptionResponse?.data?.data || []);
      setUsingFallback(false);
      addToast('EMR workspace refreshed', 'success');
    } catch {
      addToast('Could not refresh EMR data right now', 'warning');
    } finally {
      setRefreshing(false);
    }
  };

  const updateMedicine = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      medicines: current.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine
      )
    }));
  };

  const addMedicine = () => {
    setDraft((current) => ({
      ...current,
      medicines: [...current.medicines, { ...EMPTY_MEDICINE }]
    }));
  };

  const removeMedicine = (index) => {
    setDraft((current) => ({
      ...current,
      medicines: current.medicines.filter((_, medicineIndex) => current.medicines.length === 1 || medicineIndex !== index)
    }));
  };

  const addDiagnosis = (item) => {
    setDraft((current) => ({
      ...current,
      diagnosis: [...current.diagnosis.filter((entry) => entry.icdCode !== item.icdCode), { ...item, type: 'primary' }]
    }));
    setDiagnosisQuery('');
    setDiagnosisResults([]);
  };

  const removeDiagnosis = (icdCode) => {
    setDraft((current) => ({
      ...current,
      diagnosis: current.diagnosis.filter((item) => item.icdCode !== icdCode)
    }));
  };

  const addLabTest = () => {
    setDraft((current) => ({
      ...current,
      labTests: [...current.labTests, { ...EMPTY_LAB }]
    }));
  };

  const updateLab = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      labTests: current.labTests.map((lab, labIndex) => (labIndex === index ? { ...lab, [field]: value } : lab))
    }));
  };

  const removeLab = (index) => {
    setDraft((current) => ({
      ...current,
      labTests: current.labTests.filter((_, labIndex) => labIndex !== index)
    }));
  };

  const applyTemplate = (template) => {
    setDraft((current) => ({
      ...current,
      diagnosis: template.diagnosis || [],
      medicines: template.medicines?.length ? template.medicines : [{ ...EMPTY_MEDICINE }],
      labTests: template.labTests || [],
      advice: template.advice || current.advice
    }));
    addToast(`Template "${template.name}" applied`, 'success');
  };

  const persistPrescription = async (finalize = false) => {
    if (!selectedVisitId) {
      addToast('Select an active visit first', 'warning');
      return;
    }

    const payload = {
      visitId: selectedVisitId,
      diagnosis: draft.diagnosis,
      medicines: draft.medicines,
      labTests: draft.labTests.filter((item) => item.name),
      advice: draft.advice,
      notes: draft.notes,
      ...(draft.followUpDate ? { followUpDate: draft.followUpDate } : {})
    };

    if (finalize) {
      setFinalizing(true);
    } else {
      setSaving(true);
    }

    try {
      const saveResponse = await api.post('/prescriptions', payload);
      const saved = saveResponse?.data?.data;
      let finalPrescription = saved;

      if (finalize) {
        const finalizeResponse = await api.post(`/prescriptions/${saved._id}/finalize`);
        finalPrescription = finalizeResponse?.data?.data;
      }

      setPrescriptions((current) => {
        const withoutCurrent = current.filter((item) => item._id !== finalPrescription._id);
        return [finalPrescription, ...withoutCurrent];
      });

      addToast(finalize ? 'Prescription finalized and queued for PDF' : 'Prescription draft saved', 'success');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Could not save prescription', 'error');
    } finally {
      setSaving(false);
      setFinalizing(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      addToast('Enter a template name first', 'warning');
      return;
    }

    setSavingTemplate(true);
    try {
      const response = await api.post('/rx-templates', {
        name: templateName.trim(),
        speciality: user?.profile?.specialization,
        diagnosis: draft.diagnosis,
        medicines: draft.medicines,
        labTests: draft.labTests.filter((item) => item.name),
        advice: draft.advice
      });

      const created = response?.data?.data;
      setTemplates((current) => [created, ...current.filter((item) => item._id !== created._id)]);
      setTemplateName('');
      addToast('Template saved', 'success');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Could not save template', 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const downloadPdf = async (id) => {
    setPdfLoadingId(id);
    try {
      const response = await api.get(`/prescriptions/${id}/pdf`);
      const url = response?.data?.data?.url;
      if (!url) throw new Error('PDF URL missing');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      addToast(error?.response?.data?.message || 'PDF is not ready yet', 'warning');
    } finally {
      setPdfLoadingId(null);
    }
  };

  const preview = useMemo(() => {
    return {
      medicineCount: draft.medicines.filter((item) => item.name).length,
      diagnosisCount: draft.diagnosis.length,
      labCount: draft.labTests.filter((item) => item.name).length
    };
  }, [draft]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription Workspace"
        titleHi="डिजिटल पर्चा builder"
        subtitle={`${tenant?.name || 'CareSync Clinic'} · ${user?.name || 'Doctor'} · under-60-second follow-up flow`}
        actions={
          <>
            <button
              onClick={refreshPage}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-bold text-[#0F1F17]"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              to="/dashboard/prescriptions/new"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              <FilePlus2 size={16} />
              New Rx
            </Link>
          </>
        }
      />

      {usingFallback ? (
        <div className="rounded-2xl border border-amber-200 bg-[#FFF7EA] px-4 py-3 text-sm font-medium text-[#8A5A05]">
          Live EMR API is unavailable right now. The screen is using sample clinical data so the workflow remains usable.
        </div>
      ) : null}

      <section className="rounded-[28px] border border-[#D8E7DD] bg-[linear-gradient(135deg,#F8FCF7_0%,#FFFFFF_55%,#F2F8F4_100%)] p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.35fr,0.65fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge color="green">Digital Rx</Badge>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4A6258] shadow-sm ring-1 ring-brand-border/80">
                <FileSignature size={14} className="text-brand-green" />
                MCI / NMC {user?.profile?.registrationNumber || 'not configured'}
              </span>
            </div>
            <div>
              <h2 className="max-w-3xl text-balance font-display text-[28px] leading-[1.04] text-[#0F1F17] sm:text-[34px]">
                Diagnose, prescribe, and finalize with bilingual instructions from one clinical surface.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4A6258]">
                Medicine autocomplete, ICD search, reusable templates, and patient-ready PDF delivery are all in the same doctor workflow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[18px] border border-[#D6E6DB] bg-[#F7FBF8] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <ClipboardList size={18} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B]">Diagnosis</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F1F17]">{preview.diagnosisCount}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[#D6E6DB] bg-[#F7FBF8] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Syringe size={18} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B]">Medicines</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F1F17]">{preview.medicineCount}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[#F2DEB5] bg-[#FFF9EF] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <FlaskConical size={18} className="text-[#C47C00]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B]">Lab Orders</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F1F17]">{preview.labCount}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[#D9E5F9] bg-[#F5F9FF] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <FileClock size={18} className="text-[#2358C8]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6E857B]">Recent Rx</p>
                    <p className="mt-1 text-2xl font-bold text-[#0F1F17]">{prescriptions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#DCE9E0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4A6258]">Template Shelf</p>
                <h3 className="mt-2 font-display text-2xl text-[#0F1F17]">One-click recall</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDF8F0] text-brand-green">
                <FileSignature size={20} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {templates.length ? (
                templates.slice(0, 4).map((template) => (
                  <button
                    key={template._id}
                    onClick={() => applyTemplate(template)}
                    className="flex w-full items-start justify-between gap-3 rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-left transition-colors hover:border-brand-green/30 hover:bg-[#F3F9F4]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#0F1F17]">{template.name}</p>
                      <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                        {(template.diagnosis || []).map((item) => item.name).join(', ') || 'Template'}
                      </p>
                    </div>
                    <ChevronRight size={16} className="mt-0.5 shrink-0 text-[#6E857B]" />
                  </button>
                ))
              ) : (
                <EmptyState
                  icon={<FileSignature size={24} />}
                  title="अभी template नहीं है"
                  titleEn="No saved prescription templates yet"
                  description="Save a common protocol once and reuse it in follow-up visits."
                  className="py-6"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.78fr,1.22fr,0.92fr]">
        <DashboardCard title="Active Visits" titleHi="Select consultation context" className="h-fit">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : visits.length === 0 ? (
            <EmptyState
              icon={<Stethoscope size={26} />}
              title="No active visits"
              titleEn="No OPD context available"
              description="Once a patient enters consultation, the visit will appear here."
            />
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <button
                  key={visit._id}
                  onClick={() => setSelectedVisitId(visit._id)}
                  className={cn(
                    'w-full rounded-[22px] border px-4 py-4 text-left transition-all',
                    selectedVisit?._id === visit._id
                      ? 'border-brand-green bg-[#F3F9F4]'
                      : 'border-brand-border bg-white hover:border-brand-green/30 hover:bg-[#FBFDFB]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 items-center rounded-full bg-[#EDF8F0] px-2.5 text-xs font-bold text-brand-green">
                          #{visit.tokenNumber || 'NA'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">{visit.status}</span>
                      </div>
                      <p className="mt-3 break-words font-bold text-[#0F1F17]">{visit.patientId?.name}</p>
                      <p className="mt-1 text-xs text-[#4A6258]">{visit.patientId?.uhid} · {visit.type?.toUpperCase()}</p>
                      <p className="mt-2 break-words text-xs leading-5 text-[#4A6258]">{visit.chiefComplaint || 'No chief complaint recorded.'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Prescription Builder" titleHi="Draft, template, finalize" className="overflow-hidden" noPadding>
          <div className="border-b border-brand-border bg-[#FBFDFB] px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6E857B]">Current Visit</p>
                <h3 className="mt-1 break-words text-lg font-bold text-[#0F1F17]">
                  {selectedVisit?.patientId?.name || 'Select a visit'} {selectedVisit ? `· Age ${calcAge(selectedVisit.patientId?.dateOfBirth)}` : ''}
                </h3>
                <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                  {selectedVisit?.chiefComplaint || 'No complaint available'} {selectedVisit?.vitals?.temperatureF ? `· Temp ${selectedVisit.vitals.temperatureF}°F` : ''}
                </p>
              </div>
              {recentForVisit ? <PrescriptionStatusPill value={recentForVisit.status} /> : <Badge color="green">New Draft</Badge>}
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl text-[#0F1F17]">Diagnosis</h3>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#4A6258] ring-1 ring-brand-border">
                  <Search size={14} />
                  ICD search
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-brand-border bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <Search size={16} className="shrink-0 text-[#6E857B]" />
                  <input
                    value={diagnosisQuery}
                    onChange={(event) => setDiagnosisQuery(event.target.value)}
                    placeholder="Search fever, URI, J06.9"
                    className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#6E857B]"
                  />
                  {diagnosisLoading ? <Loader2 size={16} className="animate-spin text-brand-green" /> : null}
                </div>
              </div>

              {diagnosisResults.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {diagnosisResults.map((result) => (
                    <button
                      key={result.icdCode}
                      onClick={() => addDiagnosis(result)}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-brand-border bg-white px-4 py-3 text-left hover:border-brand-green/30 hover:bg-[#F3F9F4]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0F1F17]">{result.name}</p>
                        <p className="mt-1 text-xs text-[#4A6258]">{result.icdCode} · {result.category}</p>
                      </div>
                      <Plus size={16} className="mt-0.5 shrink-0 text-brand-green" />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {draft.diagnosis.length ? (
                  draft.diagnosis.map((item) => (
                    <span key={item.icdCode} className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-2 text-sm font-medium text-[#0F1F17]">
                      <span className="font-bold text-brand-green">{item.icdCode}</span>
                      <span>{item.name}</span>
                      <button type="button" onClick={() => removeDiagnosis(item.icdCode)} className="text-[#6E857B] hover:text-brand-error">
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-brand-border bg-white px-4 py-5 text-sm font-medium text-[#4A6258]">
                    Add primary diagnosis to unlock a complete prescription.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl text-[#0F1F17]">Medicines</h3>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-[#0F1F17]"
                >
                  <Plus size={14} />
                  Add medicine
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {draft.medicines.map((medicine, index) => (
                  <div key={`medicine-${index}`} className="rounded-[22px] border border-brand-border bg-white p-4">
                    <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                      <FormField label={`Medicine ${index + 1}`} hint="Autocomplete from master">
                        <div className="rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Search size={16} className="shrink-0 text-[#6E857B]" />
                            <input
                              value={medicine.name}
                              onFocus={() => setActiveMedicineIndex(index)}
                              onChange={(event) => {
                                setActiveMedicineIndex(index);
                                updateMedicine(index, 'name', event.target.value);
                              }}
                              placeholder="Search medicine"
                              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#6E857B]"
                            />
                            {medicineLoadingIndex === index ? <Loader2 size={16} className="animate-spin text-brand-green" /> : null}
                          </div>
                        </div>
                      </FormField>

                      <FormField label="Generic Name">
                        <input
                          value={medicine.genericName}
                          onChange={(event) => updateMedicine(index, 'genericName', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        />
                      </FormField>
                    </div>

                    {medicineResults[index]?.length ? (
                      <div className="mt-3 grid gap-2">
                        {medicineResults[index].map((result) => (
                          <button
                            key={`${result.code}-${index}`}
                            type="button"
                            onClick={() => {
                              updateMedicine(index, 'medicineCode', result.code || '');
                              updateMedicine(index, 'name', result.name || '');
                              updateMedicine(index, 'genericName', result.genericName || '');
                              setMedicineResults((current) => ({ ...current, [index]: [] }));
                            }}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-left hover:border-brand-green/30 hover:bg-[#F3F9F4]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#0F1F17]">{result.name}</p>
                              <p className="mt-1 text-xs text-[#4A6258]">{result.genericName || 'Generic unavailable'} {result.strength ? `· ${result.strength}` : ''}</p>
                            </div>
                            <Plus size={16} className="mt-0.5 shrink-0 text-brand-green" />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <FormField label="Dose">
                        <input
                          value={medicine.dose}
                          onChange={(event) => updateMedicine(index, 'dose', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        />
                      </FormField>

                      <FormField label="Frequency">
                        <select
                          value={medicine.frequency}
                          onChange={(event) => updateMedicine(index, 'frequency', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        >
                          {FREQUENCY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.code} · {option.hi}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Duration">
                        <input
                          value={medicine.duration}
                          onChange={(event) => updateMedicine(index, 'duration', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        />
                      </FormField>

                      <FormField label="Route">
                        <select
                          value={medicine.route}
                          onChange={(event) => updateMedicine(index, 'route', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        >
                          {ROUTE_OPTIONS.map((route) => (
                            <option key={route} value={route}>
                              {route}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
                      <FormField label="Instructions">
                        <input
                          value={medicine.instructions}
                          onChange={(event) => updateMedicine(index, 'instructions', event.target.value)}
                          className="w-full rounded-2xl border border-brand-border bg-[#FBFDFB] px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                        />
                      </FormField>
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-[#6E857B]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl text-[#0F1F17]">Labs & Advice</h3>
                <button
                  type="button"
                  onClick={addLabTest}
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-[#0F1F17]"
                >
                  <Plus size={14} />
                  Add lab
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {draft.labTests.map((lab, index) => (
                  <div key={`lab-${index}`} className="grid gap-4 md:grid-cols-[1fr,1fr,auto]">
                    <FormField label={`Lab ${index + 1}`}>
                      <input
                        value={lab.name}
                        onChange={(event) => updateLab(index, 'name', event.target.value)}
                        className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                      />
                    </FormField>
                    <FormField label="Instructions">
                      <input
                        value={lab.instructions}
                        onChange={(event) => updateLab(index, 'instructions', event.target.value)}
                        className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                      />
                    </FormField>
                    <button type="button" onClick={() => removeLab(index)} className="rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-[#6E857B]">
                      Remove
                    </button>
                  </div>
                ))}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Advice">
                    <textarea
                      value={draft.advice}
                      onChange={(event) => setDraft((current) => ({ ...current, advice: event.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                    />
                  </FormField>
                  <div className="space-y-4">
                    <FormField label="Follow-up Date">
                      <input
                        type="date"
                        value={draft.followUpDate}
                        onChange={(event) => setDraft((current) => ({ ...current, followUpDate: event.target.value }))}
                        className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                      />
                    </FormField>

                    <FormField label="Notes">
                      <textarea
                        value={draft.notes}
                        onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-dashed border-brand-border bg-[#FBFDFB] px-4 py-4">
              <p className="text-sm font-medium leading-6 text-[#4A6258]">
                Draft saves increase version automatically. Finalize locks the prescription and queues PDF + WhatsApp delivery.
              </p>
            </div>
          </div>
        </DashboardCard>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <DashboardCard title="Doctor Actions" titleHi="Always visible controls">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">Draft Status</p>
                <p className="mt-2 text-lg font-bold text-[#0F1F17]">
                  {recentForVisit ? `Version ${recentForVisit.version}` : 'Unsaved draft'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {recentForVisit ? <PrescriptionStatusPill value={recentForVisit.status} /> : <Badge color="green">Ready to save</Badge>}
                  {recentForVisit?.deliveryStatus ? <DeliveryPill value={recentForVisit.deliveryStatus} /> : null}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => persistPrescription(false)}
                  disabled={saving || finalizing}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-[#0F1F17] disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => persistPrescription(true)}
                  disabled={saving || finalizing}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {finalizing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Finalize Prescription
                </button>
                {recentForVisit?.status === 'finalized' ? (
                  <button
                    type="button"
                    onClick={() => downloadPdf(recentForVisit._id)}
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-[#0F1F17]"
                  >
                    {pdfLoadingId === recentForVisit._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Download PDF
                  </button>
                ) : null}
              </div>

              <div className="border-t border-brand-border pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">Save Current Protocol</p>
                <div className="mt-3 space-y-3">
                  <input
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    placeholder="Template name"
                    className="w-full rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-medium text-[#0F1F17] outline-none"
                  />
                  <button
                    type="button"
                    onClick={saveTemplate}
                    disabled={savingTemplate}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-[#0F1F17] disabled:opacity-60"
                  >
                    {savingTemplate ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save as Template
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Patient Snapshot" titleHi="Visit-linked context">
            {selectedVisit ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">Patient</p>
                  <p className="mt-2 break-words text-xl font-bold text-[#0F1F17]">{selectedVisit.patientId?.name}</p>
                  <p className="mt-1 break-words text-sm text-[#4A6258]">
                    {selectedVisit.patientId?.uhid} · {calcAge(selectedVisit.patientId?.dateOfBirth)}y · {selectedVisit.patientId?.gender}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#FBFDFB] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">Chief Complaint</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F17]">{selectedVisit.chiefComplaint || 'NA'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FBFDFB] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6E857B]">Vitals</p>
                    <p className="mt-2 text-sm font-medium text-[#0F1F17]">
                      BP {selectedVisit.vitals?.systolicBp || '-'}{selectedVisit.vitals?.diastolicBp ? `/${selectedVisit.vitals.diastolicBp}` : ''} · Temp {selectedVisit.vitals?.temperatureF || '-'}°F
                    </p>
                  </div>
                </div>
                <Link to={`/dashboard/patients/${selectedVisit.patientId?._id || ''}`} className="inline-flex items-center gap-2 text-sm font-bold text-brand-green">
                  View Full History <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<CalendarDays size={24} />}
                title="Select visit"
                titleEn="Choose an active consultation"
                description="Vitals and chief complaint will appear here."
              />
            )}
          </DashboardCard>

          <DashboardCard title="Recent Prescriptions" titleHi="Drafts and finalized">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : prescriptions.length === 0 ? (
              <EmptyState
                icon={<FileSignature size={24} />}
                title="No prescriptions yet"
                titleEn="Draft or finalize the first one"
                description="Recent versions and delivery status will show here."
              />
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 6).map((item) => (
                  <div key={item._id} className="rounded-[22px] border border-brand-border bg-[#FBFDFB] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-bold text-[#0F1F17]">{item.patientId?.name}</p>
                        <p className="mt-1 break-words text-xs leading-5 text-[#4A6258]">
                          V{item.version} · {item.diagnosis?.map((entry) => entry.icdCode).join(', ') || 'No diagnosis'} · {formatDateTime(item.finalizedAt || item.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PrescriptionStatusPill value={item.status} />
                        <DeliveryPill value={item.deliveryStatus} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitId(item.visitId?._id || selectedVisitId)}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-[#0F1F17]"
                      >
                        <CheckCircle2 size={14} />
                        {item.status === 'finalized' ? 'Open Visit' : 'Open Draft'}
                      </button>
                      {item.status === 'finalized' ? (
                        <button
                          type="button"
                          onClick={() => downloadPdf(item._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-[#0F1F17]"
                        >
                          {pdfLoadingId === item._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          PDF
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};
