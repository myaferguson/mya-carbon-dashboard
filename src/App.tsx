import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { TeaPage } from "./pages/TeaPage";
import { LocationProvider } from "./context/LocationProvider";

function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tea" element={<TeaPage />} />
          </Route>
        </Routes>
      </LocationProvider>
    </BrowserRouter>
  );
}

export default App;
