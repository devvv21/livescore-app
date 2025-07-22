// src/app/admin/create-prediction/page.tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable'; // Assuming you might want categories/tags for predictions too

// --- Mock/Placeholder Types ---
// Replace these with your actual data models for predictions, matches, teams, etc.
interface SelectOption { value: string; label: string; }

interface Match {
    _id: string;
    name: string; // e.g., "Manchester City vs Real Madrid"
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    // Add other relevant match fields
}

interface Prediction {
    _id: string;
    match: string | Match; // Reference to a match
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    predictionType: string; // e.g., 'winner', 'score'
    predictedOutcome: string; // e.g., 'home', 'draw', 'away'
    confidence: number; // e.g., 75 for 75%
    // Add other prediction-specific fields
    createdAt: string;
    updatedAt: string;
}
// --- End Mock/Placeholder Types ---


const LoadingSpinner = () => <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>;
// If you have a specific uploader for team logos, use it here. Otherwise, a generic text input can suffice.
// const TeamLogoUploader = dynamic(() => import('@/components/TeamLogoUploader'), { ssr: false });


const PublishedPredictionsTable = ({ predictions, isLoading, onEdit, onDelete }: { predictions: Prediction[], isLoading: boolean, onEdit: (prediction: Prediction) => void, onDelete: (id: string) => void }) => (
    <div className="mt-12 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Published Predictions</h2>
        <div className="overflow-x-auto relative">
            {isLoading && <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10"><LoadingSpinner /></div>}
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">Match</th>
                        <th scope="col" className="px-6 py-3">Prediction Type</th>
                        <th scope="col" className="px-6 py-3">Outcome</th>
                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {predictions.length === 0 && !isLoading ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No predictions found.</td>
                        </tr>
                    ) : (
                        predictions.map((prediction) => (
                            <tr key={prediction._id.toString()} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                    {(prediction.match as Match)?.name || prediction.homeTeam + ' vs ' + prediction.awayTeam}
                                </th>
                                <td className="px-6 py-4">{prediction.predictionType}</td>
                                <td className="px-6 py-4">{prediction.predictedOutcome} ({prediction.confidence}%)</td>
                                <td className="px-6 py-4 text-right space-x-4">
                                    <button onClick={() => onEdit(prediction)} className="font-medium text-blue-500 hover:underline" disabled={isLoading}>Edit</button>
                                    <button onClick={() => onDelete(prediction._id.toString())} className="font-medium text-red-500 hover:underline" disabled={isLoading}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const CreatePredictionPage = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isPredictionsLoading, setIsPredictionsLoading] = useState(true);
    const [editingPredictionId, setEditingPredictionId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // --- State for Prediction Form ---
    const [allMatches, setAllMatches] = useState<SelectOption[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<SelectOption | null>(null);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [homeLogo, setHomeLogo] = useState('');
    const [awayLogo, setAwayLogo] = useState('');
    const [predictionType, setPredictionType] = useState('winner'); // Default type
    const [predictedOutcome, setPredictedOutcome] = useState('home'); // Default outcome
    const [confidence, setConfidence] = useState(50); // Default confidence
    // --- End State for Prediction Form ---

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setIsPredictionsLoading(true);
        try {
            // Fetch existing predictions
            const predictionsRes = await fetch('/api/admin/predictions');
            if (predictionsRes.ok) {
                const data = await predictionsRes.json();
                setPredictions(data);
            } else {
                setFormError("Failed to load predictions.");
            }

            // Fetch available matches (e.g., from /api/admin/matches)
            const matchesRes = await fetch('/api/admin/matches'); // You'll need to create this API route
            if (matchesRes.ok) {
                const matchesData = await matchesRes.json();
                setAllMatches(matchesData.map((m: Match) => ({ value: m._id.toString(), label: m.name })));
            } else {
                setFormError("Failed to load matches for predictions.");
            }
        } catch (error) {
            setFormError("An error occurred while fetching initial data.");
            console.error("Fetch initial data error:", error);
        } finally {
            setIsPredictionsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleMatchSelect = (option: SelectOption | null) => {
        setSelectedMatch(option);
        if (option) {
            // Find the match details from the fetched matches if needed
            const match = allMatches.find(m => m.value === option.value) as any; // Type assertion for simplicity here
            if (match) {
                setHomeTeam(match.homeTeam || '');
                setAwayTeam(match.awayTeam || '');
                setHomeLogo(match.homeLogo || '');
                setAwayLogo(match.awayLogo || '');
            }
        } else {
            // Reset team details if no match is selected
            setHomeTeam('');
            setAwayTeam('');
            setHomeLogo('');
            setAwayLogo('');
        }
    };

    // Function to create new match if it doesn't exist (similar to create category/tag)
    const handleCreateMatchOption = async (inputValue: string) => {
        // This would involve an API call to create a new match
        // Example:
        // const response = await fetch('/api/admin/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: inputValue }) });
        // const newMatchData = await response.json();
        // if (response.ok) {
        //     const newOption = { value: newMatchData._id.toString(), label: newMatchData.name };
        //     setAllMatches(p => [...p, newOption]);
        //     setSelectedMatch(newOption);
        //     // Set team details based on new match creation
        // } else { setFormError(`Error creating match: ${newMatchData.message}`); }
        alert("Match creation not implemented yet. Please add matches via the Matches CMS.");
        // For now, just simulate adding it to the dropdown if you want to test UI
        const newOption = { value: `temp-${Date.now()}`, label: inputValue, homeTeam: '', awayTeam: '' };
        setAllMatches(p => [...p, newOption]);
        setSelectedMatch(newOption);
    };

    const resetForm = () => {
        setEditingPredictionId(null);
        setSelectedMatch(null);
        setHomeTeam('');
        setAwayTeam('');
        setHomeLogo('');
        setAwayLogo('');
        setPredictionType('winner');
        setPredictedOutcome('home');
        setConfidence(50);
        setFormError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoadPredictionForEdit = (prediction: Prediction) => {
        setEditingPredictionId(prediction._id.toString());
        setSelectedMatch(allMatches.find(m => (m.value === (prediction.match as Match)?._id.toString() || m.value === prediction.match?.toString())) || null);
        setHomeTeam(prediction.homeTeam || '');
        setAwayTeam(prediction.awayTeam || '');
        setHomeLogo(prediction.homeLogo || '');
        setAwayLogo(prediction.awayLogo || '');
        setPredictionType(prediction.predictionType || 'winner');
        setPredictedOutcome(prediction.predictedOutcome || 'home');
        setConfidence(prediction.confidence || 50);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        if (!selectedMatch?.value) {
            setFormError("Please select a match.");
            setIsSubmitting(false);
            return;
        }

        // Basic validation
        if (!homeTeam || !awayTeam || !predictionType || !predictedOutcome) {
            setFormError("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }
        if (confidence < 0 || confidence > 100) {
            setFormError("Confidence must be between 0 and 100.");
            setIsSubmitting(false);
            return;
        }


        const body = {
            matchId: selectedMatch.value,
            homeTeam,
            awayTeam,
            homeLogo,
            awayLogo,
            predictionType,
            predictedOutcome,
            confidence: parseInt(confidence.toString(), 10),
        };

        const url = editingPredictionId ? `/api/admin/predictions/${editingPredictionId}` : '/api/admin/predictions';
        const method = editingPredictionId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                alert(`Prediction successfully ${editingPredictionId ? 'updated' : 'created'}!`);
                resetForm();
                await fetchInitialData(); // Refresh the list
            } else {
                const data = await response.json();
                setFormError(data.message || `An error occurred (${response.status}).`);
            }
        } catch (error) {
            setFormError('A network error occurred.');
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (predictionId: string) => {
        if (!window.confirm("Are you sure you want to delete this prediction?")) return;
        try {
            const response = await fetch(`/api/admin/predictions/${predictionId}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Prediction deleted.");
                if (editingPredictionId === predictionId) resetForm();
                await fetchInitialData();
            } else {
                const data = await response.json();
                setFormError(data.message || "Failed to delete prediction.");
            }
        } catch (e) {
            setFormError("Error deleting prediction.");
            console.error("Delete error:", e);
        }
    };

    const selectStyles = {
        control: (s:any) => ({...s, backgroundColor: '#4a5568', border: '1px solid #718096'}),
        multiValue: (s:any) => ({...s, backgroundColor: '#2d3748'}),
        multiValueLabel: (s:any) => ({...s, color: '#e2e8f0'}),
        multiValueRemove: (s:any) => ({...s, color: '#cbd5e0', ':hover': { backgroundColor: '#e53e3e', color: 'white'}}),
        option: (s:any, {isFocused}:any) => ({...s, backgroundColor: isFocused ? '#2d3748' : '#4a5568', color: '#e2e8f0'}),
        menu: (s:any) => ({...s, backgroundColor: '#4a5568'})
    };

    // --- Input for Confidence ---
    const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setConfidence(Math.max(0, Math.min(100, value))); // Clamp between 0 and 100
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{editingPredictionId ? 'Edit Prediction' : 'Create New Prediction'}</h1>
                    {editingPredictionId && (
                        <button onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
                            New Prediction
                        </button>
                    )}
                </div>
                {formError && (
                    <div className="mb-4 p-3 rounded bg-red-800 text-white">
                        <p className="font-bold">Error</p>
                        <p>{formError}</p>
                    </div>
                )}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                            <h2 className="text-xl font-semibold">Prediction Details</h2>

                            {/* Match Selection */}
                            <div>
                                <label className="block text-sm mb-1">Select Match</label>
                                <CreatableSelect
                                    instanceId="match-select"
                                    isClearable
                                    options={allMatches}
                                    value={selectedMatch}
                                    onChange={handleMatchSelect}
                                    onCreateOption={handleCreateMatchOption}
                                    placeholder="Search or create match..."
                                    styles={selectStyles}
                                    className="text-black"
                                />
                            </div>

                            {/* Team Logos and Names (can be auto-filled from match) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Home Team</label>
                                    <input
                                        type="text"
                                        value={homeTeam}
                                        onChange={(e) => setHomeTeam(e.target.value)}
                                        required
                                        className="w-full p-2 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Home Team Name"
                                    />
                                    {/* Uncomment if you have a logo uploader */}
                                    {/* <label className="block text-sm mb-1 mt-2">Home Logo URL</label>
                                    <input type="text" value={homeLogo} onChange={(e) => setHomeLogo(e.target.value)} className="w-full p-2 rounded bg-gray-700 border-gray-600" placeholder="Logo URL" /> */}
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Away Team</label>
                                    <input
                                        type="text"
                                        value={awayTeam}
                                        onChange={(e) => setAwayTeam(e.target.value)}
                                        required
                                        className="w-full p-2 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Away Team Name"
                                    />
                                    {/* Uncomment if you have a logo uploader */}
                                    {/* <label className="block text-sm mb-1 mt-2">Away Logo URL</label>
                                    <input type="text" value={awayLogo} onChange={(e) => setAwayLogo(e.target.value)} className="w-full p-2 rounded bg-gray-700 border-gray-600" placeholder="Logo URL" /> */}
                                </div>
                            </div>

                            {/* Prediction Type */}
                            <div>
                                <label className="block text-sm mb-1">Prediction Type</label>
                                <select
                                    value={predictionType}
                                    onChange={(e) => setPredictionType(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="winner">Winner</option>
                                    <option value="score">Exact Score</option>
                                    {/* Add other prediction types as needed */}
                                </select>
                            </div>

                            {/* Predicted Outcome */}
                            <div>
                                <label className="block text-sm mb-1">Predicted Outcome</label>
                                {/* Conditional rendering based on predictionType might be needed here */}
                                <select
                                    value={predictedOutcome}
                                    onChange={(e) => setPredictedOutcome(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="home">Home Win</option>
                                    <option value="draw">Draw</option>
                                    <option value="away">Away Win</option>
                                    {/* Add other outcomes if predictionType is different */}
                                </select>
                            </div>

                            {/* Confidence */}
                            <div>
                                <label className="block text-sm mb-1">Confidence (%)</label>
                                <input
                                    type="number"
                                    value={confidence}
                                    onChange={handleConfidenceChange}
                                    min="0"
                                    max="100"
                                    required
                                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0-100"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 rounded text-lg disabled:bg-gray-500"
                        >
                            {isSubmitting ? 'Saving...' : (editingPredictionId ? 'Update Prediction' : 'Create Prediction')}
                        </button>
                    </form>
                    {/* Placeholder for a Preview section if needed */}
                    {/* <div className="p-4 bg-gray-800 rounded-lg mt-8 lg:mt-0">
                        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
                        <div className="p-4 border border-gray-700 rounded-md min-h-[200px]">
                            <p className="text-gray-400 italic">Preview not available for predictions yet.</p>
                        </div>
                    </div> */}
                </div>
            </div>
            <PublishedPredictionsTable
                predictions={predictions}
                isLoading={isPredictionsLoading}
                onEdit={handleLoadPredictionForEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default CreatePredictionPage;