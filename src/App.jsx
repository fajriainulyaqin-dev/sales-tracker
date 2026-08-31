import { useMemo, useState } from "react";
import { loadState, saveState, resetState } from "./storage";

const COLORS = {
  bg: "#080d19",
  panel: "#101829",
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

/* =========================================================
   UTIL
========================================================= */

function pctRaw(value, target) {
  if (!target || Number(target) <= 0) return 0;

  return (
    Math.round(
      (Number(value || 0) / Number(target)) * 1000
    ) / 10
  );
}

function fmt(value) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}

function statusColor(value) {
  if (value >= 100) return COLORS.green;
  if (value >= 90) return COLORS.yellow;
  return COLORS.red;
}

/* =========================================================
   ICON
========================================================= */

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

/* =========================================================
   KPI ATAS
========================================================= */

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
        padding: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 9,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon color={color}>{icon}</Icon>
        </div>

        <div
          style={{
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 8,
              color,
              marginTop: 2,
              fontWeight: 800,
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
          gap: 6,
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 8,
            }}
          >
            Pencapaian
          </div>

          <div
            style={{
              color: statusColor(achievement),
              fontSize: 12,
              fontWeight: 800,
              marginTop: 3,
            }}
          >
            {achievement.toFixed(2)}%
          </div>
        </div>

        <div>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 8,
            }}
          >
            Kontribusi
          </div>

          <div
            style={{
              color,
              fontSize: 12,
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

/* =========================================================
   SECTION
========================================================= */

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
          gap: 9,
          marginBottom: 15,
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
          }}
        >
          <span>ⓘ</span>
          <span>{note}</span>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   GRID UTAMA
   INI YANG BIKIN SEMUA KOLOM SIMETRIS
========================================================= */

const GRID =
  "minmax(100px,1.4fr) 65px 65px 72px 72px";

function ColumnHeader({ color }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 6,
        alignItems: "center",
        minWidth: 400,
        padding: "0 4px 8px",
      }}
    >
      <div />

      <div
        style={{
          textAlign: "center",
          color: COLORS.muted,
          fontSize: 8,
          fontWeight: 700,
        }}
      >
        Target
        <br />
        <span style={{ fontSize: 7 }}>
          (Input)
        </span>
      </div>

      <div
        style={{
          textAlign: "center",
          color: COLORS.muted,
          fontSize: 8,
          fontWeight: 700,
        }}
      >
        Pencapaian
        <br />
        <span style={{ fontSize: 7 }}>
          (Otomatis)
        </span>
      </div>

      <div
        style={{
          textAlign: "center",
          color: COLORS.muted,
          fontSize: 8,
          fontWeight: 700,
        }}
      >
        % Pencapaian
      </div>

      <div
        style={{
          textAlign: "center",
          color,
          fontSize: 8,
          fontWeight: 700,
        }}
      >
        Kontribusi
      </div>
    </div>
  );
}

/* =========================================================
   ROW SYSTEM
   SEMUA PWP / PSM / SG LEWAT SINI
========================================================= */

