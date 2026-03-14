import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import PendingApproval from './pages/pendingApproval'
import VendorDashboard from './pages/vendorDashboard'
// import VendorRegistration from './pages/vendorRegistration'
// import VendorLayout from './layouts/VendorLayout'         // adjust path
import VendorRoute from './routes/VendorRoute'             // adjust path
// import ManageProducts from './pages/manageProducts'        // adjust path
// import OrdersManagement from './pages/ordersManagement'    // adjust path
// import VendorSettings from './pages/vendorSettings'        // adjust path

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <VendorLayout />
            </VendorRoute>
          }
        >
          <Route index element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          {/* <Route path="products" element={<ManageProducts />} /> */}
          {/* <Route path="orders" element={<OrdersManagement />} /> */}
          {/* <Route path="settings" element={<VendorSettings />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
