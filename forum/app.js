// Simple placeholder forum: threads + replies stored in this browser's
// localStorage only (not shared between visitors). Meant to hold the
// nav slot until a real shared backend is built.
var STORAGE_KEY = "forum-threads";
var NAME_KEY = "forum-name";
var activeThreadId = null;

var els = {
  nameInput: document.getElementById("name-input"),
  views: {
    list: document.getElementById("view-list"),
    new: document.getElementById("view-new"),
    thread: document.getElementById("view-thread"),
  },
  threadList: document.getElementById("thread-list"),
  newThreadBtn: document.getElementById("new-thread-btn"),
  cancelNew: document.getElementById("cancel-new"),
  cancelNew2: document.getElementById("cancel-new-2"),
  newTitle: document.getElementById("new-title"),
  newBody: document.getElementById("new-body"),
  postThreadBtn: document.getElementById("post-thread-btn"),
  backToList: document.getElementById("back-to-list"),
  threadContent: document.getElementById("thread-content"),
  replyCount: document.getElementById("reply-count"),
  replyList: document.getElementById("reply-list"),
  replyBody: document.getElementById("reply-body"),
  postReplyBtn: document.getElementById("post-reply-btn"),
};

function loadThreads() {
  try {
    var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveThreads(threads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

function getName() {
  return els.nameInput.value.trim() || "Anonymous";
}

function escapeHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function timeAgo(ts) {
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  var days = Math.floor(hours / 24);
  return days + "d ago";
}

function showView(name) {
  Object.keys(els.views).forEach(function (key) {
    els.views[key].classList.toggle("active", key === name);
  });
}

function renderList() {
  var threads = loadThreads().slice().sort(function (a, b) {
    var aLast = a.replies.length ? a.replies[a.replies.length - 1].createdAt : a.createdAt;
    var bLast = b.replies.length ? b.replies[b.replies.length - 1].createdAt : b.createdAt;
    return bLast - aLast;
  });

  if (!threads.length) {
    els.threadList.innerHTML = '<div class="empty">No threads yet. Start the first one.</div>';
    return;
  }

  els.threadList.innerHTML = threads
    .map(function (t) {
      var replyWord = t.replies.length === 1 ? "reply" : "replies";
      return (
        '<a class="thread-card" href="#" data-id="' +
        t.id +
        '"><h3>' +
        escapeHtml(t.title) +
        '</h3><div class="meta">by ' +
        escapeHtml(t.name) +
        " · " +
        timeAgo(t.createdAt) +
        " · " +
        t.replies.length +
        " " +
        replyWord +
        "</div></a>"
      );
    })
    .join("");
}

function openThread(id) {
  var threads = loadThreads();
  var thread = threads.filter(function (t) {
    return t.id === id;
  })[0];
  if (!thread) {
    showView("list");
    renderList();
    return;
  }
  activeThreadId = id;

  els.threadContent.innerHTML =
    '<div class="post"><div class="meta">' +
    escapeHtml(thread.name) +
    " · " +
    timeAgo(thread.createdAt) +
    '</div><h2 style="margin:0 0 10px;font-size:19px;font-weight:500;">' +
    escapeHtml(thread.title) +
    '</h2><div class="body">' +
    escapeHtml(thread.body) +
    "</div></div>";

  els.replyCount.textContent =
    thread.replies.length + (thread.replies.length === 1 ? " reply" : " replies");

  els.replyList.innerHTML = thread.replies
    .map(function (r) {
      return (
        '<div class="post"><div class="meta">' +
        escapeHtml(r.name) +
        " · " +
        timeAgo(r.createdAt) +
        '</div><div class="body">' +
        escapeHtml(r.body) +
        "</div></div>"
      );
    })
    .join("");

  els.replyBody.value = "";
  showView("thread");
}

els.newThreadBtn.addEventListener("click", function () {
  els.newTitle.value = "";
  els.newBody.value = "";
  showView("new");
});
els.cancelNew.addEventListener("click", function (e) {
  e.preventDefault();
  showView("list");
});
els.cancelNew2.addEventListener("click", function () {
  showView("list");
});

els.postThreadBtn.addEventListener("click", function () {
  var title = els.newTitle.value.trim();
  var body = els.newBody.value.trim();
  if (!title || !body) return;

  var threads = loadThreads();
  var thread = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title: title,
    name: getName(),
    body: body,
    createdAt: Date.now(),
    replies: [],
  };
  threads.push(thread);
  saveThreads(threads);
  if (els.nameInput.value.trim()) localStorage.setItem(NAME_KEY, els.nameInput.value.trim());

  showView("list");
  renderList();
});

els.threadList.addEventListener("click", function (e) {
  var card = e.target.closest(".thread-card");
  if (!card) return;
  e.preventDefault();
  openThread(card.getAttribute("data-id"));
});

els.backToList.addEventListener("click", function (e) {
  e.preventDefault();
  showView("list");
  renderList();
});

els.postReplyBtn.addEventListener("click", function () {
  var body = els.replyBody.value.trim();
  if (!body || !activeThreadId) return;

  var threads = loadThreads();
  var thread = threads.filter(function (t) {
    return t.id === activeThreadId;
  })[0];
  if (!thread) return;

  thread.replies.push({
    name: getName(),
    body: body,
    createdAt: Date.now(),
  });
  saveThreads(threads);
  if (els.nameInput.value.trim()) localStorage.setItem(NAME_KEY, els.nameInput.value.trim());
  openThread(activeThreadId);
});

// restore remembered display name
els.nameInput.value = localStorage.getItem(NAME_KEY) || "";

renderList();
