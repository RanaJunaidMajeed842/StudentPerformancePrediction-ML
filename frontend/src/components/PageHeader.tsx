interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
    </header>
  )
}
