import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./layouts/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { TeaPage } from "./pages/TeaPage";
import { PlannerPage } from "./pages/PlannerPage";
import { LocationProvider } from "./context/LocationProvider";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocationProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/tea" element={<TeaPage />} />
            </Route>
          </Routes>
        </LocationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
