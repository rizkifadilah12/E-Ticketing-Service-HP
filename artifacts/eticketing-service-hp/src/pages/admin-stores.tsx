import { useState } from 'react';
import {
  useCreateAdminStore,
  useCreateStoreOperator,
  useListAdminStores,
  useUpdateStoreMembership,
  type AdminStore,
} from '@workspace/api-client-react';
import { Building2, Plus } from 'lucide-react';

const emptyStore = {
  name: '',
  code: '',
  address: '',
  phone: '',
  membershipPlan: 'monthly' as const,
  membershipExpiresAt: '',
  operatorName: '',
  operatorEmail: '',
  operatorPassword: '',
};

function planLabel(store: AdminStore) {
  if (store.membershipPlan === 'lifetime') return 'Lifetime (lunas)';
  if (store.membershipPlan === 'monthly' && store.membershipExpiresAt) {
    return `Monthly sampai ${store.membershipExpiresAt.slice(0, 10)}`;
  }
  if (store.membershipPlan === 'monthly') return 'Monthly';
  return 'Unpaid / nonaktif';
}

export default function AdminStoresPage() {
  const stores = useListAdminStores();
  const createStore = useCreateAdminStore();
  const updateMembership = useUpdateStoreMembership();
  const createOperator = useCreateStoreOperator();
  const [form, setForm] = useState(emptyStore);
  const [operator, setOperator] = useState({ storeId: '', name: '', email: '', password: '' });

  const submitStore = (event: React.FormEvent) => {
    event.preventDefault();
    createStore.mutate(
      {
        data: {
          ...form,
          membershipExpiresAt: form.membershipExpiresAt || undefined,
        },
      },
      { onSuccess: () => { setForm(emptyStore); stores.refetch(); } },
    );
  };

  const setPlan = (storeId: string, membershipPlan: 'unpaid' | 'monthly' | 'lifetime') => {
    updateMembership.mutate(
      { id: storeId, data: { membershipPlan } },
      { onSuccess: () => stores.refetch() },
    );
  };

  const submitOperator = (event: React.FormEvent) => {
    event.preventDefault();
    createOperator.mutate(
      { id: operator.storeId, data: { name: operator.name, email: operator.email, password: operator.password } },
      { onSuccess: () => { setOperator({ storeId: '', name: '', email: '', password: '' }); stores.refetch(); } },
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">Platform admin</p>
        <h2 className="text-3xl font-extrabold tracking-[-.06em]">Membership toko</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Aktifkan toko dengan pembayaran monthly atau lifetime. Toko unpaid tidak bisa dipakai operator sampai dibayar.
        </p>
      </div>

      <form onSubmit={submitStore} className="panel space-y-4 rounded-xl p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Plus className="size-4" /></span>
          <div><h3 className="text-sm font-extrabold">Tambah toko</h3><p className="text-xs text-muted-foreground">Sekaligus buat login operator pertama.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama toko" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <Field label="Kode" value={form.code} onChange={(value) => setForm({ ...form, code: value })} required />
          <Field label="Alamat" value={form.address} onChange={(value) => setForm({ ...form, address: value })} required />
          <Field label="Telepon" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required />
          <label className="block">
            <span className="label">Membership</span>
            <select className="field" value={form.membershipPlan} onChange={(event) => setForm({ ...form, membershipPlan: event.target.value as typeof form.membershipPlan })}>
              <option value="unpaid">Unpaid (nonaktif)</option>
              <option value="monthly">Monthly</option>
              <option value="lifetime">Lifetime / lunas selamanya</option>
            </select>
          </label>
          {form.membershipPlan === 'monthly' && (
            <Field label="Berlaku sampai" type="date" value={form.membershipExpiresAt} onChange={(value) => setForm({ ...form, membershipExpiresAt: value })} />
          )}
          <Field label="Nama operator" value={form.operatorName} onChange={(value) => setForm({ ...form, operatorName: value })} required />
          <Field label="Email operator" type="email" value={form.operatorEmail} onChange={(value) => setForm({ ...form, operatorEmail: value })} required />
          <Field label="Password operator" type="password" value={form.operatorPassword} onChange={(value) => setForm({ ...form, operatorPassword: value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={createStore.isPending}>Simpan toko</button>
        {createStore.isError && <p className="text-xs font-bold text-destructive">Gagal membuat toko. Cek kode atau email yang sudah dipakai.</p>}
      </form>

      <section className="space-y-3">
        {(stores.data ?? []).map((store) => (
          <article key={store.id} className="panel rounded-xl p-5" data-testid={`card-admin-store-${store.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary"><Building2 className="size-4" /></span>
                <div>
                  <h3 className="text-sm font-extrabold">{store.name}</h3>
                  <p className="font-mono text-[10px] text-muted-foreground">{store.code} · {store.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{planLabel(store)}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${store.active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {store.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => setPlan(store.id, 'unpaid')}>Tandai unpaid</button>
              <button className="btn-secondary" onClick={() => setPlan(store.id, 'monthly')}>Bayar monthly</button>
              <button className="btn-primary" onClick={() => setPlan(store.id, 'lifetime')}>Lunas lifetime</button>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operators</p>
            <ul className="mt-2 space-y-1 text-xs">
              {store.operators.map((person) => (
                <li key={person.id}>{person.name} · {person.email}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <form onSubmit={submitOperator} className="panel space-y-4 rounded-xl p-5">
        <h3 className="text-sm font-extrabold">Tambah operator ke toko</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="label">Toko</span>
            <select required className="field" value={operator.storeId} onChange={(event) => setOperator({ ...operator, storeId: event.target.value })}>
              <option value="">Pilih toko</option>
              {(stores.data ?? []).map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </label>
          <Field label="Nama" value={operator.name} onChange={(value) => setOperator({ ...operator, name: value })} required />
          <Field label="Email" type="email" value={operator.email} onChange={(value) => setOperator({ ...operator, email: value })} required />
          <Field label="Password" type="password" value={operator.password} onChange={(value) => setOperator({ ...operator, password: value })} required />
        </div>
        <button type="submit" className="btn-primary" disabled={createOperator.isPending}>Tambah operator</button>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', required,
}: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}{required && <span className="text-destructive"> *</span>}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="field" />
    </label>
  );
}
