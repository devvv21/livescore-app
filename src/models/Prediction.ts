import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPrediction extends Document {
    match: Types.ObjectId | IMatch; // Reference to the Match document
    homeTeam: string; // Redundant but useful for direct display/filtering
    awayTeam: string; // Redundant but useful for direct display/filtering
    homeLogo?: string; // Redundant but useful
    awayLogo?: string; // Redundant but useful
    predictionType: string; // e.g., 'winner', 'score', 'goalscorer'
    predictedOutcome: string; // e.g., 'home', 'draw', 'away', or specific score like '2-1'
    confidence: number; // Percentage
    actualOutcome?: string; // e.g., 'home_win', 'draw', 'away_win', 'correct_score'
    result?: 'correct' | 'incorrect' | 'pending'; // Status of the prediction
    // Add other fields like user ID if predictions are user-specific
    createdAt: Date;
    updatedAt: Date;
}

const PredictionSchema: Schema<IPrediction> = new Schema({
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeLogo: { type: String },
    awayLogo: { type: String },
    predictionType: { type: String, required: true, enum: ['winner', 'score', 'goalscorer'] }, // Example types
    predictedOutcome: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    actualOutcome: { type: String },
    result: { type: String, enum: ['correct', 'incorrect', 'pending'], default: 'pending' },
}, { timestamps: true });

// Index for faster lookups
PredictionSchema.index({ match: 1, predictionType: 1 });

const Prediction: Model<IPrediction> = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);

export default Prediction;