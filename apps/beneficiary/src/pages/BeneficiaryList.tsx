import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  beneficiariesQuery,
  queryKeys,
  notify,
  useHasPermission,
  Loader,
  ErrorAlert,
  Constants,
  useI18n,
  tFormat,
  type Beneficiary,
} from '@bank/shared';
import { beneficiaryService } from '../services/beneficiaryService';

export default function BeneficiaryList() {
  const { t, td } = useI18n();
  const queryClient = useQueryClient();
  const { data: beneficiaries, isPending: loading, error, refetch } = useQuery(beneficiariesQuery());
  const canTransfer = useHasPermission('transfer');

  const removal = useMutation({
    mutationFn: beneficiaryService.deleteBeneficiary,
    onMutate: async (id) => {
      const key = queryKeys.beneficiaries.all;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Beneficiary[]>(key);
      queryClient.setQueryData<Beneficiary[]>(key, (list) => list?.filter((b) => b.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(queryKeys.beneficiaries.all, context?.previous);
    },
    onSuccess: () => notify(t(Constants.beneficiaryRemovedKey, Constants.beneficiaryRemoved)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.all }),
  });

  const remove = (beneficiary: Beneficiary) => {
    if (
      !window.confirm(
        tFormat(Constants.removeConfirmKey, Constants.removeConfirm, { name: beneficiary.name }),
      )
    ) {
      return;
    }
    removal.mutate(beneficiary.id);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">
          {t(Constants.beneficiariesTitleKey, Constants.beneficiariesTitle)}{' '}
          <span className="badge text-bg-secondary fs-6 align-middle">
            {t(Constants.beneficiaryMfeBadgeKey, Constants.beneficiaryMfeBadge)}
          </span>
        </h3>
        <Link to="add" className="btn btn-primary btn-sm">
          {t(Constants.addBeneficiaryKey, Constants.addBeneficiary)}
        </Link>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      <ErrorAlert error={removal.error} />
      {loading && (
        <Loader text={t(Constants.fetchingBeneficiariesKey, Constants.fetchingBeneficiaries)} />
      )}

      {beneficiaries && !loading && (
        beneficiaries.length === 0 ? (
          <p className="text-secondary">{t(Constants.noBeneficiariesKey, Constants.noBeneficiaries)}</p>
        ) : (
          <table className="table bg-white align-middle">
            <thead>
              <tr>
                <th>{t(Constants.colNameKey, Constants.colName)}</th>
                <th>{t(Constants.colBankKey, Constants.colBank)}</th>
                <th>{t(Constants.colAccountKey, Constants.colAccount)}</th>
                <th>{t(Constants.colIfscKey, Constants.colIfsc)}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b) => (
                <tr key={b.id}>
                  <td>
                    {td(b.name)}
                    {b.nickname && <small className="text-secondary d-block">{td(b.nickname)}</small>}
                  </td>
                  <td>{td(b.bank)}</td>
                  <td className="font-monospace">{b.accountNumber}</td>
                  <td className="font-monospace">{b.ifsc}</td>
                  <td className="text-end">
                    {canTransfer && (
                      <Link to={`/transfer?beneficiaryId=${b.id}`} className="btn btn-sm btn-outline-primary me-2">
                        {t(Constants.sendMoneyKey, Constants.sendMoney)}
                      </Link>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(b)}>
                      {t(Constants.deleteKey, Constants.delete)}
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
