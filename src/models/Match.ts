import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
    name: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    competition?: string;
    date?: Date;
    // Add other fields as needed
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema: Schema<IMatch> = new Schema({
    name: { type: String, required: false }, // Optional if home/away teams form the name
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeLogo: { type: String },
    awayLogo: { type: String },
    competition: { type: String },
    date: { type: Date },
}, { timestamps: true });

// Prevent overwriting the model if it already exists (useful for hot-reloading)
const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;