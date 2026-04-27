import { Badge } from "@/components/ui/badge"
import type { FeedbackRow } from "@/types"

function formatSubmittedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function FeedbackCommentsTable({ rows }: { rows: FeedbackRow[] }) {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
        All comments
      </h2>
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-left">
                <th scope="col" className="px-4 py-3 font-medium text-slate-400 whitespace-nowrap">
                  Submitted
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-slate-400 whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-slate-400 min-w-[140px]">
                  Tags
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-slate-400 min-w-[240px]">
                  Comment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sorted.map((row, i) => (
                <tr key={`${row.sessionId}-${row.timestamp}-${i}`} className="align-top">
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap tabular-nums">
                    {formatSubmittedAt(row.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{row.category}</td>
                  <td className="px-4 py-3">
                    {row.tags.length === 0 ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {row.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-slate-700 text-slate-400 text-xs font-normal"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-pre-wrap break-words max-w-xl">
                    {row.comment.trim() === "" ? (
                      <span className="text-slate-600 italic">No comment</span>
                    ) : (
                      row.comment
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
