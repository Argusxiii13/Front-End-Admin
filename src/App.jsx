import { Route, Routes } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

import DashboardPage from "./pages/DashboardPage";
import BookingsPage from "./pages/BookingsPage";
import UsersPage from "./pages/UsersPage";
import FleetPage from "./pages/FleetPage";
import SalesPage from "./pages/SalesPage";
import FeedbacksPage from "./pages/FeedbacksPage";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <div className='h-screen w-full flex flex-col'>
      <Routes>
        {/* Public Login Route */}
        <Route path='/login' element={
          <div className='flex-1 bg-gray-900 flex items-center justify-center'>
            <LoginPage />
          </div>
        } />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
  <Route path="*" element={  // Change this line
    <div className='flex flex-row h-full bg-gray-900 text-gray-100 overflow-hidden'>
      <Sidebar />
      <div className='flex-1 p-4 overflow-auto'>
        <Routes>
          <Route path='' element={<DashboardPage />} />
          <Route path='dashboard' element={<DashboardPage />} />
          <Route path='booking' element={<BookingsPage />} />
          <Route path='users' element={<UsersPage />} />
          <Route path='fleet' element={<FleetPage />} />
          <Route path='sales' element={<SalesPage />} />
          <Route path='feedback' element={<FeedbacksPage />} />
          <Route path='overview' element={<OverviewPage />} />
          <Route path='settings' element={<SettingsPage />} />
          {/* Catch-all route for unmatched paths */}
          <Route path='*' element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </div>
  } />
</Route>

        {/* Catch-all route for public routes */}
        <Route path='*' element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
