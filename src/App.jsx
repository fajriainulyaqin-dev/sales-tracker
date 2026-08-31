import { useMemo, useState } from "react";
import { loadState, saveState, resetState } from "./storage";

const COLORS = {
  bg: "#080d19",
  panel: "#101829",
  border: "#26334b",
  text: "#f4f7fb",
  muted: "#8491a8",
  blue: "#5ca7ff",
  purple: "#9b70ff",
  orange: "#ff9a45",
  yellow: "#e5c84b",
  red: "#ff5f6d",
  green: "#55e56f",
};

function pct(value, target) {
  if (!target || Number(target) <= 0) return 0;
  return (Number(value || 0) / Number(target)) * 100;
}

function fmt(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function statusColor(value) {
  if (value >= 100) return COLORS.green;
  if (value >= 90) return COLORS.yellow;
  return COLORS.red;
}

/* =====================================================
   GRID DISPLAY DASHBOARD
===================================================== */

const GRID = "minmax(0,1.35fr) 64px 64px 76px 76px";

const center = {
  textAlign: "center",
  minWidth: 0,
};

/* =====================================================
   HEADER KOLOM - DASHBOARD
   TIDAK ADA INPUT
===================================================== */

function ColumnHeader({ color }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: GRID,
        gap: 6,
        width: "100%",
        alignItems: "end",
        boxSizing: "border-box",
        padding: "0 0 8px",
      }}
    >
      <div />

      <div
        style={{
          ...center,
          color: COLORS.muted,
          fontSize: 8,
        }}
      >
        Target
      </div>

      <div
        style={{
          ...center,
          color: COLORS.muted,
          fontSize: 8,
        }}
      >
        Pencapaian
      </div>

      <div
        style={{
          ...center,
          color: COLORS.muted,
          fontSize: 8,
          whiteSpace: "nowrap",
        }}
      >
        % Pencapaian
      </div>

      <div
        style={{
          ...center,
          color,
          fontSize: 8,
          whiteSpace: "nowrap",
        }}
      >
        Kontribusi
      </div>
    </div>
  );
}

/* =====================================================
   INPUT TARGET
   HANYA DIPAKAI DI MENU TARGET
===================================================== */

function TargetInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        height: 34,
        boxSizing: "border-box",
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: "#0b1221",
        color: COLORS.text,
        textAlign: "center",
        fontSize: 11,
        padding: 0,
        outline: "none",
      }}
    />
  );
}

/* =====================================================
   ROW PWP / PSM / SG
   DASHBOARD DISPLAY ONLY
===================================================== */

