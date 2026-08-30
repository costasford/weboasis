// Populates the station list from the Radio Browser API (radio-browser.info)
// instead of a hand-maintained, decaying list of hardcoded stream URLs.
// Radio Browser tracks stream health itself (lastcheckok), so filtering on
// that keeps this list self-cleaning without any manual upkeep here.

(function () {
	var API_HOSTS = [
		"https://de1.api.radio-browser.info",
		"https://de2.api.radio-browser.info",
		"https://nl1.api.radio-browser.info",
		"https://at1.api.radio-browser.info",
	];

	var CATEGORIES = [
		"60s", "70s", "80s", "90s", "2010s",
		"top 40", "adult hits", "alternative", "classic rock", "classical",
		"country", "dubstep", "electronic", "funk", "hip hop",
		"house", "indie", "jazz", "k-pop", "latin",
		"metal", "punk", "rock", "soundtrack", "vaporwave",
		"news", "talk", "comedy",
	];

	var STATIONS_PER_CATEGORY = 4;

	function codecToType(codec) {
		codec = (codec || "").toUpperCase();
		if (codec.indexOf("MP3") !== -1) return "mp3";
		if (codec.indexOf("AAC") !== -1) return "m4a";
		return null;
	}

	function titleCase(tag) {
		return tag.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
	}

	function cleanStationName(name, fallbackLabel) {
		name = (name || "").trim().replace(/\s+/g, " ");
		return name || fallbackLabel;
	}

	function fetchCategory(host, tag) {
		var url = host + "/json/stations/bytag/" + encodeURIComponent(tag) +
			"?order=clickcount&reverse=true&hidebroken=true&limit=" + (STATIONS_PER_CATEGORY * 2);
		return fetch(url, { headers: { Accept: "application/json" } })
			.then(function (res) { return res.ok ? res.json() : []; })
			.then(function (stations) {
				var label = titleCase(tag);
				var out = [];
				for (var i = 0; i < stations.length && out.length < STATIONS_PER_CATEGORY; i++) {
					var s = stations[i];
					var type = codecToType(s.codec);
					if (!type || !s.url_resolved) continue;
					var name = cleanStationName(s.name, label + " " + (out.length + 1));
					out.push({
						title: label + ": " + name,
						artist: s.countrycode || label,
						type: type,
						url: s.url_resolved,
					});
				}
				return out;
			})
			.catch(function () { return []; });
	}

	function tryHost(hostIndex) {
		if (hostIndex >= API_HOSTS.length) return Promise.resolve([]);
		var host = API_HOSTS[hostIndex];
		return Promise.all(CATEGORIES.map(function (tag) { return fetchCategory(host, tag); }))
			.then(function (results) {
				var flat = results.reduce(function (a, b) { return a.concat(b); }, []);
				return flat.length ? flat : tryHost(hostIndex + 1);
			})
			.catch(function () { return tryHost(hostIndex + 1); });
	}

	var FAVORITES_KEY = "radioFavorites";

	function loadFavorites() {
		try {
			var raw = JSON.parse(localStorage.getItem(FAVORITES_KEY));
			return Array.isArray(raw) ? raw : [];
		} catch (e) {
			return [];
		}
	}

	function saveFavorites(urls) {
		try {
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(urls));
		} catch (e) {}
	}

	function setupExtras(rows) {
		var favorites = loadFavorites();
		var favoritesSet = {};
		favorites.forEach(function (url) { favoritesSet[url] = true; });

		var searchInput = document.getElementById("station-search");
		var favToggle = document.getElementById("favorites-toggle");
		var emptyMsg = document.getElementById("radio-empty-msg");
		var favoritesOnly = false;

		rows.forEach(function (row) {
			var container = row.li.querySelector("div");
			if (!container) return;
			var favBtn = document.createElement("span");
			favBtn.className = "mdtc-clnplra-playlist-item-fav" + (favoritesSet[row.url] ? " active" : "");
			favBtn.textContent = favoritesSet[row.url] ? "★" : "☆";
			favBtn.title = "Toggle favorite";
			favBtn.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				if (favoritesSet[row.url]) {
					delete favoritesSet[row.url];
				} else {
					favoritesSet[row.url] = true;
				}
				favBtn.classList.toggle("active", !!favoritesSet[row.url]);
				favBtn.textContent = favoritesSet[row.url] ? "★" : "☆";
				saveFavorites(Object.keys(favoritesSet));
				applyFilter();
			});
			container.insertBefore(favBtn, container.firstChild);
			row.favBtn = favBtn;
		});

		function applyFilter() {
			var term = searchInput.value.trim().toLowerCase();
			var visibleCount = 0;
			rows.forEach(function (row) {
				var matchesSearch = !term ||
					row.title.toLowerCase().indexOf(term) !== -1 ||
					row.artist.toLowerCase().indexOf(term) !== -1;
				var matchesFavorites = !favoritesOnly || !!favoritesSet[row.url];
				var visible = matchesSearch && matchesFavorites;
				row.li.style.display = visible ? "" : "none";
				if (visible) visibleCount++;
			});
			emptyMsg.style.display = visibleCount === 0 ? "block" : "none";
		}

		searchInput.addEventListener("input", applyFilter);
		favToggle.addEventListener("click", function () {
			favoritesOnly = !favoritesOnly;
			favToggle.classList.toggle("active", favoritesOnly);
			applyFilter();
		});
	}

	var listEl = document.querySelector(".mediatec-cleanaudioplayer ul");

	tryHost(0).then(function (stations) {
		if (!stations.length) {
			listEl.insertAdjacentHTML(
				"beforebegin",
				'<p style="color:#fff;text-align:center;padding:20px">' +
					"Couldn't reach the station directory right now. Try reloading in a bit." +
					"</p>"
			);
			return;
		}
		var seen = {};
		var deduped = [];
		stations.forEach(function (s) {
			if (seen[s.url]) return;
			seen[s.url] = true;
			deduped.push(s);
			var li = document.createElement("li");
			li.setAttribute("data-title", s.title);
			li.setAttribute("data-artist", s.artist);
			li.setAttribute("data-type", s.type);
			li.setAttribute("data-url", s.url);
			listEl.appendChild(li);
		});
		window.initCleanAudioPlayer();

		// The plugin re-renders its own <li> elements from the source list
		// above, in the same order — zip them back up with our station data
		// so search/favorites have a title/url to work with per row. That
		// render isn't synchronous with the call above (it's still empty
		// immediately after), so poll briefly instead of assuming it's done.
		function waitForRenderedRows(attemptsLeft) {
			var renderedRows = document.querySelectorAll(".mdtc-clnplra-playlist ul li");
			if (renderedRows.length === 0 && attemptsLeft > 0) {
				setTimeout(function () { waitForRenderedRows(attemptsLeft - 1); }, 50);
				return;
			}
			var rows = deduped.map(function (s, i) {
				return { url: s.url, title: s.title, artist: s.artist, li: renderedRows[i] };
			}).filter(function (row) { return !!row.li; });
			setupExtras(rows);
		}
		waitForRenderedRows(40);
	});
})();
