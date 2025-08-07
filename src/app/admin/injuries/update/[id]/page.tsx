import InjuryModel from "@/models/Injury";
import { injuryStatuses } from "@/lib/types";
import { updateInjuryAction } from "../../actions";

export default async function UpdateInjuryPage({ params }: { params: { id: string } }) {
  const injury = await InjuryModel.findById(params.id).lean();

  if (!injury) {
    return <div>Injury not found.</div>;
  }

  return (
    <div className="bg-[#1A222D] min-h-screen p-4 sm:p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-[#2D3748] p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6">Update Injury: {injury.playerName}</h1>
        <form action={updateInjuryAction}>
          <input type="hidden" name="injuryId" value={injury._id.toString()} />
          <div className="space-y-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                id="status"
                name="status"
                required
                defaultValue={injury.status}
                className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3"
              >
                {injuryStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-300 mb-1">Latest News</label>
              <input
                type="text"
                id="details"
                name="details"
                required
                defaultValue={injury.details}
                className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3"
              />
            </div>
            <div>
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-300 mb-1">Return Date</label>
              <input
                type="text"
                id="returnDate"
                name="returnDate"
                defaultValue={injury.returnDate || ''}
                className="w-full bg-[#1A222D] text-white border border-gray-600 rounded-md p-3"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700"
              >
                Update Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}