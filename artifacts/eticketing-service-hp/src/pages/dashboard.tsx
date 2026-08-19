import { ArrowUpRight, CalendarClock, CheckCircle2, CircleAlert, Clock3, Plus, ScanLine, Wrench } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboard, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { dateLabel, formatStatus, money, statusClass } from '@/lib/format';
import { EmptyState, LoadingBlock, QueryError, SectionTitle } from '@/components/primitives';

export default function DashboardPage() {
  const dashboard = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  if (dashboard.isLoading) return <div className="space-y-6"><div className="h-20 w-64 animate-pulse rounded-lg bg-muted" /><LoadingBlock lines={5} /></div>;
  if (dashboard.isError || !dashboard.data) return <QueryError retry={() => dashboard.refetch()} />;
  const data = dashboard.data;
  const cards = [
    { label: 'Today’s intake', value: data.totalToday, note: `${data.newTickets} new in queue`, icon: ScanLine, tone: 'text-primary' },
    { label: 'Under repair', value: data.underRepair, note: `${data.waitingParts} waiting on parts`, icon: Wrench, tone: 'text-accent-foreground' },
    { label: 'Ready to collect', value: data.readyPickup, note: `${data.completed} completed today`, icon: CheckCircle2, tone: 'text-primary' },
    { label: 'Needs attention', value: data.delayed, note: 'tickets past estimate', icon: CircleAlert, tone: 'text-destructive' },
  ];
  return (
    <div className="space-y-8">
      <div className="appear flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="eyebrow mb-2">Thursday · 08:42</p><h2 className="text-3xl font-extrabold tracking-[-.06em] md:text-4xl">Keep the queue moving.</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">The next action is visible, the customer is informed, and nothing gets lost behind the bench.</p></div>
        <Link href="/tickets/new" className="btn-primary self-start sm:self-auto" data-testid="button-dashboard-new"><Plus className="size-4" /> Log a repair</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone }, index) => <div key={label} className={`panel appear appear-${index + 1} rounded-xl p-5`} data-testid={`card-kpi-${label.toLowerCase().replaceAll(' ', '-')}`}>
          <div className="flex items-start justify-between"><p className="font-mono text-[10px] uppercase tracking-[.08em] text-muted-foreground">{label}</p><Icon className={`size-4 ${tone}`} /></div>
          <p className="kpi-number mt-5" data-testid={`text-kpi-${index}`}>{value}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section>
          <SectionTitle eyebrow="Live queue" title="Recent tickets" detail="Latest movement across the repair floor" action={<Link href="/tickets" className="btn-ghost" data-testid="link-view-all-tickets">View all <ArrowUpRight className="size-3.5" /></Link>} />
          <div className="panel overflow-hidden rounded-xl">
            {data.recentTickets?.length ? <div className="divide-y divide-border">
              {data.recentTickets.map((ticket) => <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/45 sm:gap-5" data-testid={`row-recent-ticket-${ticket.id}`}>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-[10px] font-medium">{ticket.deviceBrand.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-xs font-extrabold">{ticket.customerName}</p><span className="font-mono text-[10px] text-muted-foreground">{ticket.ticketNumber}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{ticket.deviceBrand} {ticket.deviceModel} · {ticket.complaint}</p></div>
                <span className={statusClass(ticket.status)}><span className="status-dot bg-current" />{formatStatus(ticket.status)}</span><ArrowUpRight className="hidden size-4 text-muted-foreground sm:block" />
              </Link>)}
            </div> : <EmptyState title="No recent tickets" body="New intake will appear here as soon as it is logged." action={<Link href="/tickets/new" className="btn-primary" data-testid="button-empty-new">Start an intake</Link>} />}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Next up" title="Upcoming deadlines" detail="Estimates that need a close eye" />
          <div className="panel rounded-xl p-2">
            {data.upcomingDeadlines?.length ? <div className="divide-y divide-border">
              {data.upcomingDeadlines.map((ticket) => <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="block rounded-lg p-3 transition-colors hover:bg-muted/45" data-testid={`row-deadline-${ticket.id}`}>
                <div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-primary">{ticket.ticketNumber}</span><span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><CalendarClock className="size-3" />{dateLabel(ticket.estimatedCompletion)}</span></div>
                <p className="mt-2 text-xs font-extrabold">{ticket.deviceBrand} {ticket.deviceModel}</p><p className="mt-1 text-xs text-muted-foreground">{ticket.customerName}</p>
              </Link>)}
            </div> : <EmptyState title="No deadlines on deck" body="The next promised completion will show up here." />}
          </div>
        </section>
      </div>

      <section className="panel rounded-xl p-5 md:p-6">
        <SectionTitle eyebrow="Status mix" title="Repair floor at a glance" detail="A live split of every ticket currently in motion" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.statusCounts ?? {}).map(([status, count]) => <div key={status} className="rounded-lg bg-muted/55 p-4"><div className="flex items-center justify-between"><span className={statusClass(status)}>{formatStatus(status)}</span><span className="font-mono text-xs text-muted-foreground">{count}</span></div><div className="mt-4 h-1 rounded-full bg-border"><div className="h-1 rounded-full bg-primary" style={{ width: `${Math.min(100, (count / Math.max(1, data.totalToday)) * 100)}%` }} /></div></div>)}
        </div>
      </section>
    </div>
  );
}