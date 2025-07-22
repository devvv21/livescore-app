// src/app/api/admin/matches/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Ensure this utility is correctly set up
import Match, { IMatch } from '@/models/Match'; // Assuming IMatch type and Match model exist

// GET: Fetch all matches (e.g., for dropdowns or a list view)
export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q'); // Optional query for searching matches

        let matchesQuery = Match.find({});

        if (query) {
            // Basic text search on name, homeTeam, awayTeam
            matchesQuery = matchesQuery.or([
                { name: { $regex: query, $options: 'i' } },
                { homeTeam: { $regex: query, $options: 'i' } },
                { awayTeam: { $regex: query, $options: 'i' } }
            ]);
        }

        const matches = await matchesQuery
            .select('_id name homeTeam awayTeam homeLogo awayLogo') // Select fields needed for predictions
            .sort({ date: 1, createdAt: -1 }) // Sort by date, then creation time
            .lean();

        // Format for react-select
        const formattedMatches = matches.map((match: IMatch) => ({
            value: match._id.toString(),
            label: match.name || `${match.homeTeam} vs ${match.awayTeam}`,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeLogo: match.homeLogo,
            awayLogo: match.awayLogo,
            date: match.date?.toISOString() // Include date if available
        }));

        return NextResponse.json(formattedMatches);
    } catch (error: any) {
        console.error("API Error (GET /api/admin/matches):", error);
        return NextResponse.json({ message: 'Error fetching matches', error: error.message }, { status: 500 });
    }
}

// POST: Create a new match
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { name, homeTeam, awayTeam, homeLogo, awayLogo, date, competition } = body;

        // Basic validation
        if (!homeTeam || !awayTeam) {
            return NextResponse.json({ message: 'Home and Away teams are required' }, { status: 400 });
        }

        // Construct a default name if not provided
        const matchName = name || `${homeTeam} vs ${awayTeam}`;

        const newMatch = new Match({
            name: matchName,
            homeTeam,
            awayTeam,
            homeLogo: homeLogo || '', // Default to empty string if not provided
            awayLogo: awayLogo || '',
            date: date ? new Date(date) : undefined, // Ensure date is a Date object
            competition: competition || '',
        });

        await newMatch.save();

        // Return the newly created match, formatted for react-select
        const formattedMatch = {
            value: newMatch._id.toString(),
            label: newMatch.name,
            homeTeam: newMatch.homeTeam,
            awayTeam: newMatch.awayTeam,
            homeLogo: newMatch.homeLogo,
            awayLogo: newMatch.awayLogo,
            date: newMatch.date?.toISOString()
        };

        return NextResponse.json(formattedMatch, { status: 201 });

    } catch (error: any) {
        console.error("API Error (POST /api/matches):", error);
        // Handle potential duplicate entry errors or other validation issues
        if (error.code === 11000) { // Example for duplicate key error (if unique index exists)
            return NextResponse.json({ message: 'Match already exists', error: error.message }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error creating match', error: error.message }, { status: 500 });
    }
}

// Note: PUT and DELETE for matches would typically go in a [id]/route.ts file.