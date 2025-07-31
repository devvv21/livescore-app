import mongoose, { Schema, Document, models, Model } from 'mongoose';
// Import from the new shared types file
import { IInjuryData, injuryStatuses } from '@/lib/types';

// Create a Mongoose-specific interface that extends the base and Document
export interface IInjury extends IInjuryData, Document {}

const InjurySchema: Schema<IInjury> = new Schema({
  playerId: { type: Number, required: true, index: true },
  playerName: { type: String, required: true },
  playerPhoto: { type: String, required: true },
  teamId: { type: Number, required: true },
  teamName: { type: String, required: true },
  teamLogo: { type: String, required: true },
  status: { type: String, required: true, enum: injuryStatuses, default: 'Injured' },
  details: { type: String, required: true },
  returnDate: { type: String, default: 'Unknown' },
  lastUpdated: { type: Date, default: Date.now }
});

// This line is now safe because this file will only be imported on the server.
const InjuryModel: Model<IInjury> = models.Injury || mongoose.model<IInjury>('Injury', InjurySchema);

export default InjuryModel;