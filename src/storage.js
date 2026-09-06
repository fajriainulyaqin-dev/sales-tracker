const STORAGE_KEY = "sales-tracker-v1";

function localDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

function isAllowedMonth(monthKey) {
  return (
    monthKey === getCurrentMonthKey() ||
    monthKey === getPreviousMonthKey()
  );
}

const initialState = {
  period: {
    name: "Periode Aktif",
    startDate: "",
    endDate: "",
  },

  target: {
    psm: 0,
    pwp: 0,
    sg: 0,
  },

  achieved: {
    psm: 0,
    pwp: 0,
    sg: 0,
  },

  /*
    TARGET PER BULAN

    Contoh:
    targetsByMonth: {
      "2026-08": {
        penawaran: {...}
      },
      "2026-09": {
        penawaran: {...}
      }
    }
  */
  targetsByMonth: {},

  penawaran: {
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
  },

  history: [],
  sales: [],
};

function clone(value) {
  return structuredClone(value);
}

function mergePenawaran(base, saved) {
  const savedPenawaran = saved || {};

  return {
    ...clone(base),
    ...savedPenawaran,

    apc: {
      ...clone(base.apc),
      ...(savedPenawaran.apc || {}),
    },

    pwp: Array.isArray(savedPenawaran.pwp)
      ? savedPenawaran.pwp
      : clone(base.pwp),

    psm: Array.isArray(savedPenawaran.psm)
      ? savedPenawaran.psm
      : clone(base.psm),

    sg: Array.isArray(savedPenawaran.sg)
      ? savedPenawaran.sg
      : clone(base.sg),
  };
}

function cleanupTargets(targetsByMonth) {
  const cleaned = {};

  if (!targetsByMonth || typeof targetsByMonth !== "object") {
    return cleaned;
  }

  Object.entries(targetsByMonth).forEach(
    ([monthKey, monthData]) => {
      if (isAllowedMonth(monthKey)) {
        cleaned[monthKey] = monthData;
      }
    }
  );

  return cleaned;
}

function cleanupHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter((item) => {
    if (!item || !item.date) {
      return false;
    }

    const monthKey = String(item.date).slice(0, 7);

    return isAllowedMonth(monthKey);
  });
}

function mergeState(saved) {
  const base = clone(initialState);

  if (!saved || typeof saved !== "object") {
    return base;
  }

  const currentMonth = getCurrentMonthKey();

  /*
    -------------------------------------------------------
    MIGRASI DATA TARGET LAMA
    -------------------------------------------------------

    Kalau sebelumnya aplikasi masih memakai:
      state.penawaran

    kita simpan target lama sebagai target bulan berjalan.
  */

  let targetsByMonth = {};

  if (
    saved.targetsByMonth &&
    typeof saved.targetsByMonth === "object"
  ) {
    targetsByMonth = clone(saved.targetsByMonth);
  }

  if (
    !targetsByMonth[currentMonth] &&
    saved.penawaran
  ) {
    targetsByMonth[currentMonth] = {
      penawaran: mergePenawaran(
        base.penawaran,
        saved.penawaran
      ),
    };
  }

  targetsByMonth =
    cleanupTargets(targetsByMonth);

  /*
    -------------------------------------------------------
    HISTORY
    -------------------------------------------------------
  */

  const cleanedHistory =
    cleanupHistory(saved.history);

  /*
    -------------------------------------------------------
    STATE
    -------------------------------------------------------
  */

  return {
    ...base,
    ...saved,

    period: {
      ...base.period,
      ...(saved.period || {}),
    },

    target: {
      ...base.target,
      ...(saved.target || {}),
    },

    achieved: {
      ...base.achieved,
      ...(saved.achieved || {}),
    },

    targetsByMonth,

    penawaran: mergePenawaran(
      base.penawaran,
      saved.penawaran
    ),

    history: cleanedHistory,

    sales: Array.isArray(saved.sales)
      ? saved.sales
      : [],
  };
}

export function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return clone(initialState);
    }

    const parsed = JSON.parse(raw);

    const merged = mergeState(parsed);

    /*
      Simpan kembali hasil cleanup.
      Jadi data bulan yang sudah terlalu lama
      benar-benar hilang dari localStorage.
    */
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );

    return merged;
  } catch {
    return clone(initialState);
  }
}

export function saveState(state) {
  const nextState = mergeState(state);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextState)
  );
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);

  return clone(initialState);
}
