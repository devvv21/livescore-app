// src/app/api/transfers/[id]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TransferModel from '@/models/Transfer';
import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid transfer ID format" }, { status: 400 });
    }

    const deletedTransfer = await TransferModel.findByIdAndDelete(id);

    if (!deletedTransfer) {
      return NextResponse.json({ message: "Transfer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Transfer deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Failed to delete transfer:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Failed to delete transfer", error: errorMessage }, { status: 500 });
  }
}