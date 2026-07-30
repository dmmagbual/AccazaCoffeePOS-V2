import { EmptyState, Page } from '../../../shared/components'

export function DashboardPage() {
  return (
    <Page
      eyebrow="Overview"
      title="Business dashboard"
      description="Operational data will appear here when a production data source is connected."
    >
      <EmptyState
        title="No operational data available"
        description="Connect the approved data source to begin showing live sales, inventory, and activity information."
      />
    </Page>
  )
}
