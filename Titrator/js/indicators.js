/**
 * pH indicators from TODO.md (CRC reference data).
 * Each entry: { id, name, pHMin, pHMax, colorStart, colorEnd }.
 * colorStart/colorEnd are display names; resolve to hex via colorToHex().
 */
(function (global) {
  var COLOR_MAP = {
    red: "#c0392b",
    yellow: "#f1c40f",
    blue: "#3498db",
    purple: "#8e44ad",
    orange: "#e67e22",
    colorless: "#ecf0f1",
    pink: "#e91e8c",
    violet: "#6c3483",
    amber: "#f39c12",
    "blue-green": "#16a085",
    green: "#27ae60",
    "reddish-purple": "#922b21",
    "grey-violet": "#5d6d7e",
    "greenish-blue": "#1abc9c",
    rose: "#e8a0a0",
    lilac: "#c8a2c8",
    "red-pink": "#e74c3c",
    grey: "#95a5a6",
    greenish: "#2ecc71"
  };

  function normalizeColor(s) {
    if (!s || typeof s !== "string") return "grey";
    return s.toLowerCase().trim().replace(/\s+/g, "-");
  }

  function colorToHex(colorName) {
    var key = normalizeColor(colorName);
    if (COLOR_MAP[key]) return COLOR_MAP[key];
    if (key.indexOf("red") !== -1) return COLOR_MAP.red;
    if (key.indexOf("yellow") !== -1) return COLOR_MAP.yellow;
    if (key.indexOf("blue") !== -1) return COLOR_MAP.blue;
    if (key.indexOf("purple") !== -1) return COLOR_MAP.purple;
    if (key.indexOf("orange") !== -1) return COLOR_MAP.orange;
    if (key.indexOf("pink") !== -1) return COLOR_MAP.pink;
    if (key.indexOf("violet") !== -1) return COLOR_MAP.violet;
    if (key.indexOf("green") !== -1) return COLOR_MAP.green;
    if (key.indexOf("amber") !== -1) return COLOR_MAP.amber;
    if (key.indexOf("colorless") !== -1 || key.indexOf("colourless") !== -1) return COLOR_MAP.colorless;
    return COLOR_MAP.grey;
  }

  var INDICATORS = [
    { id: "cresol-red-1", name: "Cresol Red (step 1)", pHMin: 0, pHMax: 1, colorStart: "red", colorEnd: "yellow" },
    { id: "methyl-violet", name: "Methyl Violet", pHMin: 0, pHMax: 1.6, colorStart: "yellow", colorEnd: "blue" },
    { id: "crystal-violet", name: "Crystal Violet", pHMin: 0, pHMax: 1.8, colorStart: "yellow", colorEnd: "blue" },
    { id: "ethyl-violet", name: "Ethyl Violet", pHMin: 0, pHMax: 2.4, colorStart: "yellow", colorEnd: "blue" },
    { id: "malachite-green", name: "Malachite Green", pHMin: 0.2, pHMax: 1.8, colorStart: "yellow", colorEnd: "blue-green" },
    { id: "methyl-green", name: "Methyl Green", pHMin: 0.2, pHMax: 1.8, colorStart: "yellow", colorEnd: "blue" },
    { id: "dimethylphenylazo-pyridine-1", name: "2-(p-Dimethylaminophenylazo)pyridine (step 1)", pHMin: 0.2, pHMax: 1.8, colorStart: "yellow", colorEnd: "red" },
    { id: "paramethyl-red", name: "Paramethyl Red", pHMin: 1, pHMax: 3, colorStart: "red", colorEnd: "yellow" },
    { id: "metanil-yellow", name: "Metanil Yellow", pHMin: 1.2, pHMax: 2.4, colorStart: "red", colorEnd: "yellow" },
    { id: "phenylazodiphenylamine", name: "4-Phenylazodiphenylamine", pHMin: 1.2, pHMax: 2.6, colorStart: "red", colorEnd: "yellow" },
    { id: "thymol-blue-1", name: "Thymol Blue (step 1)", pHMin: 1.2, pHMax: 2.8, colorStart: "red", colorEnd: "yellow" },
    { id: "metacresol-purple-1", name: "Metacresol Purple (step 1)", pHMin: 1.2, pHMax: 2.8, colorStart: "red", colorEnd: "yellow" },
    { id: "orange-iv", name: "Orange IV", pHMin: 1.4, pHMax: 2.8, colorStart: "red", colorEnd: "yellow" },
    { id: "tolylazo-toluidine", name: "4-o-Tolylazo-o-toluidine", pHMin: 1.4, pHMax: 2.8, colorStart: "orange", colorEnd: "yellow" },
    { id: "quinaldine-red", name: "Quinaldine Red", pHMin: 1.4, pHMax: 3.2, colorStart: "colorless", colorEnd: "red" },
    { id: "dinitrophenol", name: "2,4-Dinitrophenol", pHMin: 2, pHMax: 4.7, colorStart: "colorless", colorEnd: "yellow" },
    { id: "erythrosin", name: "Erythrosin, disodium salt", pHMin: 2.2, pHMax: 3.6, colorStart: "orange", colorEnd: "red" },
    { id: "benzopurpurine-4b", name: "Benzopurpurine 4B", pHMin: 2.2, pHMax: 4.2, colorStart: "violet", colorEnd: "red" },
    { id: "dimethyl-tolylazo-aniline", name: "N,N-Dimethyl-p-(m-tolylazo)aniline", pHMin: 2.6, pHMax: 4.8, colorStart: "red", colorEnd: "yellow" },
    { id: "methyl-yellow", name: "p-Dimethylaminoazobenzene (Methyl Yellow)", pHMin: 2.8, pHMax: 4.4, colorStart: "red", colorEnd: "yellow" },
    { id: "bis-stilbenedisulfonic-1", name: "4,4′-Bis(2-amino-1-naphthylazo)-2,2′-stilbenedisulfonic acid", pHMin: 3, pHMax: 4, colorStart: "purple", colorEnd: "red" },
    { id: "tetrabromophenolphthalein", name: "Tetrabromophenolphthalein ethyl ester, potassium salt", pHMin: 3, pHMax: 4.2, colorStart: "yellow", colorEnd: "blue" },
    { id: "bromophenol-blue", name: "Bromophenol Blue", pHMin: 3, pHMax: 4.6, colorStart: "yellow", colorEnd: "blue" },
    { id: "congo-red", name: "Congo Red", pHMin: 3, pHMax: 5, colorStart: "blue", colorEnd: "red" },
    { id: "methyl-orange", name: "Methyl Orange", pHMin: 3.2, pHMax: 4.4, colorStart: "red", colorEnd: "yellow" },
    { id: "ethyl-orange", name: "Ethyl Orange", pHMin: 3.4, pHMax: 4.8, colorStart: "red", colorEnd: "yellow" },
    { id: "dimethyl-naphthylazo-methoxy", name: "4-(4-Dimethylamino-1-naphthylazo)-3-methoxybenzenesulfonic acid", pHMin: 3.5, pHMax: 4.8, colorStart: "violet", colorEnd: "yellow" },
    { id: "bromocresol-green", name: "Bromocresol Green", pHMin: 3.8, pHMax: 5.4, colorStart: "yellow", colorEnd: "blue" },
    { id: "resazurin", name: "Resazurin", pHMin: 3.8, pHMax: 6.4, colorStart: "orange", colorEnd: "violet" },
    { id: "phenylazo-naphthylamine", name: "4-Phenylazo-1-naphthylamine", pHMin: 4, pHMax: 5.6, colorStart: "red", colorEnd: "yellow" },
    { id: "ethyl-red", name: "Ethyl Red", pHMin: 4, pHMax: 5.8, colorStart: "colorless", colorEnd: "red" },
    { id: "dimethylphenylazo-pyridine-2", name: "2-(p-Dimethylaminophenylazo)pyridine (step 2)", pHMin: 4.4, pHMax: 5.6, colorStart: "red", colorEnd: "yellow" },
    { id: "ethoxyphenylazo", name: "4-(p-Ethoxyphenylazo)-m-phenylenediamine monohydrochloride", pHMin: 4.4, pHMax: 5.8, colorStart: "orange", colorEnd: "yellow" },
    { id: "resorcin-blue", name: "Resorcin Blue", pHMin: 4.4, pHMax: 6.2, colorStart: "red", colorEnd: "blue" },
    { id: "alizarin-red-s", name: "Alizarin Red S", pHMin: 4.6, pHMax: 6, colorStart: "yellow", colorEnd: "red" },
    { id: "methyl-red", name: "Methyl Red", pHMin: 4.8, pHMax: 6, colorStart: "red", colorEnd: "yellow" },
    { id: "propyl-red", name: "Propyl Red", pHMin: 4.8, pHMax: 6.6, colorStart: "red", colorEnd: "yellow" },
    { id: "bromocresol-purple", name: "Bromocresol Purple", pHMin: 5.2, pHMax: 6.8, colorStart: "yellow", colorEnd: "purple" },
    { id: "chlorophenol-red", name: "Chlorophenol Red", pHMin: 5.2, pHMax: 6.8, colorStart: "yellow", colorEnd: "red" },
    { id: "p-nitrophenol", name: "p-Nitrophenol", pHMin: 5.4, pHMax: 6.6, colorStart: "colorless", colorEnd: "yellow" },
    { id: "alizarin-1", name: "Alizarin (step 1)", pHMin: 5.6, pHMax: 7.2, colorStart: "yellow", colorEnd: "red" },
    { id: "dinitrophenylazo-naphthol", name: "2-(2,4-Dinitrophenylazo)-1-naphthol-3,6-disulfonic acid, disodium salt", pHMin: 6, pHMax: 7, colorStart: "yellow", colorEnd: "blue" },
    { id: "bromothymol-blue", name: "Bromothymol Blue", pHMin: 6, pHMax: 7.6, colorStart: "yellow", colorEnd: "blue" },
    { id: "dinitro-quinazolinedione", name: "6,8-Dinitro-2,4-(1H)quinazolinedione", pHMin: 6.4, pHMax: 8, colorStart: "colorless", colorEnd: "yellow" },
    { id: "brilliant-yellow", name: "Brilliant Yellow", pHMin: 6.6, pHMax: 7.8, colorStart: "yellow", colorEnd: "red" },
    { id: "phenol-red", name: "Phenol Red", pHMin: 6.6, pHMax: 8, colorStart: "yellow", colorEnd: "red" },
    { id: "neutral-red", name: "Neutral Red", pHMin: 6.8, pHMax: 8, colorStart: "red", colorEnd: "amber" },
    { id: "m-nitrophenol", name: "m-Nitrophenol", pHMin: 6.8, pHMax: 8.6, colorStart: "colorless", colorEnd: "yellow" },
    { id: "cresol-red-2", name: "Cresol Red (step 2)", pHMin: 7, pHMax: 8.8, colorStart: "yellow", colorEnd: "red" },
    { id: "curcumin", name: "Curcumin (Turmeric)", pHMin: 7.4, pHMax: 8.6, colorStart: "yellow", colorEnd: "red" },
    { id: "metacresol-purple-2", name: "Metacresol Purple (step 2)", pHMin: 7.4, pHMax: 9, colorStart: "yellow", colorEnd: "purple" },
    { id: "bis-stilbenedisulfonic-2", name: "4,4′-Bis(4-amino-1-naphthylazo)-2,2′-stilbenedisulfonic acid", pHMin: 8, pHMax: 9, colorStart: "blue", colorEnd: "red" },
    { id: "thymol-blue-2", name: "Thymol Blue (step 2)", pHMin: 8, pHMax: 9.6, colorStart: "yellow", colorEnd: "blue" },
    { id: "naphtholbenzein", name: "p-Naphtholbenzein", pHMin: 8.2, pHMax: 10, colorStart: "orange", colorEnd: "blue" },
    { id: "phenolphthalein", name: "Phenolphthalein", pHMin: 8.2, pHMax: 10, colorStart: "colorless", colorEnd: "pink" },
    { id: "cresolphthalein", name: "o-Cresolphthalein", pHMin: 8.2, pHMax: 9.8, colorStart: "colorless", colorEnd: "red" },
    { id: "ethyl-bis-ethanoate", name: "Ethyl bis(2,4-dimethylphenyl)ethanoate", pHMin: 8.4, pHMax: 9.6, colorStart: "colorless", colorEnd: "blue" },
    { id: "thymolphthalein", name: "Thymolphthalein", pHMin: 9.4, pHMax: 10.6, colorStart: "colorless", colorEnd: "blue" },
    { id: "alizarin-yellow-r", name: "Alizarin Yellow R", pHMin: 10.1, pHMax: 12, colorStart: "yellow", colorEnd: "red" },
    { id: "alizarin-2", name: "Alizarin (step 2)", pHMin: 11, pHMax: 12.4, colorStart: "red", colorEnd: "purple" },
    { id: "dihydroxyphenylazo", name: "p-(2,4-Dihydroxyphenylazo)benzenesulfonic acid, sodium salt", pHMin: 11.4, pHMax: 12.6, colorStart: "yellow", colorEnd: "orange" },
    { id: "indigo-carmine", name: "5,5′-Indigodisulfonic acid, disodium salt (Indigo Carmine)", pHMin: 11.4, pHMax: 13, colorStart: "blue", colorEnd: "yellow" },
    { id: "trinitrotoluene", name: "2,4,6-Trinitrotoluene", pHMin: 11.5, pHMax: 13, colorStart: "colorless", colorEnd: "orange" },
    { id: "trinitrobenzene", name: "1,3,5-Trinitrobenzene", pHMin: 12, pHMax: 14, colorStart: "colorless", colorEnd: "orange" },
    { id: "clayton-yellow", name: "Clayton Yellow", pHMin: 12.2, pHMax: 13.2, colorStart: "yellow", colorEnd: "amber" }
  ];

  function getAll() {
    return INDICATORS.slice();
  }

  function getById(id) {
    return INDICATORS.find(function (ind) { return ind.id === id; });
  }

  function getByIndex(i) {
    return INDICATORS[i] || null;
  }

  /**
   * Ideal indicator must fully span the equivalence pH (eq_pH inside [pHMin, pHMax]).
   * Among those, prefer the one that best covers the ±1 pH window around eq_pH (i.e. [eq_pH-1, eq_pH+1]),
   * then by wider range (more buffer). Fallback: if none span eq_pH, pick closest by midpoint.
   */
  function findIdeal(pHEq) {
    var idealLow = pHEq - 1;
    var idealHigh = pHEq + 1;

    var candidates = INDICATORS.filter(function (ind) {
      return pHEq >= ind.pHMin && pHEq <= ind.pHMax;
    });

    if (candidates.length === 0) {
      var best = null;
      var bestDist = Infinity;
      INDICATORS.forEach(function (ind) {
        var dist = 0;
        if (pHEq < ind.pHMin) dist = ind.pHMin - pHEq;
        else if (pHEq > ind.pHMax) dist = pHEq - ind.pHMax;
        if (dist < bestDist) { bestDist = dist; best = ind; }
      });
      return best;
    }

    function overlapWithIdeal(ind) {
      var low = Math.max(ind.pHMin, idealLow);
      var high = Math.min(ind.pHMax, idealHigh);
      return low < high ? high - low : 0;
    }

    candidates.sort(function (a, b) {
      var widthA = a.pHMax - a.pHMin;
      var widthB = b.pHMax - b.pHMin;
      if (widthB !== widthA) return widthB - widthA;
      var overlapA = overlapWithIdeal(a);
      var overlapB = overlapWithIdeal(b);
      if (overlapB !== overlapA) return overlapB - overlapA;
      var midA = (a.pHMin + a.pHMax) / 2;
      var midB = (b.pHMin + b.pHMax) / 2;
      return Math.abs(pHEq - midA) - Math.abs(pHEq - midB);
    });
    return candidates[0];
  }

  global.TitratorIndicators = {
    getAll: getAll,
    getById: getById,
    getByIndex: getByIndex,
    findIdeal: findIdeal,
    colorToHex: colorToHex,
    INDICATORS: INDICATORS
  };
})(this);
