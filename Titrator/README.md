# pH Titration Curve

An HTML/JavaScript-only application that plots **pH vs titrant volume** (titration curve) for a user-defined analyte and titrant. The calculation uses the **exact unified equation** (charge balance including water autoprotolysis) in the spirit of Robert de Levie’s work (*Anal. Chem.* 1996, 68, 585–590; “Solving pH problems on a spreadsheet”).

## How to run

Open `index.html` in a modern browser (no server required). All logic runs in the browser.

## Features

- **Analyte (virtual solution)**  
  - Initial volume (mL).  
  - Add multiple species from a built-in list (acids and bases with pK<sub>a</sub> or pK<sub>b</sub>).  
  - For each species: choose compound and enter **concentration (M)**.  
  - Edit concentration or remove species.  

- **Custom compounds**  
  - Add your own acid or base: name and pK<sub>a</sub> (or pK<sub>b</sub> for bases), comma-separated for polyprotic systems.  
  - Stored in a **browser cookie** so they persist across sessions.  

- **Titrant**  
  - Concentration (M) and pK<sub>a</sub> (or pK<sub>b</sub> if “Titrant is a base” is checked).  
  - Leave pK<sub>a</sub>/pK<sub>b</sub> empty for strong acid or strong base.  

- **Curve**  
  - **pH vs titrant volume** is recalculated and redrawn whenever you change analyte (add/remove/edit species or volume), titrant, or curve options (max volume, number of points).  

## Files

| File | Purpose |
|------|--------|
| `index.html` | Single-page UI: analyte list, titrant inputs, canvas, custom-compound modal |
| `css/styles.css` | Layout and styling |
| `js/constants.js` | Kw, defaults, cookie name |
| `js/compounds.js` | Built-in compound list and custom compounds (cookie load/save) |
| `js/chemistry.js` | Charge balance, alpha fractions, solve for [H<sup>+</sup>], titration curve |
| `js/curve.js` | Canvas rendering of pH vs volume |
| `js/app.js` | Wires UI to chemistry and curve; triggers redraw on any change |

## Chemistry

- **Charge balance** includes [H<sup>+</sup>], [OH<sup>−</sup>] (via K<sub>w</sub>), and the net charge from all weak/strong acids and bases in the analyte and from the titrant.
- Concentrations are corrected for **dilution** as titrant is added (total volume = initial volume + titrant volume).
- For each titrant volume we solve the single equation in [H<sup>+</sup>] numerically (Newton–Raphson), then pH = −log<sub>10</sub>[H<sup>+</sup>].
- Strong acids/bases are treated as fully dissociated (no pK<sub>a</sub>/pK<sub>b</sub> list).

## References

- R. de Levie, “General Expressions for Acid−Base Titrations of Arbitrary Mixtures,” *Anal. Chem.* **1996**, *68*, 585–590.
- R. de Levie, “The Henderson–Hasselbalch Equation: Its History and Limitations,” and related work on solving pH problems on a spreadsheet.
