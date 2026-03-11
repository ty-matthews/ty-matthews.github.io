/**
 * Draw pH vs titrant volume on a canvas.
 * options.indicator = { pHMin, pHMax, colorStart, colorEnd } (colors as hex); draws gradient band.
 */

(function (global) {
  function drawCurve(canvasId, data, options) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var padding = { top: 24, right: 24, bottom: 32, left: 44 };

    if (!data || data.length === 0) {
      ctx.fillStyle = "#0f1419";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#8b9cb3";
      ctx.font = "18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No analyte defined", width / 2, height / 2);
      return;
    }

    var VMin = 0;
    var VMax = options && options.VMax != null ? options.VMax : 60;
    var pHMin = 0;
    var pHMax = 14;

    var dataVMax = Math.max.apply(null, data.map(function (p) { return p.V; }));
    if (dataVMax > 0) VMax = Math.max(VMax, dataVMax * 1.02);

    var pHValues = data.map(function (p) { return p.pH; });
    var pHDataMin = Math.min.apply(null, pHValues);
    var pHDataMax = Math.max.apply(null, pHValues);
    if (pHDataMin < pHDataMax) {
      var pad = (pHDataMax - pHDataMin) * 0.05 || 0.5;
      pHMin = Math.max(0, Math.floor((pHDataMin - pad) * 2) / 2);
      pHMax = Math.min(14, Math.ceil((pHDataMax + pad) * 2) / 2);
    }

    var xScale = function (V) {
      return padding.left + (V / VMax) * (width - padding.left - padding.right);
    };
    var yScale = function (pH) {
      return height - padding.bottom - (pH - pHMin) / (pHMax - pHMin) * (height - padding.top - padding.bottom);
    };

    ctx.fillStyle = "#0f1419";
    ctx.fillRect(0, 0, width, height);

    var ind = options && options.indicator;
    if (ind && ind.pHMin != null && ind.pHMax != null && ind.colorStart && ind.colorEnd) {
      var yTop = yScale(Math.min(ind.pHMax, pHMax));
      var yBottom = yScale(Math.max(ind.pHMin, pHMin));
      if (yBottom > yTop) {
        var grad = ctx.createLinearGradient(0, yBottom, 0, yTop);
        grad.addColorStop(0, ind.colorStart);
        grad.addColorStop(1, ind.colorEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(padding.left, yTop, width - padding.left - padding.right, yBottom - yTop);
      }
    }

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    ctx.fillStyle = "#8b9cb3";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    var yAxisStep = (pHMax - pHMin) <= 2 ? 0.5 : (pHMax - pHMin) <= 7 ? 1 : 2;
    for (var pH = Math.ceil(pHMin * 2) / 2; pH <= pHMax; pH += yAxisStep) {
      var y = yScale(pH);
      if (y >= padding.top && y <= height - padding.bottom) {
        ctx.fillText(pH.toFixed(1), padding.left - 6, y + 4);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + 4, y);
        ctx.stroke();
      }
    }
    ctx.textAlign = "right";
    var tickIncrement = Math.round(VMax / 10);
    if (tickIncrement < 1) tickIncrement = 1;
    var v, x, i;
    for (i = 0; i < 10; i++) {
      v = (i / 10) * VMax;
      x = xScale(v);
      if (x < padding.left || x > width - padding.right) continue;
      ctx.beginPath();
      ctx.moveTo(x, height - padding.bottom);
      ctx.lineTo(x, height - padding.bottom - 8);
      ctx.stroke();
      ctx.fillText(String(i * tickIncrement), x, height - padding.bottom + 18);
    }

    ctx.fillText("pH", padding.left - 10, padding.top - 8);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Titrant volume (mL)", (padding.left + width - padding.right) / 2, height - padding.bottom + 22);
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = "#58a6ff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    var first = true;
    for (var i = 0; i < data.length; i++) {
      var x = xScale(data[i].V);
      var y = yScale(data[i].pH);
      if (first) { ctx.moveTo(x, y); first = false; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    var eq = options && options.equivalencePoint;
    if (eq && eq.V != null && eq.pH != null) {
      var ex = xScale(eq.V);
      var ey = yScale(eq.pH);
      var inPlot = ex >= padding.left && ex <= width - padding.right && ey >= padding.top && ey <= height - padding.bottom;
      if (inPlot) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#30363d";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#e6edf3";
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left";
        var pHText = "pH " + eq.pH.toFixed(2);
        var textX = ex + 8;
        if (textX + ctx.measureText(pHText).width > width - padding.right) textX = ex - ctx.measureText(pHText).width - 8;
        ctx.fillText(pHText, textX, ey + 4);
      }
    }

    var hover = options && options.hoverPoint;
    if (hover && hover.V != null && hover.pH != null) {
      var hx = xScale(hover.V);
      var hy = yScale(hover.pH);
      var inPlotH = hx >= padding.left && hx <= width - padding.right && hy >= padding.top && hy <= height - padding.bottom;
      if (inPlotH) {
        ctx.strokeStyle = "rgba(255, 105, 180, 0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx, height - padding.bottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(padding.left, hy);
        ctx.stroke();
        ctx.fillStyle = "#ff69b4";
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#e6edf3";
        ctx.font = "12px system-ui, sans-serif";
        ctx.textAlign = "left";
        var label = "pH " + hover.pH.toFixed(1) + ", " + hover.V.toFixed(1) + " mL";
        var lx = hx + 10;
        if (lx + ctx.measureText(label).width > width - padding.right) lx = hx - ctx.measureText(label).width - 10;
        ctx.fillText(label, lx, hy + 4);
      }
    }
  }

  function interpolatepH(data, V) {
    if (!data || data.length === 0) return null;
    if (V <= data[0].V) return data[0].pH;
    if (V >= data[data.length - 1].V) return data[data.length - 1].pH;
    for (var i = 0; i < data.length - 1; i++) {
      if (data[i].V <= V && V <= data[i + 1].V) {
        var t = (V - data[i].V) / (data[i + 1].V - data[i].V);
        return data[i].pH + t * (data[i + 1].pH - data[i].pH);
      }
    }
    return data[data.length - 1].pH;
  }

  var paddingRef = { top: 24, right: 24, bottom: 32, left: 44 };

  function setupHover(canvasId, getDataAndOptions) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof getDataAndOptions !== "function") return;
    function handleMove(e) {
      var state = getDataAndOptions();
      if (!state || !state.data || state.data.length === 0) {
        drawCurve(canvasId, [], state && state.options ? state.options : {});
        return;
      }
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var x = (e.clientX - rect.left) * scaleX;
      var y = (e.clientY - rect.top) * scaleY;
      var width = canvas.width;
      var height = canvas.height;
      var pad = paddingRef;
      if (x < pad.left || x > width - pad.right || y < pad.top || y > height - pad.bottom) {
        var opt = {};
        for (var k in state.options) if (state.options.hasOwnProperty(k)) opt[k] = state.options[k];
        delete opt.hoverPoint;
        drawCurve(canvasId, state.data, opt);
        return;
      }
      if (!state.options) return;
      var VMax = state.options.VMax != null ? state.options.VMax : 60;
      var plotW = width - pad.left - pad.right;
      var V = ((x - pad.left) / plotW) * VMax;
      if (V < 0) V = 0;
      var pH = interpolatepH(state.data, V);
      if (pH == null) return;
      var opt = {};
      for (var k in state.options) if (state.options.hasOwnProperty(k)) opt[k] = state.options[k];
      opt.hoverPoint = { V: V, pH: pH };
      drawCurve(canvasId, state.data, opt);
    }
    function handleLeave() {
      var state = getDataAndOptions();
      if (!state) return;
      var opt = state.options ? {} : null;
      if (opt && state.options) {
        for (var k in state.options) if (state.options.hasOwnProperty(k)) opt[k] = state.options[k];
        delete opt.hoverPoint;
      }
      drawCurve(canvasId, state.data || [], opt || {});
    }
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
  }

  global.TitratorCurve = {
    draw: drawCurve,
    setupHover: setupHover
  };
})(this);
