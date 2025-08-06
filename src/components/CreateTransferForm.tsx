'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import SearchableSelect from './SearchableSelect';

// --- Type Definitions (No Changes) ---
interface Player {
  id: number;
  name: string;
  photo: string;
  team: { name: string; };
}

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface PlayerOption {
  value: string;
  label: string;
  player: Player;
}

interface CreateTransferFormProps {
  players: Player[];
  teams: Team[];
}

export default function CreateTransferForm({ players, teams }: CreateTransferFormProps) {
  const router = useRouter();
  
  // --- State Management (No Changes) ---
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption | null>(null);
  const [fromTeamId, setFromTeamId] = useState<string>('');
  const [toTeamId, setToTeamId] = useState<string>('');
  const [transferType, setTransferType] = useState<string>('Transfer');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data Preparation (No Changes) ---
  const playerOptions: PlayerOption[] = players.map(p => ({
    value: p.id.toString(),
    label: `${p.name} (${p.team?.name || 'N/A'})`,
    player: p,
  }));

  // --- Form Submission Logic (No Changes) ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedPlayer || !fromTeamId || !toTeamId || !transferDate) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }
    
    const fromTeam = teams.find(t => t.id === parseInt(fromTeamId, 10));
    const toTeam = teams.find(t => t.id === parseInt(toTeamId, 10));

    if (!fromTeam || !toTeam) {
      setError('Invalid team selection.');
      setIsSubmitting(false);
      return;
    }
    
    const transferData = {
      playerId: selectedPlayer.player.id,
      playerName: selectedPlayer.player.name,
      playerPhoto: selectedPlayer.player.photo,
      transferType,
      transferDate,
      fromTeamId: fromTeam.id,
      fromTeamName: fromTeam.name,
      fromTeamLogo: fromTeam.logo,
      toTeamId: toTeam.id,
      toTeamName: toTeam.name,
      toTeamLogo: toTeam.logo,
    };

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to create transfer.');
      }
      
      alert('Transfer created successfully!');
      router.refresh();
      setSelectedPlayer(null);
      setFromTeamId('');
      setToTeamId('');
      setTransferType('Transfer');
      setTransferDate(new Date().toISOString().split('T')[0]);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STYLING & RENDER ---
  
  // Define a shared style for all input fields for perfect consistency
  const inputStyles = "w-full bg-[#1A202C] text-white border border-gray-600 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 h-[42px]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-800 text-white rounded-md">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Player</label>
        <SearchableSelect
          options={playerOptions}
          value={selectedPlayer}
          onChange={(option) => setSelectedPlayer(option)}
          placeholder="Search for a player..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">From Team</label>
        <select value={fromTeamId} onChange={(e) => setFromTeamId(e.target.value)} className={inputStyles} required>
          <option value="" disabled>Select a team...</option>
          {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">To Team</label>
        <select value={toTeamId} onChange={(e) => setToTeamId(e.target.value)} className={inputStyles} required>
          <option value="" disabled>Select a team...</option>
          {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Transfer Type</label>
        <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className={inputStyles}>
          <option>Transfer</option>
          <option>Loan</option>
          <option>Free</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Transfer Date</label>
        <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className={inputStyles} required />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Create Record'}
        </button>
      </div>
    </form>
  );
}