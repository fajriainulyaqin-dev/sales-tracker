import { useMemo, useState } from "react";
import { loadState, saveState, resetState } from "./storage";

const COLORS = {
  bg: "#080d19",
  panel: "#101829",
  panel2: "#141e32",
  border: "#26334b",
  text: "#f4f7fb",
  muted: "#8491a8",
  green: "#55e56f",
  blue: "#5ca7ff",
  purple: "#9b70ff",
  orange: "#ff9a45",
  yellow: "#e5c84b",
  red: "#ff5f6d",
};

const defaultState = {
  period: {
    name: "Periode Aktif",
    startDate: "",
    endDate: "",
  },
  target: {
    apc: 0,
    pwp: 0,
    psm: 0,
    sg: 0,
  },
  achieved: {
    apc: 0,
    pwp: 0,
    psm: 0,
    sg: 0,
  },
  penawaran: {
    apc: {
      target: 48700,
      achieved: 55062,
    },
    pwp: [
      {
        label: "PWP 1 (Tgl 1 - 15)",
        target: 263,
        achieved: 288,
      },
      {
        label: "PWP 2 (Tgl 16 - Akhir)",
        target: 205,
        achieved: 205,
      },
    ],
    psm: [
      {
        label: "PSM 1 (Tgl 1 - 7)",
        target: 444,
        achieved: 362,
      },
      {
        label: "PSM 2 (Tgl 8 - 15)",
        target: 540,
        achieved: 626,
      },
      {
        label: "PSM 3 (Tgl 16 - 22)",
        target: 614,
        achieved: 635,
      },
      {
        label: "PSM 4 (Tgl 23 - Akhir)",
        target: 498,
        achieved: 296,
      },
    ],
    sg: [
      {
        label: "Serba Gratis 1 (Tgl 1 - 15)",
        target: 230,
        achieved: 192,
      },
      {
        label: "Serba Gratis 2 (Tgl 16 - Akhir)",
        target: 247,
        achieved: 154,
      },
    ],
  },
};

function pct(value, target) {
  if (!target || target <= 0) return 0;

  return Math.min(
    100,
    Math.round((Number(value || 0) / Number(target)) * 1000) / 10
  );
}

function pctRaw(value, target) {
  if (!target || target <= 0) return 0;

  return (
    Math.round((Number(value || 0) / Number(target)) * 1000) / 10
  );
}

