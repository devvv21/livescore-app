// src/models/Injury.ts
// This file is correct. It correctly imports from the central types file.

import mongoose, { Schema, Document, models, Model } from 'mongoose';
// Import from the central shared types file
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
  // This enum correctly uses the imported `injuryStatuses` array
  status: { type: String, required: true, enum: [...injuryStatuses], default: 'Injured' },
  details: { type: String, required: true },
  returnDate: { type: String, default: 'Unknown' },
  lastUpdated: { type: Date, default: Date.now }
});

// The model is created and checked if it already exists
const InjuryModel: Model<IInjury> = models.Injury || mongoose.model<IInjury>('Injury', InjurySchema);

// The ONLY export from this file is the model itself.
export default InjuryModel;