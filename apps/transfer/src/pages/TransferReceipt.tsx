import { Link, Navigate, useLocation } from 'react-router-dom';
import { Constants, formatCurrency, useI18n, type Transfer } from '@bank/shared';

export interface ReceiptLocationState {
  transfer: Transfer;
}

export default function TransferReceipt() {
  const { t, td } = useI18n();
  const transfer = (useLocation().state as ReceiptLocationState | null)?.transfer;

  if (!transfer) return <Navigate to=".." relative="path" replace />;

  return (
    <div className="card border-success" style={{ maxWidth: 560 }}>
      <div className="card-body">
        <h4 className="text-success">{t(Constants.transferSuccessfulKey, Constants.transferSuccessful)}</h4>
        <dl className="row mb-4">
          <dt className="col-5">{t(Constants.referenceKey, Constants.reference)}</dt>
          <dd className="col-7"><code>{transfer.reference}</code></dd>
          <dt className="col-5">{t(Constants.beneficiaryKey, Constants.beneficiary)}</dt>
          <dd className="col-7">{td(transfer.beneficiaryName)}</dd>
          <dt className="col-5">{t(Constants.amountKey, Constants.amount)}</dt>
          <dd className="col-7">{formatCurrency(transfer.amount)}</dd>
          <dt className="col-5">{t(Constants.remarksKey, Constants.remarks)}</dt>
          <dd className="col-7">{transfer.remarks || '-'}</dd>
          <dt className="col-5">{t(Constants.dateKey, Constants.date)}</dt>
          <dd className="col-7">{new Date(transfer.createdAt).toLocaleString('en-IN')}</dd>
        </dl>
        <Link to=".." relative="path" className="btn btn-primary me-2">
          {t(Constants.newTransferKey, Constants.newTransfer)}
        </Link>
        <Link to="/accounts" className="btn btn-outline-secondary">
          {t(Constants.viewAccountsKey, Constants.viewAccounts)}
        </Link>
      </div>
    </div>
  );
}