function fmt(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function statusColor(value) {
  if (value >= 100) return COLORS.green;
  if (value >= 90) return COLORS.yellow;
  return COLORS.red;
}

function Icon({ children, color = COLORS.text }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

function MiniKpi({
  icon,
  title,
  weight,
  achievement,
  contribution,
  color,
}) {
  return (
    <div
      style={{
        background: "rgba(13,20,35,.95)",
        border: `1px solid ${color}35`,
        borderRadius: 12,
        padding: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon color={color}>{icon}</Icon>
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 9,
              color,
              marginTop: 2,
              fontWeight: 700,
            }}
          >
            ({weight}%)
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <div>
          <div style={{ color: COLORS.muted, fontSize: 9 }}>
            Pencapaian
          </div>

          <div
            style={{
              color: statusColor(achievement),
              fontSize: 14,
              fontWeight: 800,
              marginTop: 3,
            }}
          >
            {achievement.toFixed(2)}%
          </div>
        </div>

        <div>
          <div style={{ color: COLORS.muted, fontSize: 9 }}>
            Kontribusi
          </div>

          <div
            style={{
              color,
              fontSize: 14,
              fontWeight: 800,
              marginTop: 3,
            }}
          >
            {contribution.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  weight,
  badge,
  icon,
  color,
  children,
  note,
}) {
  return (
    <section
      style={{
        background: COLORS.panel,
        border: `1px solid ${color}40`,
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `${color}18`,
              border: `1px solid ${color}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon color={color}>{icon}</Icon>
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: COLORS.text,
              }}
            >
              {number}. {title} ({weight}%)
            </div>

            {badge && (
              <div
                style={{
                  display: "inline-block",
                  marginTop: 5,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: `${color}20`,
                  color,
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                {badge}
              </div>
            )}
          </div>
        </div>
      </div>

      {children}

      {note && (
        <div
          style={{
            marginTop: 12,
            color: COLORS.muted,
            fontSize: 9,
            display: "flex",
            alignItems: "center",
            gap: 5,
            transform: "translateX(-8px)",
          }}
        >
          <span>ⓘ</span>
          <span>{note}</span>
        </div>
      )}
    </section>
  );
}

function ColumnHeader({ color }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(100px,1fr) 68px 68px 68px 76px",
        gap: 6,
        color: COLORS.muted,
        fontSize: 8,
        fontWeight: 700,
        padding: "0 4px 7px",
        minWidth: 455,
      }}
    >
      <div></div>

      <div style={{ textAlign: "center" }}>
        Target
        <br />
        <span style={{ fontSize: 7 }}>(Input)</span>
      </div>

      <div style={{ textAlign: "center" }}>
        Pencapaian
        <br />
        <span style={{ fontSize: 7 }}>(Otomatis)</span>
      </div>

      <div style={{ textAlign: "center" }}>% Pencapaian</div>

      <div
        style={{
          textAlign: "center",
          color,
        }}
      >
        Kontribusi
      </div>
    </div>
  );
}

function PeriodRows({
  rows,
  color,
  weight,
  onTargetChange,
  showInputs = true,
}) {
  const totalTarget = rows.reduce(
    (sum, item) => sum + Number(item.target || 0),
    0
  );

  const totalAchieved = rows.reduce(
    (sum, item) => sum + Number(item.achieved || 0),
    0
  );

  const totalPct = pctRaw(totalAchieved, totalTarget);
  const totalContribution = (totalPct * weight) / 100;

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <ColumnHeader color={color} />

      <div style={{ minWidth: 455 }}>
        {rows.map((item, index) => {
          const achievement = pctRaw(item.achieved, item.target);
          const contribution = (achievement * weight) / 100;

          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(100px,1fr) 68px 68px 68px 76px",
                gap: 6,
                alignItems: "center",
                minHeight: 43,
                padding: "5px 4px",
                borderTop:
                  index === 0
                    ? "none"
                    : `1px dotted ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 650,
                  color: COLORS.text,
                }}
              >
                {item.label}
              </div>

              <div>
                {showInputs ? (
                  <input
                    type="number"
                    value={item.target}
                    onChange={(e) =>
                      onTargetChange(index, e.target.value)
                    }
                    style={{
                      width: "100%",
                      height: 29,
                      boxSizing: "border-box",
                      borderRadius: 6,
                      border: `1px solid ${COLORS.border}`,
                      background: "#0b1221",
                      color: COLORS.text,
                      textAlign: "center",
                      fontSize: 11,
                      outline: "none",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", fontSize: 10 }}>
                    {fmt(item.target)}
                  </div>
                )}
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {fmt(item.achieved)}
              </div>

              <div
                style={{
                  textAlign: "center",
                  color: statusColor(achievement),
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {achievement.toFixed(3)}%
              </div>

              <div
                style={{
                  textAlign: "center",
                  color,
                  fontSize: 10,
                  fontWeight: 800,
                  transform: "translateX(-8px)",
                }}
              >
                {contribution.toFixed(2)}%
              </div>
            </div>
          );
        })}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(100px,1fr) 68px 68px 68px 76px",
            gap: 6,
            alignItems: "center",
            borderTop: `1px dotted ${COLORS.border}`,
            padding: "10px 4px 3px",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: COLORS.text,
            }}
          >
            TOTAL
          </div>

          <div style={{ textAlign: "center", fontSize: 10 }}>
            {fmt(totalTarget)}
          </div>

          <div style={{ textAlign: "center", fontSize: 10 }}>
            {fmt(totalAchieved)}
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              color: statusColor(totalPct),
            }}
          >
            {totalPct.toFixed(3)}%
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              color,
            }}
          >
            {totalContribution.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = loadState();
      return saved || defaultState;
    } catch {
      return defaultState;
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const safeState = {
    ...defaultState,
    ...state,
    period: {
      ...defaultState.period,
      ...(state?.period || {}),
    },
    target: {
      ...defaultState.target,
      ...(state?.target || {}),
    },
    achieved: {
      ...defaultState.achieved,
      ...(state?.achieved || {}),
    },
    penawaran: {
      ...defaultState.penawaran,
      ...(state?.penawaran || {}),
    },
  };

  const apcTarget = Number(safeState.penawaran.apc?.target || 0);
  const apcAchieved = Number(
    safeState.penawaran.apc?.achieved || 0
  );

  const pwpRows = safeState.penawaran.pwp || [];
  const psmRows = safeState.penawaran.psm || [];
  const sgRows = safeState.penawaran.sg || [];

  const pwpTarget = useMemo(
    () =>
      pwpRows.reduce(
        (sum, item) => sum + Number(item.target || 0),
        0
      ),
    [pwpRows]
  );

  const pwpAchieved = useMemo(
    () =>
      pwpRows.reduce(
        (sum, item) => sum + Number(item.achieved || 0),
        0
      ),
    [pwpRows]
  );

  const psmTarget = useMemo(
    () =>
      psmRows.reduce(
        (sum, item) => sum + Number(item.target || 0),
        0
      ),
    [psmRows]
  );

  const psmAchieved = useMemo(
    () =>
      psmRows.reduce(
        (sum, item) => sum + Number(item.achieved || 0),
        0
      ),
    [psmRows]
  );

  const sgTarget = useMemo(
    () =>
      sgRows.reduce(
        (sum, item) => sum + Number(item.target || 0),
        0
      ),
    [sgRows]
  );

  const sgAchieved = useMemo(
    () =>
      sgRows.reduce(
        (sum, item) => sum + Number(item.achieved || 0),
        0
      ),
    [sgRows]
  );

  const apcPct = pctRaw(apcAchieved, apcTarget);
  const pwpPct = pctRaw(pwpAchieved, pwpTarget);
  const psmPct = pctRaw(psmAchieved, psmTarget);
  const sgPct = pctRaw(sgAchieved, sgTarget);

  const apcContribution = (apcPct * 25) / 100;
  const pwpContribution = (pwpPct * 25) / 100;
  const psmContribution = (psmPct * 20) / 100;
  const sgContribution = (sgPct * 30) / 100;

  const totalContribution =
    apcContribution +
    pwpContribution +
    psmContribution +
    sgContribution;

  const totalProgress = Math.min(100, totalContribution);

  function persist(next) {
    setState(next);

    try {
      saveState(next);
    } catch {
      // local save gagal tidak boleh membuat UI crash
    }
  }

  function updatePeriod(field, value) {
    persist({
      ...safeState,
      period: {
        ...safeState.period,
        [field]: value,
      },
    });
  }

  function updateApc(field, value) {
    persist({
      ...safeState,
      penawaran: {
        ...safeState.penawaran,
        apc: {
          ...safeState.penawaran.apc,
          [field]: Math.max(0, Number(value) || 0),
        },
      },
    });
  }

  function updateRows(group, index, field, value) {
    const updated = [...(safeState.penawaran[group] || [])];

    updated[index] = {
      ...updated[index],
      [field]:
        field === "target"
          ? Math.max(0, Number(value) || 0)
          : value,
    };

    persist({
      ...safeState,
      penawaran: {
        ...safeState.penawaran,
        [group]: updated,
      },
    });
  }

  function clearLocalData() {
    const confirmed = window.confirm(
      "Hapus semua data lokal Sales Tracker?"
    );

    if (!confirmed) return;

    const next =
      typeof resetState === "function"
        ? resetState()
        : defaultState;

    setState(next);
    setShowSettings(false);
  }

  const progressColor =
    totalProgress >= 90
      ? COLORS.green
      : totalProgress >= 70
      ? COLORS.yellow
      : COLORS.red;

  if (activeTab !== "dashboard") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            minHeight: "100vh",
          }}
        >
          <header
            style={{
              padding: "22px 18px 18px",
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                color: COLORS.muted,
                fontSize: 9,
                letterSpacing: 2,
                fontWeight: 800,
              }}
            >
              PENAWARAN LANGSUNG
            </div>

            <div
              style={{
                fontSize: 27,
                fontWeight: 850,
                marginTop: 5,
              }}
            >
              {activeTab === "history"
                ? "Riwayat"
                : activeTab === "target"
                ? "Target"
                : "Pengaturan"}
            </div>
          </header>

          <div style={{ padding: 18 }}>
            <div
              style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {activeTab === "history"
                  ? "Riwayat Pencapaian"
                  : activeTab === "target"
                  ? "Pengaturan Target"
                  : "Pengaturan Aplikasi"}
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 12,
                  lineHeight: 1.6,
                  marginTop: 8,
                }}
              >
                Modul ini kita siapkan setelah dashboard utama
                terkunci. Untuk sekarang fokus utama tetap
                dashboard Penawaran Langsung sesuai mockup.
              </div>
            </div>
          </div>
        </div>

        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        paddingBottom: 82,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            padding: "24px 18px 18px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 9,
                  letterSpacing: 2,
                  fontWeight: 800,
                }}
              >
                PENAWARAN LANGSUNG
              </div>

              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 850,
                  marginTop: 6,
                  letterSpacing: -0.5,
                }}
              >
                Dashboard
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.panel2,
                  color: COLORS.text,
                  fontSize: 21,
                  cursor: "pointer",
                }}
                aria-label="Pengaturan"
              >
                ⚙
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              background: "#0d1526",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <div>
              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 8,
                }}
              >
                PERIODE
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 750,
                  marginTop: 3,
                }}
              >
                {safeState.period.name || "Periode Aktif"}
              </div>
            </div>

            <div style={{ fontSize: 18 }}>▾</div>
          </div>
        </header>

        <main style={{ padding: "18px 14px" }}>
          {/* HERO */}
          <div
            style={{
              background:
                "linear-gradient(135deg,#141d31 0%,#111a2d 100%)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: 17,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.15fr 1fr .9fr",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  PENAWARAN LANGSUNG (%)
                </div>

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: progressColor,
                    marginTop: 8,
                  }}
                >
                  {totalProgress.toFixed(2)}%
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    marginTop: 7,
                  }}
                >
                  Total Pencapaian
                </div>
              </div>

              <div
                style={{
                  borderLeft: `1px solid ${COLORS.border}`,
                  paddingLeft: 14,
                }}
              >
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                  }}
                >
                  Total Bobot
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 850,
                    marginTop: 4,
                  }}
                >
                  100%
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    marginTop: 10,
                  }}
                >
                  Total Kontribusi
                </div>

                <div
                  style={{
                    color: progressColor,
                    fontSize: 18,
                    fontWeight: 850,
                    marginTop: 3,
                  }}
                >
                  {totalContribution.toFixed(2)}%
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: "50%",
                    background: `conic-gradient(${progressColor} ${totalProgress}%, #263149 0)`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: "50%",
                      background: COLORS.panel,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 850,
                    }}
                  >
                    {totalProgress.toFixed(2)}%
                  </div>
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 8,
                    marginTop: 6,
                  }}
                >
                  Pencapaian Akhir
                </div>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              gap: 7,
              marginTop: 12,
            }}
          >
            <MiniKpi
              icon="◉"
              title="APC vs Target"
              weight={25}
              achievement={apcPct}
              contribution={apcContribution}
              color={COLORS.blue}
            />

            <MiniKpi
              icon="🎁"
              title="PWP Total"
              weight={25}
              achievement={pwpPct}
              contribution={pwpContribution}
              color={COLORS.purple}
            />

            <MiniKpi
              icon="♟"
              title="PSM Total"
              weight={20}
              achievement={psmPct}
              contribution={psmContribution}
              color={COLORS.orange}
            />

            <MiniKpi
              icon="▣"
              title="Serba Gratis"
              weight={30}
              achievement={sgPct}
              contribution={sgContribution}
              color={COLORS.yellow}
            />
          </div>

          <div
            style={{
              color: COLORS.muted,
              fontSize: 9,
              margin: "9px 3px",
            }}
          >
            ⓘ Kontribusi = Pencapaian × Bobot
          </div>

          {/* APC */}
          <Section
            number="1"
            title="APC vs Target"
            weight={25}
            icon="◉"
            color={COLORS.blue}
            note="Bobot: 25% dari total Penawaran Langsung"
          >
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 455 }}>
                <ColumnHeader color={COLORS.blue} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(95px,1fr) 72px 72px 72px 72px",
                    gap: 6,
                    alignItems: "center",
                    minHeight: 45,
                    padding: "5px 4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 750,
                    }}
                  >
                    APC
                  </div>

                  <div>
                    <input
                      type="number"
                      value={apcTarget}
                      onChange={(e) =>
                        updateApc("target", e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: 29,
                        boxSizing: "border-box",
                        borderRadius: 6,
                        border: `1px solid ${COLORS.border}`,
                        background: "#0b1221",
                        color: COLORS.text,
                        textAlign: "center",
                        fontSize: 10,
                        outline: "none",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {fmt(apcAchieved)}
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      color: statusColor(apcPct),
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {apcPct.toFixed(2)}%
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      color: COLORS.blue,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {apcContribution.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* PWP */}
          <Section
            number="2"
            title="PWP Total"
            weight={25}
            badge="Akumulasi PWP 1 + PWP 2"
            icon="🎁"
            color={COLORS.purple}
            note="Bobot: 25% dari total Penawaran Langsung"
          >
            <PeriodRows
              rows={pwpRows}
              color={COLORS.purple}
              weight={25}
              onTargetChange={(index, value) =>
                updateRows("pwp", index, "target", value)
              }
            />
          </Section>

          {/* PSM */}
          <Section
            number="3"
            title="PSM Total"
            weight={20}
            badge="Akumulasi PSM 1 + PSM 2 + PSM 3 + PSM 4"
            icon="♟"
            color={COLORS.orange}
            note="Bobot: 20% dari total Penawaran Langsung"
          >
            <PeriodRows
              rows={psmRows}
              color={COLORS.orange}
              weight={20}
              onTargetChange={(index, value) =>
                updateRows("psm", index, "target", value)
              }
            />
          </Section>

          {/* SG */}
          <Section
            number="4"
            title="Serba Gratis Total"
            weight={30}
            badge="Akumulasi SG 1 + SG 2"
            icon="▣"
            color={COLORS.yellow}
            note="Bobot: 30% dari total Penawaran Langsung"
          >
            <PeriodRows
              rows={sgRows}
              color={COLORS.yellow}
              weight={30}
              onTargetChange={(index, value) =>
                updateRows("sg", index, "target", value)
              }
            />
          </Section>

          {/* LOCAL MODE */}
          <div
            style={{
              marginTop: 14,
              borderRadius: 13,
              border: `1px solid ${COLORS.green}45`,
              background: "#0e1a18",
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `${COLORS.green}18`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 17,
                }}
              >
                ◉
              </div>

              <div>
                <div
                  style={{
                    color: COLORS.green,
                    fontSize: 11,
                    fontWeight: 850,
                  }}
                >
                  Mode Local Aktif
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 8,
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Data saat ini disimpan di perangkat/browser
                  ini.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                try {
                  saveState(safeState);
                  window.alert("Data berhasil disimpan.");
                } catch {
                  window.alert("Gagal menyimpan data.");
                }
              }}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.green}80`,
                color: COLORS.green,
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ↑ Simpan Manual
            </button>
          </div>
        </main>
      </div>

      {/* SETTINGS */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.72)",
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              background: "#111a2b",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "18px 18px 0 0",
              padding: 18,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 850,
                }}
              >
                Pengaturan
              </div>

              <button
                onClick={() => setShowSettings(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.panel,
                  color: COLORS.text,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gap: 12,
              }}
            >
              <label>
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 10,
                    marginBottom: 6,
                  }}
                >
                  Nama periode
                </div>

                <input
                  type="text"
                  value={safeState.period.name}
                  onChange={(e) =>
                    updatePeriod("name", e.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 42,
                    borderRadius: 9,
                    border: `1px solid ${COLORS.border}`,
                    background: "#0b1221",
                    color: COLORS.text,
                    padding: "0 12px",
                    outline: "none",
                  }}
                />
              </label>

              <label>
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 10,
                    marginBottom: 6,
                  }}
                >
                  Tanggal mulai
                </div>

                <input
                  type="date"
                  value={safeState.period.startDate || ""}
                  onChange={(e) =>
                    updatePeriod("startDate", e.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 42,
                    borderRadius: 9,
                    border: `1px solid ${COLORS.border}`,
                    background: "#0b1221",
                    color: COLORS.text,
                    padding: "0 12px",
                    outline: "none",
                  }}
                />
              </label>

              <label>
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 10,
                    marginBottom: 6,
                  }}
                >
                  Tanggal selesai
                </div>

                <input
                  type="date"
                  value={safeState.period.endDate || ""}
                  onChange={(e) =>
                    updatePeriod("endDate", e.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 42,
                    borderRadius: 9,
                    border: `1px solid ${COLORS.border}`,
                    background: "#0b1221",
                    color: COLORS.text,
                    padding: "0 12px",
                    outline: "none",
                  }}
                />
              </label>

              <div
                style={{
                  marginTop: 6,
                  paddingTop: 14,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    color: COLORS.red,
                    fontSize: 11,
                    fontWeight: 850,
                  }}
                >
                  Data Lokal
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    lineHeight: 1.5,
                    marginTop: 5,
                  }}
                >
                  Semua data saat ini tersimpan di
                  browser/perangkat ini.
                </div>

                <button
                  onClick={clearLocalData}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    height: 42,
                    borderRadius: 9,
                    border: `1px solid ${COLORS.red}80`,
                    background: `${COLORS.red}10`,
                    color: COLORS.red,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Reset semua data lokal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    ["dashboard", "⌂", "Dashboard"],
    ["history", "◷", "Riwayat"],
    ["target", "◎", "Target"],
    ["settings", "⚙", "Pengaturan"],
  ];

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(9,14,25,.96)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${COLORS.border}`,
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          pointerEvents: "auto",
          paddingBottom:
            "max(7px, env(safe-area-inset-bottom))",
        }}
      >
        {items.map(([key, icon, label]) => {
          const active = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                border: 0,
                background: "transparent",
                color: active ? COLORS.blue : COLORS.muted,
                padding: "9px 4px 6px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                {icon}
              </div>

              <div
                style={{
                  fontSize: 8,
                  fontWeight: active ? 800 : 600,
                  marginTop: 5,
                }}
              >
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
