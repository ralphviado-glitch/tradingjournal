import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    side: {
      type: String,
      enum: ["Long", "Short"],
      required: true
    },
    entryPrice: {
      type: Number,
      required: true
    },
    exitPrice: {
      type: Number
    },
    positionSize: {
      type: Number,
      required: true
    },
    result: {
      type: String,
      enum: ["Win", "Loss"]
    },
    tradeDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String
    },
    fee: {
      type: Number,
      default: 0
    },
    pnl: {
      type: Number
    }
  },
  { timestamps: true }
);

export default mongoose.model("Trade", tradeSchema);
