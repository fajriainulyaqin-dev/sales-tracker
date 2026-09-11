import { useMemo, useRef, useState } from "react";
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
  subpanel: "#0d1423",
};

const DARK_THEME = { ...COLORS };
const LIGHT_THEME = {
  bg: "#f4f7fb",
  panel: "#ffffff",
  border: "#d7dfeb",
  text: "#182235",
  muted: "#66738a",
  blue: "#287fe8",
  purple: "#7650d9",
  orange: "#e87520",
  yellow: "#b08b00",
  red: "#dc3f50",
  green: "#21a94b",
  subpanel: "#f0f4f9",
};

function applyTheme(theme) {
  Object.assign(COLORS, theme === "light" ? LIGHT_THEME : DARK_THEME);
}

function pct(value, target) {
  if (!target || Number(target) <= 0) return 0;
  return (Number(value || 0) / Number(target)) * 100;
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

function performanceColor(value) {
  const v = Math.max(0, Math.min(120, Number(value || 0)));
  const stops = [
    [0, [255, 95, 109]],
    [70, [255, 110, 75]],
    [85, [255, 154, 69]],
    [95, [229, 200, 75]],
    [100, [85, 229, 111]],
    [120, [40, 210, 150]],
  ];
  for (let i = 1; i < stops.length; i += 1) {
    if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      const t = (v - a) / (b - a);
      const rgb = ca.map((c, index) => Math.round(c + (cb[index] - c) * t));
      return `rgb(${rgb.join(", ")})`;
    }
  }
  return "rgb(40, 210, 150)";
}

function fmtPct(value) {
  return `${Number(value || 0).toFixed(1).replace('.', ',')}%`;
}

function getDaysInMonth(monthKey) {
  if (!monthKey) return 0;
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function getTimeFactor(monthKey) {
  const daysInMonth = getDaysInMonth(monthKey);
  if (!daysInMonth) return 0;

  const [year, month] = monthKey.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 100;
  }

  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return 0;
  }

  return Math.min(100, (now.getDate() / daysInMonth) * 100);
}

function getRemainingDays(monthKey) {
  const daysInMonth = getDaysInMonth(monthKey);
  if (!daysInMonth) return 0;

  const [year, month] = monthKey.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) return 0;
  if (year > currentYear || (year === currentYear && month > currentMonth)) return daysInMonth;

  return Math.max(0, daysInMonth - now.getDate());
}

function fmtGapNumber(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(n);
}

function localDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const parts = String(dateString).split("-");

  if (parts.length !== 3) return dateString;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getMonthKey(dateString) {
  if (!dateString) return "";
  return String(dateString).slice(0, 7);
}

function getCurrentMonthKey() {
  return localDateString().slice(0, 7);
}

