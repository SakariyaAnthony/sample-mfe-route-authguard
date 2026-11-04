import { Route, Routes } from 'react-router-dom';
import Billers from './pages/Billers';
import PayBill from './pages/PayBill';

export default function UtilityApp() {
  return (
    <Routes>
      <Route index element={<Billers />} />
      <Route path="pay/:billerId" element={<PayBill />} />
    </Routes>
  );
}
