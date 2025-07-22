// src/app/api/admin/predictions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Prediction from '@/models/Prediction'; // Assuming you have a Prediction model
import Match from '@/models/Match'; // To populate match details if needed

export async function GET() {
    await dbConnect();
    try {
        const predictions = await Prediction.find({})
            .populate('match', 'name homeTeam awayTeam homeLogo awayLogo') // Populate match details
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json(predictions);
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching predictions', error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { matchId, homeTeam, awayTeam, homeLogo, awayLogo, predictionType, predictedOutcome, confidence } = body;

        // Basic validation
        if (!matchId || !homeTeam || !awayTeam || !predictionType || !predictedOutcome || confidence === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newPrediction = new Prediction({
            match: matchId,
            homeTeam,
            awayTeam,
            homeLogo,
            awayLogo,
            predictionType,
            predictedOutcome,
            confidence,
        });

        await newPrediction.save();
        return NextResponse.json(newPrediction, { status: 201 });

    } catch (error: any) {
        // Handle potential duplicate entry errors or other validation issues
        if (error.code === 11000) { // Example for duplicate key error
            return NextResponse.json({ message: 'Prediction for this match/type already exists', error: error.message }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error creating prediction', error: error.message }, { status: 500 });
    }
}