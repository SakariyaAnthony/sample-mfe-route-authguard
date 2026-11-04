import { Link } from 'react-router-dom';
import type { Permission } from '@bank/shared';

export default function Forbidden({ permission }: { permission: Permission }) {
  return (
    <div className="text-center py-5">
      <h1 className="display-4 text-danger">403</h1>
      <h4>Access denied</h4>
      <p className="text-secondary">
        Your profile does not have the <code>{permission}</code> permission required for this page.
      </p>
      <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
    </div>
  );
}
