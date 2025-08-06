import { IInjuryData } from '@/lib/types';
import Image from 'next/image';

interface PublicInjuriesTableProps {
  injuries: IInjuryData[];
}

export default function PublicInjuriesTable({ injuries }: PublicInjuriesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Injured':
        return 'bg-red-500 text-red-100';
      case 'Disciplinary':
        return 'bg-yellow-500 text-yellow-100';
      default:
        return 'bg-gray-500 text-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto bg-[#2D3748] rounded-b-lg shadow-lg">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-[#1A202C]">
          <tr>
            <th scope="col" className="px-6 py-4">Player</th>
            <th scope="col" className="px-6 py-4">Team</th>
            <th scope="col" className="px-6 py-4 text-center">Status</th>
            <th scope="col" className="px-6 py-4">Details</th>
            <th scope="col" className="px-6 py-4">Return Date</th>
          </tr>
        </thead>
        <tbody>
          {injuries.length > 0 ? (
            injuries.map((injury) => (
              <tr key={injury._id} className="border-b border-gray-700 hover:bg-gray-600 last:border-b-0">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Image
                      src={injury.playerPhoto || '/default-player.png'}
                      alt={injury.playerName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <span>{injury.playerName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={injury.teamLogo || '/default-team.png'}
                      alt={injury.teamName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span>{injury.teamName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(injury.status)}`}>
                    {injury.status}
                  </span>
                </td>
                <td className="px-6 py-4">{injury.details}</td>
                <td className="px-6 py-4">{injury.returnDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                No injuries or suspensions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}