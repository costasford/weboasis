// Yahoo Finance's own quote/quoteSummary APIs now require an auth "crumb"
// this app never had, but the chart endpoint (v8/finance/chart) is still
// open and covers both the current quote and historical prices. It sends
// no CORS headers, so requests go through the same CORS proxy Worker used
// by news/tech/twitter.
var PROXY = "https://broken-bonus-6b48.costasford.workers.dev/";
var CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

var chart = null;
var currentSymbol = null;
var currentRange = "3mo";
var currentInterval = "1d";

var els = {
  input: document.getElementById("symbol-input"),
  button: document.getElementById("search-btn"),
  status: document.getElementById("status"),
  result: document.getElementById("result"),
  name: document.getElementById("q-name"),
  symbol: document.getElementById("q-symbol"),
  price: document.getElementById("q-price"),
  change: document.getElementById("q-change"),
  prevClose: document.getElementById("s-prevclose"),
  dayRange: document.getElementById("s-dayrange"),
  yearRange: document.getElementById("s-yearrange"),
  volume: document.getElementById("s-volume"),
  currency: document.getElementById("s-currency"),
  exchange: document.getElementById("s-exchange"),
  rangeButtons: document.querySelectorAll(".range-buttons button"),
};

function fmtNum(n, decimals) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtVolume(n) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return String(n);
}

function setStatus(text, isError) {
  els.status.textContent = text;
  els.status.className = isError ? "error" : "";
}

function search(symbol) {
  symbol = symbol.trim().toUpperCase();
  if (!symbol) return;
  currentSymbol = symbol;
  els.result.style.display = "none";
  setStatus("Loading " + symbol + "...");

  fetchChart(symbol, currentRange, currentInterval);
}

function fetchChart(symbol, range, interval) {
  var url =
    PROXY +
    CHART_URL +
    encodeURIComponent(symbol) +
    "?range=" +
    range +
    "&interval=" +
    interval;

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      var result = json && json.chart && json.chart.result && json.chart.result[0];
      if (!result) {
        var msg =
          json && json.chart && json.chart.error && json.chart.error.description;
        setStatus(msg || "No data found for \"" + symbol + "\".", true);
        return;
      }
      render(result);
      setStatus("");
    })
    .catch(function () {
      setStatus("Couldn't reach the quote service. Try again in a moment.", true);
    });
}

function render(result) {
  var meta = result.meta;
  var quote = result.indicators.quote[0];
  var timestamps = result.timestamp || [];
  var closes = quote.close || [];

  els.name.textContent = meta.longName || meta.shortName || meta.symbol;
  els.symbol.textContent = meta.symbol + " · " + (meta.fullExchangeName || meta.exchangeName || "");

  var price = meta.regularMarketPrice;
  var prevClose = meta.chartPreviousClose || meta.previousClose;
  els.price.textContent = fmtNum(price, 2) + " " + (meta.currency || "");

  if (typeof price === "number" && typeof prevClose === "number") {
    var change = price - prevClose;
    var changePct = (change / prevClose) * 100;
    var sign = change > 0 ? "+" : "";
    els.change.textContent =
      sign + fmtNum(change, 2) + " (" + sign + fmtNum(changePct, 2) + "%)";
    els.change.className =
      "change " + (change > 0 ? "up" : change < 0 ? "down" : "flat");
  } else {
    els.change.textContent = "";
  }

  els.prevClose.textContent = fmtNum(prevClose, 2);
  els.dayRange.textContent =
    fmtNum(meta.regularMarketDayLow, 2) + " – " + fmtNum(meta.regularMarketDayHigh, 2);
  els.yearRange.textContent =
    fmtNum(meta.fiftyTwoWeekLow, 2) + " – " + fmtNum(meta.fiftyTwoWeekHigh, 2);
  els.volume.textContent = fmtVolume(meta.regularMarketVolume);
  els.currency.textContent = meta.currency || "—";
  els.exchange.textContent = meta.fullExchangeName || meta.exchangeName || "—";

  var labels = timestamps.map(function (t) {
    var d = new Date(t * 1000);
    return d.toLocaleDateString();
  });

  // close[] can contain nulls for non-trading intervals; Chart.js 2.x
  // handles that fine as a gap in the line.
  var validCloses = closes.filter(function (c) {
    return typeof c === "number";
  });
  var min = validCloses.length ? Math.min.apply(null, validCloses) * 0.98 : undefined;
  var max = validCloses.length ? Math.max.apply(null, validCloses) * 1.02 : undefined;

  var ctx = document.getElementById("chart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: meta.symbol,
          data: closes,
          borderColor: "rgb(11, 137, 195)",
          backgroundColor: "rgba(11, 137, 195, 0.15)",
          fill: true,
          borderWidth: 1.5,
          pointRadius: 0,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      legend: { display: false },
      scales: {
        yAxes: [{ ticks: { beginAtZero: false, min: min, max: max } }],
      },
    },
  });

  els.result.style.display = "block";
}

els.button.addEventListener("click", function () {
  search(els.input.value);
});
els.input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") search(els.input.value);
});
els.rangeButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    if (!currentSymbol) return;
    els.rangeButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    currentRange = btn.getAttribute("data-range");
    currentInterval = btn.getAttribute("data-interval");
    setStatus("Loading...");
    fetchChart(currentSymbol, currentRange, currentInterval);
  });
});

// default symbol so the page isn't empty on first load
search("AAPL");
