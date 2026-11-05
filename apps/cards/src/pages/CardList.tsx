import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, notify, Loader, ErrorAlert, formatCurrency, type Card } from '@bank/shared';
import { cardService, cardsQuery } from '../services/cardService';

export default function CardList() {
  const queryClient = useQueryClient();
  const { data: cards, isPending: loading, error, refetch } = useQuery(cardsQuery());
  const statusUpdate = useMutation({
    mutationFn: cardService.updateStatus,
    onSuccess: (updated) => {
      queryClient.setQueryData<Card[]>(queryKeys.cards.all, (list) =>
        list?.map((c) => (c.id === updated.id ? updated : c)),
      );
      notify(`Card ending ${updated.number.slice(-4)} is now ${updated.status.toLowerCase()}`);
    },
  });
  const pendingId = statusUpdate.isPending ? statusUpdate.variables.id : null;

  const toggleStatus = (card: Card) =>
    statusUpdate.mutate({ id: card.id, status: card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">My Cards</h3>
        <span className="badge text-bg-secondary">cards MFE</span>
      </div>

      <ErrorAlert error={error} onRetry={refetch} />
      <ErrorAlert error={statusUpdate.error} />
      {loading && <Loader text="Fetching cards..." />}

      {cards && !loading && (
        <div className="row g-3">
          {cards.map((card) => {
            const blocked = card.status === 'BLOCKED';
            return (
              <div key={card.id} className="col-md-6 col-xl-4">
                <div className={`card h-100 ${blocked ? 'border-danger' : ''}`}>
                  <div className={`card-body text-white rounded-top ${blocked ? 'bg-secondary' : 'bg-dark'}`}>
                    <div className="d-flex justify-content-between small">
                      <span>{card.type} card</span>
                      <span>{card.network}</span>
                    </div>
                    <h5 className="my-3 font-monospace">{card.number}</h5>
                    <div className="d-flex justify-content-between small">
                      <span>{card.holder}</span>
                      <span>EXP {card.expiry}</span>
                    </div>
                  </div>
                  <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                    <div className="small">
                      <span className={`badge ${blocked ? 'text-bg-danger' : 'text-bg-success'}`}>{card.status}</span>
                      {card.limit !== undefined && (
                        <span className="ms-2 text-secondary">
                          Due {formatCurrency(card.outstanding)} / {formatCurrency(card.limit)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${blocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                      disabled={pendingId === card.id}
                      onClick={() => toggleStatus(card)}
                    >
                      {pendingId === card.id ? 'Updating...' : blocked ? 'Unblock' : 'Block'}
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
