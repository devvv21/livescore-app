// src/app/admin/injuries/create/page.tsx
import { fetchAllPlayersInLeagues, fetchAllTeamsInLeagues, fetchInjuriesFromApi, fetchTransfersFromApi } from "@/lib/api";
import InjuryModel, { IInjury } from "@/models/Injury";
import TransferModel, { ITransfer } from "@/models/Transfer";
import InjuriesTable from "@/components/InjuriesTable";
import TransfersTable from "@/components/TransfersTable";
import dbConnect from "@/lib/mongodb";
import CreateInjuryForm from "@/components/CreateInjuryForm";
import CreateTransferForm from "@/components/CreateTransferForm";
import TabbedView from "@/components/TabbedView";

const leagueIds = ["39", "78"];

export default async function ManagementPage() {
  await dbConnect();
  const [players, teams, manualInjuries, apiInjuriesResponse, manualTransfers, apiTransfersResponse] = await Promise.all([
    fetchAllPlayersInLeagues(leagueIds, "2024"),
    fetchAllTeamsInLeagues(leagueIds, "2024"),
    InjuryModel.find({}).sort({ lastUpdated: -1 }).lean(),
    fetchInjuriesFromApi("39"),
    TransferModel.find({}).sort({ date: -1 }).lean(),
    fetchTransfersFromApi("39")
  ]);

  const safePlayers = players || [];
  const safeTeams = teams || [];
  const safeManualInjuries = manualInjuries || [];
  const safeApiInjuries = apiInjuriesResponse || [];
  const safeManualTransfers = manualTransfers || [];
  const safeApiTransfers = apiTransfersResponse || [];

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

  const manualTransferPlayerIds = new Set(safeManualTransfers.map(transfer => transfer.playerId));
  const automatedTransfers = safeApiTransfers
    .filter(apiTransfer => apiTransfer && apiTransfer.player && !manualTransferPlayerIds.has(apiTransfer.player.id))
    .map((apiTransfer): ITransfer | null => {
      if (!apiTransfer.transfers || apiTransfer.transfers.length === 0) return null;
      const transferInfo = apiTransfer.transfers[0];
      return {
        _id: `api-${apiTransfer.player.id}`,
        playerId: apiTransfer.player.id,
        playerName: apiTransfer.player.name,
        playerPhoto: apiTransfer.player.photo,
        transferType: transferInfo.type,
        transferDate: new Date(transferInfo.date),
        fromTeamId: transferInfo.teams.out.id,
        fromTeamName: transferInfo.teams.out.name,
        fromTeamLogo: transferInfo.teams.out.logo,
        toTeamId: transferInfo.teams.in.id,
        toTeamName: transferInfo.teams.in.name,
        toTeamLogo: transferInfo.teams.in.logo,
        isApiEntry: true,
      };
    })
    .filter(Boolean) as ITransfer[];

  const serializedManualTransfers = safeManualTransfers.map(transfer => ({
    ...transfer,
    _id: transfer._id.toString(),
    transferDate: transfer.transferDate.toISOString(),
  }));

  const combinedTransfers = [...serializedManualTransfers, ...automatedTransfers].sort(
    (a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()
  );

  const tabs = [
    {
      id: 'injuries',
      label: 'Injury Management',
      content: (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg h-fit xl:col-span-1">
            <h1 className="text-2xl font-bold text-white mb-6">Create Injury</h1>
            <CreateInjuryForm players={safePlayers} />
          </div>
          <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg xl:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Existing Injuries</h2>
            <InjuriesTable injuries={combinedInjuries} />
          </div>
        </div>
      )
    },
    {
      id: 'transfers',
      label: 'Transfer Management',
      content: (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg h-fit xl:col-span-1">
            <h1 className="text-2xl font-bold text-white mb-6">Create Transfer</h1>
            <CreateTransferForm players={safePlayers} teams={safeTeams} />
          </div>
          <div className="w-full bg-[#2D3748] p-8 rounded-lg shadow-lg xl:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Transfers</h2>
            <TransfersTable transfers={combinedTransfers} />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <TabbedView tabs={tabs} />
      </div>
    </div>
  );
}
