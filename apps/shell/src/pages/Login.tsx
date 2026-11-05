import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { getUserMessage } from '@bank/shared';
import { useAuth } from '../auth/AuthContext';

export interface LoginLocationState {
  from?: Location;
  reason?: 'expired';
}

const DEMO_USERS = [
  { username: 'john', label: 'john / 1234 (all modules)' },
  { username: 'viewer', label: 'viewer / 1234 (no Transfer, no Beneficiary)' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginLocationState;
  const [form, setForm] = useState({ username: 'john', password: '1234' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = state.from?.pathname || '/dashboard';
  const sessionExpired = state.reason === 'expired';

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.username, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getUserMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ width: 400 }}>
        <div className="card-body p-4">
          <h4 className="mb-1">Internet Banking</h4>
          <p className="text-secondary small mb-4">Sign in to continue</p>

          {sessionExpired && (
            <div className="alert alert-warning py-2 small">Your session has expired. Please sign in again.</div>
          )}
          {state.from && !sessionExpired && (
            <div className="alert alert-info py-2 small">Please sign in to access {state.from.pathname}</div>
          )}
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="username">Username</label>
              <input id="username" name="username" className="form-control" value={form.username} onChange={onChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={onChange} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <hr />
          <p className="small text-secondary mb-1">Demo users:</p>
          {DEMO_USERS.map((u) => (
            <button
              key={u.username}
              type="button"
              className="btn btn-link btn-sm p-0 d-block"
              onClick={() => setForm({ username: u.username, password: '1234' })}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
