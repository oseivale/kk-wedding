import { Logo } from "./Logo";

/**
 * Full-screen loading state: the K&K monogram with a slowly turning gold ring.
 * `delayed` waits a moment before appearing, so fast page loads never flash it.
 */
export function PageLoader({ delayed = false, label = "Loading" }: { delayed?: boolean; label?: string }) {
  return (
    <div className={`page-loader${delayed ? " page-loader--delayed" : ""}`} role="status" aria-live="polite">
      <div className="page-loader__mark">
        <svg className="page-loader__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="page-loader__track" cx="50" cy="50" r="46" />
          <circle className="page-loader__arc" cx="50" cy="50" r="46" pathLength="100" />
        </svg>
        <Logo />
      </div>
      <span className="visually-hidden">{label}…</span>
    </div>
  );
}
