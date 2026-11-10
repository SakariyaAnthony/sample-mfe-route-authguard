import { Link } from 'react-router-dom';
import type { Permission } from '@bank/shared';
import { Constants, useI18n } from '../i18n';

export default function Forbidden({ permission }: { permission: Permission }) {
  const { t, tFormat } = useI18n();

  return (
    <div className="text-center py-5">
      <h1 className="display-4 text-danger">403</h1>
      <h4>{t(Constants.accessDeniedKey, Constants.accessDenied)}</h4>
      <p className="text-secondary">
        {tFormat(Constants.forbiddenMessageKey, Constants.forbiddenMessage, { permission })}
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        {t(Constants.backToDashboardKey, Constants.backToDashboard)}
      </Link>
    </div>
  );
}
