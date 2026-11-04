import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, ErrorAlert } from '@bank/shared';
import { beneficiaryService } from '../services/beneficiaryService';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const validate = (form) => {
  const errors = {};
  if (form.name.trim().length < 3) errors.name = 'Enter the full name';
  if (!/^\d{9,18}$/.test(form.accountNumber)) errors.accountNumber = 'Account number must be 9 to 18 digits';
  if (form.accountNumber !== form.confirmAccountNumber) errors.confirmAccountNumber = 'Account numbers do not match';
  if (!IFSC_PATTERN.test(form.ifsc)) errors.ifsc = 'Invalid IFSC (e.g. HDFC0001234)';
  if (!form.bank.trim()) errors.bank = 'Enter the bank name';
  return errors;
};

const FIELDS = [
  { name: 'name', label: 'Beneficiary name' },
  { name: 'nickname', label: 'Nickname (optional)' },
  { name: 'accountNumber', label: 'Account number' },
  { name: 'confirmAccountNumber', label: 'Confirm account number' },
  { name: 'ifsc', label: 'IFSC code' },
  { name: 'bank', label: 'Bank name' },
];

export default function AddBeneficiary() {
  const navigate = useNavigate();
  const creation = useMutation(beneficiaryService.addBeneficiary);
  const [form, setForm] = useState({ name: '', nickname: '', accountNumber: '', confirmAccountNumber: '', ifsc: '', bank: '' });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const value = e.target.name === 'ifsc' ? e.target.value.toUpperCase() : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    const { confirmAccountNumber, ...payload } = form;
    try {
      await creation.mutate({ ...payload, name: payload.name.trim(), bank: payload.bank.trim() });
      navigate('..', { relative: 'path' });
    } catch {
      // error is exposed through creation.error
    }
  };

  return (
    <>
      <Link to=".." relative="path" className="btn btn-link px-0 mb-2">&larr; Back to beneficiaries</Link>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <h4 className="mb-3">Add beneficiary</h4>
          <ErrorAlert error={creation.error} />
          <form onSubmit={onSubmit} noValidate>
            {FIELDS.map(({ name, label }) => (
              <div key={name} className="mb-3">
                <label className="form-label" htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
                  value={form[name]}
                  onChange={onChange}
                />
                <div className="invalid-feedback">{errors[name]}</div>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={creation.loading}>
              {creation.loading ? 'Saving...' : 'Save beneficiary'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
