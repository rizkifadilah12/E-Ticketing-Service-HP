import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useLogin } from '@workspace/api-client-react';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate(
      { data: { email, password } },
      {
        onSuccess: (user) => {
          queryClient.invalidateQueries();
          setLocation(user.role === 'platform_admin' ? '/admin/stores' : '/');
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="panel w-full max-w-md rounded-2xl p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold">e-ticketing</p>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Service HP login</p>
          </div>
        </div>
        <label className="block">
          <span className="label">Email</span>
          <input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} data-testid="input-login-email" />
        </label>
        <label className="mt-4 block">
          <span className="label">Password</span>
          <input className="field" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} data-testid="input-login-password" />
        </label>
        {login.isError && (
          <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs font-bold text-destructive">Email atau password salah.</p>
        )}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={login.isPending} data-testid="button-login">
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
          Admin: admin@eticketing.local / Admin123!<br />
          Toko aktif: central@eticketing.local / Store123!<br />
          Toko unpaid: depok@eticketing.local / Store123!
        </p>
      </form>
    </div>
  );
}
