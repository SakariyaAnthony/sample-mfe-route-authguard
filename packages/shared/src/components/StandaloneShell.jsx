import { useState } from 'react';
import { httpClient } from '../api/httpClient';
import { authStore } from '../auth/authStore';

/**
 * Only used by a remote's own main.jsx when it is opened directly on its port.
 * Lets a team run their module in isolation with a quick dev login.
 */
export function StandaloneShell({ moduleName, children }) {
  const [user, setUser] = useState(authStore.getUser());
  const [error, setError] = useState(null);

  const devLogin = async () => {
    try {
      const { data } = await httpClient.post('/auth/login', { username: 'john', password: '1234' });
      authStore.setSession(data);
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <span>
          <strong>{moduleName}</strong> micro-frontend running standalone.
          {user ? ` Signed in as ${user.name}.` : ' Not signed in.'}
        </span>
        {!user && (
          <button type="button" className="btn btn-sm btn-primary" onClick={devLogin}>
            Dev login (john)
          </button>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {user && children}
    </div>
  );
}
