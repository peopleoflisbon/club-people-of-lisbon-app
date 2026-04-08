/**
 * ScrollPage wraps page content so it scrolls within the AppShell content area.
 * The AppShell content div is now `flex-1 overflow-hidden flex flex-col`
 * so all page content needs this wrapper to scroll properly.
 * The map page does NOT use this wrapper.
 */
export default function ScrollPage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex-1 overflow-y-auto overscroll-contain ${className}`}>
      {children}
    </div>
  );
}
