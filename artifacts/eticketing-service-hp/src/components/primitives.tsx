import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';

export function LoadingBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" data-testid="state-loading">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-muted/80" />
      ))}
    </div>
  );
}

export function LoadingButton({ children, pending }: { children: React.ReactNode; pending?: boolean }) {
  return (
    <>
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </>
  );
}

export function QueryError({ message = 'The station could not load this view.', retry }: { message?: string; retry?: () => void }) {
  return (
    <div className="panel flex items-center gap-3 rounded-xl p-5" data-testid="state-error">
      <div className="rounded-lg bg-destructive/10 p-2 text-destructive"><AlertTriangle className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Connection interrupted</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
      {retry && <button className="btn-secondary" onClick={retry} data-testid="button-retry">Retry</button>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center" data-testid="state-empty">
      <div className="mb-4 rounded-xl bg-primary/10 p-3 text-primary"><Inbox className="size-6" /></div>
      <h3 className="text-sm font-extrabold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
        {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      </div>
      {action}
    </div>
  );
}