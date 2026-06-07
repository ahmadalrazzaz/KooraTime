import { SessionWizard } from '@/components/session/session-wizard'
import { PageHeader } from '@/components/layout/page-header'

export default function NewSessionPage() {
  return (
    <div className="min-h-screen pb-8">
      <PageHeader title="New Session" back />
      <div className="px-4">
        <SessionWizard />
      </div>
    </div>
  )
}
