// src/app/api/transfers/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TransferModel from '@/models/Transfer';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Basic validation to ensure required fields are present
    const { playerId, playerName, fromTeamName, toTeamName, transferDate } = body;
    if (!playerId || !playerName || !fromTeamName || !toTeamName || !transferDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newTransfer = await TransferModel.create(body);
    
    return NextResponse.json(newTransfer, { status: 201 });

  } catch (error) {
    console.error("Failed to create transfer:", error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Failed to create transfer", error: errorMessage }, { status: 500 });
  }
}