function MetricRows({ rows = [], color, weight }) {
  const totalTarget = rows.reduce(
    (sum, row) => sum + Number(row.target || 0),
    0
  );

  const totalAchieved = rows.reduce(
    (sum, row) => sum + Number(row.achieved || 0),
    0
  );

  const totalPct = pct(totalAchieved, totalTarget);
  const totalContribution = (totalPct * weight) / 100;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <ColumnHeader color={color} />

      {rows.map((row, index) => {
        const achievement = pct(
          row.achieved,
          row.target
        );

        const contribution =
          (achievement * weight) / 100;

        return (
          <div
            key={`${row.label}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 6,
              width: "100%",
              minHeight: 46,
              alignItems: "center",
              boxSizing: "border-box",
              padding: "5px 0",
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
              {row.label}
            </div>

            {/* TARGET */}
            <div
              style={{
                ...center,
                color: COLORS.text,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {fmt(row.target)}
            </div>

            {/* PENCAPAIAN */}
            <div
              style={{
                ...center,
                color: COLORS.text,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {fmt(row.achieved)}
            </div>

            {/* % */}
            <div
              style={{
                ...center,
                color: statusColor(achievement),
                fontSize: 10,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {achievement.toFixed(3)}%
            </div>

            {/* KONTRIBUSI */}
            <div
              style={{
                ...center,
                color,
                fontSize: 10,
                fontWeight: 800,
                whiteSpace: "nowrap",
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
          width: "100%",
          alignItems: "center",
          boxSizing: "border-box",
          borderTop: `1px dotted ${COLORS.border}`,
          padding: "10px 0 2px",
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
            ...center,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmt(totalTarget)}
        </div>

        <div
          style={{
            ...center,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmt(totalAchieved)}
        </div>

        <div
          style={{
            ...center,
            color: statusColor(totalPct),
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {totalPct.toFixed(3)}%
        </div>

        <div
          style={{
            ...center,
            color,
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {totalContribution.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   APC
   DASHBOARD DISPLAY ONLY
===================================================== */

function ApcRow({ data }) {
  const achievement = pct(
    data.achieved,
    data.target
  );

  const contribution =
    (achievement * 25) / 100;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <ColumnHeader color={COLORS.blue} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 6,
          width: "100%",
          minHeight: 46,
          alignItems: "center",
          boxSizing: "border-box",
          padding: "5px 0",
        }}
      >
        {/* LABEL */}
        <div
          style={{
            color: COLORS.text,
            fontSize: 10,
            fontWeight: 800,
            textAlign: "left",
          }}
        >
          APC
        </div>

        {/* TARGET */}
        <div
          style={{
            ...center,
            color: COLORS.text,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmt(data.target)}
        </div>

        {/* PENCAPAIAN */}
        <div
          style={{
            ...center,
            color: COLORS.text,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmt(data.achieved)}
        </div>

        {/* % */}
        <div
          style={{
            ...center,
            color: statusColor(achievement),
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {achievement.toFixed(3)}%
        </div>

        {/* KONTRIBUSI */}
        <div
          style={{
            ...center,
            color: COLORS.blue,
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {contribution.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SECTION
===================================================== */

function Section({
  number,
  title,
  weight,
  badge,
  icon,
  color,
  children,
}) {
  return (
    <section
      style={{
        background: COLORS.panel,
        border: `1px solid ${color}45`,
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        boxSizing: "border-box",
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
            color,
            fontSize: 18,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            minWidth: 0,
          }}
        >
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

      {children}

      <div
        style={{
          marginTop: 12,
          color: COLORS.muted,
          fontSize: 9,
        }}
      >
        ⓘ Bobot: {weight}% dari total Penawaran Langsung
      </div>
    </section>
  );
}

/* =====================================================
   KPI ATAS
===================================================== */

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
        background: "#0d1423",
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: 10,
        boxSizing: "border-box",
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
            color,
            fontSize: 17,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {title}
          </div>

          <div
            style={{
              color,
              fontSize: 8,
              fontWeight: 800,
              marginTop: 2,
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

/* =====================================================
   TARGET PAGE
===================================================== */

function TargetPage({
  apc,
  pwp,
  psm,
  sg,
  updateApc,
  updateRows,
}) {
  return (
    <div>
      <div
        style={{
          marginTop: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Target
        </div>

        <div
          style={{
            color: COLORS.muted,
            fontSize: 10,
            marginTop: 4,
          }}
        >
          Masukkan target periode di sini.
        </div>
      </div>

      {/* APC */}
      <TargetSection
        title="APC"
        weight={25}
        color={COLORS.blue}
        icon="◎"
      >
        <TargetSingleRow
          label="APC"
          value={apc.target}
          color={COLORS.blue}
          onChange={updateApc}
        />
      </TargetSection>

      {/* PWP */}
      <TargetSection
        title="PWP"
        weight={25}
        color={COLORS.purple}
        icon="🎁"
        badge="PWP 1 + PWP 2"
      >
        {pwp.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
            color={COLORS.purple}
            onChange={(value) =>
              updateRows("pwp", index, value)
            }
          />
        ))}
      </TargetSection>

      {/* PSM */}
      <TargetSection
        title="PSM"
        weight={20}
        color={COLORS.orange}
        icon="♟"
        badge="PSM 1 + PSM 2 + PSM 3 + PSM 4"
      >
        {psm.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
            color={COLORS.orange}
            onChange={(value) =>
              updateRows("psm", index, value)
            }
          />
        ))}
      </TargetSection>

      {/* SG */}
      <TargetSection
        title="Serba Gratis"
        weight={30}
        color={COLORS.yellow}
        icon="●"
        badge="SG 1 + SG 2"
      >
        {sg.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
            color={COLORS.yellow}
            onChange={(value) =>
              updateRows("sg", index, value)
            }
          />
        ))}
      </TargetSection>
    </div>
  );
}

/* =====================================================
   TARGET COMPONENTS
===================================================== */

function TargetSection({
  title,
  weight,
  color,
  icon,
  badge,
  children,
}) {
  return (
    <section
      style={{
        background: COLORS.panel,
        border: `1px solid ${color}45`,
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 14,
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
            color,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            {title} ({weight}%)
          </div>

          {badge && (
            <div
              style={{
                display: "inline-block",
                marginTop: 4,
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
    </section>
  );
}

function TargetSingleRow({
  label,
  value,
  color,
  onChange,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        {label}
      </div>

      <TargetInput
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function TargetMetricRow({
  label,
  value,
  color,
  onChange,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 100px",
        gap: 12,
        alignItems: "center",
        padding: "9px 0",
        borderTop: `1px dotted ${COLORS.border}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.text,
        }}
      >
        {label}
      </div>

      <TargetInput
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/* =====================================================
   APP
===================================================== */

export default function App() {
  const [state, setState] = useState(() =>
    loadState()
  );

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const penawaran = state.penawaran || {};

  const apc = penawaran.apc || {
    achieved: 0,
    target: 0,
  };

  const pwp = Array.isArray(penawaran.pwp)
    ? penawaran.pwp
    : [];

  const psm = Array.isArray(penawaran.psm)
    ? penawaran.psm
    : [];

  const sg = Array.isArray(penawaran.sg)
    ? penawaran.sg
    : [];

  /* =====================================================
     KPI
  ===================================================== */

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

      const achievement = pct(
        achieved,
        target
      );

      return {
        achievement,
        contribution:
          (achievement * weight) / 100,
      };
    };

    const apcAchievement = pct(
      apc.achieved,
      apc.target
    );

    return {
      apc: {
        achievement: apcAchievement,
        contribution:
          (apcAchievement * 25) / 100,
      },

      pwp: calc(pwp, 25),
      psm: calc(psm, 20),
      sg: calc(sg, 30),
    };
  }, [apc, pwp, psm, sg]);

  /* =====================================================
     SAVE
  ===================================================== */

  function commit(next) {
    setState(next);
    saveState(next);
  }

  /* =====================================================
     UPDATE TARGET APC
  ===================================================== */

  function updateApc(value) {
    commit({
      ...state,
      penawaran: {
        ...state.penawaran,
        apc: {
          ...state.penawaran.apc,
          target: Number(value) || 0,
        },
      },
    });
  }

  /* =====================================================
     UPDATE TARGET PWP / PSM / SG
  ===================================================== */

  function updateRows(
    type,
    index,
    value
  ) {
    commit({
      ...state,
      penawaran: {
        ...state.penawaran,
        [type]:
          state.penawaran[type].map(
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
    });
  }

  /* =====================================================
     RESET
  ===================================================== */

  function handleReset() {
    if (
      !window.confirm(
        "Reset semua data Sales Tracker?"
      )
    ) {
      return;
    }

    const fresh = resetState();

    setState(fresh);
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: 82,
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: "18px 18px 12px",
          background: COLORS.bg,
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
        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activeTab === "dashboard" && (
          <>
            {/* KPI */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 8,
              }}
            >
              <MiniKpi
                icon="◎"
                title="APC"
                weight={25}
                achievement={
                  kpi.apc.achievement
                }
                contribution={
                  kpi.apc.contribution
                }
                color={COLORS.blue}
              />

              <MiniKpi
                icon="🎁"
                title="PWP"
                weight={25}
                achievement={
                  kpi.pwp.achievement
                }
                contribution={
                  kpi.pwp.contribution
                }
                color={COLORS.purple}
              />

              <MiniKpi
                icon="♟"
                title="PSM"
                weight={20}
                achievement={
                  kpi.psm.achievement
                }
                contribution={
                  kpi.psm.contribution
                }
                color={COLORS.orange}
              />

              <MiniKpi
                icon="●"
                title="SG"
                weight={30}
                achievement={
                  kpi.sg.achievement
                }
                contribution={
                  kpi.sg.contribution
                }
                color={COLORS.yellow}
              />
            </div>

            <div
              style={{
                color: COLORS.muted,
                fontSize: 9,
                marginTop: 8,
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
            >
              <ApcRow data={apc} />
            </Section>

            {/* PWP */}
            <Section
              number="2"
              title="PWP Total"
              weight={25}
              badge="Akumulasi PWP 1 + PWP 2"
              icon="🎁"
              color={COLORS.purple}
            >
              <MetricRows
                rows={pwp}
                color={COLORS.purple}
                weight={25}
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
            >
              <MetricRows
                rows={psm}
                color={COLORS.orange}
                weight={20}
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
            >
              <MetricRows
                rows={sg}
                color={COLORS.yellow}
                weight={30}
              />
            </Section>
          </>
        )}

        {/* =================================================
            RIWAYAT
        ================================================= */}

        {activeTab === "history" && (
          <div
            style={{
              background: COLORS.panel,
              border:
                `1px solid ${COLORS.border}`,
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
                marginTop: 6,
                lineHeight: 1.6,
              }}
            >
              Input pencapaian harian akan
              ditempatkan di sini.
              <br />
              Data dari sini nantinya otomatis
              dihitung ke Dashboard.
            </div>
          </div>
        )}

        {/* =================================================
            TARGET
        ================================================= */}

        {activeTab === "target" && (
          <TargetPage
            apc={apc}
            pwp={pwp}
            psm={psm}
            sg={sg}
            updateApc={updateApc}
            updateRows={updateRows}
          />
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeTab === "settings" && (
          <div
            style={{
              background: COLORS.panel,
              border:
                `1px solid ${COLORS.border}`,
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
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              Pengaturan aplikasi dan reset
              data tersedia di sini.
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%",
                height: 42,
                marginTop: 20,
                borderRadius: 9,
                border:
                  `1px solid ${COLORS.red}55`,
                background:
                  `${COLORS.red}15`,
                color: COLORS.red,
                fontWeight: 800,
              }}
            >
              Reset Semua Data
            </button>
          </div>
        )}
      </main>

      {/* =================================================
          BOTTOM NAV
      ================================================= */}

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background:
            "rgba(8,13,25,.98)",
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
          ["dashboard", "⌂", "Dashboard"],
          ["history", "◷", "Riwayat"],
          ["target", "◎", "Target"],
          ["settings", "⚙", "Pengaturan"],
        ].map(
          ([id, icon, label]) => {
            const active =
              activeTab === id;

            return (
              <button
                key={id}
                onClick={() =>
                  setActiveTab(id)
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: active
                    ? COLORS.blue
                    : COLORS.muted,
                  padding: "5px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 21,
                    lineHeight: 1,
                  }}
                >
                  {icon}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 9,
                    fontWeight:
                      active
                        ? 800
                        : 500,
                  }}
                >
                  {label}
                </div>
              </button>
            );
          }
        )}
      </nav>
    </div>
  );
}
