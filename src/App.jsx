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

const GRID = "minmax(0,1.35fr) 64px 64px 76px 76px";

const center = {
  textAlign: "center",
  minWidth: 0,
};

/* =====================================================
   DASHBOARD HEADER
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
   DASHBOARD METRIC ROWS
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
    <div style={{ width: "100%" }}>
      <ColumnHeader color={color} />

      {rows.map((row, index) => {
        const achievement = pct(row.achieved, row.target);
        const contribution = (achievement * weight) / 100;

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
              {achievement.toFixed(3)}%
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
              {contribution.toFixed(2)}%
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

        <div style={{ ...center, fontSize: 10, fontWeight: 800 }}>
          {fmt(totalTarget)}
        </div>

        <div style={{ ...center, fontSize: 10, fontWeight: 800 }}>
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
          {totalPct.toFixed(3)}%
        </div>

        <div
          style={{
            ...center,
            color,
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {totalContribution.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   APC DASHBOARD
===================================================== */

function ApcRow({ data }) {
  const achievement = pct(data.achieved, data.target);
  const contribution = (achievement * 25) / 100;

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
          {achievement.toFixed(3)}%
        </div>

        <div
          style={{
            ...center,
            color: COLORS.blue,
            fontSize: 10,
            fontWeight: 800,
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

        <div>
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
   MINI KPI
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
          <div style={{ fontSize: 10, fontWeight: 800 }}>
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
          <div style={{ color: COLORS.muted, fontSize: 8 }}>
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
          <div style={{ color: COLORS.muted, fontSize: 8 }}>
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
   TARGET INPUT
===================================================== */

function TargetInput({ value, onChange }) {
  return (
    <input
      type="number"
      inputMode="numeric"
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
   TARGET PAGE
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
          <div style={{ fontSize: 15, fontWeight: 800 }}>
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

function TargetMetricRow({ label, value, onChange }) {
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

      <TargetInput value={value} onChange={onChange} />
    </div>
  );
}

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
      <div style={{ marginTop: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
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

      <TargetSection
        title="APC"
        weight={25}
        color={COLORS.blue}
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
        color={COLORS.purple}
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
        color={COLORS.orange}
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
        color={COLORS.yellow}
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

function emptyHistoryForm() {
  return {
    date: localDateString(),
    shift: "1",
    cashier: "",
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
}

function HistoryInput({ label, value, color, onChange }) {
  return (
    <div
      style={{
        background: "#0d1423",
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
        onChange={(e) => onChange(e.target.value)}
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

/* =====================================================
   RIWAYAT PAGE
===================================================== */

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
          Input pencapaian berdasarkan tanggal, shift,
          dan kasir.
        </div>
      </div>

      {/* =================================================
          INFORMASI INPUT
      ================================================= */}

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
          {editingId ? "Edit Pencapaian" : "Tambah Pencapaian"}
        </div>

        {/* TANGGAL */}
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
              background: "#0b1221",
              color: COLORS.text,
              padding: "0 10px",
              outline: "none",
            }}
          />
        </div>

        {/* SHIFT + KASIR */}
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
                background: "#0b1221",
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
                background: "#0b1221",
                color: COLORS.text,
                padding: "0 10px",
                outline: "none",
                fontSize: 11,
              }}
            />
          </div>
        </div>
      </section>

      {/* APC */}
      <HistorySection
        title="APC"
        color={COLORS.blue}
        icon="◎"
      >
        <HistoryInput
          label="APC"
          value={form.apc}
          color={COLORS.blue}
          onChange={(value) =>
            setForm({
              ...form,
              apc: Number(value) || 0,
            })
          }
        />
      </HistorySection>

      {/* PWP */}
      <HistorySection
        title="PWP"
        color={COLORS.purple}
        icon="🎁"
        badge="PWP 1 + PWP 2"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(0,1fr))",
            gap: 8,
          }}
        >
          {HISTORY_FIELDS.filter(
            (field) =>
              field.key === "pwp1" ||
              field.key === "pwp2"
          ).map((field) => (
            <HistoryInput
              key={field.key}
              label={field.label}
              value={form[field.key]}
              color={field.color}
              onChange={(value) =>
                setForm({
                  ...form,
                  [field.key]:
                    Number(value) || 0,
                })
              }
            />
          ))}
        </div>
      </HistorySection>

      {/* PSM */}
      <HistorySection
        title="PSM"
        color={COLORS.orange}
        icon="♟"
        badge="PSM 1 + PSM 2 + PSM 3 + PSM 4"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(0,1fr))",
            gap: 8,
          }}
        >
          {HISTORY_FIELDS.filter((field) =>
            field.key.startsWith("psm")
          ).map((field) => (
            <HistoryInput
              key={field.key}
              label={field.label}
              value={form[field.key]}
              color={field.color}
              onChange={(value) =>
                setForm({
                  ...form,
                  [field.key]:
                    Number(value) || 0,
                })
              }
            />
          ))}
        </div>
      </HistorySection>

      {/* SG */}
      <HistorySection
        title="Serba Gratis"
        color={COLORS.yellow}
        icon="●"
        badge="SG 1 + SG 2"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,minmax(0,1fr))",
            gap: 8,
          }}
        >
          {HISTORY_FIELDS.filter((field) =>
            field.key.startsWith("sg")
          ).map((field) => (
            <HistoryInput
              key={field.key}
              label={field.label}
              value={form[field.key]}
              color={field.color}
              onChange={(value) =>
                setForm({
                  ...form,
                  [field.key]:
                    Number(value) || 0,
                })
              }
            />
          ))}
        </div>
      </HistorySection>

      {/* BUTTON */}
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

      {/* =================================================
          DAFTAR RIWAYAT
      ================================================= */}

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
            Masukkan pencapaian menggunakan form di atas.
          </div>
        ) : (
          [...history]
            .sort((a, b) => {
              const dateCompare = String(
                b.date || ""
              ).localeCompare(String(a.date || ""));

              if (dateCompare !== 0) {
                return dateCompare;
              }

              return Number(b.id || 0) - Number(a.id || 0);
            })
            .map((item, index) => (
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
                      PWP{" "}
                      {fmt(
                        Number(item.pwp1 || 0) +
                          Number(item.pwp2 || 0)
                      )}
                      {" · "}
                      PSM{" "}
                      {fmt(
                        Number(item.psm1 || 0) +
                          Number(item.psm2 || 0) +
                          Number(item.psm3 || 0) +
                          Number(item.psm4 || 0)
                      )}
                      {" · "}
                      SG{" "}
                      {fmt(
                        Number(item.sg1 || 0) +
                          Number(item.sg2 || 0)
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
            ))
        )}
      </section>
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

  const [historyForm, setHistoryForm] =
    useState(emptyHistoryForm());

  const [editingId, setEditingId] =
    useState(null);

  const [dashboardPeriod, setDashboardPeriod] =
    useState("current");

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

  const history = Array.isArray(state.history)
    ? state.history
    : [];

  /* =====================================================
     PERIODE DASHBOARD
  ===================================================== */

  const selectedMonthKey =
    dashboardPeriod === "current"
      ? getCurrentMonthKey()
      : getPreviousMonthKey();

  const selectedPeriodHistory = useMemo(() => {
    return history.filter(
      (item) =>
        getMonthKey(item.date) ===
        selectedMonthKey
    );
  }, [history, selectedMonthKey]);

  /* =====================================================
     HITUNG PENCAPAIAN PERIODE
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

    selectedPeriodHistory.forEach((item) => {
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
  }, [selectedPeriodHistory]);

  /* =====================================================
     DATA DASHBOARD PERIODE
  ===================================================== */

  const dashboardApc = useMemo(
    () => ({
      ...apc,
      achieved: periodAchievements.apc,
    }),
    [apc, periodAchievements.apc]
  );

  const dashboardPwp = useMemo(
    () =>
      pwp.map((row, index) => ({
        ...row,
        achieved:
          index === 0
            ? periodAchievements.pwp1
            : periodAchievements.pwp2,
      })),
    [
      pwp,
      periodAchievements.pwp1,
      periodAchievements.pwp2,
    ]
  );

  const dashboardPsm = useMemo(
    () =>
      psm.map((row, index) => ({
        ...row,
        achieved:
          index === 0
            ? periodAchievements.psm1
            : index === 1
            ? periodAchievements.psm2
            : index === 2
            ? periodAchievements.psm3
            : periodAchievements.psm4,
      })),
    [
      psm,
      periodAchievements.psm1,
      periodAchievements.psm2,
      periodAchievements.psm3,
      periodAchievements.psm4,
    ]
  );

  const dashboardSg = useMemo(
    () =>
      sg.map((row, index) => ({
        ...row,
        achieved:
          index === 0
            ? periodAchievements.sg1
            : periodAchievements.sg2,
      })),
    [
      sg,
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
     SAVE
  ===================================================== */

  function commit(next) {
    setState(next);
    saveState(next);
  }

  /* =====================================================
     TARGET
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

  function updateRows(type, index, value) {
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
     HITUNG ULANG PENCAPAIAN DARI SEMUA RIWAYAT
  ===================================================== */

  function rebuildAchievements(nextHistory) {
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

    nextHistory.forEach((item) => {
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

    return {
      ...state,
      history: nextHistory,

      penawaran: {
        ...state.penawaran,

        apc: {
          ...state.penawaran.apc,
          achieved: totals.apc,
        },

        pwp: state.penawaran.pwp.map(
          (row, index) => ({
            ...row,
            achieved:
              index === 0
                ? totals.pwp1
                : totals.pwp2,
          })
        ),

        psm: state.penawaran.psm.map(
          (row, index) => ({
            ...row,
            achieved:
              index === 0
                ? totals.psm1
                : index === 1
                ? totals.psm2
                : index === 2
                ? totals.psm3
                : totals.psm4,
          })
        ),

        sg: state.penawaran.sg.map(
          (row, index) => ({
            ...row,
            achieved:
              index === 0
                ? totals.sg1
                : totals.sg2,
          })
        ),
      },
    };
  }

  /* =====================================================
     SIMPAN / UPDATE RIWAYAT
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

    let nextHistory;

    if (editingId) {
      nextHistory = history.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...historyForm,
              id: editingId,
            }
          : item
      );
    } else {
      const item = {
        ...historyForm,
        id: Date.now(),
      };

      nextHistory = [
        ...history,
        item,
      ];
    }

    const nextState =
      rebuildAchievements(nextHistory);

    commit(nextState);

    setHistoryForm(
      emptyHistoryForm()
    );

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
    setHistoryForm({
      date: item.date || localDateString(),
      shift: item.shift || "1",
      cashier: item.cashier || "",
      apc: Number(item.apc || 0),
      pwp1: Number(item.pwp1 || 0),
      pwp2: Number(item.pwp2 || 0),
      psm1: Number(item.psm1 || 0),
      psm2: Number(item.psm2 || 0),
      psm3: Number(item.psm3 || 0),
      psm4: Number(item.psm4 || 0),
      sg1: Number(item.sg1 || 0),
      sg2: Number(item.sg2 || 0),
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

    const nextState =
      rebuildAchievements(nextHistory);

    commit(nextState);

    if (editingId === id) {
      setEditingId(null);
      setHistoryForm(
        emptyHistoryForm()
      );
    }
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
    setHistoryForm(
      emptyHistoryForm()
    );
    setEditingId(null);
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
            {/* PERIODE */}
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
                    setDashboardPeriod(
                      "current"
                    )
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
                      getCurrentMonthKey()
                    )}
                  </div>
                </button>

                <button
                  onClick={() =>
                    setDashboardPeriod(
                      "previous"
                    )
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
                      getPreviousMonthKey()
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
                {monthLabel(selectedMonthKey)}.
                Target mengikuti Target aktif.
              </div>
            </section>

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

            <Section
              number="1"
              title="APC vs Target"
              weight={25}
              icon="◎"
              color={COLORS.blue}
            >
              <ApcRow data={dashboardApc} />
            </Section>

            <Section
              number="2"
              title="PWP Total"
              weight={25}
              badge="Akumulasi PWP 1 + PWP 2"
              icon="🎁"
              color={COLORS.purple}
            >
              <MetricRows
                rows={dashboardPwp}
                color={COLORS.purple}
                weight={25}
              />
            </Section>

            <Section
              number="3"
              title="PSM Total"
              weight={20}
              badge="Akumulasi PSM 1 + PSM 2 + PSM 3 + PSM 4"
              icon="♟"
              color={COLORS.orange}
            >
              <MetricRows
                rows={dashboardPsm}
                color={COLORS.orange}
                weight={20}
              />
            </Section>

            <Section
              number="4"
              title="Serba Gratis Total"
              weight={30}
              badge="Akumulasi SG 1 + SG 2"
              icon="●"
              color={COLORS.yellow}
            >
              <MetricRows
                rows={dashboardSg}
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
              }}
            >
              Pengaturan aplikasi dan reset
              data.
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
