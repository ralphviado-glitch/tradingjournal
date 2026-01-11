import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";

export default function AddTrade({ tradeToEdit, onTradeAdded }) {
  const [formData, setFormData] = useState({
    symbol: tradeToEdit?.symbol || "",
    side: tradeToEdit?.side || "Long",
    entryPrice: tradeToEdit?.entryPrice || "",
    exitPrice: tradeToEdit?.exitPrice || "",
    positionSize: tradeToEdit?.positionSize || "",
    fee: tradeToEdit?.fee || 0,
    result: tradeToEdit?.result || "",
    pnl: tradeToEdit?.pnl || 0,
    tradeDate: tradeToEdit?.tradeDate ? tradeToEdit.tradeDate.split("T")[0] : "",
    notes: tradeToEdit?.notes || ""
  });

  // Recalculate Result and PNL
  useEffect(() => {
    const { side, entryPrice, exitPrice, positionSize, fee } = formData;
    if (entryPrice && exitPrice && positionSize) {
      let pnlValue = side === "Long"
        ? (exitPrice - entryPrice) * positionSize
        : (entryPrice - exitPrice) * positionSize;
      pnlValue -= Number(fee);

      setFormData(prev => ({
        ...prev,
        result: pnlValue >= 0 ? "Win" : "Loss",
        pnl: pnlValue.toFixed(2)
      }));
    }
  }, [formData.side, formData.entryPrice, formData.exitPrice, formData.positionSize, formData.fee]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const { symbol, side, entryPrice, positionSize, tradeDate } = formData;
    if (!symbol || !side || !entryPrice || !positionSize || !tradeDate) {
      alert("Please fill all required fields");
      return;
    }

    // Construct API URL correctly
    const baseURL = import.meta.env.VITE_API_URL;
    if (!baseURL) {
      alert("API URL not configured. Check your .env file.");
      return;
    }

    const url = tradeToEdit
      ? `${baseURL}/api/trades/${tradeToEdit._id}`
      : `${baseURL}/api/trades`;

    const method = tradeToEdit ? "PUT" : "POST";

    try {
      console.log("Sending request to:", url); // debug
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      // Read text first to handle bad responses
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Expected JSON, got:", text);
        throw new Error("Server did not return JSON");
      }

      if (!res.ok) throw new Error(data.message || "Failed to save trade");

      alert(tradeToEdit ? "Trade updated!" : "Trade added!");
      onTradeAdded?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error saving trade");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Control name="symbol" placeholder="Symbol" className="mb-2"
        value={formData.symbol} onChange={handleChange} />

      <Form.Select name="side" className="mb-2" value={formData.side} onChange={handleChange}>
        <option value="Long">Long</option>
        <option value="Short">Short</option>
      </Form.Select>

      <Form.Control type="number" name="entryPrice" placeholder="Entry Price" className="mb-2"
        value={formData.entryPrice} onChange={handleChange} />

      <Form.Control type="number" name="exitPrice" placeholder="Exit Price" className="mb-2"
        value={formData.exitPrice} onChange={handleChange} />

      <Form.Control type="number" name="positionSize" placeholder="Position Size" className="mb-2"
        value={formData.positionSize} onChange={handleChange} />

      <Form.Control type="number" name="fee" placeholder="Fee" className="mb-2"
        value={formData.fee} onChange={handleChange} />

      <Form.Control type="date" name="tradeDate" className="mb-2"
        value={formData.tradeDate} onChange={handleChange} />

      <Form.Control as="textarea" name="notes" placeholder="Notes" className="mb-2"
        value={formData.notes} onChange={handleChange} />

      <Button type="submit" className="w-100" variant="success">
        {tradeToEdit ? "Update Trade" : "Add Trade"}
      </Button>
    </Form>
  );
}
