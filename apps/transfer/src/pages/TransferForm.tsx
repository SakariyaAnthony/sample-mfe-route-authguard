import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountsQuery,
  beneficiariesQuery,
  queryKeys,
  notify,
  Loader,
  ErrorAlert,
  formatCurrency,
  maskAccount,
  Constants,
  useI18n,
  t as translate,
  tFormat as translateFormat,
  type Account,
} from '@bank/shared';
import { transferService } from '../services/transferService';
import type { ReceiptLocationState } from './TransferReceipt';

const PER_TRANSACTION_LIMIT = 200000;

interface TransferFormValues {
  fromAccountId: string;
  beneficiaryId: string;
  amount: string;
  remarks: string;
}

type FormErrors = Partial<Record<keyof TransferFormValues, string>>;

const validate = (form: TransferFormValues, accounts: Account[]): FormErrors => {
  const errors: FormErrors = {};
  const amount = Number(form.amount);
  const account = accounts.find((a) => a.id === Number(form.fromAccountId));

  if (!form.fromAccountId) {
    errors.fromAccountId = translate(Constants.errSelectDebitAccountKey, Constants.errSelectDebitAccount);
  }
  if (!form.beneficiaryId) {
    errors.beneficiaryId = translate(Constants.errSelectBeneficiaryKey, Constants.errSelectBeneficiary);
  }
  if (!(amount > 0)) {
    errors.amount = translate(Constants.errAmountGreaterZeroKey, Constants.errAmountGreaterZero);
  } else if (amount > PER_TRANSACTION_LIMIT) {
    errors.amount = translateFormat(Constants.errAmountMaxKey, Constants.errAmountMax, {
      amount: formatCurrency(PER_TRANSACTION_LIMIT),
    });
  } else if (account && amount > account.balance) {
    errors.amount = translate(Constants.errAmountExceedsBalanceKey, Constants.errAmountExceedsBalance);
  }
  return errors;
};

export default function TransferForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t, tFormat, td } = useI18n();
  const accountsList = useQuery(accountsQuery());
  const beneficiaryList = useQuery(beneficiariesQuery());

  const transferMutation = useMutation({
    mutationFn: transferService.createTransfer,
    onSuccess: (result) => {
      notify(
        tFormat(Constants.transferredToKey, Constants.transferredTo, {
          amount: formatCurrency(result.amount),
          name: result.beneficiaryName,
        }),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      const state: ReceiptLocationState = { transfer: result };
      navigate('receipt', { state });
    },
  });

  const [form, setForm] = useState<TransferFormValues>({
    fromAccountId: '',
    beneficiaryId: searchParams.get('beneficiaryId') ?? '',
    amount: '',
    remarks: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  if (accountsList.isPending || beneficiaryList.isPending) {
    return (
      <Loader
        text={t(Constants.loadingAccountsBeneficiariesKey, Constants.loadingAccountsBeneficiaries)}
      />
    );
  }
  if (accountsList.isError || beneficiaryList.isError) {
    const failed = accountsList.isError ? accountsList : beneficiaryList;
    return <ErrorAlert error={failed.error} onRetry={failed.refetch} />;
  }

  const accounts = accountsList.data;
  const beneficiaries = beneficiaryList.data;
  const fieldClass = (name: keyof TransferFormValues, base = 'form-control') =>
    `${base} ${errors[name] ? 'is-invalid' : ''}`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form, accounts);
    setErrors(found);
    if (Object.keys(found).length) return;

    transferMutation.mutate({
      fromAccountId: Number(form.fromAccountId),
      beneficiaryId: Number(form.beneficiaryId),
      amount: Number(form.amount),
      remarks: form.remarks.trim(),
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t(Constants.fundTransferKey, Constants.fundTransfer)}</h3>
        <span className="badge text-bg-secondary">
          {t(Constants.transferMfeBadgeKey, Constants.transferMfeBadge)}
        </span>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <ErrorAlert error={transferMutation.error} />
          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="fromAccountId">
                {t(Constants.fromAccountKey, Constants.fromAccount)}
              </label>
              <select id="fromAccountId" name="fromAccountId" className={fieldClass('fromAccountId', 'form-select')} value={form.fromAccountId} onChange={onChange}>
                <option value="">{t(Constants.selectAccountKey, Constants.selectAccount)}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {td(a.type)} {maskAccount(a.number)} - {formatCurrency(a.balance)}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errors.fromAccountId}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="beneficiaryId">
                {t(Constants.toBeneficiaryKey, Constants.toBeneficiary)}
              </label>
              <select id="beneficiaryId" name="beneficiaryId" className={fieldClass('beneficiaryId', 'form-select')} value={form.beneficiaryId} onChange={onChange}>
                <option value="">{t(Constants.selectBeneficiaryKey, Constants.selectBeneficiary)}</option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {td(b.name)} - {td(b.bank)} {maskAccount(b.accountNumber)}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errors.beneficiaryId}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="amount">
                {t(Constants.amountInrKey, Constants.amountInr)}
              </label>
              <input id="amount" name="amount" type="number" min="1" step="0.01" className={fieldClass('amount')} value={form.amount} onChange={onChange} />
              <div className="invalid-feedback">{errors.amount}</div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="remarks">
                {t(Constants.remarksOptionalKey, Constants.remarksOptional)}
              </label>
              <input id="remarks" name="remarks" maxLength={50} className="form-control" value={form.remarks} onChange={onChange} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={transferMutation.isPending}>
              {transferMutation.isPending
                ? t(Constants.transferringKey, Constants.transferring)
                : t(Constants.transferKey, Constants.transfer)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