function getPreviousMonthKey() {
  const d = new Date();

  d.setDate(1);
  d.setMonth(d.getMonth() - 1);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function monthLabel(monthKey) {
  if (!monthKey) return "";

  const [year, month] = monthKey.split("-");

  const names = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${names[Number(month) - 1] || month} ${year}`;
}

/* =====================================================
   DEFAULT TARGET
===================================================== */

function emptyPenawaran() {
  return {
    apc: {
      achieved: 0,
      target: 0,
    },

    pwp: [
      { label: "PWP 1", achieved: 0, target: 0 },
      { label: "PWP 2", achieved: 0, target: 0 },
    ],

    psm: [
      { label: "PSM 1", achieved: 0, target: 0 },
      { label: "PSM 2", achieved: 0, target: 0 },
      { label: "PSM 3", achieved: 0, target: 0 },
      { label: "PSM 4", achieved: 0, target: 0 },
    ],

    sg: [
      { label: "SG 1", achieved: 0, target: 0 },
      { label: "SG 2", achieved: 0, target: 0 },
    ],
  };
}

function normalizePenawaran(data) {
  const base = emptyPenawaran();

  return {
    ...base,
    ...(data || {}),

    apc: {
      ...base.apc,
      ...(data?.apc || {}),
    },

    pwp: Array.isArray(data?.pwp)
      ? data.pwp
      : base.pwp,

    psm: Array.isArray(data?.psm)
      ? data.psm
      : base.psm,

    sg: Array.isArray(data?.sg)
      ? data.sg
      : base.sg,
  };
}

/* =====================================================
   DASHBOARD
===================================================== */

const GRID =
  "minmax(0,1.35fr) 64px 64px 76px 76px";

const center = {
  textAlign: "center",
  minWidth: 0,
};

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
  const totalContribution =
    (totalPct * weight) / 100;

  return (
    <div style={{ width: "100%" }}>
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
            <div
              style={{
                minWidth: 0,
                color: COLORS.text,
                fontSize: 10,
                fontWeight: 700,
                textAlign: "left",
              }}
            >
              {row.label}
            </div>

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

            <div
              style={{
                ...center,
                color: statusColor(achievement),
                fontSize: 10,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {fmtPct(achievement)}
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
              {fmtPct(contribution)}
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 6,
          width: "100%",
          alignItems: "center",
          borderTop: `1px dotted ${COLORS.border}`,
          padding: "10px 0 2px",
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 10,
            fontWeight: 800,
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
          }}
        >
          {fmtPct(totalPct)}
        </div>

        <div
          style={{
            ...center,
            color,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmtPct(totalContribution)}
        </div>
      </div>
    </div>
  );
}

function ApcRow({ data }) {
  const achievement = pct(
    data.achieved,
    data.target
  );

  const contribution =
    (achievement * 25) / 100;

  return (
    <div style={{ width: "100%" }}>
      <ColumnHeader color={COLORS.blue} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 6,
          width: "100%",
          minHeight: 46,
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          APC
        </div>

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

        <div
          style={{
            ...center,
            color: statusColor(achievement),
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmtPct(achievement)}
        </div>

        <div
          style={{
            ...center,
            color: COLORS.blue,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {fmtPct(contribution)}
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  weight,
  badge,
  icon,
  achievement,
  children,
  gap,
  remainingDays,
  targetPerDay,
  timeFactor,
}) {
  const sectionColor = performanceColor(achievement);
  const gapToTf = Number(achievement || 0) - Number(timeFactor || 0);

  return (
    <section
      style={{
        background: `radial-gradient(circle at 100% 0%, ${sectionColor}16 0%, transparent 42%), ${COLORS.panel}`,
        border: `1px solid ${sectionColor}70`,
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        boxSizing: "border-box",
        boxShadow: `0 0 16px ${sectionColor}0f`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${sectionColor}20`,
            border: `1px solid ${sectionColor}45`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: sectionColor,
            fontSize: 18,
            flexShrink: 0,
          }}
        >{icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: sectionColor }}>
            {number}. {title} ({weight}%)
          </div>
          {badge && (
            <div style={{ display: "inline-block", marginTop: 5, padding: "3px 8px", borderRadius: 999, background: `${sectionColor}20`, color: sectionColor, fontSize: 8, fontWeight: 800 }}>
              {badge}
            </div>
          )}
        </div>
        <div style={{ color: sectionColor, fontSize: 14, fontWeight: 900, whiteSpace: "nowrap" }}>
          {fmtPct(achievement)}
        </div>
      </div>

      <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${COLORS.border}` }}>
        {children}
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 }}>
        <div style={{ background: COLORS.subpanel, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "8px 9px" }}>
          <div style={{ color: COLORS.muted, fontSize: 8 }}>Gap to Target</div>
          <div style={{ color: gap > 0 ? COLORS.green : gap < 0 ? COLORS.red : COLORS.text, fontSize: 11, fontWeight: 900, marginTop: 3 }}>
            {gap > 0 ? "+" : ""}{fmtGapNumber(gap)}
          </div>
        </div>
        <div style={{ background: COLORS.subpanel, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "8px 9px" }}>
          <div style={{ color: COLORS.muted, fontSize: 8 }}>Sisa Hari</div>
          <div style={{ color: COLORS.text, fontSize: 11, fontWeight: 900, marginTop: 3 }}>{remainingDays} hari</div>
        </div>
        <div style={{ background: COLORS.subpanel, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "8px 9px" }}>
          <div style={{ color: COLORS.muted, fontSize: 8 }}>Target / Hari</div>
          <div style={{ color: sectionColor, fontSize: 11, fontWeight: 900, marginTop: 3 }}>{fmtGapNumber(targetPerDay)}</div>
        </div>
        <div style={{ background: COLORS.subpanel, border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "8px 9px" }}>
          <div style={{ color: COLORS.muted, fontSize: 8 }}>Time Factor</div>
          <div style={{ color: gapToTf >= 0 ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: 900, marginTop: 3 }}>{fmtPct(timeFactor)}</div>
        </div>
      </div>

      <div style={{ marginTop: 7, background: COLORS.subpanel, border: `1px solid ${gapToTf >= 0 ? COLORS.green : COLORS.red}45`, borderRadius: 9, padding: "8px 9px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ color: COLORS.muted, fontSize: 8 }}>Gap to TF</div>
          <div style={{ color: gapToTf >= 0 ? COLORS.green : COLORS.red, fontSize: 11, fontWeight: 900, marginTop: 3 }}>{gapToTf >= 0 ? "+" : ""}{fmtPct(gapToTf)}</div>
        </div>
        <div style={{ color: gapToTf >= 0 ? COLORS.green : COLORS.red, fontSize: 8, fontWeight: 800, textAlign: "right" }}>
          {gapToTf >= 0 ? "Di atas Time Factor" : "Di bawah Time Factor"}
        </div>
      </div>

      <div style={{ marginTop: 10, color: COLORS.muted, fontSize: 9 }}>
        ⓘ Bobot: {weight}% dari total Penawaran Langsung
      </div>
    </section>
  );
}

function PerformanceCards({ pwp, psm, sg }) {
  const card = (label, stat, baseColor) => {
    const achievement = Number(stat?.achievement || 0);
    const accent = performanceColor(achievement);
    const gap = Number(stat?.gap || 0);
    const targetPerDay = Number(stat?.targetPerDay || 0);
    return (
      <div style={{ background: `radial-gradient(circle at 100% 0%, ${accent}18 0%, transparent 60%), ${COLORS.panel}`, border: `1px solid ${accent}75`, borderRadius: 12, padding: "10px 10px 9px", boxShadow: `0 0 14px ${accent}10` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: baseColor, fontSize: 12, fontWeight: 900 }}>
          {label}<span style={{ marginLeft: "auto", color: COLORS.muted, fontSize: 14 }}>›</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 1px minmax(0,1fr)", gap: 8, marginTop: 9 }}>
          <div>
            <div style={{ color: COLORS.muted, fontSize: 8 }}>Gap</div>
            <div style={{ color: gap >= 0 ? COLORS.green : COLORS.red, fontSize: 14, fontWeight: 900, marginTop: 4, whiteSpace: "nowrap" }}>{gap > 0 ? "+" : ""}{fmtGapNumber(gap)}</div>
          </div>
          <div style={{ width: 1, background: COLORS.border }} />
          <div>
            <div style={{ color: COLORS.muted, fontSize: 8 }}>Target / Hari</div>
            <div style={{ color: accent, fontSize: 14, fontWeight: 900, marginTop: 4, whiteSpace: "nowrap" }}>{targetPerDay > 0 ? "+" : ""}{fmtGapNumber(targetPerDay)}</div>
            <div style={{ color: COLORS.muted, fontSize: 7, marginTop: 2 }}>unit / hari</div>
          </div>
        </div>
      </div>
    );
  };
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12 }}>
    {card("PWP", pwp, COLORS.purple)}
    {card("PSM", psm, COLORS.orange)}
    {card("Serba Gratis", sg, COLORS.yellow)}
  </div>;
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
        background: COLORS.subpanel,
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: 10,
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
            {fmtPct(achievement)}
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
            {fmtPct(contribution)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectSummary({ value }) {
  const percentage = Number(value || 0);

  return (
    <section
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.green}45`,
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 72px 72px 76px",
          gap: 6,
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            lineHeight: 1.25,
          }}
        >
          Penawaran Langsung
          <div
            style={{
              color: COLORS.green,
              fontSize: 9,
              fontWeight: 800,
              marginTop: 3,
            }}
          >
            (%)
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            color: COLORS.muted,
            fontSize: 8,
          }}
        >
          100%
        </div>

        <div
          style={{
            textAlign: "center",
            color: statusColor(percentage),
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {fmtPct(percentage)}
        </div>

        <div
          style={{
            textAlign: "center",
            color: statusColor(percentage),
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {fmtPct(percentage)}
        </div>
      </div>

      <div
        style={{
          color: COLORS.muted,
          fontSize: 8,
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        Ringkasan APC 25% + PWP 25% + PSM 20% + SG 30%.
      </div>
    </section>
  );
}

/* =====================================================
   TARGET
===================================================== */

function TargetInput({ value, onChange }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min="0"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value)
      }
      style={{
        width: "100%",
        height: 34,
        boxSizing: "border-box",
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.subpanel,
        color: COLORS.text,
        textAlign: "center",
        fontSize: 11,
        padding: 0,
        outline: "none",
      }}
    />
  );
}

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

function TargetMetricRow({
  label,
  value,
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

function TargetPage({
  apc,
  pwp,
  psm,
  sg,
  targetPeriod,
  currentMonthKey,
  previousMonthKey,
  setTargetPeriod,
  updateApc,
  updateRows,
}) {
  const selectedTargetMonth =
    targetPeriod === "current"
      ? currentMonthKey
      : previousMonthKey;

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

      <section
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Periode Target
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(0,1fr))",
            gap: 8,
          }}
        >
          <button
            onClick={() =>
              setTargetPeriod("current")
            }
            style={{
              height: 44,
              borderRadius: 9,
              border: `1px solid ${
                targetPeriod === "current"
                  ? COLORS.blue
                  : COLORS.border
              }`,
              background:
                targetPeriod === "current"
                  ? `${COLORS.blue}18`
                  : "#0b1221",
              color:
                targetPeriod === "current"
                  ? COLORS.blue
                  : COLORS.muted,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            Periode Berjalan

            <div
              style={{
                fontSize: 8,
                marginTop: 2,
              }}
            >
              {monthLabel(currentMonthKey)}
            </div>
          </button>

          <button
            onClick={() =>
              setTargetPeriod("previous")
            }
            style={{
              height: 44,
              borderRadius: 9,
              border: `1px solid ${
                targetPeriod === "previous"
                  ? COLORS.purple
                  : COLORS.border
              }`,
              background:
                targetPeriod === "previous"
                  ? `${COLORS.purple}18`
                  : "#0b1221",
              color:
                targetPeriod === "previous"
                  ? COLORS.purple
                  : COLORS.muted,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            Bulan Lalu

            <div
              style={{
                fontSize: 8,
                marginTop: 2,
              }}
            >
              {monthLabel(previousMonthKey)}
            </div>
          </button>
        </div>

        <div
          style={{
            color: COLORS.muted,
            fontSize: 8,
            marginTop: 8,
          }}
        >
          Target yang sedang diedit:{" "}
          <strong style={{ color: COLORS.text }}>
            {monthLabel(selectedTargetMonth)}
          </strong>
        </div>
      </section>

      <TargetSection
        title="APC"
        weight={25}
        icon="◎"
      >
        <TargetMetricRow
          label="APC"
          value={apc.target}
          onChange={updateApc}
        />
      </TargetSection>

      <TargetSection
        title="PWP"
        weight={25}
        icon="🎁"
        badge="PWP 1 + PWP 2"
      >
        {pwp.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
            onChange={(value) =>
              updateRows("pwp", index, value)
            }
          />
        ))}
      </TargetSection>

      <TargetSection
        title="PSM"
        weight={20}
        icon="♟"
        badge="PSM 1 + PSM 2 + PSM 3 + PSM 4"
      >
        {psm.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
            onChange={(value) =>
              updateRows("psm", index, value)
            }
          />
        ))}
      </TargetSection>

      <TargetSection
        title="Serba Gratis"
        weight={30}
        icon="●"
        badge="SG 1 + SG 2"
      >
        {sg.map((row, index) => (
          <TargetMetricRow
            key={`${row.label}-${index}`}
            label={row.label}
            value={row.target}
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
   RIWAYAT
===================================================== */

const HISTORY_FIELDS = [
  { key: "apc", label: "APC", color: COLORS.blue },
  { key: "pwp1", label: "PWP 1", color: COLORS.purple },
  { key: "pwp2", label: "PWP 2", color: COLORS.purple },
  { key: "psm1", label: "PSM 1", color: COLORS.orange },
  { key: "psm2", label: "PSM 2", color: COLORS.orange },
  { key: "psm3", label: "PSM 3", color: COLORS.orange },
  { key: "psm4", label: "PSM 4", color: COLORS.orange },
  { key: "sg1", label: "SG 1", color: COLORS.yellow },
  { key: "sg2", label: "SG 2", color: COLORS.yellow },
];

function getHistoryPeriod(dateString) {
  const day = Number(String(dateString || "").slice(8, 10));

  if (!day || day < 1 || day > 31) {
    return {
      pwpKey: "pwp1",
      pwpLabel: "PWP 1",
      psmKey: "psm1",
      psmLabel: "PSM 1",
      sgKey: "sg1",
      sgLabel: "SG 1",
    };
  }

  if (day <= 7) {
    return {
      pwpKey: "pwp1",
      pwpLabel: "PWP 1",
      psmKey: "psm1",
      psmLabel: "PSM 1",
      sgKey: "sg1",
      sgLabel: "SG 1",
    };
  }

  if (day <= 15) {
    return {
      pwpKey: "pwp1",
      pwpLabel: "PWP 1",
      psmKey: "psm2",
      psmLabel: "PSM 2",
      sgKey: "sg1",
      sgLabel: "SG 1",
    };
  }

  if (day <= 22) {
    return {
      pwpKey: "pwp2",
      pwpLabel: "PWP 2",
      psmKey: "psm3",
      psmLabel: "PSM 3",
      sgKey: "sg2",
      sgLabel: "SG 2",
    };
  }

  return {
    pwpKey: "pwp2",
    pwpLabel: "PWP 2",
    psmKey: "psm4",
    psmLabel: "PSM 4",
    sgKey: "sg2",
    sgLabel: "SG 2",
  };
}

function emptyHistoryForm() {
  return {
    date: localDateString(),
    shift: "1",
    cashier: "",
    apcValue: 0,
    pwpValue: 0,
    psmValue: 0,
    sgValue: 0,
  };
}

function HistoryInput({
  label,
  value,
  color,
  onChange,
}) {
  return (
    <div
      style={{
        background: COLORS.subpanel,
        border: `1px solid ${color}35`,
        borderRadius: 10,
        padding: 10,
      }}
    >
      <div
        style={{
          color: COLORS.text,
          fontSize: 10,
          fontWeight: 800,
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value ?? 0}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={{
          width: "100%",
          height: 38,
          boxSizing: "border-box",
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          background: "#080d19",
          color: COLORS.text,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 800,
          outline: "none",
        }}
      />
    </div>
  );
}

function HistorySection({
  title,
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
        marginTop: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 8,
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
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            {title}
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

function HistoryPage({
  history,
  form,
  setForm,
  editingId,
  onSave,
  onDelete,
  onEdit,
  onCancelEdit,
}) {
  const period = getHistoryPeriod(form.date);

  function setValue(key, value) {
    setForm({
      ...form,
      [key]: Number(value) || 0,
    });
  }

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
          Riwayat
        </div>

        <div
          style={{
            color: COLORS.muted,
            fontSize: 10,
            marginTop: 4,
          }}
        >
          Input pencapaian berdasarkan tanggal,
          shift, dan kasir.
        </div>
      </div>

      <section
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          {editingId
            ? "Edit Pencapaian"
            : "Tambah Pencapaian"}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              color: COLORS.muted,
              fontSize: 9,
              marginBottom: 6,
            }}
          >
            Tanggal
          </div>

          <input
            type="date"
            value={form.date || ""}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            style={{
              width: "100%",
              height: 40,
              boxSizing: "border-box",
              borderRadius: 9,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.subpanel,
              color: COLORS.text,
              padding: "0 10px",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0,1fr) minmax(0,1.4fr)",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                color: COLORS.muted,
                fontSize: 9,
                marginBottom: 6,
              }}
            >
              Shift
            </div>

            <select
              value={form.shift || "1"}
              onChange={(e) =>
                setForm({
                  ...form,
                  shift: e.target.value,
                })
              }
              style={{
                width: "100%",
                height: 40,
                boxSizing: "border-box",
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.subpanel,
                color: COLORS.text,
                padding: "0 10px",
                outline: "none",
              }}
            >
              <option value="1">Shift 1</option>
              <option value="2">Shift 2</option>
              <option value="3">Shift 3</option>
            </select>
          </div>

          <div>
            <div
              style={{
                color: COLORS.muted,
                fontSize: 9,
                marginBottom: 6,
              }}
            >
              Nama Kasir
            </div>

            <input
              type="text"
              value={form.cashier || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  cashier: e.target.value,
                })
              }
              placeholder="Nama kasir"
              style={{
                width: "100%",
                height: 40,
                boxSizing: "border-box",
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.subpanel,
                color: COLORS.text,
                padding: "0 10px",
                outline: "none",
                fontSize: 11,
              }}
            />
          </div>
        </div>
      </section>

      <HistorySection
        title="APC"
        icon="◎"
        badge="Otomatis berdasarkan tanggal"
      >
        <HistoryInput
          label="APC"
          value={form.apcValue}
          onChange={(value) =>
            setValue("apcValue", value)
          }
        />
      </HistorySection>

      <HistorySection
        title="PWP"
        icon="🎁"
        badge={`${period.pwpLabel} · otomatis`}
      >
        <HistoryInput
          label={period.pwpLabel}
          value={form.pwpValue}
          onChange={(value) =>
            setValue("pwpValue", value)
          }
        />
      </HistorySection>

      <HistorySection
        title="PSM"
        icon="♟"
        badge={`${period.psmLabel} · otomatis`}
      >
        <HistoryInput
          label={period.psmLabel}
          value={form.psmValue}
          onChange={(value) =>
            setValue("psmValue", value)
          }
        />
      </HistorySection>

      <HistorySection
        title="Serba Gratis"
        icon="●"
        badge={`${period.sgLabel} · otomatis`}
      >
        <HistoryInput
          label={period.sgLabel}
          value={form.sgValue}
          onChange={(value) =>
            setValue("sgValue", value)
          }
        />
      </HistorySection>

      <div
        style={{
          color: COLORS.muted,
          fontSize: 9,
          lineHeight: 1.6,
          marginTop: 10,
          padding: "0 2px",
        }}
      >
        Periode ditentukan otomatis dari tanggal:
        PWP & SG tanggal 1–15 / 16–akhir bulan,
        sedangkan PSM tanggal 1–7 / 8–15 / 16–22 /
        23–akhir bulan.
      </div>

      <button
        onClick={onSave}
        style={{
          width: "100%",
          height: 46,
          marginTop: 12,
          border: "none",
          borderRadius: 10,
          background: COLORS.blue,
          color: "#06101f",
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {editingId
          ? "✓ SIMPAN PERUBAHAN"
          : "+ SIMPAN PENCAPAIAN"}
      </button>

      {editingId && (
        <button
          onClick={onCancelEdit}
          style={{
            width: "100%",
            height: 42,
            marginTop: 8,
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            background: "transparent",
            color: COLORS.muted,
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          BATAL EDIT
        </button>
      )}

      <section
        style={{
          background: COLORS.panel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 14,
          marginTop: 14,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          Data Pencapaian
        </div>

        {history.length === 0 ? (
          <div
            style={{
              color: COLORS.muted,
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            Belum ada pencapaian.
            <br />
            Masukkan pencapaian menggunakan form di
            atas.
          </div>
        ) : (
          [...history]
            .sort((a, b) => {
              const dateCompare = String(
                b.date || ""
              ).localeCompare(
                String(a.date || "")
              );

              if (dateCompare !== 0) {
                return dateCompare;
              }

              return (
                Number(b.id || 0) -
                Number(a.id || 0)
              );
            })
            .map((item, index) => {
              const itemPeriod =
                getHistoryPeriod(item.date);

              return (
                <div
                  key={item.id || index}
                  style={{
                    borderTop:
                      index === 0
                        ? "none"
                        : `1px dotted ${COLORS.border}`,
                    padding:
                      index === 0
                        ? "0 0 14px"
                        : "14px 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {formatDate(item.date)}
                      </div>

                      <div
                        style={{
                          color: COLORS.purple,
                          fontSize: 9,
                          fontWeight: 800,
                          marginTop: 3,
                        }}
                      >
                        Shift {item.shift || "-"}
                        {" · "}
                        {item.cashier ||
                          "Nama kasir belum diisi"}
                      </div>

                      <div
                        style={{
                          color: COLORS.muted,
                          fontSize: 9,
                          marginTop: 5,
                          lineHeight: 1.6,
                        }}
                      >
                        APC {fmt(item.apc)}
                        {" · "}
                        {itemPeriod.pwpLabel}{" "}
                        {fmt(
                          Number(
                            item[itemPeriod.pwpKey] || 0
                          )
                        )}
                        {" · "}
                        {itemPeriod.psmLabel}{" "}
                        {fmt(
                          Number(
                            item[itemPeriod.psmKey] || 0
                          )
                        )}
                        {" · "}
                        {itemPeriod.sgLabel}{" "}
                        {fmt(
                          Number(
                            item[itemPeriod.sgKey] || 0
                          )
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() =>
                          onEdit(item)
                        }
                        style={{
                          border:
                            `1px solid ${COLORS.blue}55`,
                          background:
                            `${COLORS.blue}15`,
                          color: COLORS.blue,
                          borderRadius: 8,
                          padding: "7px 8px",
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          onDelete(item.id)
                        }
                        style={{
                          border:
                            `1px solid ${COLORS.red}55`,
                          background:
                            `${COLORS.red}15`,
                          color: COLORS.red,
                          borderRadius: 8,
                          padding: "7px 8px",
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </section>
    </div>
  );
}

/* =====================================================
   APP
===================================================== */


function downloadBackup(data) {
  const backup = {
    app: "Sales Tracker",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = localDateString();

  a.href = url;
  a.download = `sales-tracker-backup-${date}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function readBackupFile(file, onSuccess) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      let restoredData = parsed?.data;

      // Support backup format that directly contains app state.
      if (!restoredData && parsed?.history) {
        restoredData = parsed;
      }

      if (
        !restoredData ||
        typeof restoredData !== "object"
      ) {
        throw new Error("Format backup tidak valid.");
      }

      if (!Array.isArray(restoredData.history)) {
        throw new Error("Data riwayat tidak ditemukan.");
      }

      onSuccess(restoredData);
    } catch (error) {
      window.alert(
        "Backup tidak valid atau file rusak.\n\nData yang sekarang tetap aman."
      );
    }
  };

  reader.onerror = () => {
    window.alert(
      "File backup tidak dapat dibaca.\n\nData yang sekarang tetap aman."
    );
  };

  reader.readAsText(file);
}

export default function App() {
  const [state, setState] = useState(() =>
    loadState()
  );

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [historyForm, setHistoryForm] =
    useState(emptyHistoryForm());

  const [editingId, setEditingId] =
    useState(null);

  const [dashboardPeriod, setDashboardPeriod] =
    useState("current");

  const [targetPeriod, setTargetPeriod] =
    useState("current");

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("sales-tracker-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  applyTheme(theme);

  const restoreInputRef = useRef(null);

  const currentMonthKey =
    getCurrentMonthKey();

  const previousMonthKey =
    getPreviousMonthKey();

  const history = Array.isArray(state.history)
    ? state.history
    : [];

  /* =====================================================
     TARGET PER BULAN
  ===================================================== */

  const selectedTargetMonth =
    targetPeriod === "current"
      ? currentMonthKey
      : previousMonthKey;

  const selectedTargetData = useMemo(() => {
    const stored =
      state.targetsByMonth?.[
        selectedTargetMonth
      ];

    if (stored?.penawaran) {
      return normalizePenawaran(
        stored.penawaran
      );
    }

    if (
      selectedTargetMonth ===
        currentMonthKey &&
      state.penawaran
    ) {
      return normalizePenawaran(
        state.penawaran
      );
    }

    return normalizePenawaran(null);
  }, [
    state.targetsByMonth,
    state.penawaran,
    selectedTargetMonth,
    currentMonthKey,
  ]);

  const apc =
    selectedTargetData.apc || {
      achieved: 0,
      target: 0,
    };

  const pwp = Array.isArray(
    selectedTargetData.pwp
  )
    ? selectedTargetData.pwp
    : [];

  const psm = Array.isArray(
    selectedTargetData.psm
  )
    ? selectedTargetData.psm
    : [];

  const sg = Array.isArray(
    selectedTargetData.sg
  )
    ? selectedTargetData.sg
    : [];

  /* =====================================================
     DASHBOARD PERIODE
  ===================================================== */

  const selectedMonthKey =
    dashboardPeriod === "current"
      ? currentMonthKey
      : previousMonthKey;

  const dashboardTargetData = useMemo(() => {
    const stored =
      state.targetsByMonth?.[
        selectedMonthKey
      ];

    if (stored?.penawaran) {
      return normalizePenawaran(
        stored.penawaran
      );
    }

    if (
      selectedMonthKey === currentMonthKey &&
      state.penawaran
    ) {
      return normalizePenawaran(
        state.penawaran
      );
    }

    return normalizePenawaran(null);
  }, [
    state.targetsByMonth,
    state.penawaran,
    selectedMonthKey,
    currentMonthKey,
  ]);

  const dashboardHistory = useMemo(() => {
    return history.filter(
      (item) =>
        getMonthKey(item.date) ===
        selectedMonthKey
    );
  }, [history, selectedMonthKey]);

  /* =====================================================
     HITUNG PENCAPAIAN
  ===================================================== */

  const periodAchievements = useMemo(() => {
    const totals = {
      apc: 0,
      pwp1: 0,
      pwp2: 0,
      psm1: 0,
      psm2: 0,
      psm3: 0,
      psm4: 0,
      sg1: 0,
      sg2: 0,
    };

    dashboardHistory.forEach((item) => {
      totals.apc += Number(item.apc || 0);
      totals.pwp1 += Number(item.pwp1 || 0);
      totals.pwp2 += Number(item.pwp2 || 0);
      totals.psm1 += Number(item.psm1 || 0);
      totals.psm2 += Number(item.psm2 || 0);
      totals.psm3 += Number(item.psm3 || 0);
      totals.psm4 += Number(item.psm4 || 0);
      totals.sg1 += Number(item.sg1 || 0);
      totals.sg2 += Number(item.sg2 || 0);
    });

    return totals;
  }, [dashboardHistory]);

  /* =====================================================
     DATA DASHBOARD
  ===================================================== */

  const dashboardApc = useMemo(
    () => ({
      ...dashboardTargetData.apc,
      achieved:
        periodAchievements.apc,
    }),
    [
      dashboardTargetData.apc,
      periodAchievements.apc,
    ]
  );

  const dashboardPwp = useMemo(
    () =>
      dashboardTargetData.pwp.map(
        (row, index) => ({
          ...row,
          achieved:
            index === 0
              ? periodAchievements.pwp1
              : periodAchievements.pwp2,
        })
      ),
    [
      dashboardTargetData.pwp,
      periodAchievements.pwp1,
      periodAchievements.pwp2,
    ]
  );

  const dashboardPsm = useMemo(
    () =>
      dashboardTargetData.psm.map(
        (row, index) => ({
          ...row,
          achieved:
            index === 0
              ? periodAchievements.psm1
              : index === 1
              ? periodAchievements.psm2
              : index === 2
              ? periodAchievements.psm3
              : periodAchievements.psm4,
        })
      ),
    [
      dashboardTargetData.psm,
      periodAchievements.psm1,
      periodAchievements.psm2,
      periodAchievements.psm3,
      periodAchievements.psm4,
    ]
  );

  const dashboardSg = useMemo(
    () =>
      dashboardTargetData.sg.map(
        (row, index) => ({
          ...row,
          achieved:
            index === 0
              ? periodAchievements.sg1
              : periodAchievements.sg2,
        })
      ),
    [
      dashboardTargetData.sg,
      periodAchievements.sg1,
      periodAchievements.sg2,
    ]
  );

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
      dashboardApc.achieved,
      dashboardApc.target
    );

    return {
      apc: {
        achievement: apcAchievement,
        contribution:
          (apcAchievement * 25) / 100,
      },

      pwp: calc(dashboardPwp, 25),
      psm: calc(dashboardPsm, 20),
      sg: calc(dashboardSg, 30),
    };
  }, [
    dashboardApc,
    dashboardPwp,
    dashboardPsm,
    dashboardSg,
  ]);

  /* =====================================================
     DETAIL GAP & TIME FACTOR DASHBOARD
  ===================================================== */

  const dashboardTimeFactor = getTimeFactor(selectedMonthKey);
  const dashboardRemainingDays = getRemainingDays(selectedMonthKey);

  const sectionStats = {
    apc: {
      target: Number(dashboardApc.target || 0),
      achieved: Number(dashboardApc.achieved || 0),
      achievement: kpi.apc.achievement,
    },
    pwp: {
      target: dashboardPwp.reduce((s, x) => s + Number(x.target || 0), 0),
      achieved: dashboardPwp.reduce((s, x) => s + Number(x.achieved || 0), 0),
      achievement: kpi.pwp.achievement,
    },
    psm: {
      target: dashboardPsm.reduce((s, x) => s + Number(x.target || 0), 0),
      achieved: dashboardPsm.reduce((s, x) => s + Number(x.achieved || 0), 0),
      achievement: kpi.psm.achievement,
    },
    sg: {
      target: dashboardSg.reduce((s, x) => s + Number(x.target || 0), 0),
      achieved: dashboardSg.reduce((s, x) => s + Number(x.achieved || 0), 0),
      achievement: kpi.sg.achievement,
    },
  };

  Object.values(sectionStats).forEach((item) => {
    item.gap = item.target - item.achieved;
    item.targetPerDay = dashboardRemainingDays > 0
      ? Math.max(0, item.gap) / dashboardRemainingDays
      : 0;
  });

  /* =====================================================
     COMMIT
  ===================================================== */

  function commit(next) {
    setState(next);
    saveState(next);
  }

  /* =====================================================
     UPDATE TARGET APC
  ===================================================== */

  function updateApc(value) {
    const currentTarget =
      normalizePenawaran(
        state.targetsByMonth?.[
          selectedTargetMonth
        ]?.penawaran
      );

    const nextPenawaran = {
      ...currentTarget,

      apc: {
        ...currentTarget.apc,
        target:
          Number(value) || 0,
      },
    };

    const next = {
      ...state,

      targetsByMonth: {
        ...(state.targetsByMonth || {}),

        [selectedTargetMonth]: {
          ...(state.targetsByMonth?.[
            selectedTargetMonth
          ] || {}),

          penawaran: nextPenawaran,
        },
      },

      penawaran:
        selectedTargetMonth ===
        currentMonthKey
          ? nextPenawaran
          : state.penawaran,
    };

    commit(next);
  }

  /* =====================================================
     UPDATE TARGET PWP / PSM / SG
  ===================================================== */

  function updateRows(
    type,
    index,
    value
  ) {
    const currentTarget =
      normalizePenawaran(
        state.targetsByMonth?.[
          selectedTargetMonth
        ]?.penawaran
      );

    const nextRows =
      currentTarget[type].map(
        (item, i) =>
          i === index
            ? {
                ...item,
                target:
                  Number(value) || 0,
              }
            : item
      );

    const nextPenawaran = {
      ...currentTarget,
      [type]: nextRows,
    };

    const next = {
      ...state,

      targetsByMonth: {
        ...(state.targetsByMonth || {}),

        [selectedTargetMonth]: {
          ...(state.targetsByMonth?.[
            selectedTargetMonth
          ] || {}),

          penawaran: nextPenawaran,
        },
      },

      penawaran:
        selectedTargetMonth ===
        currentMonthKey
          ? nextPenawaran
          : state.penawaran,
    };

    commit(next);
  }

  /* =====================================================
     SIMPAN RIWAYAT
  ===================================================== */

  function saveHistory() {
    if (!historyForm.date) {
      window.alert("Tanggal belum diisi.");
      return;
    }

    if (!historyForm.cashier.trim()) {
      window.alert("Nama kasir belum diisi.");
      return;
    }

    const period = getHistoryPeriod(
      historyForm.date
    );

    const periodValues = {
      apc: 0,
      pwp1: 0,
      pwp2: 0,
      psm1: 0,
      psm2: 0,
      psm3: 0,
      psm4: 0,
      sg1: 0,
      sg2: 0,
    };

    /*
      Satu kolom input per indikator.
      Periode tujuan ditentukan otomatis dari tanggal.
    */
    periodValues.apc = Number(
      historyForm.apcValue ?? 0
    );

    periodValues[period.pwpKey] = Number(
      historyForm.pwpValue ?? historyForm.value ?? 0
    );
    periodValues[period.psmKey] = Number(
      historyForm.psmValue ?? historyForm.value ?? 0
    );
    periodValues[period.sgKey] = Number(
      historyForm.sgValue ?? historyForm.value ?? 0
    );

    const itemData = {
      date: historyForm.date,
      shift: historyForm.shift || "1",
      cashier: historyForm.cashier.trim(),
      ...periodValues,
    };

    let nextHistory;

    if (editingId) {
      nextHistory = history.map((item) =>
        item.id === editingId
          ? {
              ...itemData,
              id: editingId,
            }
          : item
      );
    } else {
      nextHistory = [
        ...history,
        {
          ...itemData,
          id: Date.now(),
        },
      ];
    }

    commit({
      ...state,
      history: nextHistory,
    });

    setHistoryForm(emptyHistoryForm());
    setEditingId(null);

    window.alert(
      editingId
        ? "Pencapaian berhasil diperbarui."
        : "Pencapaian berhasil disimpan."
    );
  }

  /* =====================================================
     EDIT RIWAYAT
  ===================================================== */

  function editHistory(item) {
    const period = getHistoryPeriod(
      item.date || localDateString()
    );

    setHistoryForm({
      date:
        item.date ||
        localDateString(),

      shift:
        item.shift || "1",

      cashier:
        item.cashier || "",

      apcValue: Number(item.apc || 0),

      pwpValue: Number(
        item[period.pwpKey] || 0
      ),

      psmValue: Number(
        item[period.psmKey] || 0
      ),

      sgValue: Number(
        item[period.sgKey] || 0
      ),
    });

    setEditingId(item.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     BATAL EDIT
  ===================================================== */

  function cancelEdit() {
    setEditingId(null);
    setHistoryForm(emptyHistoryForm());
  }

  /* =====================================================
     HAPUS RIWAYAT
  ===================================================== */

  function deleteHistory(id) {
    if (
      !window.confirm(
        "Hapus pencapaian ini?"
      )
    ) {
      return;
    }

    const nextHistory =
      history.filter(
        (item) => item.id !== id
      );

    commit({
      ...state,
      history: nextHistory,
    });

    if (editingId === id) {
      setEditingId(null);
      setHistoryForm(emptyHistoryForm());
    }
  }

  /* =====================================================
     BACKUP & RESTORE
  ===================================================== */

  function handleBackup() {
    try {
      downloadBackup(state);
      window.alert(
        "Backup data berhasil dibuat."
      );
    } catch (error) {
      window.alert(
        "Gagal membuat backup data."
      );
    }
  }

  function handleRestoreClick() {
    restoreInputRef.current?.click();
  }

  function handleRestoreFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    readBackupFile(file, (restoredData) => {
      const confirmed = window.confirm(
        "Restore data dari file ini?\n\n" +
        "Data Sales Tracker yang sekarang akan " +
        "digantikan oleh data backup."
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      try {
        /*
          Lewat saveState + loadState supaya normalisasi
          dan aturan retensi 2 periode tetap berlaku.
        */
        saveState(restoredData);

        const restored = loadState();

        setState(restored);
        setHistoryForm(emptyHistoryForm());
        setEditingId(null);
        setDashboardPeriod("current");
        setTargetPeriod("current");

        window.alert(
          "Data berhasil direstore."
        );
      } catch (error) {
        window.alert(
          "Restore gagal.\n\nData yang sekarang tetap aman."
        );
      }

      event.target.value = "";
    });
  }

  /* =====================================================
     RESET
  ===================================================== */

  function handleReset() {
    if (
      !window.confirm(
        "Reset semua data Sales Tracker?\n\nSemua target dan riwayat akan dihapus."
      )
    ) {
      return;
    }

    const fresh = resetState();

    setState(fresh);
    setHistoryForm(emptyHistoryForm());
    setEditingId(null);
    setDashboardPeriod("current");
    setTargetPeriod("current");

    window.alert(
      "Semua data berhasil direset."
    );
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

      <header style={{ padding: "18px 18px 12px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Sales Tracker</div>
            <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 3 }}>Monitoring Penawaran & Pencapaian</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              applyTheme(next);
              try { localStorage.setItem("sales-tracker-theme", next); } catch {}
            }}
            aria-label="Ganti mode tampilan"
            style={{ width: 42, height: 34, borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.panel, color: COLORS.text, fontSize: 17, cursor: "pointer", flexShrink: 0 }}
          >{theme === "dark" ? "☀️" : "🌙"}</button>
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
            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Periode Dashboard
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2,minmax(0,1fr))",
                  gap: 8,
                }}
              >
                <button
                  onClick={() =>
                    setDashboardPeriod("current")
                  }
                  style={{
                    height: 40,
                    borderRadius: 9,
                    border:
                      `1px solid ${
                        dashboardPeriod ===
                        "current"
                          ? COLORS.blue
                          : COLORS.border
                      }`,
                    background:
                      dashboardPeriod ===
                      "current"
                        ? `${COLORS.blue}18`
                        : "#0b1221",
                    color:
                      dashboardPeriod ===
                      "current"
                        ? COLORS.blue
                        : COLORS.muted,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  Periode Berjalan

                  <div
                    style={{
                      fontSize: 8,
                      marginTop: 2,
                    }}
                  >
                    {monthLabel(
                      currentMonthKey
                    )}
                  </div>
                </button>

                <button
                  onClick={() =>
                    setDashboardPeriod("previous")
                  }
                  style={{
                    height: 40,
                    borderRadius: 9,
                    border:
                      `1px solid ${
                        dashboardPeriod ===
                        "previous"
                          ? COLORS.purple
                          : COLORS.border
                      }`,
                    background:
                      dashboardPeriod ===
                      "previous"
                        ? `${COLORS.purple}18`
                        : "#0b1221",
                    color:
                      dashboardPeriod ===
                      "previous"
                        ? COLORS.purple
                        : COLORS.muted,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  Bulan Lalu

                  <div
                    style={{
                      fontSize: 8,
                      marginTop: 2,
                    }}
                  >
                    {monthLabel(
                      previousMonthKey
                    )}
                  </div>
                </button>
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 8,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                Menampilkan pencapaian{" "}
                {monthLabel(
                  selectedMonthKey
                )}
                . Target mengikuti target
                bulan tersebut.
              </div>
            </section>

            <DirectSummary
              value={
                kpi.apc.contribution +
                kpi.pwp.contribution +
                kpi.psm.contribution +
                kpi.sg.contribution
              }
            />

            <PerformanceCards
              pwp={sectionStats.pwp}
              psm={sectionStats.psm}
              sg={sectionStats.sg}
            />

            <Section
              id="apc"
              number="1"
              title="APC"
              weight={25}
              icon="◎"
              achievement={sectionStats.apc.achievement}
              }
              gap={sectionStats.apc.gap}
              remainingDays={dashboardRemainingDays}
              targetPerDay={sectionStats.apc.targetPerDay}
              timeFactor={dashboardTimeFactor}
            >
              <ApcRow data={dashboardApc} />
            </Section>

            <Section
              id="pwp"
              number="2"
              title="PWP"
              weight={25}
              badge="Akumulasi PWP 1 + PWP 2"
              icon="🎁"
              achievement={sectionStats.pwp.achievement}
              }
              gap={sectionStats.pwp.gap}
              remainingDays={dashboardRemainingDays}
              targetPerDay={sectionStats.pwp.targetPerDay}
              timeFactor={dashboardTimeFactor}
            >
              <MetricRows
                rows={dashboardPwp}
                weight={25}
              />
            </Section>

            <Section
              id="psm"
              number="3"
              title="PSM"
              weight={20}
              badge="Akumulasi PSM 1 + PSM 2 + PSM 3 + PSM 4"
              icon="♟"
              achievement={sectionStats.psm.achievement}
              }
              gap={sectionStats.psm.gap}
              remainingDays={dashboardRemainingDays}
              targetPerDay={sectionStats.psm.targetPerDay}
              timeFactor={dashboardTimeFactor}
            >
              <MetricRows
                rows={dashboardPsm}
                weight={20}
              />
            </Section>

            <Section
              id="sg"
              number="4"
              title="Serba Gratis"
              weight={30}
              badge="Akumulasi SG 1 + SG 2"
              icon="●"
              achievement={sectionStats.sg.achievement}
              }
              gap={sectionStats.sg.gap}
              remainingDays={dashboardRemainingDays}
              targetPerDay={sectionStats.sg.targetPerDay}
              timeFactor={dashboardTimeFactor}
            >
              <MetricRows
                rows={dashboardSg}
                weight={30}
              />
            </Section>
          </>
        )}

        {/* =================================================
            RIWAYAT
        ================================================= */}

        {activeTab === "history" && (
          <HistoryPage
            history={history}
            form={historyForm}
            setForm={setHistoryForm}
            editingId={editingId}
            onSave={saveHistory}
            onDelete={deleteHistory}
            onEdit={editHistory}
            onCancelEdit={cancelEdit}
          />
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
            targetPeriod={targetPeriod}
            currentMonthKey={
              currentMonthKey
            }
            previousMonthKey={
              previousMonthKey
            }
            setTargetPeriod={
              setTargetPeriod
            }
            updateApc={updateApc}
            updateRows={updateRows}
          />
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeTab === "settings" && (
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
                Pengaturan
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                Pengaturan aplikasi dan informasi
                penyimpanan.
              </div>
            </div>

            {/* PENYIMPANAN */}

            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.blue}45`,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${COLORS.blue}18`,
                    border:
                      `1px solid ${COLORS.blue}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.blue,
                    fontSize: 18,
                  }}
                >
                  💾
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Penyimpanan Data
                  </div>

                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 9,
                      marginTop: 3,
                    }}
                  >
                    Data tersimpan secara lokal.
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: COLORS.subpanel,
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: 11,
                }}
              >
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                  }}
                >
                  Metode Penyimpanan
                </div>

                <div
                  style={{
                    color: COLORS.text,
                    fontSize: 12,
                    fontWeight: 800,
                    marginTop: 4,
                  }}
                >
                  Local Storage
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    lineHeight: 1.6,
                    marginTop: 5,
                  }}
                >
                  Data disimpan di perangkat/browser
                  ini. Saat ini aplikasi belum
                  menggunakan database online.
                </div>
              </div>
            </section>

            {/* BACKUP & RESTORE */}

            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.blue}45`,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      `${COLORS.blue}18`,
                    border:
                      `1px solid ${COLORS.blue}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.blue,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  💾
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Backup & Restore
                  </div>

                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 9,
                      marginTop: 3,
                    }}
                  >
                    Simpan atau kembalikan data aplikasi.
                  </div>
                </div>
              </div>

              <button
                onClick={handleBackup}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 9,
                  border:
                    `1px solid ${COLORS.blue}55`,
                  background:
                    `${COLORS.blue}15`,
                  color: COLORS.blue,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                ↓ BACKUP DATA
              </button>

              <button
                onClick={handleRestoreClick}
                style={{
                  width: "100%",
                  height: 44,
                  marginTop: 8,
                  borderRadius: 9,
                  border:
                    `1px solid ${COLORS.purple}55`,
                  background:
                    `${COLORS.purple}15`,
                  color: COLORS.purple,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                ↑ RESTORE DATA
              </button>

              <input
                ref={restoreInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFile}
                style={{ display: "none" }}
              />

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 8,
                  lineHeight: 1.5,
                  marginTop: 8,
                }}
              >
                Backup menyimpan target dan riwayat
                Sales Tracker dalam file .json.
                Simpan file tersebut di tempat yang aman.
              </div>
            </section>

            {/* RETENSI DATA */}

            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.purple}45`,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${COLORS.purple}18`,
                    border:
                      `1px solid ${COLORS.purple}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.purple,
                    fontSize: 18,
                  }}
                >
                  🗓️
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Retensi Data
                  </div>

                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 9,
                      marginTop: 3,
                    }}
                  >
                    Pengelolaan periode yang disimpan.
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: COLORS.subpanel,
                  border:
                    `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: 11,
                }}
              >
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                  }}
                >
                  Periode yang dipertahankan
                </div>

                <div
                  style={{
                    color: COLORS.text,
                    fontSize: 12,
                    fontWeight: 800,
                    marginTop: 4,
                  }}
                >
                  2 Periode Terakhir
                </div>

                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 9,
                    lineHeight: 1.6,
                    marginTop: 5,
                  }}
                >
                  Bulan berjalan dan bulan sebelumnya.
                  Data dari periode yang lebih lama
                  akan dihapus otomatis.
                </div>
              </div>
            </section>

            {/* RESET DATA */}

            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.red}45`,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${COLORS.red}18`,
                    border:
                      `1px solid ${COLORS.red}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.red,
                    fontSize: 18,
                  }}
                >
                  ⚠️
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Reset Data
                  </div>

                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 9,
                      marginTop: 3,
                    }}
                  >
                    Hapus seluruh data aplikasi.
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 9,
                  border:
                    `1px solid ${COLORS.red}55`,
                  background:
                    `${COLORS.red}15`,
                  color: COLORS.red,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                Reset Semua Data
              </button>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 8,
                  lineHeight: 1.5,
                  marginTop: 8,
                }}
              >
                Tindakan ini akan menghapus seluruh
                target dan riwayat yang tersimpan
                di perangkat.
              </div>
            </section>

            {/* TENTANG */}

            <section
              style={{
                background: COLORS.panel,
                border:
                  `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: 14,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                Tentang Aplikasi
              </div>

              <div
                style={{
                  color: COLORS.text,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Sales Tracker
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 9,
                  marginTop: 4,
                }}
              >
                Monitoring Penawaran & Pencapaian
              </div>

              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 9,
                  marginTop: 8,
                }}
              >
                Versi 1.0
              </div>
            </section>
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
