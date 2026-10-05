/* Baby Boss · site behaviour. Header and drawer from MV:hd2, hero entrance from MV:h3 (inView, not an observer),
   the reveal from engine/motion.md 2, MV:g03 (the circle on the night shoot) and MV:g05 (the four chassis). */
(function () {
  "use strict";
  var WA = "https://wa.me/972524312213";
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- WhatsApp: every link carries its own message (copy, shared components) ---------- */
  function waHref(msg) { return WA + "?text=" + encodeURIComponent(msg); }
  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waHref(a.getAttribute("data-wa")); });

  /* ---------- year in the footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- headroom: hides on the way down, comes back on the first move up (library/headers.md) ---------- */
  function headroom(el) {
    var tol = 6, last = 0, raf = 0;
    function upd() {
      raf = 0;
      var y = window.scrollY, d = y - last, top = el.offsetHeight + 24;
      el.classList.toggle("is-scrolled", y > 8);
      var hold = el.classList.contains("menu-open") || !!el.querySelector(":focus-visible");
      if (y <= top || hold) { el.classList.remove("is-hidden"); last = y; return; }
      if (Math.abs(d) < tol) return;
      el.classList.toggle("is-hidden", d > 0);
      last = y;
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    el.addEventListener("focusin", upd);
    last = window.scrollY; upd();
  }

  /* ---------- mobile drawer: focus trap, Esc, scroll lock without a jump ---------- */
  function drawer(root, burger) {
    if (!root) return;
    var panel = root.querySelector(".md-panel"), scrim = root.querySelector(".md-scrim"), closeBtn = root.querySelector(".md-close");
    var doc = document.documentElement, last = null;
    root.querySelectorAll(".md-item").forEach(function (el, i) { el.style.setProperty("--i", i); });
    panel.inert = true;
    function set(open) {
      root.classList.toggle("open", open);
      doc.classList.toggle("md-open", open);
      panel.inert = !open;
      if (burger) burger.setAttribute("aria-expanded", String(open));
      doc.style.scrollbarGutter = open ? "stable" : "";
      doc.style.overflow = open ? "hidden" : "";
      if (open) { last = document.activeElement; setTimeout(function () { closeBtn.focus(); }, 180); }
      else { var to = (last && last !== document.body) ? last : burger; if (to) to.focus({ preventScroll: true }); }
    }
    if (burger) burger.addEventListener("click", function () { set(!root.classList.contains("open")); });
    closeBtn.addEventListener("click", function () { set(false); });
    scrim.addEventListener("click", function () { set(false); });
    root.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    addEventListener("keydown", function (e) {
      if (!root.classList.contains("open")) return;
      if (e.key === "Escape") { set(false); return; }
      if (e.key !== "Tab") return;
      var f = [].slice.call(panel.querySelectorAll("a,button")).filter(function (x) { return x.offsetParent !== null; });
      var i = f.indexOf(document.activeElement);
      var n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      e.preventDefault(); f[n].focus();
    });
  }

  /* ---------- in view = fire, measured directly (an observer does not update in a throttled tab) ---------- */
  function inView(el, f) {
    var ro;
    function chk() { var r = el.getBoundingClientRect(); if (r.top < innerHeight * .9 && r.bottom > 0) { off(); f(); } }
    function off() { removeEventListener("scroll", chk); removeEventListener("resize", chk); if (ro) ro.disconnect(); }
    addEventListener("scroll", chk, { passive: true }); addEventListener("resize", chk);
    if (window.ResizeObserver) { ro = new ResizeObserver(chk); ro.observe(document.body); }
    requestAnimationFrame(chk); setTimeout(chk, 300);
  }

  var hd = document.getElementById("hd");
  if (hd) {
    headroom(hd);
    requestAnimationFrame(function () { hd.classList.remove("pre"); });   // the header comes down first
  }
  drawer(document.getElementById("md"), document.querySelector(".hd .burger"));

  var hero = document.getElementById("hero");
  if (hero) inView(hero, function () { hero.classList.add("is-in", "is-lit"); });

  /* ---------- the reveal, exactly as engine/motion.md 2 ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (!rm && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- brand windows: a native dialog (focus in, Esc, focus back to the logo) ---------- */
  var BRANDS = {
    valco: { origin: "אוסטרליה", name: "Valco Baby", text: "חברה משפחתית שמייצרת עגלות מאז 1965. אנחנו מביאים לישראל את עגלת התאומים שלה, ה-Slim Twin.", link: ["לעגלת התאומים", "twin.html"] },
    abc: { origin: "גרמניה", name: "ABC Design", text: "חברה משפחתית מגרמניה, שהוקמה ב-1989. אנחנו מביאים לישראל את הטיולון Ping 2, את Ping 2 Trekking עם הגלגלים הגדולים לשבילים ולמדרכות משובשות, ועגלה חדשה שתגיע בקרוב." },
    choopie: { origin: "ארה\"ב", name: "Choopie", text: "את החברה הקימה בניו יורק אמא שזיהתה צורך, וכך נולדו ה-City Grips: כיסויים לידית העגלה. אנחנו מביאים את City Grips ואת City Hooks, הווים לתליית תיקים על העגלה." },
    benbat: { origin: "ישראל", name: "Benbat", text: "מותג ישראלי שהקימו ב-2008 שני אחים, מעצבי מוצר, ושנמכר היום ביותר מ-30 מדינות. אנחנו מפיצים את המראות, הצלונים והצעצועים שלו לרכב ולעגלה." }
  };
  var dlg = document.getElementById("br-dlg"), opener = null;
  if (dlg && dlg.showModal) {
    document.querySelectorAll("[data-brand]").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = BRANDS[b.getAttribute("data-brand")]; if (!d) return;
        opener = b;
        dlg.querySelector(".br-origin").textContent = d.origin;
        dlg.querySelector(".br-name").textContent = d.name;
        dlg.querySelector(".br-text").textContent = d.text;
        var act = dlg.querySelector(".br-actions"); act.innerHTML = "";
        var wa = document.createElement("a");
        wa.className = "btn btn-solid"; wa.target = "_blank"; wa.rel = "noopener";
        wa.href = waHref("היי, הגעתי מהאתר ואשמח לשמוע על המוצרים של " + d.name);
        wa.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg>שאלה על ' + d.name;
        act.appendChild(wa);
        if (d.link) { var l = document.createElement("a"); l.className = "tlink"; l.href = d.link[1]; l.textContent = d.link[0]; act.appendChild(l); }
        dlg.showModal();
      });
    });
    dlg.querySelector(".br-x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });   // a click on the backdrop
    dlg.addEventListener("close", function () { if (opener) opener.focus({ preventScroll: true }); });
  }

  /* ---------- the stroller finder (strollers.html): three questions, one screen each, then the answer ----------
     Priority, as in the copy (Kobi still has to approve it): rough ground -> Tiger, stairs -> Panther, small boot -> Cheetah, else Bobcat */
  var fbox = document.querySelector("[data-finder]");
  if (fbox) {
    var BUY = "https://www.babyboss.co.il/items/9136266", SHOP = "https://www.babyboss.co.il/821278";
    var MODELS = {
      tiger: { name: "טייגר 3", img: "images/m-tiger.webp", buy: [SHOP, "לאתר המכירות"], why: "הדרך שלכם היא לא רק אספלט, וטייגר 3 בנויה בדיוק בשביל זה: גלגלים גדולים וקפיץ לכל גלגל." },
      panther: { name: "פנתר 3", img: "images/m-panther.webp", buy: [SHOP, "לאתר המכירות"], why: "אתם סוחבים את העגלה במדרגות, ופנתר 3 היא הקלה ביותר שלנו: 6.2 ק\"ג עם הטיולון." },
      cheetah: { name: "צ'יטה 3", img: "images/m-cheetah.webp", buy: [SHOP, "לאתר המכירות"], why: "הבגאז' שלכם קטן, וצ'יטה 3 מתקפלת לגודל הקטן ביותר מכל הדגמים שלנו." },
      bobcat: { name: "בובקט 3", img: "images/m-bobcat.webp", buy: [BUY, "לרכישה"], why: "בובקט 3 מתאימה לרוב המשפחות, ולכן היא גם הדגם הנמכר ביותר שלנו." }
    };
    var qs = [].slice.call(fbox.querySelectorAll(".fi-q")), res = fbox.querySelector(".fi-res");
    var bar = fbox.querySelector(".fi-bar i"), live = fbox.querySelector("[data-finder-live]");
    var picks = [], words = [];
    function show(el) { qs.concat(res).forEach(function (x) { x.hidden = x !== el; }); }
    function step(i) {
      show(qs[i]);
      bar.style.transform = "scaleX(" + (i / qs.length) + ")";
      live.textContent = "שאלה " + (i + 1) + " מתוך " + qs.length;
      qs[i].querySelector(".fi-opt").focus({ preventScroll: true });
    }
    function result() {
      var k = picks[0] ? "tiger" : picks[1] ? "panther" : picks[2] ? "cheetah" : "bobcat", m = MODELS[k];
      res.querySelector("img").src = m.img;
      res.querySelector(".m-name").textContent = m.name;
      res.querySelector(".fi-why").textContent = m.why;
      res.querySelector(".fi-wa").href = waHref("היי, עשיתי את השאלון באתר ויצא לי " + m.name + ". הדרך שלנו: " + words[0] + ". מהבית לרחוב: " + words[1] + ". בגאז': " + words[2] + ". אשמח לשמוע עוד.");
      var buy = res.querySelector(".fi-buy"); buy.href = m.buy[0]; buy.textContent = m.buy[1];
      show(res);
      bar.style.transform = "scaleX(1)";
      live.textContent = "ההמלצה שלנו: " + m.name;
      res.focus({ preventScroll: true });
    }
    qs.forEach(function (q, i) {
      q.querySelectorAll(".fi-opt").forEach(function (b) {
        b.addEventListener("click", function () {
          picks[i] = b.getAttribute("data-v") === "1"; words[i] = b.textContent.trim();
          if (i < qs.length - 1) step(i + 1); else result();
        });
      });
    });
    fbox.querySelector(".fi-again").addEventListener("click", function () { picks = []; words = []; step(0); });
    fbox.classList.add("is-live");
  }

  /* ---------- floating WhatsApp: after the hero, and away again where the page already offers it ---------- */
  // on a phone the whole bar steps aside (its accessibility button lives in the header meanwhile); wider, only WhatsApp does
  var fab = document.querySelector(".fab-wa"), fabs = document.getElementById("fabs");
  if (fab && fabs && hero) {
    var blockers = [hero, document.getElementById("visit"), document.getElementById("ft")].filter(Boolean);
    var shown = new Set();
    function setOff(off) { fab.classList.toggle("is-off", off); fabs.classList.toggle("is-off", off); fabs.inert = off && innerWidth < 768; }
    setOff(true);
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) shown.add(en.target); else shown.delete(en.target); });
      setOff(shown.size > 0);
    }, { threshold: 0 });
    blockers.forEach(function (el) { fo.observe(el); });
  }

  /* ---------- GSAP layer: only the two approved moves ---------- */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;   // without GSAP: the photo is whole, the last stroller shows, all text reads
  gsap.registerPlugin(ScrollTrigger);

  /* MV:g03, the night shoot opens from a circle to the full screen */
  var m = document.getElementById("maskv");
  if (m) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
      m.classList.add("gsap-live");
      gsap.timeline({ scrollTrigger: { trigger: m, start: "top top", end: "+=900", scrub: 1, pin: true, anticipatePin: 1 } })
        .fromTo(m, { "--mask-size": innerWidth < 768 ? "150px" : "16vw" }, { "--mask-size": "260vw", ease: "none" }, 0)
        .fromTo(m.querySelector("img"), { scale: 1.12 }, { scale: 1, ease: "none" }, 0)
        .fromTo(m.querySelector(".film-cap"), { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: .25 }, .75);
      return function () { m.classList.remove("gsap-live"); };
    });
  }

  /* the reviews wall (from iLab, 5.10.2026): columns travel with the scroll at their own speed, the middle one the other way.
     Only with motion allowed; otherwise the wall stays whole and still */
  var wall = document.querySelector(".rw");
  if (wall) {
    var wcols = [].slice.call(wall.querySelectorAll(".rw-col"));
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
      wall.classList.add("is-moving");
      wcols.filter(function (c) { return c.offsetParent !== null; }).forEach(function (c) {
        var sp = +c.dataset.speed || 1, k = Math.min(1, Math.abs(sp));
        var room = function () { return Math.max(48, c.offsetHeight - wall.clientHeight); };
        gsap.fromTo(c, { y: function () { return sp > 0 ? 0 : -room() * k; } }, { y: function () { return sp > 0 ? -room() * k : 0; }, ease: "none",
          // whole device pixels, so the text stays crisp while the column travels
          modifiers: { y: function (v) { var d = window.devicePixelRatio || 1; return (Math.round(parseFloat(v) * d) / d) + "px"; } },
          scrollTrigger: { trigger: wall, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
      });
      return function () { wall.classList.remove("is-moving"); gsap.set(wcols, { clearProps: "transform" }); };
    });
  }

  /* the visit: the city shoot settles slowly as the section arrives, nothing more */
  var vbg = document.querySelector(".vs-bg img");
  if (vbg) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
      gsap.fromTo(vbg, { scale: 1.14, yPercent: -3 }, { scale: 1.07, yPercent: 3, ease: "none", scrollTrigger: { trigger: "#visit", start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  }

  /* MV:g05, the signature: the stroller stays, the chassis changes as each model's text arrives */
  var texts = gsap.utils.toArray(".sync-t");
  if (texts.length) {
    gsap.matchMedia().add({ desk: "(min-width: 768px)", mob: "(max-width: 767px)", rm: "(prefers-reduced-motion: reduce)" }, function (ctx) {
      var c = ctx.conditions;
      var start = c.mob ? "top 85%" : "top 60%", end = c.mob ? "top 55%" : "top 30%", mid = c.mob ? "top 70%" : "top 45%";
      // one caption for the panel, switched when a model's text crosses the middle (two fading captions overlapped)
      var tag = document.getElementById("si-tag"), names = ["BOBCAT 3", "PANTHER 3", "TIGER 3", "CHEETAH 3"];
      function setTag(k) { if (!tag || tag.textContent === names[k]) return; tag.textContent = names[k]; if (!c.rm) gsap.fromTo(tag, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .3, ease: "power2.out" }); }
      setTag(0);
      texts.forEach(function (txt, i) {
        ScrollTrigger.create({ trigger: txt, start: mid, end: "bottom " + mid.split(" ")[1], onEnter: function () { setTag(i); }, onEnterBack: function () { setTag(i); } });
      });
      texts.forEach(function (txt, i) {
        if (!i) return;
        var img = ".si-" + (i + 1);
        if (c.rm) {   // reduced motion: the picture changes at once, no fade
          gsap.set(img, { autoAlpha: 0 });
          ScrollTrigger.create({ trigger: txt, start: mid, end: "max", onToggle: function (s) { gsap.set(img, { autoAlpha: s.isActive ? 1 : 0 }); } });
          return;
        }
        gsap.from(img, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: txt, start: start, end: end, scrub: 1 } });
      });
    });
  }
})();
