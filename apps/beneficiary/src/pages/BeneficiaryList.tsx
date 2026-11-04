import { Link } from 'react-router-dom';
import { authStore, useApi, useMutation, Loader, ErrorAlert, type Beneficiary } from '@bank/shared';
import { beneficiaryService } from '../services/beneficiaryService';

export default function BeneficiaryList() {
  const { data: beneficiaries, loading, error, refetch, setData } = useApi((signal) =>
    beneficiaryService.getBeneficiaries({ signal }),
  );
  const removal = useMutation(beneficiaryService.deleteBeneficiary);
  const canTransfer = authStore.hasPermission('transfer');

  const remove = async (beneficiary: Beneficiary) => {
    if (!window.confirm(`Remove ${beneficiary.name}?`)) return;
    try {
      await removal.mutate(beneficiary.id);
      setData((list) => list?.filter((b) => b.id !== beneficiary.id) ?? null);
    } catch {
      // error is exposed through removal.error
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">
          Beneficiaries <span className="badge text-bg-secondary fs-6 align-middle">beneficiary MFE</span>
        </h3>
        <Link to="add" className="btn btn-primary btn-sm">Add beneficiary</Link>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      <ErrorAlert error={removal.error} />
      {loading && <Loader text="Fetching beneficiaries..." />}

      {beneficiaries && !loading && (
        beneficiaries.length === 0 ? (
          <p className="text-secondary">No beneficiaries added yet.</p>
        ) : (
          <table className="table bg-white align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Bank</th>
                <th>Account</th>
                <th>IFSC</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.name}
                    {b.nickname && <small className="text-secondary d-block">{b.nickname}</small>}
                  </td>
                  <td>{b.bank}</td>
                  <td className="font-monospace">{b.accountNumber}</td>
                  <td className="font-monospace">{b.ifsc}</td>
                  <td className="text-end">
                    {canTransfer && (
                      // Cross-MFE navigation: just a URL, no direct import of the transfer module.
                      <Link to={`/transfer?beneficiaryId=${b.id}`} className="btn btn-sm btn-outline-primary me-2">
                        Send money
                      </Link>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(b)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </>
  );
}
