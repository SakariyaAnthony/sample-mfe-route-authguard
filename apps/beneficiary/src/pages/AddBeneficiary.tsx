import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, notify, ErrorAlert } from '@bank/shared';
import { beneficiaryService } from '../services/beneficiaryService';

interface BeneficiaryForm {
  name: string;
  nickname: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  bank: string;
}

type FormErrors = Partial<Record<keyof BeneficiaryForm, string>>;

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const validate = (form: BeneficiaryForm): FormErrors => {
  const errors: FormErrors = {};
  if (form.name.trim().length < 3) errors.name = 'Enter the full name';
  if (!/^\d{9,18}$/.test(form.accountNumber)) errors.accountNumber = 'Account number must be 9 to 18 digits';
  if (form.accountNumber !== form.confirmAccountNumber) errors.confirmAccountNumber = 'Account numbers do not match';
  if (!IFSC_PATTERN.test(form.ifsc)) errors.ifsc = 'Invalid IFSC (e.g. HDFC0001234)';
  if (!form.bank.trim()) errors.bank = 'Enter the bank name';
  return errors;
};

const FIELDS: { name: keyof BeneficiaryForm; label: string }[] = [
  { name: 'name', label: 'Beneficiary name' },
  { name: 'nickname', label: 'Nickname (optional)' },
  { name: 'accountNumber', label: 'Account number' },
  { name: 'confirmAccountNumber', label: 'Confirm account number' },
  { name: 'ifsc', label: 'IFSC code' },
  { name: 'bank', label: 'Bank name' },
];

export default function AddBeneficiary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creation = useMutation({
    mutationFn: beneficiaryService.addBeneficiary,
    onSuccess: (created) => {
      notify(`${created.name} added as a beneficiary`);
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.all });
      navigate('..', { relative: 'path' });
    },
  });
  const [form, setForm] = useState<BeneficiaryForm>({
    name: '',
    nickname: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bank: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'ifsc' ? e.target.value.toUpperCase() : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    creation.mutate({
      name: form.name.trim(),
      nickname: form.nickname.trim() || undefined,
      accountNumber: form.accountNumber,
      ifsc: form.ifsc,
      bank: form.bank.trim(),
    });
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
            <button type="submit" className="btn btn-primary" disabled={creation.isPending}>
              {creation.isPending ? 'Saving...' : 'Save beneficiary'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
