import React, { useEffect, useState } from 'react';
import {
  REVIEW_SCENARIOS,
  applyScenarioChrome,
  scenarioFromLocation,
  scenarioHref,
} from './scenarios';
import './review-chrome.css';

export const ReviewChrome: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [scenario, setScenario] = useState(() => scenarioFromLocation());

  useEffect(() => {
    void applyScenarioChrome(scenarioFromLocation());
  }, []);

  return (
    <div
      className="handoff-chrome"
      data-handoff-chrome="true"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="handoff-chrome-panel" hidden={collapsed}>
        <p>
          Review chrome. Jobs, catalog, providers, and generated results are simulated. Images are
          fixtures, not proof of generation quality. Hide this panel before judging layout.
        </p>
        <div className="handoff-chrome-row">
          <select
            aria-label="Review scenario"
            value={scenario.id}
            onChange={(event) => {
              const next = REVIEW_SCENARIOS.find((item) => item.id === event.target.value);
              if (!next) return;
              setScenario(next);
              window.location.assign(`${window.location.pathname}${scenarioHref(next)}`);
            }}
          >
            {REVIEW_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <button
        type="button"
        className="handoff-chrome-toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
      >
        {collapsed ? 'Review' : 'Hide review'}
      </button>
    </div>
  );
};
