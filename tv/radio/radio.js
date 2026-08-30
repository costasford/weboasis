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
					out.push({
						title: out.length === 0 ? label : label + " " + (out.length + 1),
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
		stations.forEach(function (s) {
			if (seen[s.url]) return;
			seen[s.url] = true;
			var li = document.createElement("li");
			li.setAttribute("data-title", s.title);
			li.setAttribute("data-type", s.type);
			li.setAttribute("data-url", s.url);
			listEl.appendChild(li);
		});
		window.initCleanAudioPlayer();
	});
})();
