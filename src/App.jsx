import { useMemo, useState } from "react";
import { loadState, saveState, resetState } from "./storage";

const METRICS = [
  { key: "psm", label: "PSM" },
  { key: "pwp", label: "PWP" },
  { key: "sg", label: "SG" }
];

function pct(value, target) {
  if (!target || target <= 0) return 0;

  return Math.min(
    100,
    Math.round((Number(value || 0) / Number(target)) * 100)
  );
}

function App() {
  const [state, setState] = useState(loadState);
  const [showSettings, setShowSettings] = useState(false);

  const totalTarget = useMemo(() => {
    return (
      Number(state.target.psm || 0) +
      Number(state.target.pwp || 0) +
      Number(state.target.sg || 0)
    );
  }, [state.target]);

  const totalAchieved = useMemo(() => {
    return (
      Number(state.achieved.psm || 0) +
      Number(state.achieved.pwp || 0) +
      Number(state.achieved.sg || 0)
    );
  }, [state.achieved]);

  const totalProgress = pct(totalAchieved, totalTarget);

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

  function updatePeriod(field, value) {
    const next = {
      ...state,
      period: {
        ...state.period,
        [field]: value
      }
    };

    setState(next);
    saveState(next);
  }

  function updatePenawaran(group, index, field, value) {
    let updatedGroup;

    if (group === "apc") {
      updatedGroup = {
        ...state.penawaran.apc,
        [field]: Math.max(0, Number(value) || 0)
      };
    } else {
      updatedGroup = state.penawaran[group].map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          [field]: Math.max(0, Number(value) || 0)
        };
      });
    }

    const next = {
      ...state,
      penawaran: {
        ...state.penawaran,
        [group]: updatedGroup
      }
    };

    setState(next);
    saveState(next);
  }

  function clearLocalData() {
    const confirmed = window.confirm(
      "Hapus semua data lokal Sales Tracker?"
    );

    if (!confirmed) return;

    const next = resetState();

    setState(next);
    setShowSettings(false);
  }

  function PenawaranItem({ item, group, index }) {
    const progress = pct(item.achieved, item.target);

    return (
      <div className="offer-item">
        <div className="section-title">
          <span>{item.label}</span>
          <strong>{progress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="metric-numbers">
          <strong>{item.achieved}</strong>
          <span>/ {item.target}</span>
        </div>

        <details className="edit-details">
          <summary>Edit {item.label}</summary>

          <div className="edit-box">
            <label className="input-row">
              <span>Pencapaian</span>

              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={item.achieved}
                onChange={(e) =>
                  updatePenawaran(
                    group,
                    index,
                    "achieved",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="input-row">
              <span>Target</span>

              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={item.target}
                onChange={(e) =>
                  updatePenawaran(
                    group,
                    index,
                    "target",
                    e.target.value
                  )
                }
              />
            </label>
          </div>
        </details>
      </div>
    );
  }

  function PenawaranGroup({ title, group }) {
    const items =
      group === "apc"
        ? [
            {
              ...state.penawaran.apc,
              label: "APC"
            }
          ]
        : state.penawaran[group];

    return (
      <article className="metric-card offer-card">
        <div className="metric-head">
          <span>{title}</span>
        </div>

        <div className="input-list">
          {items.map((item, index) => (
            <PenawaranItem
              key={item.label}
              item={item}
              group={group}
              index={index}
            />
          ))}
        </div>
      </article>
    );
  }

  return (
    <div className="app-shell">

      {/* HEADER */}
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

        {/* HERO */}
        <section className="hero-card">
          <div>
            <span className="muted">Periode</span>
            <h2>{state.period.name}</h2>
          </div>

          <div className="hero-total">
            <span>Total progress</span>
            <strong>{totalProgress}%</strong>
          </div>
        </section>

        {/* PROGRESS TARGET */}
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
                <article
                  className="metric-card"
                  key={metric.key}
                >
                  <div className="metric-head">
                    <span>{metric.label}</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`
                      }}
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

        {/* INPUT PENCAPAIAN */}
        <section className="section">
          <div className="section-title">
            <h2>Input Pencapaian</h2>
            <span>tersimpan otomatis</span>
          </div>

          <div className="input-list">

            {METRICS.map((metric) => (
              <label
                className="input-row"
                key={metric.key}
              >
                <span>{metric.label}</span>

                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={state.achieved[metric.key]}
                  onChange={(e) =>
                    updateAchieved(
                      metric.key,
                      e.target.value
                    )
                  }
                />
              </label>
            ))}

          </div>
        </section>

        {/* TARGET */}
        <section className="section">
          <div className="section-title">
            <h2>Target</h2>
            <span>versi lokal</span>
          </div>

          <div className="input-list">

            {METRICS.map((metric) => (
              <label
                className="input-row"
                key={metric.key}
              >
                <span>Target {metric.label}</span>

                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={state.target[metric.key]}
                  onChange={(e) =>
                    updateTarget(
                      metric.key,
                      e.target.value
                    )
                  }
                />
              </label>
            ))}

          </div>
        </section>

        {/* HASIL PENAWARAN */}
        <section className="section">

          <div className="section-title">
            <h2>Hasil Penawaran Langsung</h2>
            <span>tersimpan otomatis</span>
          </div>

          <div className="offer-grid">

            <PenawaranGroup
              title="APC"
              group="apc"
            />

            <PenawaranGroup
              title="PWP"
              group="pwp"
            />

            <PenawaranGroup
              title="PSM"
              group="psm"
            />

            <PenawaranGroup
              title="SG"
              group="sg"
            />

          </div>

        </section>

        {/* LOCAL STATUS */}
        <div className="local-note">
          <div className="local-icon">✓</div>

          <div>
            <strong>Mode Local Aktif</strong>

            <p>
              Data saat ini disimpan di perangkat/browser ini.
              Belum terhubung ke database online.
            </p>
          </div>
        </div>

      </main>

      {/* SETTINGS MODAL */}
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
              <div>
                <div className="eyebrow">
                  SALES TRACKER
                </div>

                <h2>Pengaturan</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowSettings(false)}
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {/* PERIODE */}
            <div className="settings-section">

              <div className="settings-title">
                Periode
              </div>

              <label className="input-row">
                <span>Nama periode</span>

                <input
                  type="text"
                  value={state.period.name}
                  onChange={(e) =>
                    updatePeriod(
                      "name",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="input-row">
                <span>Tanggal mulai</span>

                <input
                  type="date"
                  value={state.period.startDate}
                  onChange={(e) =>
                    updatePeriod(
                      "startDate",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="input-row">
                <span>Tanggal selesai</span>

                <input
                  type="date"
                  value={state.period.endDate}
                  onChange={(e) =>
                    updatePeriod(
                      "endDate",
                      e.target.value
                    )
                  }
                />
              </label>

            </div>

            {/* RESET */}
            <div className="settings-section danger-section">

              <div className="settings-title">
                Data Lokal
              </div>

              <p className="muted">
                Semua data saat ini tersimpan di
                browser/perangkat ini.
              </p>

              <button
                className="danger-btn"
                onClick={clearLocalData}
              >
                Reset semua data lokal
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
