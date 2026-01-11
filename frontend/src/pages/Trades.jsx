import { useState, useRef } from "react";
import TradeTable from "../components/TradeTable";
import AddTrade from "../components/AddTrade";
import { Modal, Button } from "react-bootstrap";

export default function TradePage() {
  const tradeTableRef = useRef();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null); // for edit

  // Refresh table after add/edit/delete
  const handleTradeUpdated = () => {
    if (tradeTableRef.current) tradeTableRef.current.refreshTrades();
    setShowAddModal(false);
    setEditingTrade(null);
  };


  const handleEdit = (trade) => {
    setEditingTrade(trade);
    setShowAddModal(true);
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trade?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trades/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete trade");
      alert("Trade deleted!");
      if (tradeTableRef.current) tradeTableRef.current.refreshTrades();
    } catch (err) {
      console.error(err);
      alert("Error deleting trade");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Trades</h2>

      <Button variant="primary" className="mb-3" onClick={() => setShowAddModal(true)}>
        {editingTrade ? "Edit Trade" : "Add Trade"}
      </Button>

      <TradeTable ref={tradeTableRef} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Add/Edit Trade Modal */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setEditingTrade(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingTrade ? "Edit Trade" : "Add Trade"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddTrade tradeToEdit={editingTrade} onTradeAdded={handleTradeUpdated} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
