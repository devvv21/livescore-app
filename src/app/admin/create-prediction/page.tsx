// src/app/admin/create-prediction/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';

// --- Placeholder Types (Ensure these match your actual models) ---
interface SelectOption { value: string; label: string; }

interface Match {
    _id: string;
    name: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    date?: string; // ISO string
}

interface Prediction {
    _id: string;
    match: Match | null; // Populate match details
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    predictionType: string;
    predictedOutcome: string;
    confidence: number;
    createdAt: string;
    updatedAt: string;
}
// --- End Placeholder Types ---

const LoadingSpinner = () => <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>;

// Table Component for Displaying Published Predictions
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
                            <tr key={prediction._id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                    {prediction.match?.name || `${prediction.homeTeam} vs ${prediction.awayTeam}`}
                                </th>
                                <td className="px-6 py-4">{prediction.predictionType}</td>
                                <td className="px-6 py-4">{prediction.predictedOutcome} ({prediction.confidence}%)</td>
                                <td className="px-6 py-4 text-right space-x-4">
                                    <button onClick={() => onEdit(prediction)} className="font-medium text-blue-500 hover:underline" disabled={isLoading}>Edit</button>
                                    <button onClick={() => onDelete(prediction._id)} className="font-medium text-red-500 hover:underline" disabled={isLoading}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// Main Component for Creating/Editing Predictions
const CreatePredictionPage = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isPredictionsLoading, setIsPredictionsLoading] = useState(true);
    const [editingPredictionId, setEditingPredictionId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // --- Form State ---
    const [allMatches, setAllMatches] = useState<SelectOption[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<SelectOption | null>(null);
    const [homeTeam, setHomeTeam] = useState('');
    const [awayTeam, setAwayTeam] = useState('');
    const [homeLogo, setHomeLogo] = useState('');
    const [awayLogo, setAwayLogo] = useState('');
    const [predictionType, setPredictionType] = useState('winner');
    const [predictedOutcome, setPredictedOutcome] = useState('home');
    const [confidence, setConfidence] = useState(50);
    // --- End Form State ---

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch initial data (predictions and available matches)
    const fetchInitialData = useCallback(async () => {
        setIsPredictionsLoading(true);
        try {
            const [predictionsRes, matchesRes] = await Promise.all([
                fetch('/api/admin/predictions'),
                fetch('/api/admin/matches') // Fetch matches for the dropdown
            ]);

            if (predictionsRes.ok) {
                const data = await predictionsRes.json();
                setPredictions(data);
            } else { setFormError("Failed to load predictions."); }

            if (matchesRes.ok) {
                const matchesData = await matchesRes.json();
                setAllMatches(matchesData);
            } else { setFormError("Failed to load matches for predictions."); }

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

    // Handle selecting a match from the dropdown
    const handleMatchSelect = (option: SelectOption | null) => {
        setSelectedMatch(option);
        if (option) {
            // Assuming the option object contains match details from the API response
            const matchDetails = option as any; // Type assertion for simplicity
            setHomeTeam(matchDetails.homeTeam || '');
            setAwayTeam(matchDetails.awayTeam || '');
            setHomeLogo(matchDetails.homeLogo || '');
            setAwayLogo(matchDetails.awayLogo || '');
        } else {
            // Reset if no match is selected
            setHomeTeam(''); setAwayTeam(''); setHomeLogo(''); setAwayLogo('');
        }
    };

    // Handle creating a new match if it doesn't exist
    const handleCreateMatchOption = async (inputValue: string) => {
        // This should ideally call your API to create a new match
        // For now, we'll simulate adding it and inform the user.
        alert("Match creation not implemented in this example. Please add matches via the Matches CMS.");
        // Simulate adding it to the dropdown if you want to test the UI flow
        const newOption = { value: `temp-${Date.now()}`, label: inputValue, homeTeam: '', awayTeam: '' };
        setAllMatches(p => [...p, newOption]);
        setSelectedMatch(newOption);
    };

    // Reset form fields to default/empty state
    const resetForm = () => {
        setEditingPredictionId(null);
        setSelectedMatch(null);
        setHomeTeam(''); setAwayTeam(''); setHomeLogo(''); setAwayLogo('');
        setPredictionType('winner'); setPredictedOutcome('home'); setConfidence(50);
        setFormError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load prediction data into the form for editing
    const handleLoadPredictionForEdit = (prediction: Prediction) => {
        setEditingPredictionId(prediction._id);
        setSelectedMatch(allMatches.find(m => m.value === prediction.match?._id.toString()) || null);
        setHomeTeam(prediction.homeTeam || '');
        setAwayTeam(prediction.awayTeam || '');
        setHomeLogo(prediction.homeLogo || '');
        setAwayLogo(prediction.awayLogo || '');
        setPredictionType(prediction.predictionType || 'winner');
        setPredictedOutcome(prediction.predictedOutcome || 'home');
        setConfidence(prediction.confidence || 50);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle form submission (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        if (!selectedMatch?.value) {
            setFormError("Please select a match.");
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

    // Handle deleting a prediction
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

    // Styles for CreatableSelect inputs
    const selectStyles = {
        control: (s:any) => ({...s, backgroundColor: '#4a5568', border: '1px solid #718096'}),
        multiValue: (s:any) => ({...s, backgroundColor: '#2d3748'}),
        multiValueLabel: (s:any) => ({...s, color: '#e2e8f0'}),
        multiValueRemove: (s:any) => ({...s, color: '#cbd5e0', ':hover': { backgroundColor: '#e53e3e', color: 'white'}}),
        option: (s:any, {isFocused}:any) => ({...s, backgroundColor: isFocused ? '#2d3748' : '#4a5568', color: '#e2e8f0'}),
        menu: (s:any) => ({...s, backgroundColor: '#4a5568'})
    };

    // Handle input change for confidence level
    const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setConfidence(Math.max(0, Math.min(100, value)));
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Home Team</label>
                                    <input type="text" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} required className="w-full p-2 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="Home Team Name" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Away Team</label>
                                    <input type="text" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} required className="w-full p-2 rounded bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="Away Team Name" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Prediction Type</label>
                                <select value={predictionType} onChange={(e) => setPredictionType(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="winner">Winner</option>
                                    <option value="score">Exact Score</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Predicted Outcome</label>
                                <select value={predictedOutcome} onChange={(e) => setPredictedOutcome(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="home">Home Win</option>
                                    <option value="draw">Draw</option>
                                    <option value="away">Away Win</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Confidence (%)</label>
                                <input type="number" value={confidence} onChange={handleConfidenceChange} min="0" max="100" required className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="0-100" />
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 rounded text-lg disabled:bg-gray-500">
                            {isSubmitting ? 'Saving...' : (editingPredictionId ? 'Update Prediction' : 'Create Prediction')}
                        </button>
                    </form>
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