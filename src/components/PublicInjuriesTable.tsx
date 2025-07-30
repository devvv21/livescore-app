import Image from "next/image";
import { IInjuryData } from "@/lib/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Injured':
    case 'Knock':
    case 'Disciplinary':
    case 'Unavailable':
      return 'bg-red-600/50 text-red-300';
    case 'Doubt':
      return 'bg-yellow-600/50 text-yellow-300';
    case 'On Loan':
      return 'bg-blue-600/50 text-blue-300';
    default:
      return 'bg-gray-600/50 text-gray-300';
  }
};

interface PublicInjuriesTableProps {
  injuries: IInjuryData[];
}

export default function PublicInjuriesTable({ injuries }: PublicInjuriesTableProps) {
  return (
    <div className="overflow-x-auto bg-[#1A202C] rounded-lg  shadow-lg">
      <table className="min-w-full text-sm text-left text-gray-300 border-gray-700">
        <thead className="text-xs text-gray-100 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-4">Player</th>
            <th scope="col" className="px-6 py-4">Club</th>
            <th scope="col" className="px-6 py-4">Status</th>
            <th scope="col" className="px-6 py-4">Return Date</th>
            <th scope="col" className="px-6 py-4">Latest News</th>
            <th scope="col" className="px-6 py-4">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {(injuries || []).map((injury) => (
            <tr key={injury._id} className="border-b border-gray-700  hover:bg-gray-700/50">
              <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                <Image src={injury.playerPhoto} alt={injury.playerName} width={32} height={32} className="rounded-full" />
                {injury.playerName}
              </td>
              <td className="px-6 py-4">
                <Image src={injury.teamLogo} alt={injury.teamName} width={24} height={24} />
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(injury.status)}`}>
                  {injury.status}
                </span>
              </td>
              <td className="px-6 py-4">{injury.returnDate}</td>
              <td className="px-6 py-4">{injury.details}</td>
              <td className="px-6 py-4">{new Date(injury.lastUpdated).toLocaleDateString()}</td>
            </tr>
          ))}
          {(!injuries || injuries.length === 0) && (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-400">No injuries to display.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
