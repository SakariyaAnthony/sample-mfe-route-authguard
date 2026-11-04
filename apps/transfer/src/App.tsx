import { Route, Routes } from 'react-router-dom';
import TransferForm from './pages/TransferForm';
import TransferReceipt from './pages/TransferReceipt';

export default function TransferApp() {
  return (
    <Routes>
      <Route index element={<TransferForm />} />
      <Route path="receipt" element={<TransferReceipt />} />
    </Routes>
  );
}
