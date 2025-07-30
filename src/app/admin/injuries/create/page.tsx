import { fetchAllPlayersInLeague, fetchInjuriesFromApi } from "@/lib/api";
import InjuryModel, { IInjury } from "@/models/Injury";
import InjuriesTable from "@/components/InjuriesTable";
import dbConnect from "@/lib/mongodb";
import CreateInjuryForm from "@/components/CreateInjuryForm";
export default async function ManageInjuriesPage() {
  await dbConnect();

  const [players, manualInjuries, apiInjuriesResponse] = await Promise.all([
    fetchAllPlayersInLeague("39"),
    InjuryModel.find({}).sort({ lastUpdated: -1 }).lean(),
    fetchInjuriesFromApi("39")
  ]);

  const safePlayers = players || [];
  const safeManualInjuries = manualInjuries || [];
  const safeApiInjuries = apiInjuriesResponse || [];
  
  const manualInjuryPlayerIds = new Set(safeManualInjuries.map(inj => inj.playerId));

  const automatedInjuries = safeApiInjuries
    .filter(apiInjury => apiInjury && apiInjury.player && !manualInjuryPlayerIds.has(apiInjury.player.id))
    .map((apiInjury): IInjury | null => {
      if (!apiInjury.team || !apiInjury.injury || !apiInjury.fixture) return null;
      return {
        _id: `api-${apiInjury.player.id}`,
        playerId: apiInjury.player.id,
        playerName: apiInjury.player.name,
        playerPhoto: apiInjury.player.photo,
        teamId: apiInjury.team.id,
        teamName: apiInjury.team.name,
        teamLogo: apiInjury.team.logo,
        status: (apiInjury.injury.type === 'Suspended' || apiInjury.injury.type === 'Red Card') ? 'Disciplinary' : 'Injured',
        details: apiInjury.injury.reason,
        returnDate: 'Unknown',
        lastUpdated: new Date(apiInjury.fixture.date),
        isApiEntry: true,
      };
    })
    .filter(Boolean) as IInjury[];

  const serializedManualInjuries = safeManualInjuries.map(injury => ({
    ...injury,
    _id: injury._id.toString(),
    lastUpdated: injury.lastUpdated.toISOString(),
  }));
  
  const combinedInjuries = [...serializedManualInjuries, ...automatedInjuries].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-screen-2xl mx-auto">
        <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg h-fit xl:col-span-1">
          <h1 className="text-2xl font-bold text-white mb-6">Create Injury</h1>
          <CreateInjuryForm players={safePlayers} />
        </div>
        <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg xl:col-span-2">
           <h2 className="text-2xl font-bold text-white mb-6">Existing Injuries</h2>
           <InjuriesTable injuries={combinedInjuries} />
        </div>
      </div>
    </div>
  );
}