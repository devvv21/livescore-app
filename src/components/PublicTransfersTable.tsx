import { ITransfer } from '@/models/Transfer';
import Image from 'next/image';

interface PublicTransfersTableProps {
  transfers: ITransfer[];
}

export default function PublicTransfersTable({ transfers }: PublicTransfersTableProps) {
  return (
    <div className="overflow-x-auto bg-[#2D3748] rounded-b-lg shadow-lg">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-[#1A202C]">
          <tr>
            <th scope="col" className="px-6 py-4">Player</th>
            <th scope="col" className="px-6 py-4">Type</th>
            <th scope="col" className="px-6 py-4">From Team</th>
            <th scope="col" className="px-6 py-4">To Team</th>
            <th scope="col" className="px-6 py-4 text-center">Date</th>
          </tr>
        </thead>
        <tbody>
          {transfers.length > 0 ? (
            transfers.map((transfer) => (
              <tr key={transfer._id} className="border-b border-gray-700 hover:bg-gray-600 last:border-b-0">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Image
                      src={transfer.playerPhoto || '/default-player.png'}
                      alt={transfer.playerName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <span>{transfer.playerName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize">{transfer.transferType}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={transfer.fromTeamLogo || '/default-team.png'}
                      alt={transfer.fromTeamName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span>{transfer.fromTeamName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={transfer.toTeamLogo || '/default-team.png'}
                      alt={transfer.toTeamName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span>{transfer.toTeamName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(transfer.transferDate).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                No recent transfers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}