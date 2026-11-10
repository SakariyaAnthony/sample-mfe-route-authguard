import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  notify,
  ErrorAlert,
  Constants,
  useI18n,
  t as translate,
  tFormat,
} from '@bank/shared';
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
  if (form.name.trim().length < 3) {
    errors.name = translate(Constants.errFullNameKey, Constants.errFullName);
  }
  if (!/^\d{9,18}$/.test(form.accountNumber)) {
    errors.accountNumber = translate(Constants.errAccountDigitsKey, Constants.errAccountDigits);
  }
  if (form.accountNumber !== form.confirmAccountNumber) {
    errors.confirmAccountNumber = translate(Constants.errAccountMismatchKey, Constants.errAccountMismatch);
  }
  if (!IFSC_PATTERN.test(form.ifsc)) {
    errors.ifsc = translate(Constants.errInvalidIfscKey, Constants.errInvalidIfsc);
  }
  if (!form.bank.trim()) {
    errors.bank = translate(Constants.errBankNameKey, Constants.errBankName);
  }
  return errors;
};

const FIELD_DEFS: {
  name: keyof BeneficiaryForm;
  labelKey: string;
  label: string;
}[] = [
  {
    name: 'name',
    labelKey: Constants.fieldBeneficiaryNameKey,
    label: Constants.fieldBeneficiaryName,
  },
  {
    name: 'nickname',
    labelKey: Constants.fieldNicknameKey,
    label: Constants.fieldNickname,
  },
  {
    name: 'accountNumber',
    labelKey: Constants.fieldAccountNumberKey,
    label: Constants.fieldAccountNumber,
  },
  {
    name: 'confirmAccountNumber',
    labelKey: Constants.fieldConfirmAccountKey,
    label: Constants.fieldConfirmAccount,
  },
  {
    name: 'ifsc',
    labelKey: Constants.fieldIfscKey,
    label: Constants.fieldIfsc,
  },
  {
    name: 'bank',
    labelKey: Constants.fieldBankNameKey,
    label: Constants.fieldBankName,
  },
];

export default function AddBeneficiary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const creation = useMutation({
    mutationFn: beneficiaryService.addBeneficiary,
    onSuccess: (created) => {
      notify(tFormat(Constants.beneficiaryAddedKey, Constants.beneficiaryAdded, { name: created.name }));
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
      <Link to=".." relative="path" className="btn btn-link px-0 mb-2">
        {t(Constants.backToBeneficiariesKey, Constants.backToBeneficiaries)}
      </Link>
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <h4 className="mb-3">{t(Constants.addBeneficiaryKey, Constants.addBeneficiary)}</h4>
          <ErrorAlert error={creation.error} />
          <form onSubmit={onSubmit} noValidate>
            {FIELD_DEFS.map(({ name, labelKey, label }) => (
              <div key={name} className="mb-3">
                <label className="form-label" htmlFor={name}>
                  {t(labelKey, label)}
                </label>
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
              {creation.isPending
                ? t(Constants.savingKey, Constants.saving)
                : t(Constants.saveBeneficiaryKey, Constants.saveBeneficiary)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
