import { Routes, Route, Navigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js'
import { Analytics, Dashboard, Hero, Landing, Login, Monitor, Overview, Personal, Project, Register, Report, Summary } from './pages';
import { AuthRoute, Timeline, TimelineSkeleton, Thread } from './components';

Chart.register(...registerables);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />}>
        <Route index element={<Hero />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path='*' element={<Hero />} />
      </Route>

      <Route path="/activist" element={<AuthRoute type="activist"><Dashboard /></AuthRoute>}>
        <Route index element={<Navigate to="project" />} />
        <Route path="project" element={<Project />} />
        <Route path="overview" element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="report" element={<Report />} />
        <Route path="monitor" element={<Monitor />}>
          <Route index element={<TimelineSkeleton />} />
          <Route path=":username" element={<Timeline />} />
          <Route path=":username/:id" element={<Thread />} />
        </Route>
      </Route>

      <Route path="/user" element={<AuthRoute type="user"><Dashboard /></AuthRoute>}>
        <Route index element={<Navigate to="personal" />} />
        <Route path="personal" element={<Personal />} />
        <Route path="overview" element={<Overview />} />
        <Route path="summary" element={<Summary />}>
          <Route index element={<TimelineSkeleton />} />
          <Route path=":username" element={<Timeline />} />
          <Route path=":username/:id" element={<Thread />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
