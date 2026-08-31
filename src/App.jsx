import { useMemo, useState } from "react";
import { loadState, saveState, resetState } from "./storage";

const METRICS = [
  { key: "psm", label: "PSM" },
  { key: "pwp", label: "PWP" },
  { key: "sg", label: "SG" }
];

function pct(value, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

function App() {
  const [state, setState] = useState(loadState);
  const [showSettings, setShowSettings] = useState(false);

  const totalTarget = useMemo(
    () => state.target.psm + state.target.pwp + state.target.sg,
    [state.target]
  );

  const totalAchieved = useMemo(
    () => state.achieved.psm + state.achieved.pwp + state.achieved.sg,
    [state.achieved]
  );

  function updateTarget(key, value) {
    const next = {
      ...state,
      target: {
        ...state.target,
        [key]: Math.max(0, Number(value) || 0)
      }
    };

    setState(next);
    saveState(next);
  }

  function updateAchieved(key, value) {
    const next = {
      ...state,
      achieved: {
        ...state.achieved,
        [key]: Math.max(0, Number(value) || 0)
      }
    };

    setState(next);
    saveState(next);
  }

  function clearLocalData() {
    if (!confirm("Hapus semua data lokal Sales Tracker?")) return;

    const next = resetState();
    setState(next);
    setShowSettings(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">SALES TRACKER</div>
          <h1>Dashboard</h1>
        </div>

        <button
          className="icon-btn"
          onClick={() => setShowSettings(true)}
          aria-label="Pengaturan"
        >
          ⚙
        </button>
      </header>

      <main className="content">
        <section className="hero-card">
          <div>
            <span className="muted">Periode</span>
            <h2>{state.period.name}</h2>
          </div>

          <div className="hero-total">
            <span>Total progress</span>
            <strong>{pct(totalAchieved, totalTarget)}%</strong>
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <h2>Progress Target</h2>
            <span>
              {totalAchieved} / {totalTarget}
            </span>
          </div>

          <div className="metric-grid">
            {METRICS.map((metric) => {
              const achieved = state.achieved[metric.key];
              const target = state.target[metric.key];
              const progress = pct(achieved, target);

              return (
                <article className="metric-card" key={metric.key}>
                  <div className="metric-head">
                    <span>{metric.label}</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="metric-numbers">
                    <strong>{achieved}</strong>
                    <span>/ {target}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <h2>Input Pencapaian</h2>
            <span>tersimpan otomatis</span>
          </div>

          <div className="input-list">
            {METRICS.map((metric) => (
              <label className="input-row" key={metric.key}>
                <span>{metric.label}</span>

                <input
                  inputMode="numeric"
                  type="number"
                  min="0"
                  value={state.achieved[metric.key]}
                  onChange={(e) =>
                    updateAchieved(metric.key, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <h2>Target</h2>
            <span>versi lokal</span>
          </div>

          <div className="input-list">
            {METRICS.map((metric) => (
              <label className="input-row" key={metric.key}>
                <span>Target {metric.label}</span>

                <input
                  inputMode="numeric"
                  type="number"
                  min="0"
                  value={state.target[metric.key]}
                  onChange={(e) =>
                    updateTarget(metric.key, e.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <div className="local-note">
          <span>✓</span>

          <div>
            <strong>Mode Local Aktif</strong>

            <p>
              Data saat ini disimpan di perangkat/browser ini.
              Belum terhubung ke database online.
            </p>
          </div>
        </div>
      </main>

      {showSettings && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Pengaturan</h2>

              <button
                className="icon-btn"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>

            <p className="muted">
              Ini masih tahap local-first.
            </p>

            <button
              className="danger-btn"
              onClick={clearLocalData}
            >
              Reset semua data lokal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
