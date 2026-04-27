import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { listUserProjects } from "@/lib/sheets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/")

  const projects = await listUserProjects(session.accessToken)

  return (
    <main className="min-h-screen bg-[#2B1F0E] text-[#D9CCB4] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#D9CCB4]">Your projects</h1>
            <p className="text-[#A5A6A4] text-sm mt-1">
              Copy any direct form/dashboard link below.
            </p>
          </div>
          <Link href="/setup">
            <Button className="bg-[#733906] hover:bg-[#8A4508] text-[#D9CCB4]">New project</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
            <CardContent className="py-10 text-[#A5A6A4] text-sm">
              No projects yet. Create your first project in setup.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const sid = project.spreadsheetId
              const dashboardHref = `/dashboard/${project.projectId}?sid=${sid}`
              const formHref = `/form/${project.projectId}?sid=${sid}`

              return (
                <Card key={project.projectId} className="bg-[#40331C] border-[#5C4520] text-[#D9CCB4]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[#D9CCB4]">{project.projectName}</CardTitle>
                    <CardDescription className="text-[#A5A6A4]">
                      projectId: <span className="font-mono">{project.projectId}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="text-[#C4B898]">
                      Form:{" "}
                      <Link className="text-[#D9A76A] hover:text-[#E5BF8E] break-all" href={formHref}>
                        {formHref}
                      </Link>
                    </div>
                    <div className="text-[#C4B898]">
                      Dashboard:{" "}
                      <Link
                        className="text-[#D9A76A] hover:text-[#E5BF8E] break-all"
                        href={dashboardHref}
                      >
                        {dashboardHref}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
