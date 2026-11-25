
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import InfoPage from "./pages/InfoPage";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminProducts from "./pages/AdminProducts";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route path="/account" element={<Account />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />

        </Route>

        <Route path="/contact" element={<InfoPage />} />
        <Route path="/shipping" element={<InfoPage />} />
        <Route path="/returns" element={<InfoPage />} />
        <Route path="/privacy" element={<InfoPage />} />
        <Route path="/terms" element={<InfoPage />} />

        <Route path="*" element={<InfoPage notFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
