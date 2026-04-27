import { google } from "googleapis"
import type { Project, FeedbackRow } from "@/types"

function getSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.sheets({ version: "v4", auth })
}

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: "v3", auth })
}

function isQuotaError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const err = error as { code?: number; status?: number; message?: string }
  return (
    err.code === 429 ||
    err.status === 429 ||
    (typeof err.message === "string" && err.message.toLowerCase().includes("quota exceeded"))
  )
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0
  let delayMs = 300

  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (!isQuotaError(error) || attempt >= retries) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      delayMs *= 2
      attempt += 1
    }
  }
}

export async function createProjectSheet(
  accessToken: string,
  project: Omit<Project, "spreadsheetId" | "createdAt">
): Promise<string> {
  const drive = getDriveClient(accessToken)
  const sheets = getSheetsClient(accessToken)

  const file = await drive.files.create({
    requestBody: {
      name: `Feedback: ${project.projectName}`,
      mimeType: "application/vnd.google-apps.spreadsheet",
    },
  })

  const spreadsheetId = file.data.id!

  // Set up tabs and headers
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { addSheet: { properties: { title: "config", index: 0 } } },
        { addSheet: { properties: { title: "responses", index: 1 } } },
      ],
    },
  })

  // Delete the default Sheet1
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const defaultSheet = meta.data.sheets?.find((s) => s.properties?.title === "Sheet1")
  if (defaultSheet?.properties?.sheetId != null) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ deleteSheet: { sheetId: defaultSheet.properties.sheetId } }],
      },
    })
  }

  const createdAt = new Date().toISOString()

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        {
          range: "config!A1:G2",
          values: [
            [
              "projectId",
              "projectName",
              "categories",
              "tags",
              "createdAt",
              "requirements",
              "description",
            ],
            [
              project.projectId,
              project.projectName,
              JSON.stringify(project.categories),
              JSON.stringify(project.tags),
              createdAt,
              JSON.stringify(project.requirements),
              project.description ?? "",
            ],
          ],
        },
        {
          range: "responses!A1:E1",
          values: [["timestamp", "category", "tags", "comment", "sessionId"]],
        },
      ],
    },
  })

  return spreadsheetId
}

/** Updates config row B–D, F–G; preserves projectId (A) and createdAt (E). Optionally renames the Drive file. */
export async function updateProjectConfig(
  accessToken: string,
  spreadsheetId: string,
  updates: Pick<Project, "projectName" | "categories" | "tags" | "requirements" | "description">
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  const drive = getDriveClient(accessToken)

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        {
          range: "config!B2:D2",
          values: [
            [
              updates.projectName,
              JSON.stringify(updates.categories),
              JSON.stringify(updates.tags),
            ],
          ],
        },
        {
          range: "config!F2:G2",
          values: [[JSON.stringify(updates.requirements), updates.description ?? ""]],
        },
      ],
    },
  })

  await withRetry(() =>
    drive.files.update({
      fileId: spreadsheetId,
      requestBody: { name: `Feedback: ${updates.projectName}` },
    })
  )
}

export async function getProjectConfig(
  accessToken: string,
  spreadsheetId: string
): Promise<Project> {
  const sheets = getSheetsClient(accessToken)
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "config!A2:G2",
    })
  )
  const [row] = res.data.values ?? []
  const requirements = row?.[5]
    ? JSON.parse(row[5])
    : { tagsRequired: false, commentRequired: false }
  return {
    projectId: row[0],
    projectName: row[1],
    categories: JSON.parse(row[2]),
    tags: JSON.parse(row[3]),
    requirements,
    spreadsheetId,
    createdAt: row[4],
    description: typeof row?.[6] === "string" ? row[6] : "",
  }
}

export async function appendFeedbackBatch(
  accessToken: string,
  spreadsheetId: string,
  rows: FeedbackRow[]
) {
  if (rows.length === 0) return
  const sheets = getSheetsClient(accessToken)
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "responses!A:E",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows.map((row) => [
        row.timestamp,
        row.category,
        row.tags.join(","),
        row.comment,
        row.sessionId,
      ]),
    },
  })
}

export async function appendFeedback(
  accessToken: string,
  spreadsheetId: string,
  row: FeedbackRow
) {
  await appendFeedbackBatch(accessToken, spreadsheetId, [row])
}

export async function getAllFeedback(
  accessToken: string,
  spreadsheetId: string
): Promise<FeedbackRow[]> {
  const sheets = getSheetsClient(accessToken)
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "responses!A2:E",
    })
  )
  return (res.data.values ?? []).map((row) => ({
    timestamp: row[0],
    category: row[1],
    tags: row[2] ? row[2].split(",") : [],
    comment: row[3] ?? "",
    sessionId: row[4] ?? "",
  }))
}

export async function listUserProjects(
  accessToken: string
): Promise<
    Array<
      Pick<Project, "projectId" | "projectName" | "description" | "spreadsheetId" | "createdAt">
    >
  > {
  const drive = getDriveClient(accessToken)
  const filesRes = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and name contains 'Feedback:'",
    fields: "files(id,name,createdTime)",
    pageSize: 100,
  })

  const files = filesRes.data.files ?? []
  const projects: Array<
    Pick<Project, "projectId" | "projectName" | "description" | "spreadsheetId" | "createdAt">
  > = []

  for (const file of files) {
    if (!file.id) continue

    try {
      const project = await getProjectConfig(accessToken, file.id)
      projects.push({
        projectId: project.projectId,
        projectName: project.projectName,
        description: project.description ?? "",
        spreadsheetId: project.spreadsheetId,
        createdAt: project.createdAt ?? file.createdTime ?? new Date().toISOString(),
      })
    } catch {
      // Ignore non-app spreadsheets or malformed config tabs.
    }
  }

  return projects.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/** Moves the spreadsheet to the user's Google Drive trash (removes form + dashboard for this project). */
export async function trashProjectSpreadsheet(accessToken: string, spreadsheetId: string) {
  const drive = getDriveClient(accessToken)
  await withRetry(() =>
    drive.files.update({
      fileId: spreadsheetId,
      requestBody: { trashed: true },
    })
  )
}
