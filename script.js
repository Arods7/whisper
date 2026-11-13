/* ============================================================
   Painting Whisper — logic
   یک چرخشِ روزانه و قطعی: هیچ نقاشی‌ای دوبار پشت‌سرهم تکرار نمی‌شود.
   منبع داده: data.js (اسناد موزه‌ی هنر شیکاگو + تصاویر عمومی)
   ============================================================ */
(function () {
  "use strict";

  var ART = window.ARTWORKS || [];

  /* ---------- تاریخ (به وقت تهران) ---------- */
  var TZ = "Asia/Tehran";
  function parts(loc, d, opt) {
    var o = {}; opt.timeZone = TZ;
    new Intl.DateTimeFormat(loc, opt).formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function faDate(d) {
    var p = parts("fa-IR-u-ca-persian", d, { day: "numeric", month: "long", year: "numeric" });
    return p.day + " " + p.month + " " + p.year;
  }
  function enDate(d) {
    var p = parts("en-GB", d, { day: "numeric", month: "long", year: "numeric" });
    return p.day + " " + p.month + " " + p.year;
  }

  /* ---------- انتخابِ روز: هر ۲۴ ساعت (نیمه‌شب تهران) یک تابلوی بعدی ---------- */
  function dayNumber(d) {
    var p = parts("en-US", d, { day: "numeric", month: "numeric", year: "numeric" });
    return Math.floor(Date.UTC(+p.year, +p.month - 1, +p.day) / 86400000);
  }
  function pickOfDay(n) {
    return ((n % ART.length) + ART.length) % ART.length;
  }

  var today = new Date();
  var dn = dayNumber(today);
  var idx = pickOfDay(dn);
  var art = ART[idx];
  var todayKey = art ? art.key : null;

  /* هنگام گذر از نیمه‌شب تهران صفحه خودکار تازه می‌شود */
  (function () {
    var last = dn;
    setInterval(function () {
      if (dayNumber(new Date()) !== last) location.reload();
    }, 30000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && dayNumber(new Date()) !== last) location.reload();
    });
  })();

  /* ---------- ابزار رندر ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  var onViewFa = { true: "در تالارِ موزه", false: "در انبارِ موزه (نمایش ندارد)" };

  function factsDl(a) {
    var facts = el("dl", "facts");
    [
      ["هنرمند", a.artist_fa],
      ["سال", a.year_fa],
      ["تکنیک", a.medium_fa],
      ["ابعاد", a.dims_fa],
      ["محلِ نگهداری", a.location_fa ? a.location_fa : (a.credit_fa||"").replace(/^مجموعه‌ی /, "موزه‌ی هنر شیکاگو · ") + (a.location_fa ? "" : (a.on_view ? " · " + onViewFa["true"] : " · " + onViewFa["false"]))]
    ].filter(function (f) { return f[1] && f[1].replace(/[\s·]/g, "").length > 0 && f[1].indexOf("در انبار") < 0 && f[1].indexOf("در تالار") < 0 || (f[0] !== "محلِ نگهداری" && f[1]); }).forEach(function (f) {
      var row = el("div", "fact");
      row.appendChild(el("dt", null, f[0]));
      row.appendChild(el("dd", null, esc(f[1])));
      facts.appendChild(row);
    });
    return facts;
  }
  function chipsRow(a) {
    var styles = el("div", "styles-row");
    a.styles_fa.forEach(function (s) { styles.appendChild(el("span", "chip", esc(s))); });
    return styles;
  }
  function whisperBox(a) {
    var w = el("div", "whisper");
    w.appendChild(el("span", "whisper-label", "زمزمه‌ی امروز"));
    w.appendChild(el("p", null, esc(a.whisper_fa)));
    return w;
  }
  function paletteRow(a) {
    var pal = el("div", "palette-row");
    pal.appendChild(el("span", "pr-label", "پالتِ رنگِ تابلو:"));
    var sw = el("div", "swatches");
    a.palette.forEach(function (c) {
      var s = el("span", "swatch");
      s.style.background = c;
      s.title = c;
      sw.appendChild(s);
    });
    pal.appendChild(sw);
    return pal;
  }

  /* ---------- صفحه‌ی امروز ---------- */
  function renderFeature(a, dayNo) {
    var host = document.getElementById("feature");
    if (!host) return;
    host.innerHTML = "";

    var grid = el("div", "wrap feature-grid");

    // قاب
    var fig = el("figure", "art-frame-wrap");
    fig.style.margin = "0";
    var frame = el("div", "art-frame");
    var mat = el("div", "mat");
    var img = document.createElement("img");
    img.src = "web_images/" + a.key + ".jpg";
    img.alt = a.fa + " — " + a.artist_fa;
    img.loading = "eager";
    mat.appendChild(img);
    frame.appendChild(mat);
    var cap = el("figcaption", "fig-cap",
      "<b>" + esc(a.fa) + "</b> · " + esc(a.artist_fa) + " · " + esc(a.year_fa));
    fig.appendChild(frame);
    fig.appendChild(cap);
    grid.appendChild(fig);

    // کارت اطلاعات
    var card = el("div", "info-card");
    card.appendChild(el("span", "badge-day", "نقاشیِ امروز"));
    card.appendChild(el("p", "paint-no", "تابلوِ شمارهٔ " + ((dayNo % ART.length) + 1) + " از " + ART.length));
    card.appendChild(el("h2", "title-fa", esc(a.fa)));
    card.appendChild(el("p", "title-en", esc(a.en) + " · " + esc(a.artist_en)));
    card.appendChild(factsDl(a));
    card.appendChild(chipsRow(a));
    card.appendChild(el("p", "desc", esc(a.desc_fa)));
    card.appendChild(whisperBox(a));
    card.appendChild(paletteRow(a));
    card.appendChild(el("p", "credit-note",
      "متنِ روایت، برگردانِ آزاد از سندِ رسمیِ موزه‌ی هنر شیکاگو است · تصویر: نسخه‌ی مالکیتِ عمومی (ویکی‌مدیا کامانز)"));

    grid.appendChild(card);
    host.appendChild(grid);
  }

  /* ---------- قفسه (۴ اثرِ دیگر) ---------- */
  function renderShelf(a) {
    var grid = document.getElementById("shelf-grid");
    if (!grid) return;
    grid.innerHTML = "";
    var others = ART.filter(function (x) { return x.key !== a.key; });
    var shift = dn % others.length;
    for (var i = 0; i < 4; i++) {
      var x = others[(shift + i) % others.length];
      var link = el("a", "mini");
      link.href = "archive.html#art-" + x.key;
      link.innerHTML =
        '<span class="mini-frame"><img src="web_images/' + x.key + '.jpg" alt="' + esc(x.fa) + '" loading="lazy"></span>' +
        '<span class="mini-date">' + esc(x.year_fa.split(" ")[0]) + "</span>" +
        '<span class="mini-title">' + esc(x.fa) + "</span>" +
        '<span class="mini-artist">' + esc(x.artist_fa.split(" (")[0]) + "</span>";
      grid.appendChild(link);
    }
  }

  /* ---------- گفتاوردِ روز ---------- */
  var QUOTES = [
    { q: "نقاشی، شعری است که دیدن آن را نمی‌دانند.", by: "پل سزان" },
    { q: "من می‌خواهم به نقاشی‌هایی برسم که هرکس آنها را ببیند، با خود فکر کند: من هم همین را حس کرده‌ام.", by: "ادوارد مانیه" },
    { q: "رنگ، در خودش قدرتی نهفته دارد؛ صدایی که مستقیم با روح حرف می‌زند.", by: "واسیلاری کاندینسکی" },
    { q: "من رویاپدایی می‌کنم و سپس نقاشی می‌کنم.", by: "مارک شاگال" },
    { q: "هنر، شستنِ غبارِ روزمره از روح است.", by: "پابلو پیکاسو" },
    { q: "من اغلب اوقات، قبل از اینکه چیزی را ببینم، نقاشی‌اش می‌کنم.", by: "آندره ماسون" },
    { q: "نقاشی، پُلی است میانِ روحِ نقاش و روحِ تماشاگر.", by: "واسیلاری کاندینسکی" }
  ];
  function renderQuote(dayNo) {
    var qe = document.getElementById("daily-quote");
    var be = document.getElementById("daily-quote-by");
    if (!qe) return;
    var q = QUOTES[dayNo % QUOTES.length];
    qe.textContent = "«" + q.q + "»";
    be.textContent = "— " + q.by;
  }

  /* ---------- اجرای صفحه‌ی اصلی ---------- */
  var faEl = document.getElementById("fa-date");
  var geEl = document.getElementById("greg-date");
  if (faEl) faEl.textContent = faDate(today);
  if (geEl) geEl.textContent = enDate(today);

  if (document.getElementById("feature")) {
    renderFeature(art, dn);
    renderShelf(art);
    renderQuote(dn);
  }

  /* ============================================================
     صفحه‌ی آرشیو — جست‌وجو، فیلتر، مرتب‌سازی، مودال
     ============================================================ */
  var archGrid = document.getElementById("archive-grid");
  if (archGrid) {
    var state = { q: "", style: "همه", sort: "old" };

    /* نرمال‌سازی متنِ جست‌وجو: ی/ك عربی، نیم‌فاصله، حروفِ کوچک */
    function norm(s) {
      return String(s).toLowerCase()
        .replace(/[يى]/g, "ی").replace(/ك/g, "ک")
        .replace(/ۀ|ة/g, "ه").replace(/\u200c/g, " ")
        .replace(/\s+/g, " ").trim();
    }

    function visibleList() {
      var list = ART.slice();
      if (state.style !== "همه") {
        list = list.filter(function (a) { return a.styles_fa.indexOf(state.style) !== -1; });
      }
      if (state.q) {
        var q = norm(state.q);
        list = list.filter(function (a) {
          return norm(a.fa + " " + a.en + " " + a.artist_fa + " " + a.artist_en + " " + a.year_fa + " " + a.en_year + " " + a.medium_fa).indexOf(q) !== -1;
        });
      }
      if (state.sort === "old") list.sort(function (a, b) { return parseInt(a.en_year, 10) - parseInt(b.en_year, 10); });
      else if (state.sort === "new") list.sort(function (a, b) { return parseInt(b.en_year, 10) - parseInt(a.en_year, 10); });
      else if (state.sort === "artist") list.sort(function (a, b) { return a.artist_fa.localeCompare(b.artist_fa, "fa"); });
      else if (state.sort === "title") list.sort(function (a, b) { return a.fa.localeCompare(b.fa, "fa"); });
      return list;
    }

    function renderCount(n) {
      var c = document.getElementById("arch-count");
      if (c) c.textContent = n.toLocaleString("fa-IR") + " تابلو";
    }

    function renderArchive() {
      var list = visibleList();
      renderCount(list.length);
      archGrid.innerHTML = "";
      list.forEach(function (a) {
        var i = ART.indexOf(a);
        var link = el("a", "arch-card" + (a.key === todayKey ? " is-today" : ""));
        link.href = "#art-" + a.key;
        link.dataset.key = a.key;
        var body = el("div", "arch-body");
        body.innerHTML =
          '<span class="arch-fa">' + esc(a.fa) + "</span>" +
          '<span class="arch-en">' + esc(a.en) + "</span>" +
          '<span class="arch-meta"><b>' + esc(a.artist_fa.split(" (")[0]) + "</b> · " + esc(a.year_fa) + "</span>" +
          '<span class="arch-medium">' + esc(a.medium_fa) + "</span>";
        var top = el("div", "arch-top");
        var img = document.createElement("img");
        img.src = "web_images/" + a.key + ".jpg";
        img.alt = a.fa;
        img.loading = "lazy";
        top.appendChild(img);
        top.appendChild(el("span", "arch-no", "№ " + (i + 1)));
        if (a.key === todayKey) top.appendChild(el("span", "arch-today", "امروز"));
        link.appendChild(top);
        link.appendChild(body);
        archGrid.appendChild(link);
      });
      if (!list.length) {
        archGrid.appendChild(el("p", "empty-note", "چیزی پیدا نشد — عبارتِ دیگری را امتحان کنید یا فیلتر را بردارید."));
      }
    }

    /* فیلترِ سبک */
    var set = {};
    ART.forEach(function (a) { a.styles_fa.forEach(function (s) { set[s] = 1; }); });
    var cats = ["همه"].concat(Object.keys(set).sort(function (a, b) { return a.localeCompare(b, "fa"); }));
    var row = document.getElementById("filter-row");
    cats.forEach(function (c) {
      var b = el("button", "filter-btn", c);
      b.type = "button";
      if (c === "همه") b.classList.add("is-on");
      b.addEventListener("click", function () {
        state.style = c;
        row.querySelectorAll(".filter-btn").forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        renderArchive();
      });
      row.appendChild(b);
    });

    /* جست‌وجو */
    var search = document.getElementById("arch-search");
    if (search) {
      var t = null;
      search.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(function () { state.q = search.value; renderArchive(); }, 160);
      });
    }

    /* مرتب‌سازی */
    var sortSel = document.getElementById("arch-sort");
    if (sortSel) {
      sortSel.addEventListener("change", function () { state.sort = sortSel.value; renderArchive(); });
    }

    renderArchive();

    /* ---------- مودالِ جزئیات ---------- */
    function closeModal() {
      var back = document.querySelector(".modal-back");
      if (back) back.remove();
      document.body.style.overflow = "";
      history.replaceState(null, "", location.pathname);
    }
    function openModal(a) {
      closeModal();
      document.body.style.overflow = "hidden";

      var back = el("div", "modal-back");
      var m = el("div", "modal");
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-label", a.fa);

      var close = el("button", "modal-close", "✕");
      close.type = "button";
      close.setAttribute("aria-label", "بستن");
      close.addEventListener("click", closeModal);

      var fig = el("div", "m-figwrap");
      var frame = el("div", "art-frame small");
      var mat = el("div", "mat");
      var img = document.createElement("img");
      img.src = "web_images/" + a.key + ".jpg";
      img.alt = a.fa;
      mat.appendChild(img);
      frame.appendChild(mat);
      fig.appendChild(frame);

      var body = el("div", "m-body");
      if (a.key === todayKey) body.appendChild(el("span", "badge-day", "نقاشیِ امروز"));
      body.appendChild(el("h3", "title-fa", esc(a.fa)));
      body.appendChild(el("p", "title-en", esc(a.en) + " · " + esc(a.artist_en)));
      body.appendChild(factsDl(a));
      body.appendChild(chipsRow(a));
      body.appendChild(el("p", "desc", esc(a.desc_fa)));
      body.appendChild(whisperBox(a));
      body.appendChild(paletteRow(a));
      body.appendChild(el("p", "credit-note",
        "برگردانِ آزاد از سندِ رسمیِ موزه‌ی هنر شیکاگو · تصویر: مالکیتِ عمومی (ویکی‌مدیا کامانز)"));

      m.appendChild(close);
      m.appendChild(fig);
      m.appendChild(body);
      back.appendChild(m);
      document.body.appendChild(back);

      back.addEventListener("click", function (e) { if (e.target === back) closeModal(); });
      document.addEventListener("keydown", function escHandler(e) {
        if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", escHandler); }
      });

      history.replaceState(null, "", "#art-" + a.key);
    }

    /* کلیک روی کارت‌ها → مودال */
    archGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".arch-card");
      if (!card) return;
      e.preventDefault();
      var a = ART.filter(function (x) { return x.key === card.dataset.key; })[0];
      if (a) openModal(a);
    });

    /* ورود با لینکِ عمیق: archive.html#art-KEY */
    if (location.hash.indexOf("#art-") === 0) {
      var key = location.hash.replace("#art-", "");
      var deep = ART.filter(function (x) { return x.key === key; })[0];
      if (deep) openModal(deep);
    }
  }

  /* ---------- صفحه‌ی درباره: شمارنده ---------- */
  var stat1 = document.getElementById("stat-count");
  if (stat1) stat1.textContent = ART.length.toLocaleString("fa-IR");
  var stat2 = document.getElementById("stat-artists");
  if (stat2) {
    var artists = {};
    ART.forEach(function (a) { artists[a.artist_en] = 1; });
    stat2.textContent = Object.keys(artists).length.toLocaleString("fa-IR");
  }
  var stat3 = document.getElementById("stat-years");
  if (stat3) {
    var ys = ART.map(function (a) { return parseInt(a.en_year, 10); }).filter(Boolean);
    stat3.textContent = Math.min.apply(null, ys).toLocaleString("fa-IR");
  }
})();
