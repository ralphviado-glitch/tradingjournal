import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "react-bootstrap";

const TradeTable = forwardRef(({ onEdit, onDelete }, ref) => {
  const [trades, setTrades] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "tradeDate", direction: "desc" });

  const fetchTrades = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/trades", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      console.error(err);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshTrades: fetchTrades
  }));

  useEffect(() => {
    fetchTrades();
  }, []);

  // Calculate P&L
  const calcPNL = (trade) => {
    if (!trade.entryPrice || !trade.exitPrice) return "";
    let pnl = trade.side === "Long"
      ? (trade.exitPrice - trade.entryPrice) * trade.positionSize
      : (trade.entryPrice - trade.exitPrice) * trade.positionSize;

    if (trade.fee) pnl -= trade.fee;
    return pnl.toFixed(2);
  };

  // Sorting handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedTrades = [...trades].sort((a, b) => {
    if (!a[sortConfig.key]) return 1;
    if (!b[sortConfig.key]) return -1;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // For date
    if (sortConfig.key === "tradeDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="table-responsive">
      <h4 className="mb-2">My Trades</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th onClick={() => handleSort("symbol")} style={{ cursor: "pointer" }}>Symbol</th>
            <th onClick={() => handleSort("side")} style={{ cursor: "pointer" }}>Side</th>
            <th onClick={() => handleSort("entryPrice")} style={{ cursor: "pointer" }}>Entry</th>
            <th onClick={() => handleSort("exitPrice")} style={{ cursor: "pointer" }}>Exit</th>
            <th onClick={() => handleSort("positionSize")} style={{ cursor: "pointer" }}>Position</th>
            <th>Result</th>
            <th onClick={() => handleSort("pnl")} style={{ cursor: "pointer" }}>P&L</th>
            <th onClick={() => handleSort("tradeDate")} style={{ cursor: "pointer" }}>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrades.length ? (
            sortedTrades.map(trade => (
              <tr key={trade._id}>
                <td>{trade.symbol}</td>
                <td>{trade.side}</td>
                <td>{trade.entryPrice}</td>
                <td>{trade.exitPrice}</td>
                <td>{trade.positionSize}</td>
                <td>{trade.result}</td>
                <td>{calcPNL(trade)}</td>
                <td>{new Date(trade.tradeDate).toLocaleDateString()}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => onEdit && onEdit(trade)}>Edit</Button>{" "}
                  <Button size="sm" variant="danger" onClick={() => onDelete && onDelete(trade._id)}>Delete</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No trades yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TradeTable;
