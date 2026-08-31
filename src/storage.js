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
  sales: []
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return initialState;
}