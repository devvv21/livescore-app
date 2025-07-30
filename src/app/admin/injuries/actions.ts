'use server';

import dbConnect from "@/lib/mongodb";
import InjuryModel from "@/models/Injury";
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import { redirect } from "next/navigation";

const injurySchema = z.object({
  playerData: z.string().min(1, 'Player is required.'),
  status: z.string().min(1, 'Status is required.'),
  details: z.string().min(3, 'Details must be at least 3 characters long.'),
  returnDate: z.string().optional(),
});

export async function createInjuryAction(formData: FormData) {
  await dbConnect();

  const rawData = {
    playerData: formData.get('playerData'),
    status: formData.get('status'),
    details: formData.get('details'),
    returnDate: formData.get('returnDate'),
  };

  const validation = injurySchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  
  const player = JSON.parse(validation.data.playerData);

  try {
    await new InjuryModel({
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo,
      teamId: player.team.id,
      teamName: player.team.name,
      teamLogo: player.team.logo,
      status: validation.data.status,
      details: validation.data.details,
      returnDate: validation.data.returnDate || 'Unknown',
    }).save();

    revalidatePath('/admin/injuries/create');
    return { success: true, message: 'Injury created successfully!' };
  } catch (error) {
    return { success: false, message: 'An error occurred while creating the injury.' };
  }
}

export async function updateInjuryAction(formData: FormData) {
  const injuryId = formData.get('injuryId')?.toString();
  
  const updateData = {
    status: formData.get('status')?.toString(),
    details: formData.get('details')?.toString(),
    returnDate: formData.get('returnDate')?.toString(),
  };

  if (!injuryId) return { success: false, message: 'Injury ID not found.' };

  await dbConnect();
  await InjuryModel.findByIdAndUpdate(injuryId, { ...updateData, lastUpdated: new Date() });
  
  revalidatePath('/admin/injuries/create');
  redirect('/admin/injuries/create');
}

export async function deleteInjuryAction(formData: FormData) {
  const injuryId = formData.get('injuryId')?.toString();

  if (!injuryId) return { success: false, message: 'Injury ID not found.' };

  await dbConnect();
  await InjuryModel.findByIdAndDelete(injuryId);
  revalidatePath('/admin/injuries/create');
  return { success: true, message: 'Injury deleted.' };
}