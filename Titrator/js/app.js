/**
 * Main app: wire analyte, titrant, custom compound modal, indicator list, and redraw curve.
 */

(function (global) {
  var constants = global.TitratorConstants || {};
  var compounds = global.TitratorCompounds;
  var chemistry = global.TitratorChemistry;
  var curve = global.TitratorCurve;
  var indicators = global.TitratorIndicators;

  var analyteList = [];
  var analyteVolume = constants.defaultAnalyteVolume || 50;
  var titrantC = 0.1;
  var titrantPkas = [];
  var selectedIndicatorId = null;
  var lastCurveData = null;
  var lastCurveOptions = null;

  function getAnalyteVolume() {
    var el = document.getElementById("analyte-volume");
    var v = parseFloat(el && el.value, 10);
    return isFinite(v) && v > 0 ? v : analyteVolume;
  }

  function getTitrantFromForm() {
    var cEl = document.getElementById("titrant-concentration");
    var pEl = document.getElementById("titrant-pkas");
    var c = parseFloat(cEl && cEl.value, 10);
    var pkas = [];
    if (pEl && pEl.value.trim()) {
      pEl.value.split(",").forEach(function (s) {
        var x = parseFloat(s.trim(), 10);
        if (isFinite(x)) pkas.push(x);
      });
    }
    return {
      concentration: isFinite(c) && c >= 0 ? c : 0.1,
      pkas: pkas
    };
  }

  function buildParams() {
    var V0 = getAnalyteVolume();
    var titrant = getTitrantFromForm();
    return {
      V0: V0,
      analyte: analyteList.map(function (s) {
        return { concentration: s.concentration, pkas: s.pkas.slice() };
      }),
      titrantC: titrant.concentration,
      titrantPkas: titrant.pkas.slice()
    };
  }

  function niceRoundUp(v) {
    if (v <= 0) return 10;
    var step = Math.pow(10, Math.ceil(Math.log10(v)) - 1);
    return Math.ceil(v / step) * step;
  }

  function redrawCurve(updateIdeal) {
    var params = buildParams();
    renderIndicatorsList();
    if (!params.analyte || params.analyte.length === 0) {
      lastCurveData = [];
      lastCurveOptions = {};
      curve.draw("curve-canvas", [], {});
      return;
    }
    var vMaxSuggested = chemistry.suggestedVMax(params);
    var vMax = niceRoundUp(vMaxSuggested);
    var nPoints = 1000;
    var data = chemistry.titrationCurve(params, vMax, nPoints);
    var eq = chemistry.equivalencePointFromParams(params);
    if (updateIdeal && indicators) {
      var ideal = eq ? indicators.findIdeal(eq.pH) : null;
      selectedIndicatorId = ideal ? ideal.id : (indicators.getAll()[0] && indicators.getAll()[0].id);
    }
    var ind = selectedIndicatorId && indicators ? indicators.getById(selectedIndicatorId) : null;
    var options = { VMax: vMax, equivalencePoint: eq };
    var showCheck = document.getElementById("show-indicator-gradient");
    if (ind && showCheck && showCheck.checked) {
      options.indicator = {
        pHMin: ind.pHMin,
        pHMax: ind.pHMax,
        colorStart: indicators.colorToHex(ind.colorStart),
        colorEnd: indicators.colorToHex(ind.colorEnd)
      };
    }
    lastCurveData = data;
    lastCurveOptions = {};
    for (var key in options) if (options.hasOwnProperty(key)) lastCurveOptions[key] = options[key];
    curve.draw("curve-canvas", data, options);
  }

  function colorSpan(colorName) {
    if (!indicators) return escapeHtml(colorName);
    var hex = indicators.colorToHex(colorName);
    return "<span class='ind-color' style='color:" + hex + "'>" + escapeHtml(colorName) + "</span>";
  }

  function renderIndicatorsList() {
    var listEl = document.getElementById("indicators-list");
    if (!listEl || !indicators) return;
    var all = indicators.getAll();
    listEl.innerHTML = "";
    all.forEach(function (ind) {
      var div = document.createElement("div");
      div.className = "indicator-item" + (ind.id === selectedIndicatorId ? " selected" : "");
      div.setAttribute("data-id", ind.id);
      div.setAttribute("role", "option");
      div.setAttribute("aria-selected", ind.id === selectedIndicatorId ? "true" : "false");
      div.innerHTML =
        "<span class='ind-name'>" + escapeHtml(ind.name) + "</span> " +
        "<span class='ind-meta'>pH " + ind.pHMin + "–" + ind.pHMax + " " +
        colorSpan(ind.colorStart) + " → " + colorSpan(ind.colorEnd) + "</span>";
      div.addEventListener("click", function () {
        selectedIndicatorId = ind.id;
        redrawCurve(false);
      });
      listEl.appendChild(div);
    });
  }

  function populateStandardCompoundSelect() {
    var sel = document.getElementById("analyte-compound");
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "— Select —";
    sel.appendChild(opt0);
    (compounds.getStandardCompounds() || []).forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name + ((c.pkas && c.pkas.length) ? " (" + c.pkas.join(", ") + ")" : "");
      sel.appendChild(opt);
    });
    if (current && compounds.getCompoundById(current)) sel.value = current;
  }

  function populateCustomCompoundSelect() {
    var sel = document.getElementById("analyte-compound-custom");
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "— Select —";
    sel.appendChild(opt0);
    (compounds.getCustomCompounds() || []).forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name + ((c.pkas && c.pkas.length) ? " (" + c.pkas.join(", ") + ")" : "");
      sel.appendChild(opt);
    });
    if (current && compounds.getCompoundById(current)) sel.value = current;
  }

  function addAnalyteEntry(compoundId, concentration) {
    var comp = compounds.getCompoundById(compoundId);
    if (!comp) return;
    var c = parseFloat(concentration, 10);
    if (!isFinite(c) || c < 0) return;
    var isCustom = String(compoundId).indexOf("custom_") === 0;
    analyteList.push({
      id: compoundId,
      name: comp.name,
      concentration: c,
      pkas: (comp.pkas || []).slice(),
      isCustom: isCustom
    });
    renderAnalyteList();
    redrawCurve(true);
  }

  function removeAnalyteEntry(index) {
    analyteList.splice(index, 1);
    renderAnalyteList();
    redrawCurve(true);
  }

  function updateAnalyteEntry(index, concentration) {
    var c = parseFloat(concentration, 10);
    if (!isFinite(c) || c < 0) return;
    analyteList[index].concentration = c;
    redrawCurve(true);
  }

  function renderAnalyteList() {
    var ul = document.getElementById("analyte-list");
    if (!ul) return;
    ul.innerHTML = "";
    analyteList.forEach(function (s, i) {
      var li = document.createElement("li");
      var isCustomEntry = s.isCustom || (String(s.id).indexOf("custom_") === 0);
      li.className = "species-item" + (isCustomEntry ? " species-item-custom" : "");
      var cation = (!s.pkas || s.pkas.length === 0) || (s.pkas[0] >= 7);
      var pkasStr = (s.pkas && s.pkas.length) ? "pKa " + s.pkas.join(", ") : (cation ? "strong base" : "strong acid");
      li.innerHTML =
        "<span class='name'>" + escapeHtml(s.name) + "</span>" +
        "<span class='conc'>" + s.concentration.toFixed(4) + " M</span>" +
        "<span class='pkas'>" + escapeHtml(pkasStr) + "</span>" +
        "<span class='actions'>" +
        "<button type='button' class='btn-icon edit' data-index='" + i + "' title='Edit concentration'>Edit</button>" +
        "<button type='button' class='btn-icon danger remove' data-index='" + i + "' title='Remove'>Remove</button>" +
        "</span>";
      ul.appendChild(li);
    });
    ul.querySelectorAll(".btn-icon.remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        removeAnalyteEntry(parseInt(btn.getAttribute("data-index"), 10));
      });
    });
    ul.querySelectorAll(".btn-icon.edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-index"), 10);
        var c = prompt("New concentration (M):", analyteList[idx].concentration);
        if (c != null) updateAnalyteEntry(idx, c);
      });
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function setupAnalyteAdd() {
    var sel = document.getElementById("analyte-compound");
    var conc = document.getElementById("analyte-concentration");
    var btn = document.getElementById("analyte-add");
    if (btn && sel && conc) {
      btn.addEventListener("click", function () {
        addAnalyteEntry(sel.value, conc.value);
        conc.value = "";
      });
    }
    var selCustom = document.getElementById("analyte-compound-custom");
    var concCustom = document.getElementById("analyte-concentration-custom");
    var btnCustom = document.getElementById("analyte-add-custom");
    if (btnCustom && selCustom && concCustom) {
      btnCustom.addEventListener("click", function () {
        addAnalyteEntry(selCustom.value, concCustom.value);
        concCustom.value = "";
      });
    }
    var btnRemoveCustom = document.getElementById("analyte-remove-custom");
    if (btnRemoveCustom && selCustom) {
      btnRemoveCustom.addEventListener("click", function () {
        var id = selCustom.value;
        if (!id) return;
        compounds.removeCustomCompound(id);
        populateCustomCompoundSelect();
        for (var i = analyteList.length - 1; i >= 0; i--) {
          if (analyteList[i].id === id) analyteList.splice(i, 1);
        }
        renderAnalyteList();
        redrawCurve(true);
      });
    }
  }

  function setupTitrantListeners() {
    ["titrant-concentration", "titrant-pkas", "analyte-volume"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var event = el.type === "checkbox" ? "change" : "input";
      el.addEventListener(event, function () { redrawCurve(true); });
    });
    var showGradientEl = document.getElementById("show-indicator-gradient");
    if (showGradientEl) {
      showGradientEl.addEventListener("change", function () { redrawCurve(false); });
    }
  }

  function openCustomModal() {
    var modal = document.getElementById("modal-custom");
    if (!modal) return;
    document.getElementById("custom-name").value = "";
    document.getElementById("custom-pkas").value = "";
    modal.hidden = false;
  }

  function closeCustomModal() {
    var modal = document.getElementById("modal-custom");
    if (modal) modal.hidden = true;
  }

  function saveCustomCompound(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var nameEl = document.getElementById("custom-name");
    var name = nameEl ? nameEl.value.trim() : "";
    if (!name) {
      alert("Please enter a name for the compound.");
      if (nameEl) nameEl.focus();
      return;
    }
    var pkasEl = document.getElementById("custom-pkas");
    var pkasStr = pkasEl ? pkasEl.value.trim() : "";
    var pkas = [];
    if (pkasStr) {
      pkasStr.split(",").forEach(function (s) {
        var x = parseFloat(s.trim(), 10);
        if (isFinite(x)) pkas.push(x);
      });
    }
    compounds.addCustomCompound(name, pkas);
    populateCustomCompoundSelect();
    closeCustomModal();
  }

  function init() {
    populateStandardCompoundSelect();
    populateCustomCompoundSelect();
    renderAnalyteList();
    setupAnalyteAdd();
    setupTitrantListeners();

    var btnAddCustom = document.getElementById("btn-add-custom");
    if (btnAddCustom) btnAddCustom.addEventListener("click", openCustomModal);
    var btnSave = document.getElementById("custom-save");
    if (btnSave) btnSave.addEventListener("click", saveCustomCompound);
    var btnCancel = document.getElementById("custom-cancel");
    if (btnCancel) btnCancel.addEventListener("click", closeCustomModal);

    curve.setupHover("curve-canvas", function () {
      return { data: lastCurveData, options: lastCurveOptions };
    });

    redrawCurve(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(this);
