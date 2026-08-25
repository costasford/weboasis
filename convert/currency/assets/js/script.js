
(function ($) {
    "use strict";

    // Units-of-CODE-per-1-USD, populated once fetchRates() resolves.
    var usdRates = null;

    function isNumber(value) {
        return value !== "" && !isNaN(value) && isFinite(value);
    }

    var loading = {
        start: function () {
            $('.exchange-btn').html('<i class="fa fa-refresh fa-spin"></i>');
        },
        done: function () {
            $('.exchange-btn').html('<i class="fa fa-exchange"></i>');
        }
    };

    function optionHtml(currency, selected) {
        var content = "<img class='flag' src='" + currency.flag + "'> " +
            "<span class='currency_code'>" + currency.currency_code + "</span> " +
            "<span class='currency_name'>" + currency.currency_name + "</span>";
        return '<option data-content="' + content.replace(/"/g, "&quot;") + '"' +
            (selected ? " selected" : "") +
            ' value="' + currency.currency_code + '">' + currency.currency_code + '</option>';
    }

    function populateSelects() {
        var fromHtml = "";
        var toHtml = "";
        CURRENCIES.forEach(function (currency) {
            fromHtml += optionHtml(currency, currency.currency_code === "USD");
            toHtml += optionHtml(currency, currency.currency_code === "BTC");
        });
        $("#fromCurr").html(fromHtml);
        $("#toCurr").html(toHtml);
        $(".selectpicker").selectpicker();
    }

    function populateReferenceTables() {
        var half = Math.round(CURRENCIES.length / 2);
        var rowHtml = function (currency) {
            return "<tr><td class='flag'><img src='" + currency.flag + "' width='24' alt='National flag of " +
                currency.country_fullname + "'></td><td>" + currency.currency_code + "</td><td>" +
                currency.currency_name + "</td><td>" + currency.country_name + "</td></tr>";
        };
        var left = "", right = "";
        CURRENCIES.forEach(function (currency, i) {
            if (i < half) {
                left += rowHtml(currency);
            } else {
                right += rowHtml(currency);
            }
        });
        $("#currencyTableLeft").html(left);
        $("#currencyTableRight").html(right);
    }

    function fetchRates() {
        var fiat = $.getJSON("https://open.er-api.com/v6/latest/USD");
        var btc = $.getJSON("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");

        return $.when(fiat, btc).then(function (fiatResp, btcResp) {
            var rates = fiatResp[0].rates || {};
            var btcUsd = btcResp[0] && btcResp[0].bitcoin && btcResp[0].bitcoin.usd;
            if (btcUsd) {
                rates.BTC = 1 / btcUsd; // BTC per 1 USD, same convention as the fiat rates
            }
            usdRates = rates;
            $("#ratesNote").text("Live rates via open.er-api.com" + (btcUsd ? " & CoinGecko" : "") + ".");
        }, function () {
            $("#ratesNote").text("Couldn't load live exchange rates right now - try reloading the page.");
        });
    }

    function currencyConverter() {
        if (!usdRates) {
            return;
        }
        loading.start();
        var fromCurr = $('select[name=fromCurr]').val();
        var toCurr = $('select[name=toCurr]').val();
        var finpt = $('input[name=finpt]').val();

        if (!isNumber(finpt)) {
            loading.done();
            return;
        }
        finpt = parseFloat(finpt);

        if (fromCurr === toCurr) {
            $('#tinpt').val(finpt);
            loading.done();
            return;
        }

        if (!usdRates[fromCurr] || !usdRates[toCurr]) {
            loading.done();
            alert("No live rate available for " + (usdRates[fromCurr] ? toCurr : fromCurr) + " right now.");
            return;
        }

        var usdAmount = finpt / usdRates[fromCurr];
        var result = usdAmount * usdRates[toCurr];
        var decimals = (fromCurr === "BTC" || toCurr === "BTC") ? 8 : 2;
        $('#tinpt').val(result.toFixed(decimals));
        loading.done();
    }

    $(document).ready(function () {
        $("#copyrightYear").text(new Date().getFullYear());
        populateSelects();
        populateReferenceTables();

        $(document).on('change', '.exchange-btn,select[name=fromCurr],select[name=toCurr],input[name=finpt]', function () {
            currencyConverter();
        });
        $(".exchange-btn").click(function () {
            var from = $('select[name=fromCurr]').val();
            var to = $('select[name=toCurr]').val();
            $('select[name=toCurr]').val(from);
            $('select[name=fromCurr]').val(to);
            $('.selectpicker').selectpicker('refresh');
            setTimeout(currencyConverter, 100);
        });

        fetchRates().then(currencyConverter);
    });
})(jQuery);
