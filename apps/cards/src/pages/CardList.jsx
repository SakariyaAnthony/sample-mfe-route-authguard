import { useState } from 'react';
import { useApi, useMutation, Loader, ErrorAlert, formatCurrency } from '@bank/shared';
import { cardService } from '../services/cardService';

export default function CardList() {
  const { data: cards, loading, error, refetch, setData } = useApi((signal) => cardService.getCards({ signal }));
  const statusUpdate = useMutation(cardService.updateStatus);
  const [pendingId, setPendingId] = useState(null);

  const toggleStatus = async (card) => {
    const nextStatus = card.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setPendingId(card.id);
    try {
      const updated = await statusUpdate.mutate(card.id, nextStatus);
      setData((list) => list.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      // error is exposed through statusUpdate.error
    } finally {
      setPendingId(null);
    }
  };

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
                      {card.limit && (
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
