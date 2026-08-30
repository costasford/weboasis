// Forum backed by the shared Cloudflare Worker (js/site_services_worker.js)
// so threads and replies are visible to every visitor, not just this
// browser. Posting stays anonymous — just an optional display name, no
// account.
var BASE = window.SITE_SERVICES_URL;
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

function getName() {
  return els.nameInput.value.trim() || "Anonymous";
}

function escapeHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function timeAgo(sqliteTimestamp) {
  var ts = new Date(sqliteTimestamp.replace(" ", "T") + "Z").getTime();
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

function apiRequest(path, options) {
  return fetch(BASE + path, options)
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
      });
    });
}

function renderList() {
  els.threadList.innerHTML = '<div class="empty">Loading…</div>';
  apiRequest("/forum/threads")
    .then(function (data) {
      var threads = data.threads;
      if (!threads.length) {
        els.threadList.innerHTML = '<div class="empty">No threads yet. Start the first one.</div>';
        return;
      }
      els.threadList.innerHTML = threads
        .map(function (t) {
          var replyWord = t.reply_count === 1 ? "reply" : "replies";
          return (
            '<a class="thread-card" href="#" data-id="' +
            t.id +
            '"><h3>' +
            escapeHtml(t.title) +
            '</h3><div class="meta">by ' +
            escapeHtml(t.author_name) +
            " · " +
            timeAgo(t.created_at) +
            " · " +
            t.reply_count +
            " " +
            replyWord +
            "</div></a>"
          );
        })
        .join("");
    })
    .catch(function (err) {
      els.threadList.innerHTML = '<div class="empty">Couldn’t load threads: ' + escapeHtml(err.message) + "</div>";
    });
}

function openThread(id) {
  activeThreadId = id;
  els.threadContent.innerHTML = "<div class=\"post\">Loading…</div>";
  els.replyList.innerHTML = "";
  els.replyCount.textContent = "";
  showView("thread");

  apiRequest("/forum/threads/" + id)
    .then(function (data) {
      var thread = data.thread;
      els.threadContent.innerHTML =
        '<div class="post"><div class="meta">' +
        escapeHtml(thread.author_name) +
        " · " +
        timeAgo(thread.created_at) +
        '</div><h2 style="margin:0 0 10px;font-size:19px;font-weight:500;">' +
        escapeHtml(thread.title) +
        '</h2><div class="body">' +
        escapeHtml(thread.body) +
        "</div></div>";

      els.replyCount.textContent =
        data.replies.length + (data.replies.length === 1 ? " reply" : " replies");

      els.replyList.innerHTML = data.replies
        .map(function (r) {
          return (
            '<div class="post"><div class="meta">' +
            escapeHtml(r.author_name) +
            " · " +
            timeAgo(r.created_at) +
            '</div><div class="body">' +
            escapeHtml(r.body) +
            "</div></div>"
          );
        })
        .join("");

      els.replyBody.value = "";
    })
    .catch(function (err) {
      els.threadContent.innerHTML = '<div class="post">Couldn’t load thread: ' + escapeHtml(err.message) + "</div>";
    });
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

  els.postThreadBtn.disabled = true;
  apiRequest("/forum/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, body: body, author_name: getName() }),
  })
    .then(function () {
      if (els.nameInput.value.trim()) localStorage.setItem(NAME_KEY, els.nameInput.value.trim());
      showView("list");
      renderList();
    })
    .catch(function (err) {
      alert("Couldn't post thread: " + err.message);
    })
    .then(function () {
      els.postThreadBtn.disabled = false;
    });
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

  els.postReplyBtn.disabled = true;
  apiRequest("/forum/threads/" + activeThreadId + "/replies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: body, author_name: getName() }),
  })
    .then(function () {
      if (els.nameInput.value.trim()) localStorage.setItem(NAME_KEY, els.nameInput.value.trim());
      openThread(activeThreadId);
    })
    .catch(function (err) {
      alert("Couldn't post reply: " + err.message);
    })
    .then(function () {
      els.postReplyBtn.disabled = false;
    });
});

// restore remembered display name
els.nameInput.value = localStorage.getItem(NAME_KEY) || "";

renderList();
