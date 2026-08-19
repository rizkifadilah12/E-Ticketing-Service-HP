import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import DashboardPage from '@/pages/dashboard';
import TicketsPage from '@/pages/tickets';
import NewTicketPage from '@/pages/new-ticket';
import TicketDetailPage from '@/pages/ticket-detail';
import CustomersPage from '@/pages/customers';
import TrackingPage from '@/pages/track';
import { AppShell } from '@/components/layout';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/tickets/new" component={NewTicketPage} />
          <Route path="/tickets/:id" component={TicketDetailPage} />
          <Route path="/tickets" component={TicketsPage} />
          <Route path="/customers" component={CustomersPage} />
          <Route path="/track/:ticketNumber" component={TrackingPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
