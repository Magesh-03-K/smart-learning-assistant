import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  goal: String,

  topics: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Plan", PlanSchema);