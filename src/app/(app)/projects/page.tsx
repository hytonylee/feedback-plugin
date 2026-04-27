import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { listUserProjects } from "@/lib/sheets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const projects = await listUserProjects(session.accessToken)

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your projects</h1>
            <p className="text-slate-400 text-sm mt-1">
              Copy any direct form/dashboard link below.
            </p>
          </div>
          <Link href="/setup">
            <Button className="bg-violet-600 hover:bg-violet-500">New project</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="py-10 text-slate-400 text-sm">
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
                <Card key={project.projectId} className="bg-slate-900 border-slate-800 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.projectName}</CardTitle>
                    <CardDescription className="text-slate-400">
                      projectId: <span className="font-mono">{project.projectId}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="text-slate-300">
                      Form:{" "}
                      <Link className="text-cyan-400 hover:text-cyan-300 break-all" href={formHref}>
                        {formHref}
                      </Link>
                    </div>
                    <div className="text-slate-300">
                      Dashboard:{" "}
                      <Link
                        className="text-violet-400 hover:text-violet-300 break-all"
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
