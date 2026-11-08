import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./layouts/Layout";
import { LocationProvider } from "./context/LocationProvider";
import type { ApplianceId } from "./utils/appliances";

// Lazy so the shell paints first; the dashboard's chart is split again.
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

/**
 * The planner and tea optimiser used to be separate pages. Old links still
 * work: they open the dashboard at the planner with the matching appliance,
 * keeping any other query parameters (postcode, hours, by…).
 */
function ToPlanner({ appliance }: { appliance: ApplianceId }) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  if (!params.has("appliance")) params.set("appliance", appliance);
  return <Navigate replace to={{ pathname: "/", search: `?${params}`, hash: "#planner" }} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocationProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/planner" element={<ToPlanner appliance="washing-machine" />} />
              <Route path="/tea" element={<ToPlanner appliance="kettle" />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
          </Routes>
        </LocationProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
