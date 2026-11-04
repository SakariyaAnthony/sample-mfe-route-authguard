import { Link, Navigate, useLocation } from 'react-router-dom';
import { formatCurrency, type Transfer } from '@bank/shared';

export interface ReceiptLocationState {
  transfer: Transfer;
}

export default function TransferReceipt() {
  const transfer = (useLocation().state as ReceiptLocationState | null)?.transfer;

  // Receipt data only comes from a just-completed transfer; a refresh or a
  // direct visit has nothing to show.
  if (!transfer) return <Navigate to=".." relative="path" replace />;

  return (
    <div className="card border-success" style={{ maxWidth: 560 }}>
      <div className="card-body">
        <h4 className="text-success">Transfer successful</h4>
        <dl className="row mb-4">
          <dt className="col-5">Reference</dt>
          <dd className="col-7"><code>{transfer.reference}</code></dd>
          <dt className="col-5">Beneficiary</dt>
          <dd className="col-7">{transfer.beneficiaryName}</dd>
          <dt className="col-5">Amount</dt>
          <dd className="col-7">{formatCurrency(transfer.amount)}</dd>
          <dt className="col-5">Remarks</dt>
          <dd className="col-7">{transfer.remarks || '-'}</dd>
          <dt className="col-5">Date</dt>
          <dd className="col-7">{new Date(transfer.createdAt).toLocaleString('en-IN')}</dd>
        </dl>
        <Link to=".." relative="path" className="btn btn-primary me-2">New transfer</Link>
        <Link to="/accounts" className="btn btn-outline-secondary">View accounts</Link>
      </div>
    </div>
  );
}
