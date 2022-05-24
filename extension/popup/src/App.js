import { Routes, Route } from 'react-router-dom';
import { Analytics, Landing, Login } from './pages';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />}>
        <Route index element={<Login />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Login />} />
      </Route>
    </Routes>
  );
}

export default App;
