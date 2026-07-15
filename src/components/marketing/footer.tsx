export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            C
          </span>
          <span className="font-medium text-foreground">Castway</span>
        </div>
        <p>© {new Date().getFullYear()} Castway. Built for the creator economy.</p>
      </div>
    </footer>
  );
}
