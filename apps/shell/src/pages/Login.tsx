import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { getUserMessage } from '@bank/shared';
import { useAuth } from '../auth/AuthContext';
import { Constants, LocaleSwitcher, useI18n } from '../i18n';

export interface LoginLocationState {
  from?: Location;
  reason?: 'expired';
}

const DEMO_USERS = [
  {
    username: 'john',
    labelKey: Constants.demoUserJohnKey,
    label: Constants.demoUserJohn,
  },
  {
    username: 'viewer',
    labelKey: Constants.demoUserViewerKey,
    label: Constants.demoUserViewer,
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tFormat } = useI18n();
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
      <div className="position-absolute top-0 end-0 p-3">
        <LocaleSwitcher />
      </div>
      <div className="card shadow-sm" style={{ width: 400 }}>
        <div className="card-body p-4">
          <h4 className="mb-1">{t(Constants.loginTitleKey, Constants.loginTitle)}</h4>
          <p className="text-secondary small mb-4">
            {t(Constants.loginSubtitleKey, Constants.loginSubtitle)}
          </p>

          {sessionExpired && (
            <div className="alert alert-warning py-2 small">
              {t(Constants.sessionExpiredKey, Constants.sessionExpired)}
            </div>
          )}
          {state.from && !sessionExpired && (
            <div className="alert alert-info py-2 small">
              {tFormat(Constants.signInToAccessKey, Constants.signInToAccess, {
                path: state.from.pathname,
              })}
            </div>
          )}
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                {t(Constants.usernameKey, Constants.username)}
              </label>
              <input id="username" name="username" className="form-control" value={form.username} onChange={onChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                {t(Constants.passwordKey, Constants.password)}
              </label>
              <input id="password" name="password" type="password" className="form-control" value={form.password} onChange={onChange} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? t(Constants.signingInKey, Constants.signingIn)
                : t(Constants.signInKey, Constants.signIn)}
            </button>
          </form>

          <hr />
          <p className="small text-secondary mb-1">{t(Constants.demoUsersKey, Constants.demoUsers)}</p>
          {DEMO_USERS.map((u) => (
            <button
              key={u.username}
              type="button"
              className="btn btn-link btn-sm p-0 d-block"
              onClick={() => setForm({ username: u.username, password: '1234' })}
            >
              {t(u.labelKey, u.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
