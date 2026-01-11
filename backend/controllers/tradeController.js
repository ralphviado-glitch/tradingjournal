import Trade from "../models/Trade.js";

//create trade
export const createTrade = async (req, res) => {
  try {
    const {
      symbol,
      side,
      entryPrice,
      exitPrice,
      positionSize,
      tradeDate,
      notes,
      fee = 0
    } = req.body;

    if (!symbol || !side || !entryPrice || !positionSize || !tradeDate) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const { result, pnl } = calculateResult({
      side,
      entryPrice,
      exitPrice,
      positionSize,
      fee
    });

    const trade = new Trade({
      symbol,
      side,
      entryPrice,
      exitPrice,
      positionSize,
      tradeDate,
      notes,
      fee,
      result,
      pnl,
      userId: req.user.id
    });

    const savedTrade = await trade.save();
    res.status(201).json(savedTrade);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to save trade",
      error: error.message
    });
  }
};

// get trade
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade
      .find({ userId: req.user.id })
      .sort({ tradeDate: -1 });

    res.status(200).json(trades);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch trades",
      error: error.message
    });
  }
};

// update trade
export const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const {
      symbol,
      side,
      entryPrice,
      exitPrice,
      positionSize,
      fee,
      tradeDate,
      notes
    } = req.body;

    Object.assign(trade, {
      symbol,
      side,
      entryPrice,
      exitPrice,
      positionSize,
      fee,
      tradeDate,
      notes
    });

    const { result, pnl } = calculateResult(trade);
    trade.result = result;
    trade.pnl = pnl;

    const updatedTrade = await trade.save();
    res.status(200).json(updatedTrade);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update trade",
      error: error.message
    });
  }
};

// delete trade
export const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.status(200).json({ message: "Trade deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete trade",
      error: error.message
    });
  }
};

// perf metrics
export const getPerformance = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user.id });

    const totalTrades = trades.length;

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl < 0);

    const totalPnL = trades.reduce(
      (sum, t) => sum + (t.pnl || 0),
      0
    );

    const winRate =
      totalTrades > 0
        ? (wins.length / totalTrades) * 100
        : 0;

    // ---- CORRECT AVG RISK-REWARD ----
    const avgWin =
      wins.length > 0
        ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length
        : 0;

    const avgLoss =
      losses.length > 0
        ? Math.abs(
            losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length
          )
        : 0;

    const avgRiskReward =
      avgLoss > 0 ? avgWin / avgLoss : 0;

    res.status(200).json({
      totalTrades,
      totalPnL: totalPnL.toFixed(2),
      winRate: winRate.toFixed(2),
      avgRiskReward: avgRiskReward.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to calculate performance",
      error: error.message
    });
  }
};


const calculateResult = (trade) => {
  let result = null;
  let pnl = 0;

  const {
    side,
    entryPrice,
    exitPrice,
    positionSize,
    fee = 0
  } = trade;

  if (
    entryPrice != null &&
    exitPrice != null &&
    positionSize != null
  ) {
    pnl =
      side === "Long"
        ? (exitPrice - entryPrice) * positionSize - fee
        : (entryPrice - exitPrice) * positionSize - fee;

    result = pnl >= 0 ? "Win" : "Loss";
  }

  return { result, pnl };
};
