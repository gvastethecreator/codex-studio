import { useDialogFocus } from '../hooks/useDialogFocus';

const SUPPORT_LINKS = [
  {
    href: 'https://github.com/sponsors/gvastethecreator/',
    label: 'Support on GitHub',
    tone: 'primary',
  },
  {
    href: 'https://ko-fi.com/gvaste',
    label: 'Buy me a coffee',
    tone: 'quiet',
  },
] as const;

export function SupportProjectPage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useDialogFocus(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 studio-scrim"
        aria-label="Close support page"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-project-title"
        tabIndex={-1}
        className="studio-dialog relative z-10 w-full max-w-lg rounded-[var(--wb-radius)] border border-[color:var(--wb-line)] bg-[color:var(--wb-panel)] p-6"
      >
        <h2 id="support-project-title" className="text-xl font-semibold text-[color:var(--wb-ink)]">
          Help keep Cozy Studio moving.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--wb-muted)]">
          Cozy Studio is an independent, open-source project. Your support helps make time for
          development, bug fixes, integration testing, and documentation.
        </p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--wb-muted)]">
          Contributions are optional. You do not need to donate to use the app, and supporting Cozy
          does not buy image-generation credits.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {SUPPORT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.tone === 'primary' ? 'studio-primary-control' : 'studio-ghost-control'} inline-flex h-10 items-center justify-center rounded-[var(--wb-radius)] px-4 text-sm font-semibold`}
            >
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[color:var(--wb-muted)]">
          You can also help by{' '}
          <a
            href="https://github.com/gvastethecreator/codex-studio/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            reporting a clear bug
          </a>
          , improving documentation, or sharing what you make.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="studio-ghost-control mt-5 inline-flex h-10 items-center rounded-[var(--wb-radius)] px-4 text-sm font-semibold"
        >
          Back
        </button>
      </div>
    </div>
  );
}
