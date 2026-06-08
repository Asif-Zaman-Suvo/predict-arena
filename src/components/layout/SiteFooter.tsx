export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
        <p className="text-xs text-text-muted">
          FIFA World Cup {year} Predictor
        </p>
      </div>
    </footer>
  )
}
