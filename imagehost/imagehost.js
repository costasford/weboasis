var BASE = window.SITE_SERVICES_URL;

var dropzone = document.getElementById("dropzone");
var dropzoneText = document.getElementById("dropzone-text");
var fileInput = document.getElementById("file-input");
var preview = document.getElementById("preview");
var previewImg = document.getElementById("preview-img");
var uploadBtn = document.getElementById("upload-btn");
var errorBox = document.getElementById("error-box");
var resultBox = document.getElementById("result-box");
var resultUrl = document.getElementById("result-url");
var copyBtn = document.getElementById("copy-btn");

var selectedFile = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("visible");
  resultBox.classList.remove("visible");
}

function selectFile(file) {
  if (!file) return;
  selectedFile = file;
  dropzoneText.textContent = file.name;
  previewImg.src = URL.createObjectURL(file);
  preview.classList.add("visible");
  uploadBtn.disabled = false;
  errorBox.classList.remove("visible");
  resultBox.classList.remove("visible");
}

fileInput.addEventListener("change", function () {
  selectFile(fileInput.files[0]);
});

dropzone.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", function () {
  dropzone.classList.remove("dragover");
});
dropzone.addEventListener("drop", function (e) {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if (e.dataTransfer.files[0]) selectFile(e.dataTransfer.files[0]);
});

uploadBtn.addEventListener("click", function () {
  if (!selectedFile) return;
  uploadBtn.disabled = true;
  errorBox.classList.remove("visible");

  var formData = new FormData();
  formData.append("image", selectedFile);

  fetch(BASE + "/upload", { method: "POST", body: formData })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Upload failed");
        return data;
      });
    })
    .then(function (data) {
      resultUrl.value = data.url;
      resultBox.classList.add("visible");
    })
    .catch(function (err) {
      showError(err.message);
    })
    .then(function () {
      uploadBtn.disabled = false;
    });
});

copyBtn.addEventListener("click", function () {
  resultUrl.select();
  navigator.clipboard.writeText(resultUrl.value).then(function () {
    copyBtn.textContent = "Copied!";
    setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500);
  });
});
