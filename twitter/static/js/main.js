(window["webpackJsonpreact-rss-tutorial-app"] =
  window["webpackJsonpreact-rss-tutorial-app"] || []).push([
  [0],
  {
    221: function (e, t, a) {
      e.exports = a(480);
    },
    226: function (e, t, a) {},
    228: function (e, t, a) {},
    375: function (e, t, a) {},
    397: function (e, t, a) {},
    416: function (e, t) {},
    418: function (e, t) {},
    451: function (e, t) {},
    453: function (e, t) {},
    480: function (e, t, a) {
      "use strict";
      a.r(t);
      var r = a(0),
        n = a.n(r),
        s = a(40),
        o = a.n(s),
        c = a(488),
        l = a(26),
        m = a(219),
        i = a.n(m),
        d = (a(226), a(33)),
        u = a(34),
        h = a.n(u),
        f = a(57),
        p = a(52),
        w = (a(228), a(32)),
        g = a(21),
        b = a.n(g),
        k = a(220),
        v = a(28),
        E = a.n(v),
        y = a(78),
        x = a.n(y),
        S = a(41),
        N = a.n(S),
        O = a(80),
        T = [
          { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/" },
          { name: "Brian Krebs", url: "https://krebsonsecurity.com/feed/" },
          { name: "Bruce Schneier", url: "https://www.schneier.com/feed/atom/" },
          { name: "EFF", url: "https://www.eff.org/rss/updates.xml" },
          { name: "Threatpost", url: "https://threatpost.com/feed/" },
          { name: "Shodan", url: "https://blog.shodan.io/rss/" },
          { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed.xml" },
          { name: "Darknet Diaries", url: "https://feeds.megaphone.fm/darknetdiaries" },
          { name: "Ubuntu", url: "https://ubuntu.com/blog/feed" },
          { name: "Vitalik Buterin", url: "https://vitalik.eth.limo/feed.xml" },
          { name: "Citizen Lab", url: "https://citizenlab.ca/feed/" },
          { name: "Graham Cluley", url: "https://grahamcluley.com/feed/" },
          { name: "404 Media", url: "https://www.404media.co/rss/" },
          { name: "IntelTechniques", url: "https://inteltechniques.com/blog/feed/" },
          { name: "OWASP Amass", url: "https://github.com/owasp-amass/amass/releases.atom" },
          { name: "Edward Snowden", url: "https://edwardsnowden.substack.com/feed" },
          { name: "Marc Ruef", url: "https://www.scip.ch/en/?rss.news" },
          { name: "Slashdot", url: "https://rss.slashdot.org/Slashdot/slashdotMain" },
          { name: "MKBHD", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ" },
          { name: "IppSec", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCa6eh7gCkpPo5XXUDfygQQA" },
          { name: "John Hammond", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCVeW9qkBjo3zosnqUbG7CFw" },
          { name: "LiveOverflow", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UClcE-kVhqyiHCcjYwcpfj9w" },
          { name: "Hak5", url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC3s0BtrBJpwNDaflRSoiieQ" },
                              { name: "Dan Goodin", url: "https://arstechnica.com/author/dan-goodin/feed/" },
          { name: "Mike West", url: "https://mikewest.org/rss/index.xml" },
        ],
        D = a(169),
        j = O.object({
          name: O.string().required("URL is required"),
          url: O.string()
            .required("URL is required")
            .matches(
              /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/,
              "Invalid URL"
            ),
        });
      console.log = function () {};

      var C = Object(w.a)(function (e) {
          var t = this,
            a = e.feedsStore,
            s = Object(r.useState)(!1),
            o = Object(p.a)(s, 2),
            c = o[0],
            l = o[1],
            m = Object(r.useState)(!1),
            i = Object(p.a)(m, 2),
            u = i[0],
            w =
              (i[1],
              (function () {
                var e = Object(f.a)(
                  h.a.mark(function e(t, r) {
                    var n, s, o;
                    return h.a.wrap(
                      function (e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                (n = r.setSubmitting),
                                (s = r.setErrors),
                                (o = r.resetForm),
                                (e.prev = 1),
                                (e.next = 4),
                                j.validate(t)
                              );
                            case 4:
                              o({}),
                                a.feeds.push(t),
                                a.setFeeds(a.feeds),
                                localStorage.setItem(
                                  "twitterfeeds",
                                  JSON.stringify(a.feeds)
                                ),
                                (e.next = 14);
                              break;
                            case 10:
                              (e.prev = 10),
                                (e.t0 = e.catch(1)),
                                n(!1),
                                s({ submit: e.t0.message });
                            case 14:
                            case "end":
                              return e.stop();
                          }
                      },
                      e,
                      null,
                      [[1, 10]]
                    );
                  })
                );
                return function (t, a) {
                  return e.apply(this, arguments);
                };
              })()),
            g = function (e) {
              a.feeds.splice(e, 1),
                a.setFeeds(a.feeds),
                localStorage.setItem("twitterfeeds", JSON.stringify(a.feeds));
            };
          return (
            Object(r.useEffect)(
              function () {
                if (!c) {
                  var e = [],
                    t = "";
                  try {
                    (e = JSON.parse(localStorage.getItem("twitterfeeds"))),
                      Array.isArray(e) ? a.setFeeds(e) : a.setFeeds(T);
                  } catch (r) {
                    console.log("error" + r);
                  }
                  try {
                    (t = JSON.parse(localStorage.getItem("darkmode"))),
                      a.setDarkMode(t),
                      console.log(t);
                  } catch (r) {
                    console.log("error" + r);
                  }
                  l(!0), console.log("Useeffect ran");
                }
              },
              [c]
            ),
            u
              ? n.a.createElement(d.a, {
                  to: "/feed?".concat(D.encode({ url: a.feed })),
                })
              : n.a.createElement(
                  "div",
                  { className: "home-page" },
                  n.a.createElement("h1", { className: "center" }, "RSS Feeds"),
                  n.a.createElement(
                    N.a,
                    {
                      variant: 1 != a.darkmode ? "primary" : "info",
                      onClick: function () {
                        return (
                          (e = !a.darkmode),
                          a.setDarkMode(e),
                          localStorage.setItem("darkmode", JSON.stringify(e)),
                          void console.log("darkmode ran  " + e)
                        );
                        var e;
                      },
                    },
                    1 != a.darkmode ? "Turn On Dark Mode" : "Turn Off Dark Mode"
                  ),
                  n.a.createElement("br", null),
                  n.a.createElement("br", null),
                  n.a.createElement(
                    k.a,
                    {
                      validationSchema: j,
                      onSubmit: w,
                      initialValues: { name: "", url: "" },
                    },
                    function (e) {
                      var t = e.handleSubmit,
                        r = e.handleChange,
                        s = (e.handleBlur, e.values),
                        o = e.touched,
                        c = (e.isInvalid, e.errors);
                      return n.a.createElement(
                        "div",
                        null,
                        n.a.createElement("h5", null, "Add a RSS feed"),
                        n.a.createElement(
                          E.a,
                          { noValidate: !0, onSubmit: t },
                          n.a.createElement(
                            E.a.Row,
                            null,
                            n.a.createElement(
                              E.a.Group,
                              { as: x.a, md: "12", controlId: "name" },
                              n.a.createElement(E.a.Control, {
                                className:
                                  1 != a.darkmode
                                    ? "bg-light"
                                    : "bg-dark text-light",
                                type: "text",
                                name: "name",
                                placeholder: "Name",
                                value: s.name || "",
                                onChange: r,
                                isInvalid: o.name && c.name,
                              }),
                              n.a.createElement(
                                E.a.Control.Feedback,
                                { type: "invalid" },
                                c.name
                              )
                            ),
                            n.a.createElement(
                              E.a.Group,
                              { as: x.a, md: "12", controlId: "url" },
                              n.a.createElement(E.a.Control, {
                                className:
                                  1 != a.darkmode
                                    ? "bg-light"
                                    : "bg-dark text-light",
                                type: "text",
                                name: "url",
                                placeholder: "URL",
                                value: s.url || "",
                                onChange: r,
                                isInvalid: o.url && c.url,
                              }),
                              n.a.createElement(
                                E.a.Control.Feedback,
                                { type: "invalid" },
                                c.url
                              )
                            )
                          ),
                          n.a.createElement(
                            N.a,
                            {
                              variant: 1 != a.darkmode ? "primary" : "info",
                              type: "submit",
                            },
                            "Add"
                          )
                        )
                      );
                    }
                  ),
                  n.a.createElement("br", null),
                  n.a.createElement(
                    N.a,
                    {
                      variant: 1 != a.darkmode ? "primary" : "info",
                      onClick: function () {
                        localStorage.removeItem("twitterfeeds"), l(!1);
                      },
                    },
                    "Reset to Default Feeds"
                  ),
                  n.a.createElement("br", null),
                  n.a.createElement("br", null),
                  a.feeds.map(function (e, r) {
                    return n.a.createElement(
                      b.a,
                      { key: r },
                      n.a.createElement(
                        "div",
                        { className: 1 != a.darkmode ? "bg-white" : "bg-dark" },
                        n.a.createElement(
                          b.a.Title,
                          {
                            className:
                              1 != a.darkmode
                                ? "card-title"
                                : "card-title bg-dark text-light ",
                          },
                          e.name
                        ),
                        n.a.createElement(
                          b.a.Subtitle,
                          { style: { paddingLeft: "20px" } },
                          e.url
                        ),
                        n.a.createElement(
                          b.a.Body,
                          null,
                          n.a.createElement(
                            N.a,
                            {
                              variant: 1 != a.darkmode ? "primary" : "info",
                              onClick: g.bind(t, r),
                            },
                            "Delete"
                          )
                        )
                      )
                    );
                  })
                )
          );
        }),
        F = (a(375), a(60)),
        R = a.n(F),
        I = a(127),
        A = a.n(I),
        B = a(4);
      var M = Object(w.a)(function (e) {
          var t = e.feedsStore;
          return n.a.createElement(
            R.a,
            {
              bg: 1 != t.darkmode ? "primary" : "secondary",
              expand: "lg",
              variant: "dark",
            },
            n.a.createElement(
              R.a.Brand,
              null,
              n.a.createElement(
                l.b,
                { style: { color: "white", textDecoration: "none" }, to: "/" },
                "Twitter"
              )
            ),
            n.a.createElement(R.a.Toggle, {
              "aria-controls": "basic-navbar-nav",
            }),
            n.a.createElement(
              R.a.Collapse,
              { id: "basic-navbar-nav" },
              n.a.createElement(
                A.a,
                { className: "mr-auto" },
                n.a.createElement(
                  l.b,
                  {
                    to: "/",
                    style: { color: "white", textDecoration: "none" },
                  },
                  "Home"
                ),
                n.a.createElement(
                  l.b,
                  {
                    style: { color: "white", textDecoration: "none" },
                    className: "nav-item nav-link active",
                    to: "/settings",
                  },
                  "Settings"
                )
              )
            )
          );
        }),
        H = a(489),
        L = (a(397), a(398)),
        J = a(444),
        W = a(445),
        G = (new (a(446))(), a(469));
      var q = Object(d.f)(
        Object(w.a)(function (e) {
          var t = this,
            a = e.feedsStore,
            s = Object(r.useState)(!1),
            o = Object(p.a)(s, 2),
            c = o[0],
            l = o[1],
            m = Object(r.useState)([]),
            i = Object(p.a)(m, 2),
            d = i[0],
            u = i[1],
            w = [],
            g = (function () {
              var e = Object(f.a)(
                h.a.mark(function e(t) {
                  return h.a.wrap(function (e) {
                    for (;;)
                      switch ((e.prev = e.next)) {
                        case 0:
                          return (
                            (e.next = 2),
                            L.load(
                              "https://cors.club/" + t.url,
                              function (e, a) {
                                if (e) console.log("error" + t);
                                else {
                                  a.items.map(function (e) {
                                    return (e.sourceName = a.title);
                                  });
                                  var r = G.uniqBy(a.items, "title");
                                  w.push(G.uniqBy(a.items, "title")),
                                    (r = []),
                                    u(w.flat()),
                                    console.log(r);
                                }
                              }
                            )
                          );
                        case 2:
                        case "end":
                          return e.stop();
                      }
                  }, e);
                })
              );
              return function (t) {
                return e.apply(this, arguments);
              };
            })();
          Object(r.useEffect)(
            function () {
              if (c) return;
              l(!0);
              var storedFeeds = [];
              try {
                storedFeeds = JSON.parse(localStorage.getItem("twitterfeeds"));
              } catch (err) {}
              var feedList =
                Array.isArray(storedFeeds) && storedFeeds.length
                  ? storedFeeds
                  : T;
              a.setFeeds(feedList);
              try {
                a.setDarkMode(JSON.parse(localStorage.getItem("darkmode")));
              } catch (err) {}
              var collected = [];
              var flushTimer = null;
              function scheduleFlush() {
                if (flushTimer) return;
                flushTimer = setTimeout(function () {
                  flushTimer = null;
                  u(collected.slice());
                }, 400);
              }
              Promise.allSettled(
                feedList.map(function (feed) {
                  return fetch(
                    "https://broken-bonus-6b48.costasford.workers.dev/" +
                      feed.url
                  )
                    .then(function (res) {
                      return res.text();
                    })
                    .then(function (xml) {
                      var doc = new DOMParser().parseFromString(
                        xml,
                        "text/xml"
                      );
                      var nodes = Array.prototype.slice.call(
                        doc.querySelectorAll("item")
                      );
                      if (!nodes.length)
                        nodes = Array.prototype.slice.call(
                          doc.querySelectorAll("entry")
                        );
                      var parsed = nodes.map(function (it) {
                        function txt(tag) {
                          var n = it.querySelector(tag);
                          return n ? n.textContent : "";
                        }
                        var link = txt("link");
                        if (!link) {
                          var linkEl = it.querySelector("link");
                          link = linkEl
                            ? linkEl.getAttribute("href") || ""
                            : "";
                        }
                        return {
                          title: txt("title"),
                          link: link,
                          description:
                            txt("description") ||
                            txt("summary") ||
                            txt("content"),
                          pubDate:
                            txt("pubDate") ||
                            txt("published") ||
                            txt("updated"),
                          sourceName: feed.name,
                        };
                      });
                      collected = collected.concat(parsed);
                      scheduleFlush();
                    })
                    .catch(function () {});
                })
              ).then(function () {
                if (flushTimer) {
                  clearTimeout(flushTimer);
                  flushTimer = null;
                }
                u(collected.slice());
              });
            },
            [c]
          );
          var k = function (e) {
            window.open(e);
          };
          return 0 === d.length
            ? n.a.createElement(
                "div",
                { className: "feed-page" },
                n.a.createElement("h2", null, " Loading! "),
                " "
              )
            : n.a.createElement(
                "div",
                { className: "feed-page" },
                " ",
                d
                  .sort(function (e, t) {
                    var a = new Date(e.pubDate).getTime();
                    return new Date(t.pubDate).getTime() - a;
                  })
                  .splice(0, 250)
                  .map(function (e, r) {
                    if (void 0 != e.pubDate && !isNaN(new Date(e.pubDate).getTime()))
                      return n.a.createElement(
                        b.a,
                        { key: r },
                        n.a.createElement(
                          b.a.Header,
                          {
                            className:
                              1 != a.darkmode
                                ? "card-title"
                                : "card-title bg-dark text-light ",
                          },
                          " ",
                          e.title,
                          " "
                        ),
                        n.a.createElement(
                          b.a.Body,
                          { className: 1 != a.darkmode ? "" : "bg-dark" },
                          n.a.createElement(
                            b.a.Text,
                            null,
                            " ",
                            W.decode(
                              J(e.description).substring(0, 250) + "..."
                            ),
                            " "
                          ),
                          " ",
                          n.a.createElement(
                            b.a.Text,
                            { className: "time-ago" },
                            n.a.createElement(
                              "span",
                              null,
                              n.a.createElement(H.a, {
                                date: new Date(e.pubDate),
                              }),
                              " ",
                              n.a.createElement(
                                "span",
                                null,
                                " ",
                                "  from ".concat(e.sourceName),
                                " "
                              ),
                              " "
                            ),
                            " "
                          ),
                          " ",
                          " ",
                          n.a.createElement(
                            N.a,
                            {
                              variant: 1 != a.darkmode ? "primary" : "info",
                              onClick: k.bind(t, e.link),
                            },
                            "Open",
                            " "
                          ),
                          " "
                        ),
                        " "
                      );
                  }),
                " "
              );
        })
      );
      var U = Object(w.a)(function (e) {
        var t = e.feedsStore;
        return n.a.createElement(
          "div",
          {
            className:
              1 != t.darkmode ? "app bg-white" : "app bg-dark text-light",
          },
          n.a.createElement(M, { feedsStore: t }),
          n.a.createElement(d.b, {
            path: "/",
            exact: !0,
            render: function (e) {
              return n.a.createElement(
                q,
                Object.assign({}, e, { feedsStore: t })
              );
            },
          }),
          n.a.createElement(d.b, {
            path: "/settings",
            exact: !0,
            render: function (e) {
              return n.a.createElement(
                C,
                Object.assign({}, e, { feedsStore: t })
              );
            },
          })
        );
      });
      Boolean(
        "localhost" === window.location.hostname ||
          "[::1]" === window.location.hostname ||
          window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
          )
      );
      var z = a(217),
        _ = a(218),
        P = (function () {
          function e() {
            Object(z.a)(this, e),
              (this.feeds = ["Hello"]),
              (this.feed = ""),
              (this.darkmode = !1);
          }
          return (
            Object(_.a)(e, [
              {
                key: "setFeeds",
                value: function (e) {
                  this.feeds = e;
                },
              },
              {
                key: "setSelectedFeed",
                value: function (e) {
                  this.feed = e;
                },
              },
              {
                key: "setDarkMode",
                value: function (e) {
                  this.darkmode = e;
                },
              },
            ]),
            e
          );
        })(),
        V = new (P = Object(B.h)(P, {
          feeds: B.m,
          feed: B.m,
          darkmode: B.m,
          setDarkMode: B.d,
          setFeeds: B.d,
          setSelectedFeed: B.d,
        }))();
      c.a.locale(i.a),
        o.a.render(
          n.a.createElement(
            l.a,
            { basename: "/weboasis/twitter" },
            n.a.createElement(U, { feedsStore: V })
          ),
          document.getElementById("root")
        ),
        "serviceWorker" in navigator &&
          navigator.serviceWorker.ready.then(function (e) {
            e.unregister();
          });
    },
  },
  [[221, 1, 2]],
]);
