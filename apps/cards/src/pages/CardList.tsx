import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  notify,
  Loader,
  ErrorAlert,
  formatCurrency,
  Constants,
  useI18n,
  t as translate,
  tFormat as translateFormat,
  type Card,
} from '@bank/shared';
import { cardService, cardsQuery } from '../services/cardService';

export default function CardList() {
  const { t, tFormat, td } = useI18n();
  const queryClient = useQueryClient();
  const { data: cards, isPending: loading, error, refetch } = useQuery(cardsQuery());
  const statusUpdate = useMutation({
    mutationFn: cardService.updateStatus,
    onSuccess: (updated) => {
      queryClient.setQueryData<Card[]>(queryKeys.cards.all, (list) =>
        list?.map((c) => (c.id === updated.id ? updated : c)),
      );
      const statusLabel =
        updated.status === 'BLOCKED'
          ? translate(Constants.statusBlockedKey, Constants.statusBlocked)
          : translate(Constants.statusActiveKey, Constants.statusActive);
      notify(
        translateFormat(Constants.cardStatusChangedKey, Constants.cardStatusChanged, {
          last4: updated.number.slice(-4),
          status: statusLabel.toLowerCase(),
        }),
      );
    },
  });
  const pendingId = statusUpdate.isPending ? statusUpdate.variables.id : null;

  const toggleStatus = (card: Card) =>
    statusUpdate.mutate({ id: card.id, status: card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{t(Constants.myCardsKey, Constants.myCards)}</h3>
        <span className="badge text-bg-secondary">
          {t(Constants.cardsMfeBadgeKey, Constants.cardsMfeBadge)}
        </span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      <ErrorAlert error={statusUpdate.error} />
      {loading && <Loader text={t(Constants.fetchingCardsKey, Constants.fetchingCards)} />}

      {cards && !loading && (
        <div className="row g-3">
          {cards.map((card) => {
            const blocked = card.status === 'BLOCKED';
            return (
              <div key={card.id} className="col-md-6 col-xl-4">
                <div className={`card h-100 ${blocked ? 'border-danger' : ''}`}>
                  <div className={`card-body text-white rounded-top ${blocked ? 'bg-secondary' : 'bg-dark'}`}>
                    <div className="d-flex justify-content-between small">
                      <span>
                        {tFormat(Constants.cardTypeLabelKey, Constants.cardTypeLabel, {
                          type: td(card.type),
                        })}
                      </span>
                      <span>{td(card.network)}</span>
                    </div>
                    <h5 className="my-3 font-monospace">{card.number}</h5>
                    <div className="d-flex justify-content-between small">
                      <span>{td(card.holder)}</span>
                      <span>
                        {tFormat(Constants.cardExpiryKey, Constants.cardExpiry, {
                          expiry: card.expiry,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                    <div className="small">
                      <span className={`badge ${blocked ? 'text-bg-danger' : 'text-bg-success'}`}>
                        {blocked
                          ? t(Constants.statusBlockedKey, Constants.statusBlocked)
                          : t(Constants.statusActiveKey, Constants.statusActive)}
                      </span>
                      {card.limit !== undefined && (
                        <span className="ms-2 text-secondary">
                          {tFormat(Constants.cardDueKey, Constants.cardDue, {
                            outstanding: formatCurrency(card.outstanding),
                            limit: formatCurrency(card.limit),
                          })}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${blocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                      disabled={pendingId === card.id}
                      onClick={() => toggleStatus(card)}
                    >
                      {pendingId === card.id
                        ? t(Constants.updatingKey, Constants.updating)
                        : blocked
                          ? t(Constants.unblockKey, Constants.unblock)
                          : t(Constants.blockKey, Constants.block)}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
