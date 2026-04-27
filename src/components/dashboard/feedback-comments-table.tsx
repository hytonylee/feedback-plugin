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
      <h2 className="text-sm font-medium text-[#2B1F0E]/70 uppercase tracking-wider">
        All comments
      </h2>
      <div className="rounded-xl border border-[#FF8B5A] bg-[#FFA95A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FF8B5A] bg-[#FFD45A]/60 text-left">
                <th scope="col" className="px-4 py-3 font-medium text-[#2B1F0E]/70 whitespace-nowrap">
                  Submitted
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-[#2B1F0E]/70 whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-[#2B1F0E]/70 min-w-[140px]">
                  Tags
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-[#2B1F0E]/70 min-w-[240px]">
                  Comment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF8B5A]">
              {sorted.map((row, i) => (
                <tr key={`${row.sessionId}-${row.timestamp}-${i}`} className="align-top">
                  <td className="px-4 py-3 text-[#2B1F0E]/80 whitespace-nowrap tabular-nums">
                    {formatSubmittedAt(row.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-[#2B1F0E] font-medium">{row.category}</td>
                  <td className="px-4 py-3">
                    {row.tags.length === 0 ? (
                      <span className="text-[#2B1F0E]/50">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {row.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-[#FF8B5A] text-[#2B1F0E]/70 text-xs font-normal"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#2B1F0E]/80 whitespace-pre-wrap wrap-break-word max-w-xl">
                    {row.comment.trim() === "" ? (
                      <span className="text-[#2B1F0E]/50 italic">No comment</span>
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
