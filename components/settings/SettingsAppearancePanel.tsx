import { ACCENT_PALETTES, useTheme } from '../../hooks/useTheme';

export function SettingsAppearancePanel() {
  const { preferences, previewPreferences } = useTheme();
  return (
    <div className="settings-form-stack">
      <label className="settings-row">
        <span>
          <strong>Theme</strong>
          <small>Preview the workspace appearance.</small>
        </span>
        <select
          className="studio-field"
          aria-label="Theme"
          value={preferences.appearance}
          onChange={(event) =>
            previewPreferences({
              ...preferences,
              appearance: event.target.value === 'light' ? 'light' : 'dark',
            })
          }
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <fieldset className="settings-accent-picker">
        <legend>Accent color</legend>
        <div>
          {ACCENT_PALETTES.map((palette) => (
            <button
              key={palette.name}
              type="button"
              className="settings-accent-option"
              aria-label={`Accent: ${palette.name}`}
              aria-pressed={preferences.accent === palette.name}
              onClick={() => previewPreferences({ ...preferences, accent: palette.name })}
            >
              <span style={{ backgroundColor: `rgb(${palette.colors[500]})` }} aria-hidden="true" />
              {palette.name}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="settings-row">
        <span>
          <strong>Motion</strong>
          <small>Reduced motion disables decorative loops and movement.</small>
        </span>
        <select
          className="studio-field"
          aria-label="Motion preference"
          value={preferences.motion}
          onChange={(event) =>
            previewPreferences({
              ...preferences,
              motion: event.target.value === 'reduced' ? 'reduced' : 'system',
            })
          }
        >
          <option value="system">System</option>
          <option value="reduced">Reduced</option>
        </select>
      </label>
      <p className="studio-muted text-xs">
        Preview changes here. Save keeps them; Discard restores your saved appearance.
      </p>
    </div>
  );
}
