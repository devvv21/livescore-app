import Link from "next/link";
import Image from "next/image";
import { IInjury } from "@/models/Injury";
import { deleteInjuryAction } from "@/app/admin/injuries/actions";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Injured': case 'Knock': case 'Disciplinary': case 'Unavailable': return 'bg-red-600/50 text-red-300';
    case 'Doubt': return 'bg-yellow-600/50 text-yellow-300';
    case 'On Loan': return 'bg-blue-600/50 text-blue-300';
    default: return 'bg-gray-600/50 text-gray-300';
  }
};

interface InjuriesTableProps {
  injuries: (IInjury & { _id: string, isApiEntry?: boolean })[];
}

export default function InjuriesTable({ injuries }: InjuriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-[#1A222D]">
          <tr>
            <th scope="col" className="px-6 py-3">Player</th>
            <th scope="col" className="px-6 py-3">Club</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Return Date</th>
            <th scope="col" className="px-6 py-3">Latest News</th>
            <th scope="col" className="px-6 py-3">Last Updated</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Change is on this line */}
          {(injuries || []).map((injury) => (
            <tr key={injury._id} className="border-b border-gray-700 hover:bg-gray-700/50">
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
              <td className="px-6 py-4 text-right flex items-center justify-end gap-4">
                {injury.isApiEntry ? (
                  <span className="text-gray-500 text-xs">API</span>
                ) : (
                  <>
                    <Link href={`/admin/injuries/update/${injury._id}`} className="font-medium text-blue-400 hover:underline">Update</Link>
                    <form action={deleteInjuryAction}>
                      <input type="hidden" name="injuryId" value={injury._id} />
                      <button type="submit" className="font-medium text-red-400 hover:underline">Delete</button>
                    </form>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}