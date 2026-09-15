"use client"

import { moveLetter } from "@/lib/actions/letter-actions"

interface Props {
  letterId: string
  currentDeskId: string
  desks: Array<{ id: string; name: string }>
  userId: string
}

export default function MovementForm({ letterId, desks, userId }: Props) {
  return (
    <form action={moveLetter} className="space-y-4">
      <input type="hidden" name="letterId" value={letterId} />
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-sm font-medium">Dispatch / Outward No.</label>
        <input
          type="text"
          name="dispatchNo"
          placeholder="e.g. OUT-2026-88"
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Forward to Desk</label>
        <select name="toDeskId" className="w-full border p-2 rounded" required>
          <option value="">Select Target Desk</option>
          {desks.map((desk) => (
            <option key={desk.id} value={desk.id}>
              {desk.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Remarks</label>
        <textarea
          name="remarks"
          placeholder="Add comments or instructions..."
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Forward Letter
      </button>
    </form>
  )
}