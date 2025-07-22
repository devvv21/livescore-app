// src/app/api/admin/predictions/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prediction from '@/models/Prediction';

// Helper to get ID from dynamic route
export async function GET(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const prediction = await Prediction.findById(params.id)
            .populate('match', 'name homeTeam awayTeam homeLogo awayLogo')
            .lean();
        if (!prediction) {
            return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
        }
        return NextResponse.json(prediction);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching prediction', error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const body = await request.json();
        const { matchId, homeTeam, awayTeam, homeLogo, awayLogo, predictionType, predictedOutcome, confidence } = body;

        // Basic validation
        if (!matchId || !homeTeam || !awayTeam || !predictionType || !predictedOutcome || confidence === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const updatedPrediction = await Prediction.findByIdAndUpdate(
            params.id,
            {
                match: matchId,
                homeTeam,
                awayTeam,
                homeLogo,
                awayLogo,
                predictionType,
                predictedOutcome,
                confidence,
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true } // Return the updated doc, run schema validators
        ).lean();

        if (!updatedPrediction) {
            return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
        }

        return NextResponse.json(updatedPrediction);

    } catch (error: any) {
        return NextResponse.json({ message: 'Error updating prediction', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const deletedPrediction = await Prediction.findByIdAndDelete(params.id).lean();
        if (!deletedPrediction) {
            return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Prediction deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error deleting prediction', error: error.message }, { status: 500 });
    }
}