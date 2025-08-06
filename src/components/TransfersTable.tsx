'use client';

import { ITransfer } from '@/models/Transfer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface TransfersTableProps {
  transfers: ITransfer[];
}

export default function TransfersTable({ transfers }: TransfersTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    // Prevent deleting entries that are automatically fetched from the API
    if (id.startsWith('api-')) {
      alert("API entries cannot be deleted.");
      return;
    }

    if (confirm('Are you sure you want to delete this manual transfer entry?')) {
      try {
        const response = await fetch(`/api/transfers/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete the transfer.');
        }
        
        alert('Transfer deleted successfully!');
        router.refresh(); // Refresh server components to get the updated list
      } catch (error) {
        console.error('Error deleting transfer:', error);
        alert('An error occurred while deleting the transfer.');
      }
    }
  };
  
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-[#1A202C]">
          <tr>
            <th scope="col" className="px-6 py-3">Player</th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">From Team</th>
            <th scope="col" className="px-6 py-3">To Team</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transfers.length > 0 ? (
            transfers.map((transfer) => (
              <tr key={transfer._id} className="bg-[#2D3748] border-b border-gray-700 hover:bg-gray-600">
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
                <td className="px-6 py-4">{transfer.transferType}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={transfer.fromTeamLogo || '/default-team.png'}
                      alt={transfer.fromTeamName}
                      width={24}
                      height={24}
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
                    />
                    <span>{transfer.toTeamName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Date(transfer.transferDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {!transfer.isApiEntry && (
                    <button
                      onClick={() => handleDelete(transfer._id)}
                      className="font-medium text-red-500 hover:underline"
                      aria-label={`Delete transfer for ${transfer.playerName}`}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                No transfers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}