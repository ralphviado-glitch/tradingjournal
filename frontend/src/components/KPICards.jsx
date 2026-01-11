import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

export default function KPICards() {
  const [performance, setPerformance] = useState({
    totalTrades: 0,
    totalPnL: 0,
    winRate: 0,
    avgRiskReward: 0
  });

  const [equityCurve, setEquityCurve] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        // Fetch performance
        const perfRes = await fetch(
          "http://localhost:5000/api/trades/performance",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const perfData = await perfRes.json();
        setPerformance(perfData);

        // Fetch trades
        const tradesRes = await fetch(
          "http://localhost:5000/api/trades",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const trades = await tradesRes.json();

        // Build equity curve
        let cumulativePnL = 0;
        const curve = trades
          .sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate))
          .map((trade, index) => {
            cumulativePnL += trade.pnl || 0;
            return {
              trade: index + 1,
              equity: cumulativePnL
            };
          });

        setEquityCurve(curve);

      } catch (error) {
        console.error("Error loading KPI data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading performance...</p>;

  const equityData = {
    labels: equityCurve.map(p => `Trade ${p.trade}`),
    datasets: [
      {
        label: "Equity Curve",
        data: equityCurve.map(p => p.equity),
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row mb-4">

        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Trades</h6>
              <h3>{performance.totalTrades}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Profit</h6>
              <h3 className={performance.totalPnL >= 0 ? "text-success" : "text-danger"}>
                ${Number(performance.totalPnL).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Win Rate</h6>
              <h3>{Number(performance.winRate).toFixed(2)}%</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Avg Risk : Reward</h6>
              <h3>1 : {Number(performance.avgRiskReward).toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Equity Curve</h5>
          <Line data={equityData} />
        </div>
      </div>
    </>
  );
}
