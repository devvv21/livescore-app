import { Schema, model, models, Document } from 'mongoose';

export interface ITransfer extends Document {
  _id: string;
  playerId: number;
  playerName: string;
  playerPhoto: string;
  transferType: string;
  transferDate: Date;
  fromTeamId: number;
  fromTeamName: string;
  fromTeamLogo: string;
  toTeamId: number;
  toTeamName: string;
  toTeamLogo: string;
  isApiEntry?: boolean;
}

const TransferSchema = new Schema<ITransfer>({
  playerId: { type: Number, required: true, index: true },
  playerName: { type: String, required: true },
  playerPhoto: { type: String, required: true },
  transferType: { type: String, required: true },
  transferDate: { type: Date, required: true, index: true },
  fromTeamId: { type: Number, required: true },
  fromTeamName: { type: String, required: true },
  fromTeamLogo: { type: String, required: true },
  toTeamId: { type: Number, required: true },
  toTeamName: { type: String, required: true },
  toTeamLogo: { type: String, required: true },
  isApiEntry: { type: Boolean, default: false },
});

const TransferModel = models.Transfer || model<ITransfer>('Transfer', TransferSchema);

export default TransferModel;