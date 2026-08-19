import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { getListTicketsQueryKey, useListTickets } from '@workspace/api-client-react';
import { dateLabel, formatStatus, money, statusClass } from '@/lib/format';
import { EmptyState, LoadingBlock, QueryError, SectionTitle } from '@/components/primitives';

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const params = useMemo(() => ({ ...(search ? { search } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}) }), [search, status, priority]);
  const query = useListTickets(params, { query: { queryKey: getListTicketsQueryKey(params) } });
  const tickets = query.data ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-2">Operations / tickets</p><h2 className="text-3xl font-extrabold tracking-[-.06em]">Repair tickets</h2><p className="mt-2 text-sm text-muted-foreground">Find the next device, filter the floor, close the loop.</p></div><Link href="/tickets/new" className="btn-primary self-start sm:self-auto" data-testid="button-ticket-new"><Plus className="size-4" /> New intake</Link></div>
      <div className="panel rounded-xl p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="field pl-9" placeholder="Search ticket, customer, device or IMEI" data-testid="input-ticket-search" /></label>
          <div className="flex gap-2"><label className="sr-only" htmlFor="ticket-status">Status</label><select id="ticket-status" value={status} onChange={(event) => setStatus(event.target.value)} className="field min-w-0 sm:w-44" data-testid="select-ticket-status"><option value="">All statuses</option><option value="new">New intake</option><option value="diagnosing">Diagnosing</option><option value="awaiting_parts">Awaiting parts</option><option value="repairing">Repairing</option><option value="ready">Ready for pickup</option><option value="completed">Completed</option><option value="delayed">Delayed</option></select><label className="sr-only" htmlFor="ticket-priority">Priority</label><select id="ticket-priority" value={priority} onChange={(event) => setPriority(event.target.value)} className="field min-w-0 sm:w-36" data-testid="select-ticket-priority"><option value="">All priority</option><option value="high">High priority</option><option value="normal">Normal</option></select></div>
        </div>
      </div>
      <SectionTitle eyebrow={`${tickets.length} records`} title="All active work" detail="Click a ticket to open its service record" action={<span className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><SlidersHorizontal className="size-4" /> Filters are live</span>} />
      {query.isLoading ? <LoadingBlock lines={6} /> : query.isError ? <QueryError retry={() => query.refetch()} /> : tickets.length === 0 ? <EmptyState title="No tickets match" body="Try another ticket number, customer, status or priority." action={<button className="btn-secondary" onClick={() => { setSearch(''); setStatus(''); setPriority(''); }} data-testid="button-clear-filters"><Filter className="size-4" /> Clear filters</button>} /> :
        <div className="panel overflow-hidden rounded-xl">
          <div className="mobile-scroll"><table className="w-full min-w-[820px] text-left"><thead className="bg-muted/55"><tr className="font-mono text-[10px] uppercase tracking-[.08em] text-muted-foreground"><th className="px-5 py-3 font-medium">Ticket / customer</th><th className="px-4 py-3 font-medium">Device</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Estimate</th><th className="px-4 py-3 font-medium">Balance</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-border">
            {tickets.map((ticket) => <tr key={ticket.id} className="group transition-colors hover:bg-muted/35" data-testid={`row-ticket-${ticket.id}`}><td className="px-5 py-4"><Link href={`/tickets/${ticket.id}`} className="block"><div className="flex items-center gap-2"><span className="font-mono text-xs font-medium text-primary">{ticket.ticketNumber}</span>{ticket.priority === 'high' && <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-destructive">Urgent</span>}</div><p className="mt-1 text-xs font-extrabold">{ticket.customerName}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{ticket.whatsapp}</p></Link></td><td className="px-4 py-4"><p className="text-xs font-bold">{ticket.deviceBrand} {ticket.deviceModel}</p><p className="mt-1 max-w-[210px] truncate text-[11px] text-muted-foreground">{ticket.complaint}</p></td><td className="px-4 py-4"><span className={statusClass(ticket.status)}><span className="status-dot bg-current" />{formatStatus(ticket.status)}</span></td><td className="px-4 py-4"><p className="text-xs font-bold">{dateLabel(ticket.estimatedCompletion)}</p><p className="mt-1 text-[11px] text-muted-foreground">in at {dateLabel(ticket.intakeDate)}</p></td><td className="px-4 py-4"><p className={`text-xs font-extrabold ${ticket.paidAmount < ticket.totalCost ? 'text-destructive' : 'text-primary'}`}>{money(ticket.totalCost - ticket.paidAmount)}</p><p className="mt-1 text-[11px] text-muted-foreground">of {money(ticket.totalCost)}</p></td><td className="px-4 py-4 text-right"><Link href={`/tickets/${ticket.id}`} className="btn-ghost opacity-50 group-hover:opacity-100" data-testid={`link-ticket-${ticket.id}`}><ArrowUpRight className="size-4" /></Link></td></tr>)}
          </tbody></table></div>
        </div>}
    </div>
  );
}