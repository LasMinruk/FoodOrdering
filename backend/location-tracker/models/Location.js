import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  agentId: String,
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Location', locationSchema);