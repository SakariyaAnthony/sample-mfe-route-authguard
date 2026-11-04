import { Route, Routes } from 'react-router-dom';
import CardList from './pages/CardList';

export default function CardsApp() {
  return (
    <Routes>
      <Route index element={<CardList />} />
    </Routes>
  );
}
