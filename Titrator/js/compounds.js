/**
 * Known compounds: pKa only. Conjugate-acid pKa (14 - pKb) for bases. No acid/base flag.
 */

(function (global) {
  /** Built-in compounds. All pkas are pKa (acids) or conjugate-acid pKa (bases). */
  const KNOWN_COMPOUNDS = [
    { id: "perchloric", name: "Perchloric acid (strong)", pkas: [-10] },
    { id: "hcl", name: "Hydrochloric acid (strong)", pkas: [-6.3] },
    { id: "h2so4", name: "Sulfuric acid", pkas: [-2, 1.99] },
    { id: "hno3", name: "Nitric acid (strong)", pkas: [-1.4] },
    { id: "h3po4", name: "Phosphoric acid", pkas: [2.16, 7.21, 12.32] },
    { id: "hf", name: "Hydrofluoric acid", pkas: [3.17] },
    { id: "acetic", name: "Acetic acid", pkas: [4.76] },
    { id: "formic", name: "Formic acid", pkas: [3.75] },
    { id: "lactic", name: "Lactic acid", pkas: [3.86] },
    { id: "uric", name: "Uric acid", pkas: [5.57, 10.3] },
    { id: "malic", name: "Malic acid", pkas: [3.4, 5.11] },
    { id: "oxalic", name: "Oxalic acid", pkas: [1.25, 4.14] },
    { id: "citric", name: "Citric acid", pkas: [3.13, 4.76, 6.40] },
    { id: "folic", name: "Folic acid", pkas: [4.7, 6.8, 9.0] },
    { id: "carbonic", name: "Carbonic acid", pkas: [6.35, 10.33] },
    { id: "naoh", name: "Sodium hydroxide (strong base)", pkas: [13.8] },
    { id: "koh", name: "Potassium hydroxide (strong base)", pkas: [13.5] },
    { id: "ammonia", name: "Ammonia", pkas: [9.25] },
    { id: "tris", name: "Tris (base)", pkas: [8.06] },
    { id: "ethylamine", name: "Ethylamine", pkas: [10.75] },
    { id: "na2co3", name: "Sodium carbonate", pkas: [10.33, 6.35] }
  ];

  const STORAGE_KEY = "titrator_custom_compounds";

  function loadCustom() {
    try {
      var raw = null;
      if (typeof localStorage !== "undefined") raw = localStorage.getItem(STORAGE_KEY);
      if (raw == null || raw === "") return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveCustom(list) {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  /** Sort key by first pKa for display order. No pkas → 999 so strong bases sort last. */
  function firstPkaSortKey(c) {
    if (c.pkas && c.pkas.length > 0) return c.pkas[0];
    return 999;
  }

  /** Standard (built-in) compounds only. Sorted by first pKa. */
  function getStandardCompounds() {
    const known = KNOWN_COMPOUNDS.map(function (c) {
      return { id: c.id, name: c.name, pkas: c.pkas.slice() };
    });
    known.sort(function (a, b) { return firstPkaSortKey(a) - firstPkaSortKey(b); });
    return known;
  }

  /** Custom compounds only (from storage). Sorted by first pKa. */
  function getCustomCompounds() {
    const custom = loadCustom();
    const list = custom.map(function (c) {
      return { id: c.id, name: c.name || "Custom", pkas: (c.pkas || []).slice() };
    });
    list.sort(function (a, b) { return firstPkaSortKey(a) - firstPkaSortKey(b); });
    return list;
  }

  /** Get all compounds: known + custom. Sorted by first pKa. */
  function getAllCompounds() {
    return getStandardCompounds().concat(getCustomCompounds());
  }

  /** Get compound by id (known or custom). */
  function getCompoundById(id) {
    const all = getAllCompounds();
    return all.find(function (c) { return c.id === id; });
  }

  /** Add a custom compound (pKa only). Saves to storage. */
  function addCustomCompound(name, pkas) {
    const list = loadCustom();
    const id = "custom_" + (name || "custom").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    const entry = { id: id, name: name || "Custom", pkas: pkas || [] };
    const existing = list.findIndex(function (c) { return c.id === id; });
    if (existing >= 0) list[existing] = entry;
    else list.push(entry);
    saveCustom(list);
    return { id: entry.id, name: entry.name, pkas: entry.pkas.slice() };
  }

  /** Remove a custom compound by id. */
  function removeCustomCompound(id) {
    if (!id || !String(id).startsWith("custom_")) return;
    const list = loadCustom().filter(function (c) { return c.id !== id; });
    saveCustom(list);
  }

  global.TitratorCompounds = {
    KNOWN_COMPOUNDS: KNOWN_COMPOUNDS,
    getStandardCompounds: getStandardCompounds,
    getCustomCompounds: getCustomCompounds,
    getAllCompounds: getAllCompounds,
    getCompoundById: getCompoundById,
    addCustomCompound: addCustomCompound,
    removeCustomCompound: removeCustomCompound,
    loadCustom: loadCustom,
    saveCustom: saveCustom
  };
})(this);
