const STORAGE_KEY = "sales-tracker-v1";

const initialState = {
  period: {
    name: "Periode Aktif",
    startDate: "",
    endDate: ""
  },

  target: {
    psm: 0,
    pwp: 0,
    sg: 0
  },

  achieved: {
    psm: 0,
    pwp: 0,
    sg: 0
  },

  penawaran: {
    apc: {
      achieved: 0,
      target: 0
    },

    pwp: [
      { label: "PWP 1", achieved: 0, target: 0 },
      { label: "PWP 2", achieved: 0, target: 0 }
    ],

    psm: [
      { label: "PSM 1", achieved: 0, target: 0 },
      { label: "PSM 2", achieved: 0, target: 0 },
      { label: "PSM 3", achieved: 0, target: 0 },
      { label: "PSM 4", achieved: 0, target: 0 }
    ],

    sg: [
      { label: "SG 1", achieved: 0, target: 0 },
      { label: "SG 2", achieved: 0, target: 0 }
    ]
  },

  sales: [],
  history: []
};

function mergeState(saved) {
  const base = structuredClone(initialState);

  if (!saved || typeof saved !== "object") {
    return base;
  }

  return {
    ...base,
    ...saved,

    period: {
      ...base.period,
      ...(saved.period || {})
    },

    target: {
      ...base.target,
      ...(saved.target || {})
    },

    achieved: {
      ...base.achieved,
      ...(saved.achieved || {})
    },

    penawaran: {
      ...base.penawaran,
      ...(saved.penawaran || {}),

      apc: {
        ...base.penawaran.apc,
        ...(saved.penawaran?.apc || {})
      },

      pwp: saved.penawaran?.pwp || base.penawaran.pwp,
      psm: saved.penawaran?.psm || base.penawaran.psm,
      sg: saved.penawaran?.sg || base.penawaran.sg
    },

    sales: Array.isArray(saved.sales) ? saved.sales : [],
    history: Array.isArray(saved.history) ? saved.history : []
  };
}

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getPreviousMonthKey(date = new Date()) {
  const previous = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );

  return getMonthKey(previous);
}

function getHistoryMonth(item) {
  if (!item || !item.date) return null;

  const value = String(item.date);

  if (!/^\d{4}-\d{2}/.test(value)) {
    return null;
  }

  return value.slice(0, 7);
}

function cleanupOldHistory(history) {
  const currentMonth = getMonthKey();
  const previousMonth = getPreviousMonthKey();

  return history.filter((item) => {
    const month = getHistoryMonth(item);

    return month === currentMonth || month === previousMonth;
  });
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return structuredClone(initialState);
    }

    const saved = JSON.parse(raw);
    const state = mergeState(saved);

    // Simpan hanya riwayat bulan berjalan
    // dan satu bulan sebelumnya.
    const cleanedHistory = cleanupOldHistory(state.history);

    if (cleanedHistory.length !== state.history.length) {
      state.history = cleanedHistory;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    }

    return state;
  } catch {
    return structuredClone(initialState);
  }
}

export function saveState(state) {
  const nextState = mergeState(state);

  // Selalu bersihkan riwayat lama sebelum disimpan.
  nextState.history = cleanupOldHistory(nextState.history);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(nextState)
  );
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);

  return structuredClone(initialState);
}
