// Lightweight crypto price table. Replaces the old X4CryptoTables WordPress
// widget, which was hard-wired to CoinCap's v2 API - CoinCap retired that
// API entirely (moved to a key-gated v3 under a different domain), so the
// widget was permanently stuck on its loading spinner. This talks to
// CoinGecko's free, keyless /coins/markets endpoint instead.

(function () {
  var API = "https://api.coingecko.com/api/v3/coins/markets";
  var PER_PAGE = 100;

  var state = {
    coins: [],
    filtered: [],
    currency: "usd",
    sortKey: "market_cap_rank",
    sortDir: 1,
    search: "",
  };

  var CURRENCIES = [
    ["usd", "USD"],
    ["eur", "EUR"],
    ["gbp", "GBP"],
    ["jpy", "JPY"],
    ["btc", "BTC"],
  ];

  var CURRENCY_SYMBOLS = { usd: "$", eur: "€", gbp: "£", jpy: "¥", btc: "₿" };

  var COLUMNS = [
    { key: "market_cap_rank", label: "#" },
    { key: "name", label: "Coin" },
    { key: "current_price", label: "Price" },
    { key: "price_change_percentage_24h", label: "24h %" },
    { key: "market_cap", label: "Market Cap" },
    { key: "total_volume", label: "Volume (24h)" },
  ];

  function fmtPrice(n) {
    if (n === null || n === undefined) return "—";
    var sym = CURRENCY_SYMBOLS[state.currency] || "";
    var decimals = n < 1 ? 6 : 2;
    return sym + n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function fmtLarge(n) {
    if (n === null || n === undefined) return "—";
    var sym = CURRENCY_SYMBOLS[state.currency] || "";
    if (n >= 1e12) return sym + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return sym + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return sym + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return sym + (n / 1e3).toFixed(2) + "K";
    return sym + n.toFixed(2);
  }

  function fmtPct(n) {
    if (n === null || n === undefined) return "—";
    var sign = n > 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      e.appendChild(c);
    });
    return e;
  }

  function applyFilterSort() {
    var q = state.search.trim().toLowerCase();
    state.filtered = state.coins.filter(function (c) {
      return !q || c.name.toLowerCase().indexOf(q) !== -1 || c.symbol.toLowerCase().indexOf(q) !== -1;
    });
    state.filtered.sort(function (a, b) {
      var av = a[state.sortKey];
      var bv = b[state.sortKey];
      if (typeof av === "string") return state.sortDir * av.localeCompare(bv);
      av = av === null || av === undefined ? -Infinity : av;
      bv = bv === null || bv === undefined ? -Infinity : bv;
      return state.sortDir * (av - bv);
    });
  }

  function render(root) {
    applyFilterSort();
    var table = root.querySelector(".ct-table");
    var tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    state.filtered.forEach(function (c) {
      var changeClass = c.price_change_percentage_24h > 0 ? "ct-up" : c.price_change_percentage_24h < 0 ? "ct-down" : "";
      var row = el("tr", {}, [
        el("td", { class: "ct-rank", text: c.market_cap_rank || "—" }),
        el(
          "td",
          { class: "ct-coin" },
          [
            el("img", { src: c.image, alt: "", class: "ct-icon", loading: "lazy" }),
            el("span", { text: c.name + " " }),
            el("span", { class: "ct-symbol", text: c.symbol.toUpperCase() }),
          ]
        ),
        el("td", { class: "ct-num", text: fmtPrice(c.current_price) }),
        el("td", { class: "ct-num " + changeClass, text: fmtPct(c.price_change_percentage_24h) }),
        el("td", { class: "ct-num", text: fmtLarge(c.market_cap) }),
        el("td", { class: "ct-num", text: fmtLarge(c.total_volume) }),
      ]);
      var link = el("a", {
        href: "https://www.coingecko.com/en/coins/" + c.id,
        target: "_blank",
        rel: "noopener noreferrer",
        class: "ct-row-link",
      });
      row.addEventListener("click", function () {
        window.open(link.href, "_blank", "noopener");
      });
      tbody.appendChild(row);
    });

    root.querySelectorAll(".ct-th").forEach(function (th) {
      th.classList.toggle("ct-sort-active", th.getAttribute("data-key") === state.sortKey);
    });
  }

  function fetchCoins(root) {
    var status = root.querySelector(".ct-status");
    status.textContent = "Loading…";
    status.className = "ct-status";

    var url =
      API +
      "?vs_currency=" +
      state.currency +
      "&order=market_cap_desc&per_page=" +
      PER_PAGE +
      "&page=1&sparkline=false&price_change_percentage=24h";

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.coins = data;
        status.textContent = "Updated " + new Date().toLocaleTimeString();
        render(root);
      })
      .catch(function (err) {
        status.textContent = "Couldn't load prices right now (" + err.message + "). Try again shortly.";
        status.className = "ct-status ct-error";
      });
  }

  function build(root) {
    var toolbar = el("div", { class: "ct-toolbar" }, [
      el("input", { class: "ct-search", type: "search", placeholder: "Search coins…" }),
      el(
        "select",
        { class: "ct-currency" },
        CURRENCIES.map(function (c) {
          return el("option", { value: c[0], text: c[1] });
        })
      ),
      el("span", { class: "ct-status", text: "Loading…" }),
    ]);

    var thead = el(
      "tr",
      {},
      COLUMNS.map(function (c) {
        return el("th", { class: "ct-th", "data-key": c.key, text: c.label });
      })
    );

    var table = el("table", { class: "ct-table" }, [
      el("thead", {}, [thead]),
      el("tbody", {}, []),
    ]);

    root.appendChild(toolbar);
    root.appendChild(el("div", { class: "ct-table-wrap" }, [table]));

    root.querySelector(".ct-search").addEventListener("input", function (e) {
      state.search = e.target.value;
      render(root);
    });
    root.querySelector(".ct-currency").addEventListener("change", function (e) {
      state.currency = e.target.value;
      fetchCoins(root);
    });
    root.querySelectorAll(".ct-th").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-key");
        if (state.sortKey === key) {
          state.sortDir *= -1;
        } else {
          state.sortKey = key;
          state.sortDir = key === "name" ? 1 : -1;
        }
        render(root);
      });
    });

    fetchCoins(root);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("main-widget");
    if (root) build(root);
  });
})();
