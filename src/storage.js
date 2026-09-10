const STORAGE_KEY = "sales-tracker-v1";

/* =========================================================
   DATE / PERIOD
========================================================= */

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

/* =========================================================
   INITIAL STATE
========================================================= */

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
      {
        label: "PWP 1",
        achieved: 0,
        target: 0,
      },
      {
        label: "PWP 2",
        achieved: 0,
        target: 0,
      },
    ],

    psm: [
      {
        label: "PSM 1",
        achieved: 0,
        target: 0,
      },
      {
        label: "PSM 2",
        achieved: 0,
        target: 0,
      },
      {
        label: "PSM 3",
        achieved: 0,
        target: 0,
      },
      {
        label: "PSM 4",
        achieved: 0,
        target: 0,
      },
    ],

    sg: [
      {
        label: "SG 1",
        achieved: 0,
        target: 0,
      },
      {
        label: "SG 2",
        achieved: 0,
        target: 0,
      },
    ],
  },

  history: [],

  sales: [],
};

/* =========================================================
   HELPERS
========================================================= */

function clone(value) {
  return structuredClone(value);
}

function mergePenawaran(base, saved) {
  const savedPenawaran =
    saved && typeof saved === "object"
      ? saved
      : {};

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

/* =========================================================
   CLEANUP TARGET
========================================================= */

function cleanupTargets(targetsByMonth) {
  const cleaned = {};

  if (
    !targetsByMonth ||
    typeof targetsByMonth !== "object" ||
    Array.isArray(targetsByMonth)
  ) {
    return cleaned;
  }

  Object.entries(targetsByMonth).forEach(
    ([monthKey, monthData]) => {
      if (!isAllowedMonth(monthKey)) {
        return;
      }

      if (
        !monthData ||
        typeof monthData !== "object"
      ) {
        return;
      }

      cleaned[monthKey] = {
        ...monthData,

        penawaran: mergePenawaran(
          initialState.penawaran,
          monthData.penawaran
        ),
      };
    }
  );

  return cleaned;
}

/* =========================================================
   CLEANUP HISTORY
========================================================= */

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

/* =========================================================
   MERGE STATE
========================================================= */

function mergeState(saved) {
  const base = clone(initialState);

  if (
    !saved ||
    typeof saved !== "object" ||
    Array.isArray(saved)
  ) {
    return base;
  }

  const currentMonth = getCurrentMonthKey();

  /* -------------------------------------------------------
     TARGET PER BULAN
  ------------------------------------------------------- */

  let targetsByMonth = {};

  const hasTargetsByMonth =
    saved.targetsByMonth &&
    typeof saved.targetsByMonth === "object" &&
    !Array.isArray(saved.targetsByMonth);

  /*
    Kalau targetsByMonth memang belum pernah ada,
    kita anggap aplikasi versi lama dan migrasikan
    penawaran lama ke bulan berjalan.

    PENTING:
    Kalau targetsByMonth SUDAH ADA tetapi bulan berjalan
    belum ada, JANGAN menyalin penawaran bulan sebelumnya
    ke bulan baru.
  */

  if (hasTargetsByMonth) {
    targetsByMonth = clone(saved.targetsByMonth);
  } else if (saved.penawaran) {
    targetsByMonth[currentMonth] = {
      penawaran: mergePenawaran(
        base.penawaran,
        saved.penawaran
      ),
    };
  }

  /* -------------------------------------------------------
     CLEANUP TARGET
  ------------------------------------------------------- */

  targetsByMonth = cleanupTargets(targetsByMonth);

  /*
    Kalau bulan berjalan belum mempunyai target,
    buat target kosong.

    Jadi ketika masuk bulan baru:

    September -> target September
    Oktober   -> target Oktober = 0

    Tidak menyalin target September.
  */

  if (!targetsByMonth[currentMonth]) {
    targetsByMonth[currentMonth] = {
      penawaran: clone(base.penawaran),
    };
  }

  /* -------------------------------------------------------
     HISTORY
  ------------------------------------------------------- */

  const cleanedHistory = cleanupHistory(
    saved.history
  );

  /* -------------------------------------------------------
     CURRENT MONTH PENAWARAN
  ------------------------------------------------------- */

  /*
    `penawaran` dipertahankan sebagai mirror
    target bulan berjalan supaya kompatibel dengan
    kode lama / bagian aplikasi yang masih membacanya.
  */

  const currentMonthPenawaran =
    targetsByMonth[currentMonth]?.penawaran ||
    base.penawaran;

  /* -------------------------------------------------------
     STATE FINAL
  ------------------------------------------------------- */

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

    /*
      Selalu sinkron dengan target bulan berjalan.
    */
    penawaran: mergePenawaran(
      base.penawaran,
      currentMonthPenawaran
    ),

    history: cleanedHistory,

    sales: Array.isArray(saved.sales)
      ? saved.sales
      : [],
  };
}

/* =========================================================
   LOAD
========================================================= */

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return clone(initialState);
    }

    const parsed = JSON.parse(raw);

    const merged = mergeState(parsed);

    /*
      Simpan kembali hasil cleanup.

      Jadi kalau ada:
      - history bulan lama
      - target bulan lama

      semuanya benar-benar dihapus dari localStorage.
    */

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );

    return merged;
  } catch (error) {
    console.error(
      "Gagal membaca data Sales Tracker:",
      error
    );

    return clone(initialState);
  }
}

/* =========================================================
   SAVE
========================================================= */

export function saveState(state) {
  try {
    const nextState = mergeState(state);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextState)
    );
  } catch (error) {
    console.error(
      "Gagal menyimpan data Sales Tracker:",
      error
    );
  }
}

/* =========================================================
   RESET
========================================================= */

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);

  return clone(initialState);
}