function MetricRows({
  rows,
  color,
  weight,
  onTargetChange,
}) {
  const totalTarget = rows.reduce(
    (sum, item) =>
      sum + Number(item.target || 0),
    0
  );

  const totalAchieved = rows.reduce(
    (sum, item) =>
      sum + Number(item.achieved || 0),
    0
  );

  const totalPct = pctRaw(
    totalAchieved,
    totalTarget
  );

  const totalContribution =
    (totalPct * weight) / 100;

  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <ColumnHeader color={color} />

      <div style={{ minWidth: 400 }}>
        {rows.map((item, index) => {
          const achievement = pctRaw(
            item.achieved,
            item.target
          );

          const contribution =
            (achievement * weight) / 100;

          return (
            <div
              key={`${item.label}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 6,
                alignItems: "center",
                minHeight: 45,
                padding: "5px 4px",
                borderTop:
                  index === 0
                    ? "none"
                    : `1px dotted ${COLORS.border}`,
              }}
            >
              {/* LABEL */}
              <div
                style={{
                  minWidth: 0,
                  color: COLORS.text,
                  fontSize: 10,
                  fontWeight: 700,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </div>

              {/* TARGET */}
              <input
                type="number"
                value={item.target ?? ""}
                onChange={(e) =>
                  onTargetChange(
                    index,
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  height: 30,
                  boxSizing: "border-box",
                  borderRadius: 7,
                  border: `1px solid ${COLORS.border}`,
                  background: "#0b1221",
                  color: COLORS.text,
                  textAlign: "center",
                  fontSize: 10,
                  outline: "none",
                  padding: 0,
                }}
              />

              {/* PENCAPAIAN */}
              <div
                style={{
                  textAlign: "center",
                  color: COLORS.text,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {fmt(item.achieved)}
              </div>

              {/* PERSENTASE */}
              <div
                style={{
                  textAlign: "center",
                  color: statusColor(
                    achievement
                  ),
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {achievement.toFixed(3)}%
              </div>

              {/* KONTRIBUSI */}
              <div
                style={{
                  textAlign: "center",
                  color,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {contribution.toFixed(2)}%
              </div>
            </div>
          );
        })}

        {/* TOTAL */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 6,
            alignItems: "center",
            borderTop: `1px dotted ${COLORS.border}`,
            padding: "10px 4px 3px",
          }}
        >
          <div
            style={{
              color: COLORS.text,
              fontSize: 10,
              fontWeight: 800,
              textAlign: "left",
            }}
          >
            TOTAL
          </div>

          <div
            style={{
              color: COLORS.text,
              fontSize: 10,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {fmt(totalTarget)}
          </div>

          <div
            style={{
              color: COLORS.text,
              fontSize: 10,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {fmt(totalAchieved)}
          </div>

          <div
            style={{
              color: statusColor(totalPct),
              fontSize: 10,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {totalPct.toFixed(3)}%
          </div>

          <div
            style={{
              color,
              fontSize: 10,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {totalContribution.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APC
========================================================= */

function ApcRow({
  data,
  weight,
  onTargetChange,
}) {
  const achievement = pctRaw(
    data.achieved,
    data.target
  );

  const contribution =
    (achievement * weight) / 100;

  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <ColumnHeader color={COLORS.blue} />

      <div style={{ minWidth: 400 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 6,
            alignItems: "center",
            minHeight: 45,
            padding: "5px 4px",
          }}
        >
          <div
            style={{
              color: COLORS.text,
              fontSize: 11,
              fontWeight: 800,
              textAlign: "left",
            }}
          >
            APC
          </div>

          <input
            type="number"
            value={data.target ?? ""}
            onChange={(e) =>
              onTargetChange(e.target.value)
            }
            style={{
              width: "100%",
              height: 30,
              boxSizing: "border-box",
              borderRadius: 7,
              border: `1px solid ${COLORS.border}`,
              background: "#0b1221",
              color: COLORS.text,
              textAlign: "center",
              fontSize: 10,
              outline: "none",
              padding: 0,
            }}
          />

          <div
            style={{
              textAlign: "center",
              color: COLORS.text,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {fmt(data.achieved)}
          </div>

          <div
            style={{
              textAlign: "center",
              color: statusColor(
                achievement
              ),
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {achievement.toFixed(3)}%
          </div>

          <div
            style={{
              textAlign: "center",
              color: COLORS.blue,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {contribution.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [state, setState] = useState(() =>
    loadState()
  );

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const penawaran =
    state.penawaran || {};

  const apc = penawaran.apc || {
    target: 0,
    achieved: 0,
  };

  const pwp = penawaran.pwp || [];
  const psm = penawaran.psm || [];
  const sg = penawaran.sg || [];

  /* -------------------------------------------------------
     HITUNG KPI ATAS
  ------------------------------------------------------- */

  const kpi = useMemo(() => {
    const calc = (rows, weight) => {
      const target = rows.reduce(
        (s, x) =>
          s + Number(x.target || 0),
        0
      );

      const achieved = rows.reduce(
        (s, x) =>
          s + Number(x.achieved || 0),
        0
      );

      const pct = pctRaw(
        achieved,
        target
      );

      return {
        pct,
        contribution:
          (pct * weight) / 100,
      };
    };

    return {
      apc: {
        pct: pctRaw(
          apc.achieved,
          apc.target
        ),
        contribution:
          (pctRaw(
            apc.achieved,
            apc.target
          ) *
            25) /
          100,
      },

      pwp: calc(pwp, 25),
      psm: calc(psm, 20),
      sg: calc(sg, 30),
    };
  }, [apc, pwp, psm, sg]);

  /* -------------------------------------------------------
     SAVE
  ------------------------------------------------------- */

  function commit(nextState) {
    setState(nextState);
    saveState(nextState);
  }

  /* -------------------------------------------------------
     TARGET PWP
  ------------------------------------------------------- */

  function updatePwp(index, value) {
    const next = {
      ...state,
      penawaran: {
        ...state.penawaran,
        pwp: state.penawaran.pwp.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  target:
                    Number(value) || 0,
                }
              : item
        ),
      },
    };

    commit(next);
  }

  /* -------------------------------------------------------
     TARGET PSM
  ------------------------------------------------------- */

  function updatePsm(index, value) {
    const next = {
      ...state,
      penawaran: {
        ...state.penawaran,
        psm: state.penawaran.psm.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  target:
                    Number(value) || 0,
                }
              : item
        ),
      },
    };

    commit(next);
  }

  /* -------------------------------------------------------
     TARGET SG
  ------------------------------------------------------- */

  function updateSg(index, value) {
    const next = {
      ...state,
      penawaran: {
        ...state.penawaran,
        sg: state.penawaran.sg.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  target:
                    Number(value) || 0,
                }
              : item
        ),
      },
    };

    commit(next);
  }

  /* -------------------------------------------------------
     TARGET APC
  ------------------------------------------------------- */

  function updateApc(value) {
    const next = {
      ...state,
      penawaran: {
        ...state.penawaran,
        apc: {
          ...state.penawaran.apc,
          target:
            Number(value) || 0,
        },
      },
    };

    commit(next);
  }

  /* -------------------------------------------------------
     RESET
  ------------------------------------------------------- */

  function handleReset() {
    const ok = window.confirm(
      "Reset semua data Sales Tracker?"
    );

    if (!ok) return;

    const fresh = resetState();
    setState(fresh);
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: 80,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: "18px 18px 10px",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background:
            "rgba(8,13,25,.94)",
          backdropFilter:
            "blur(10px)",
          borderBottom:
            `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Sales Tracker
        </div>

        <div
          style={{
            color: COLORS.muted,
            fontSize: 10,
            marginTop: 3,
          }}
        >
          Monitoring Penawaran & Pencapaian
        </div>
      </header>

      <main
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          padding: "12px 14px",
          boxSizing: "border-box",
        }}
      >
        {activeTab === "dashboard" && (
          <>
            {/* KPI ATAS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0,1fr))",
                gap: 8,
              }}
            >
              <MiniKpi
                icon="◎"
                title="APC"
                weight={25}
                achievement={kpi.apc.pct}
                contribution={
                  kpi.apc.contribution
                }
                color={COLORS.blue}
              />

              <MiniKpi
                icon="🎁"
                title="PWP"
                weight={25}
                achievement={kpi.pwp.pct}
                contribution={
                  kpi.pwp.contribution
                }
                color={COLORS.purple}
              />

              <MiniKpi
                icon="♟"
                title="PSM"
                weight={20}
                achievement={kpi.psm.pct}
                contribution={
                  kpi.psm.contribution
                }
                color={COLORS.orange}
              />

              <MiniKpi
                icon="●"
                title="SG"
                weight={30}
                achievement={kpi.sg.pct}
                contribution={
                  kpi.sg.contribution
                }
                color={COLORS.yellow}
              />
            </div>

            <div
              style={{
                marginTop: 8,
                color: COLORS.muted,
                fontSize: 9,
              }}
            >
              ⓘ Kontribusi = Pencapaian × Bobot
            </div>

            {/* APC */}
            <Section
              number="1"
              title="APC vs Target"
              weight={25}
              icon="◎"
              color={COLORS.blue}
              note="Bobot: 25% dari total Penawaran Langsung"
            >
              <ApcRow
                data={apc}
                weight={25}
                onTargetChange={
                  updateApc
                }
              />
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
              <MetricRows
                rows={pwp}
                color={COLORS.purple}
                weight={25}
                onTargetChange={
                  updatePwp
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
              <MetricRows
                rows={psm}
                color={COLORS.orange}
                weight={20}
                onTargetChange={
                  updatePsm
                }
              />
            </Section>

            {/* SG */}
            <Section
              number="4"
              title="Serba Gratis Total"
              weight={30}
              badge="Akumulasi SG 1 + SG 2"
              icon="●"
              color={COLORS.yellow}
              note="Bobot: 30% dari total Penawaran Langsung"
            >
              <MetricRows
                rows={sg}
                color={COLORS.yellow}
                weight={30}
                onTargetChange={
                  updateSg
                }
              />
            </Section>
          </>
        )}

        {/* TARGET */}
        {activeTab === "target" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: 18,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Target
            </div>

            <div
              style={{
                color: COLORS.muted,
                fontSize: 10,
                marginTop: 5,
              }}
            >
              Target periode dapat diatur
              langsung dari dashboard.
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 10,
                background:
                  "#0b1221",
                color: COLORS.muted,
                fontSize: 10,
              }}
            >
              Gunakan kolom <b>Target
              (Input)</b> pada APC, PWP,
              PSM, dan SG.
            </div>
          </div>
        )}

        {/* RIWAYAT */}
        {activeTab === "history" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: 18,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Riwayat
            </div>

            <div
              style={{
                color: COLORS.muted,
                fontSize: 10,
                marginTop: 5,
              }}
            >
              Riwayat periode akan tersedia
              pada pengembangan berikutnya.
            </div>
          </div>
        )}

        {/* PENGATURAN */}
        {activeTab === "settings" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: 18,
              marginTop: 10,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Pengaturan
            </div>

            <div
              style={{
                color: COLORS.muted,
                fontSize: 10,
                marginTop: 5,
              }}
            >
              Pengaturan aplikasi.
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%",
                marginTop: 20,
                height: 42,
                borderRadius: 9,
                border: `1px solid ${COLORS.red}55`,
                background: `${COLORS.red}15`,
                color: COLORS.red,
                fontWeight: 800,
              }}
            >
              Reset Semua Data
            </button>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background:
            "rgba(8,13,25,.97)",
          borderTop:
            `1px solid ${COLORS.border}`,
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          padding:
            "8px 8px calc(8px + env(safe-area-inset-bottom))",
        }}
      >
        {[
          {
            id: "dashboard",
            icon: "⌂",
            label: "Dashboard",
          },
          {
            id: "history",
            icon: "◷",
            label: "Riwayat",
          },
          {
            id: "target",
            icon: "◎",
            label: "Target",
          },
          {
            id: "settings",
            icon: "⚙",
            label: "Pengaturan",
          },
        ].map((item) => {
          const active =
            activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                setActiveTab(item.id)
              }
              style={{
                border: "none",
                background: "transparent",
                color: active
                  ? COLORS.blue
                  : COLORS.muted,
                padding: "5px 0",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 21,
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 9,
                  fontWeight: active
                    ? 800
                    : 500,
                }}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
