/**
 * Titration curve via charge-balance (de Levie style).
 * Includes water autoprotolysis (Kw). Solves for [H+] at each titrant volume.
 */

(function (global) {
  const Kw = (global.TitratorConstants && global.TitratorConstants.Kw) || 1e-14;

  /**
   * Alpha fractions for a polyprotic acid with given Ka values at [H+] = h.
   * Returns array of fractions [alpha_0, alpha_1, ..., alpha_n] for H_nA, HA^(n-1)-, ..., A^n-.
   * Denominator D = [H+]^n + Ka1*[H+]^(n-1) + ... + Ka1*...*Kan (standard form).
   * term_j = (Ka1*...*Ka_j) * [H+]^(n-j), with product for j=0 equal to 1.
   */
  function acidAlphaFractions(h, kas) {
    if (!kas || kas.length === 0) {
      return [1];
    }
    var n = kas.length;
    var terms = [];
    var denom = 0;
    for (var j = 0; j <= n; j++) {
      var t = 1;
      for (var i = 0; i < j; i++) t *= kas[i];
      for (var k = 0; k < n - j; k++) t *= h;
      terms[j] = t;
      denom += t;
    }
    return terms.map(function (t) { return t / denom; });
  }

  /**
   * Total anionic charge per mole of acid at [H+] = h.
   * charge = sum over j of (j * alpha_j) for alpha_j = fraction of A^(j-).
   */
  function acidChargePerMole(h, kas) {
    var alphas = acidAlphaFractions(h, kas);
    var q = 0;
    for (var j = 0; j < alphas.length; j++) q += j * alphas[j];
    return q;
  }

  /**
   * Cation charge per mole for a base: conjugate acid has pKa = 14 - pKb, so Ka_conj = 10^(-pKa).
   * Alpha fractions are for the conjugate acid (BH+, BH2^2+, ... B). Cation = fraction protonated:
   * sum over j of (n - j) * alpha_j (alpha_0 = BH_n, alpha_n = B). So we return that sum, not sum j*alpha_j.
   */
  function baseChargePerMole(h, pkbs) {
    if (!pkbs || pkbs.length === 0) return 1;
    var conjugateKas = pkbs.map(function (pkb) { return Math.pow(10, pkb - 14); });
    var alphas = acidAlphaFractions(h, conjugateKas);
    var n = alphas.length - 1;
    var q = 0;
    for (var j = 0; j < n; j++) q += (n - j) * alphas[j];
    return q;
  }

  /**
   * Convert pKa list to Ka list. Strong acid: empty array -> treat as full dissociation.
   */
  function pkaToKa(pkas) {
    if (!pkas || pkas.length === 0) return [];
    return pkas.map(function (p) { return Math.pow(10, -p); });
  }

  /**
   * Charge balance residual: f([H+]) = 0. All species use pKa only.
   * Cation contributor: first pKa >= 7 or no pkas (conjugate-acid pKa for bases). Anion: first pKa < 7 (acids).
   */
  function chargeBalanceResidual(h, params) {
    var V0 = params.V0;
    var V = params.V;
    var totalVolume = V0 + V;
    var dilution = totalVolume > 0 ? V0 / totalVolume : 1;
    var titrantConc = totalVolume > 0 ? (V * params.titrantC) / totalVolume : 0;
    var titrantPkas = params.titrantPkas || [];

    var pos = h;
    var neg = Kw / h;

    params.analyte.forEach(function (s) {
      var C = s.concentration * dilution;
      var pkas = s.pkas || [];
      var cation = (pkas.length === 0) || (pkas[0] >= 7);
      if (cation) {
        var pkbs = pkas.map(function (p) { return 14 - p; });
        if (pkbs.length === 0) pos += C;
        else pos += C * baseChargePerMole(h, pkbs);
      } else {
        var kas = pkaToKa(pkas);
        if (kas.length === 0) neg += C;
        else neg += C * acidChargePerMole(h, kas);
      }
    });

    var titrantCation = (titrantPkas.length === 0) || (titrantPkas[0] >= 7);
    if (titrantCation) {
      if (titrantPkas.length === 0) pos += titrantConc;
      else pos += titrantConc * baseChargePerMole(h, titrantPkas.map(function (p) { return 14 - p; }));
    } else {
      if (titrantPkas.length === 0) neg += titrantConc;
      else neg += titrantConc * acidChargePerMole(h, pkaToKa(titrantPkas));
    }

    return pos - neg;
  }

  /**
   * Solve for [H+] using Newton-Raphson. h must be positive.
   */
  function solveH(params, hStart) {
    var h = Math.max(hStart || 1e-7, 1e-14);
    var delta = 1e-8 * h;
    for (var iter = 0; iter < 80; iter++) {
      var f = chargeBalanceResidual(h, params);
      if (Math.abs(f) < 1e-12) return h;
      var fp = (chargeBalanceResidual(h + delta, params) - f) / delta;
      var step = fp !== 0 ? -f / fp : 0;
      if (Math.abs(step) > 0.5 * h) step = 0.5 * h * (step > 0 ? 1 : -1);
      h += step;
      if (h <= 0) h = 1e-14;
      if (h > 1) h = 1;
    }
    return h;
  }

  /**
   * Compute pH at a single titrant volume V (mL).
   * params: { V0, analyte: [{ concentration, pkas }], titrantC, titrantPkas }. All pKa only.
   */
  function pHAtVolume(params, V) {
    var p = {
      V0: params.V0,
      V: V,
      analyte: params.analyte,
      titrantC: params.titrantC,
      titrantPkas: params.titrantPkas || []
    };
    var h = solveH(p);
    return -Math.log10(h);
  }

  /**
   * Generate titration curve: array of { V, pH }.
   */
  function titrationCurve(params, VMax, nPoints) {
    var out = [];
    var step = VMax / Math.max(nPoints - 1, 1);
    for (var i = 0; i < nPoints; i++) {
      var V = i * step;
      out.push({ V: V, pH: pHAtVolume(params, V) });
    }
    return out;
  }

  /**
   * Stoichiometric first-equivalence volume (mL). All pKa only; cation vs anion from first pKa.
   */
  function equivalenceVolume(params) {
    if (!params || !params.analyte || params.analyte.length === 0) return null;
    var netAcidEquivPerL = 0;
    params.analyte.forEach(function (s) {
      var n = (s.pkas && s.pkas.length > 0) ? s.pkas.length : 1;
      var equiv = s.concentration * n;
      var pkas = s.pkas || [];
      var cation = (pkas.length === 0) || (pkas[0] >= 7);
      if (cation) netAcidEquivPerL -= equiv;
      else netAcidEquivPerL += equiv;
    });
    var V0 = params.V0 || 0;
    var Ct = params.titrantC || 0;
    if (Ct <= 0 || V0 <= 0) return null;
    var titrantPkas = params.titrantPkas || [];
    var titrantCation = (titrantPkas.length === 0) || (titrantPkas[0] >= 7);
    var VEq;
    if (titrantCation) {
      if (netAcidEquivPerL <= 0) return null;
      VEq = (V0 * netAcidEquivPerL) / Ct;
    } else {
      if (netAcidEquivPerL >= 0) return null;
      VEq = (V0 * (-netAcidEquivPerL)) / Ct;
    }
    return VEq > 0 ? VEq : null;
  }

  /**
   * Equivalence point from stoichiometry only: { V, pH }.
   * V = equivalence volume (mL), pH = pH at that volume. Independent of max titrant volume and curve points.
   */
  function equivalencePointFromParams(params) {
    var VEq = equivalenceVolume(params);
    if (VEq == null) return null;
    var pH = pHAtVolume(params, VEq);
    return { V: VEq, pH: pH };
  }

  /**
   * Suggested x-axis max (mL) from stoichiometry: full equivalence volume plus buffer (e.g. 20%).
   * Used to auto-set plot range. Returns at least minVMax (e.g. 50) if no analyte.
   */
  function suggestedVMax(params, bufferFraction, minVMax) {
    var VEq = equivalenceVolume(params);
    var b = bufferFraction != null ? bufferFraction : 0.2;
    var minV = minVMax != null ? minVMax : 50;
    if (VEq == null || VEq <= 0) return minV;
    var v = VEq * (1 + b);
    return v < minV ? minV : v;
  }

  global.TitratorChemistry = {
    Kw: Kw,
    acidAlphaFractions: acidAlphaFractions,
    acidChargePerMole: acidChargePerMole,
    baseChargePerMole: baseChargePerMole,
    chargeBalanceResidual: chargeBalanceResidual,
    solveH: solveH,
    pHAtVolume: pHAtVolume,
    titrationCurve: titrationCurve,
    equivalenceVolume: equivalenceVolume,
    equivalencePointFromParams: equivalencePointFromParams,
    suggestedVMax: suggestedVMax
  };
})(this);
