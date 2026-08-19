import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';

export function AuthGate({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const me = useGetMe({ query: { queryKey: getGetMeQueryKey(), retry: false } });

  useEffect(() => {
    if (me.isError) setLocation('/login');
  }, [me.isError, setLocation]);

  useEffect(() => {
    if (!me.data) return;
    if (location.startsWith('/admin') && me.data.role !== 'platform_admin') {
      setLocation('/');
    }
    if (me.data.role === 'platform_admin' && !location.startsWith('/admin')) {
      setLocation('/admin/stores');
    }
  }, [location, me.data, setLocation]);

  if (me.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (me.isError || !me.data) return null;
  return children;
}
