import { IssuesPage } from '../issues/issues-page'

export default function Issues() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My Issues</h1>
      <IssuesPage />
    </div>
  )
}
