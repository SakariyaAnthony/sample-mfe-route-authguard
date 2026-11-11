import { Link } from 'react-router-dom';
import { Constants, useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <h1 className="display-4">404</h1>
      <p className="text-secondary">{t(Constants.pageNotFoundKey, Constants.pageNotFound)}</p>
      <Link to="/" className="btn btn-primary">
        {t(Constants.goHomeKey, Constants.goHome)}
      </Link>
    </div>
  );
}
