import { Route, Routes } from 'react-router-dom';
import BeneficiaryList from './pages/BeneficiaryList';
import AddBeneficiary from './pages/AddBeneficiary';

export default function BeneficiaryApp() {
  return (
    <Routes>
      <Route index element={<BeneficiaryList />} />
      <Route path="add" element={<AddBeneficiary />} />
    </Routes>
  );
}
