import { useState, useEffect } from "react";

function App() {
  const [intensity, setIntensity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.carbonintensity.org.uk/intensity")
      .then((response) => response.json())
      .then((data) => {
        const value = data.data[0].intensity.actual;
        setIntensity(value);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch:", error);
        setError("Could not load data. Please try again later.");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>UK Carbon Intensity</h1>
      {loading ? <p>Loading...</p> : error ? <p>{error}</p> : <p>{intensity} gCO₂/kWh</p>}
    </div>
  );
}

export default App;
