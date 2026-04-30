import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Menu } from "antd";
import ProductPage from "./pages/ProductPage";
import TestModelPage from "./pages/TestModelPage";

const menuItems = [
  { key: "/products", label: <Link to="/products">Products</Link> },
  { key: "/test-models", label: <Link to="/test-models">Test Models</Link> },
];

function App() {
  return (
    <BrowserRouter>
      <Menu mode="horizontal" items={menuItems} />
      <div style={{ padding: 24 }}>
        <Routes>
          <Route path="/products" element={<ProductPage />} />
          <Route path="/test-models" element={<TestModelPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
