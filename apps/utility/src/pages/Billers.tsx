import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Constants, Loader, ErrorAlert, useI18n } from '@bank/shared';
import { billersQuery } from '../services/utilityService';

export default function Billers() {
  const { t, td } = useI18n();
  const { data: billers, isPending: loading, error, refetch } = useQuery(billersQuery());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t(Constants.billPaymentsKey, Constants.billPayments)}</h3>
        <span className="badge text-bg-secondary">
          {t(Constants.utilityMfeBadgeKey, Constants.utilityMfeBadge)}
        </span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text={t(Constants.fetchingBillersKey, Constants.fetchingBillers)} />}

      {billers && !loading && (
        <div className="list-group">
          {billers.map((biller) => (
            <div key={biller.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{td(biller.name)}</div>
                <small className="text-secondary">{td(biller.category)}</small>
              </div>
              <Link to={`pay/${biller.id}`} className="btn btn-sm btn-primary">
                {t(Constants.payKey, Constants.pay)}
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
