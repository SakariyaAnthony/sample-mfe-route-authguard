import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader, ErrorAlert } from '@bank/shared';
import { billersQuery } from '../services/utilityService';

export default function Billers() {
  const { data: billers, isPending: loading, error, refetch } = useQuery(billersQuery());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Bill Payments</h3>
        <span className="badge text-bg-secondary">utility MFE</span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      {loading && <Loader text="Fetching billers..." />}

      {billers && !loading && (
        <div className="list-group">
          {billers.map((biller) => (
            <div key={biller.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{biller.name}</div>
                <small className="text-secondary">{biller.category}</small>
              </div>
              <Link to={`pay/${biller.id}`} className="btn btn-sm btn-primary">Pay</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
