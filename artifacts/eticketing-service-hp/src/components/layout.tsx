import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, ChevronRight, ClipboardList, Command, LayoutDashboard, Menu, Search, Settings2, Users, X, Zap } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Command center', icon: LayoutDashboard },
  { href: '/tickets', label: 'Repair tickets', icon: ClipboardList },
  { href: '/customers', label: 'Customers', icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const pageTitle = location === '/' ? 'Command center' : location.startsWith('/tickets') ? 'Repair tickets' : location.startsWith('/customers') ? 'Customers' : 'Public tracking';

  return (
    <div className="app-shell flex">
      <aside className={`sidebar-shell fixed inset-y-0 left-0 z-30 w-[244px] shrink-0 border-r border-sidebar-border transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-2 py-3">
            <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
              <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Zap className="size-5" /></span>
              <span><span className="block text-sm font-extrabold tracking-tight">e-ticketing</span><span className="block font-mono text-[9px] uppercase tracking-[.14em] text-sidebar-foreground/55">service hp</span></span>
            </Link>
            <button className="btn-ghost text-sidebar-foreground/60 md:hidden" onClick={() => setOpen(false)} data-testid="button-close-sidebar"><X className="size-4" /></button>
          </div>

          <div className="mt-7 px-2"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-sidebar-foreground/40">Operations</p></div>
          <nav className="mt-2 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? location === '/' : location.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold transition-colors ${active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon className={`size-4 ${active ? 'text-sidebar-primary' : ''}`} />{label}{active && <ChevronRight className="ml-auto size-3.5 opacity-60" />}
              </Link>;
            })}
          </nav>

          <div className="mt-9 px-2"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-sidebar-foreground/40">Tools</p></div>
          <div className="mt-2 space-y-1">
            <Link href="/tickets/new" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid="link-new-ticket"><Command className="size-4 text-accent" />New intake</Link>
            <Link href="/track/lookup" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground" data-testid="link-public-tracking"><Activity className="size-4" />Customer tracking</Link>
          </div>

          <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/45 p-3">
            <div className="flex items-center gap-2"><span className="status-dot bg-sidebar-primary" /><span className="font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/70">Station online</span></div>
            <p className="mt-2 text-[11px] leading-4 text-sidebar-foreground/45">All notification channels operational.</p>
          </div>
          <div className="mt-3 flex items-center gap-2 px-2 text-[11px] text-sidebar-foreground/45"><Settings2 className="size-3.5" /> System settings <span className="ml-auto font-mono">v1.4</span></div>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-20 bg-foreground/30 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" data-testid="button-overlay" />}
      <main className="content-grid min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button className="btn-ghost -ml-2 md:hidden" onClick={() => setOpen(true)} data-testid="button-open-sidebar"><Menu className="size-5" /></button>
            <div><p className="eyebrow hidden sm:block">Service station / HP</p><h1 className="text-sm font-extrabold">{pageTitle}</h1></div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tickets" className="btn-ghost hidden sm:flex" data-testid="link-global-search"><Search className="size-4" /> Search tickets</Link>
            <Link href="/tickets/new" className="btn-primary" data-testid="button-header-new"><Command className="size-4" /><span className="hidden sm:inline">New intake</span><span className="sm:hidden">New</span></Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1480px] p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}