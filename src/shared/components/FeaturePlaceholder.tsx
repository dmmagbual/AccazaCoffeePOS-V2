type Props = { title: string; description: string }
export function FeaturePlaceholder({ title, description }: Props) { return <section className="placeholder-page"><p className="eyebrow">Coming next</p><h1>{title}</h1><p>{description}</p></section> }
