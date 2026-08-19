export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-[var(--text-faint)] sm:flex-row">
        <div className="flex items-center">
          <img src="/brand/omni1os-logo.png" alt="Omni1OS" className="h-6 w-auto object-contain opacity-70" />
        </div>
        <span>© {new Date().getFullYear()} Omni1OS. All rights reserved.</span>
      </div>
    </footer>
  );
}
