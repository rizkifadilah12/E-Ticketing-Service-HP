import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Check, ClipboardPenLine, Smartphone } from 'lucide-react';
import { useCreateTicket } from '@workspace/api-client-react';
import { LoadingButton } from '@/components/primitives';

const initialForm = { customerName: '', whatsapp: '', deviceBrand: '', deviceModel: '', imei: '', color: '', complaint: '', priority: 'normal', estimatedCompletion: '', condition: '', storage: '', notes: '' };

export default function NewTicketPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState(initialForm);
  const createTicket = useCreateTicket();
  const update = (key: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createTicket.mutate({ data: { ...form, accessories: [] } }, { onSuccess: (ticket) => setLocation(`/tickets/${ticket.id}`) });
  };
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3"><button className="btn-ghost" onClick={() => setLocation('/tickets')} data-testid="button-back-tickets"><ArrowLeft className="size-4" /> Back to tickets</button><span className="text-border">/</span><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">New intake</span></div>
      <div><p className="eyebrow mb-2">Intake / step 01</p><h2 className="text-3xl font-extrabold tracking-[-.06em]">Log a repair.</h2><p className="mt-2 text-sm text-muted-foreground">Capture the handoff cleanly. Diagnosis and pricing can be added from the service record.</p></div>
      <form onSubmit={submit} className="space-y-5">
        <section className="panel rounded-xl p-5 md:p-7"><div className="mb-6 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardPenLine className="size-4" /></span><div><h3 className="text-sm font-extrabold">Customer contact</h3><p className="text-xs text-muted-foreground">WhatsApp is used for service updates.</p></div></div><div className="grid gap-4 md:grid-cols-2"><Field label="Customer name" value={form.customerName} onChange={(value) => update('customerName', value)} required testId="input-customer-name" /><Field label="WhatsApp number" value={form.whatsapp} onChange={(value) => update('whatsapp', value)} required testId="input-customer-whatsapp" /><Field label="Priority" as="select" value={form.priority} onChange={(value) => update('priority', value)} testId="select-new-priority"><option value="normal">Normal</option><option value="high">High priority</option></Field><Field label="Estimated completion" type="datetime-local" value={form.estimatedCompletion} onChange={(value) => update('estimatedCompletion', value)} testId="input-estimate" /></div></section>
        <section className="panel rounded-xl p-5 md:p-7"><div className="mb-6 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-accent/30 text-accent-foreground"><Smartphone className="size-4" /></span><div><h3 className="text-sm font-extrabold">Device handoff</h3><p className="text-xs text-muted-foreground">Record what arrived at the counter.</p></div></div><div className="grid gap-4 md:grid-cols-3"><Field label="Brand" value={form.deviceBrand} onChange={(value) => update('deviceBrand', value)} required testId="input-device-brand" /><Field label="Model" value={form.deviceModel} onChange={(value) => update('deviceModel', value)} required testId="input-device-model" /><Field label="Storage" value={form.storage} onChange={(value) => update('storage', value)} testId="input-device-storage" /><Field label="IMEI / serial" value={form.imei} onChange={(value) => update('imei', value)} testId="input-device-imei" /><Field label="Color" value={form.color} onChange={(value) => update('color', value)} testId="input-device-color" /><Field label="Condition" value={form.condition} onChange={(value) => update('condition', value)} testId="input-device-condition" /></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Customer complaint" as="textarea" value={form.complaint} onChange={(value) => update('complaint', value)} required testId="textarea-complaint" /><Field label="Intake notes" as="textarea" value={form.notes} onChange={(value) => update('notes', value)} testId="textarea-intake-notes" /></div></section>
        {createTicket.isError && <p className="rounded-lg bg-destructive/10 p-3 text-xs font-bold text-destructive" data-testid="text-create-error">Could not create this ticket. Check the required fields and try again.</p>}
        <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setLocation('/tickets')} data-testid="button-cancel-intake">Cancel</button><button type="submit" className="btn-primary" disabled={createTicket.isPending} data-testid="button-submit-ticket"><LoadingButton pending={createTicket.isPending}><Check className="size-4" /> Create ticket</LoadingButton></button></div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', as = 'input', required, testId, children }: { label: string; value: string; onChange: (value: string) => void; type?: string; as?: 'input' | 'textarea' | 'select'; required?: boolean; testId: string; children?: React.ReactNode }) {
  return <label className="block"><span className="label">{label}{required && <span className="text-destructive"> *</span>}</span>{as === 'textarea' ? <textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} className="field min-h-28 resize-y" data-testid={testId} /> : as === 'select' ? <select value={value} onChange={(event) => onChange(event.target.value)} className="field" data-testid={testId}>{children}</select> : <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="field" data-testid={testId} />}</label>;
}