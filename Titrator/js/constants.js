/**
 * Physical constants and defaults (25 °C).
 * Kw = [H+][OH-] for water autoprotolysis.
 */
window.TitratorConstants = {
  Kw: 1e-14,
  /** Default initial analyte volume (mL) */
  defaultAnalyteVolume: 50,
  /** Cookie name for custom compounds */
  customCompoundCookie: "titrator_custom_compounds",
  /** Max titrant volume (mL) for curve */
  defaultVMax: 60,
  defaultCurvePoints: 400
};
