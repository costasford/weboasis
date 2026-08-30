var BASE = window.SITE_SERVICES_URL;

var urlInput = document.getElementById("url-input");
var shortenBtn = document.getElementById("shorten-btn");
var errorBox = document.getElementById("error-box");
var resultBox = document.getElementById("result-box");
var resultUrl = document.getElementById("result-url");
var copyBtn = document.getElementById("copy-btn");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("visible");
  resultBox.classList.remove("visible");
}

function shorten() {
  var url = urlInput.value.trim();
  if (!url) return;

  errorBox.classList.remove("visible");
  shortenBtn.disabled = true;

  fetch(BASE + "/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url }),
  })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
      });
    })
    .then(function (data) {
      resultUrl.value = BASE + "/s/" + data.code;
      resultBox.classList.add("visible");
    })
    .catch(function (err) {
      showError(err.message);
    })
    .then(function () {
      shortenBtn.disabled = false;
    });
}

shortenBtn.addEventListener("click", shorten);
urlInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") shorten();
});

copyBtn.addEventListener("click", function () {
  resultUrl.select();
  navigator.clipboard.writeText(resultUrl.value).then(function () {
    copyBtn.textContent = "Copied!";
    setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500);
  });
});
