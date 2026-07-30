import { EmptyState, Page } from '.'
type Props = { title: string; description: string }
export function FeaturePlaceholder({ title, description }: Props) { return <Page eyebrow="Module" title={title} description={description}><EmptyState title={`${title} is ready for implementation`} description="The module boundary, route, and shared platform services are in place." /></Page> }
