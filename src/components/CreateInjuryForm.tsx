'use client';

import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { createInjuryAction } from '@/app/admin/injuries/actions';
// Import from the new shared types file
import { injuryStatuses } from '@/lib/types'; 
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function CreateInjuryForm({ players }: { players: any[] }) {
  const [query, setQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filteredPlayers =
    query === ''
      ? players
      : players.filter((player) => {
          return player.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <form action={createInjuryAction}>
      <div className="space-y-6">
        <Combobox as="div" name="player" value={selectedPlayer} onChange={setSelectedPlayer}>
          <Combobox.Label className="block text-sm font-medium text-gray-300 mb-1">Player</Combobox.Label>
          <div className="relative">
            <Combobox.Input
              className="w-full rounded-md border-0 bg-[#1A222D] p-3 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(player: any) => player?.name}
              placeholder="Search for a player..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
            
            {filteredPlayers.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2D3748] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredPlayers.slice(0, 100).map((player) => (
                  <Combobox.Option
                    key={player.id}
                    value={player}
                    className={({ active }) =>
                      cn('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-blue-600 text-white' : 'text-gray-300')
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <span className={cn('block truncate', selected && 'font-semibold')}>{player.name} ({player.team.name})</span>
                        {selected && (
                          <span className={cn('absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-blue-600')}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
        
        {selectedPlayer && (
          <input type="hidden" name="playerData" value={JSON.stringify(selectedPlayer)} />
        )}
        
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select id="status" name="status" required className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3">
              {injuryStatuses.map(status => (<option key={status} value={status}>{status}</option>))}
            </select>
        </div>

        <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-1">Latest News</label>
            <input type="text" id="details" name="details" required placeholder="e.g., Knee injury in training" className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3"/>
        </div>

        <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-300 mb-1">Return Date</label>
            <input type="text" id="returnDate" name="returnDate" placeholder="e.g., Unknown" className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3"/>
        </div>

        <div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-500" disabled={!selectedPlayer}>
              Create Record
            </button>
        </div>
      </div>
    </form>
  );
}