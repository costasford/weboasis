var one = "";
var two = "";
var three = "";

// Searches archive.org's public-domain film collections directly — their
// search API sends permissive CORS headers, so no proxy is needed at all.
function search() {
	var q = document.getElementById('movie').value;
	document.getElementById("buttlol").innerHTML = "Searching";
	var query = encodeURIComponent(q) +
		' AND (collection:(feature_films) OR collection:(prelinger) OR collection:(opensource_movies))' +
		' AND mediatype:(movies)';
	var url = "https://archive.org/advancedsearch.php?q=" + query +
		"&fl[]=identifier&fl[]=title&fl[]=year&sort[]=downloads+desc&rows=3&output=json";
	fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error("NETWORK RESPONSE ERROR");
			}
		})
		.then(data => {
			makeVisible();
			clear();
			document.getElementById("buttlol").innerHTML = "Searched";
			var docs = data["response"]["docs"];
			var count = docs.length;
			if (count < 2) {
				document.getElementById("2title").style.visibility = "hidden";
				document.getElementById("2img").style.visibility = "hidden";
			}
			if (count < 3) {
				document.getElementById("3title").style.visibility = "hidden";
				document.getElementById("3img").style.visibility = "hidden";
			}
			if (count >= 1) {
				document.getElementById("1title").innerHTML = docs[0]["title"] + (docs[0]["year"] ? " " + docs[0]["year"] : "");
				document.getElementById("1img").src = "https://archive.org/services/img/" + docs[0]["identifier"];
				one = docs[0]["identifier"];
			}
			if (count >= 2) {
				document.getElementById("2title").innerHTML = docs[1]["title"] + (docs[1]["year"] ? " " + docs[1]["year"] : "");
				document.getElementById("2img").src = "https://archive.org/services/img/" + docs[1]["identifier"];
				two = docs[1]["identifier"];
			}
			if (count >= 3) {
				document.getElementById("3title").innerHTML = docs[2]["title"] + (docs[2]["year"] ? " " + docs[2]["year"] : "");
				document.getElementById("3img").src = "https://archive.org/services/img/" + docs[2]["identifier"];
				three = docs[2]["identifier"];
			}
		})
		.catch((error) => console.error("FETCH ERROR:", error));
}
let input = document.getElementById('movie');
let timeout = null;
function makeVisible() {
    document.getElementById("1title").style.visibility = 'visible';
    document.getElementById("2title").style.visibility = 'visible';
    document.getElementById("3title").style.visibility = 'visible';
    document.getElementById("1img").style.visibility = 'visible';
    document.getElementById("2img").style.visibility = 'visible';
    document.getElementById("3img").style.visibility = 'visible';
}
function makeHidden() {
    document.getElementById("1title").style.visibility = 'hidden';
    document.getElementById("2title").style.visibility = 'hidden';
    document.getElementById("3title").style.visibility = 'hidden';
    document.getElementById("1img").style.visibility = 'hidden';
    document.getElementById("2img").style.visibility = 'hidden';
    document.getElementById("3img").style.visibility = 'hidden';
}
function clear() {
    document.getElementById("1title").innerHTML = 'No movie found';
    document.getElementById("2title").innerHTML = 'No movie found';
    document.getElementById("3title").innerHTML = 'No movie found';
    document.getElementById("1img").src = '';
    document.getElementById("2img").src = '';
    document.getElementById("3img").src = '';
    one = "";
    two = "";
    three = "";
}
function clickPress(event) {
    clearTimeout(timeout);
    if (event.keyCode == 13) {
        search();
        return;
    }
    timeout = setTimeout(function () {
        search();
    }, 300);
}
function playerSize() {
	var winwidth = Math.max(window.screen.width, window.innerWidth);
	if (winwidth < 500) return { w: 336, h: 189 };
	if (winwidth < 750) return { w: 640, h: 360 };
	return { w: 720, h: 405 };
}
function ooh() {
    document.getElementById('movie').style.backgroundColor = "#202020";
    document.getElementById('movie').style.color = "white";
    document.body.style.backgroundColor = "#202020";
}

// Plays the item using archive.org's own embed player — their officially
// supported way to play any item regardless of its underlying format, so
// there's nothing to extract, no CORS proxy, and no DRM/token dance.
function getm3u8(identifier) {
	ooh();
	var size = playerSize();
	var old = document.getElementById('video');
	var iframe = document.createElement('iframe');
	iframe.id = 'video';
	iframe.src = "https://archive.org/embed/" + identifier;
	iframe.width = size.w;
	iframe.height = size.h;
	iframe.style.margin = "0 auto";
	iframe.style.display = "block";
	iframe.style.border = "none";
	iframe.setAttribute("allowfullscreen", "true");
	old.parentNode.replaceChild(iframe, old);
	clear();
	makeHidden();
	document.getElementById("buttlol").innerHTML = "Search";
	window.scroll({
		top: 150,
		behavior: 'smooth'
	});
}
function newsearch() {
	window.location.reload(true);
}
