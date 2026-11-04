import { Route, Routes } from 'react-router-dom';
import AccountList from './pages/AccountList';
import AccountDetail from './pages/AccountDetail';

// Paths are relative to wherever the host mounts this module (e.g. /accounts/*).
export default function AccountsApp() {
  return (
    <Routes>
      <Route index element={<AccountList />} />
      <Route path=":accountId" element={<AccountDetail />} />
    </Routes>
  );
}
