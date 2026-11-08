import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./layouts/Layout";
import { lazy } from "react";
import { LocationProvider } from "./context/LocationProvider";

// Each page is its own chunk, so visitors only download the code for the
// page they open. The dashboard's charting library is the biggest saving.
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const PlannerPage = lazy(() =>
  import("./pages/PlannerPage").then((m) => ({ default: m.PlannerPage })),
);
const TeaPage = lazy(() =>
  import("./pages/TeaPage").then((m) => ({ default: m.TeaPage })),
);

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
