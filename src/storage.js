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

  sales: []
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
    }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return structuredClone(initialState);
    }

    return mergeState(JSON.parse(raw));
  } catch {
    return structuredClone(initialState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(initialState);
}
