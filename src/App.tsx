import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { TeaPage } from "./pages/TeaPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tea" element={<TeaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
