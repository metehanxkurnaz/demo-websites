(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const tl = (n) => "₺" + n.toLocaleString("tr-TR");

  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "";
    }));
  }

  const page = location.pathname.split("/").pop() || "index.html";
  $$(".nav a").forEach((a) => a.getAttribute("href") === page && a.classList.add("is-active"));

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "", start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("tr-TR")) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4200);
  };
  $$("form[data-demo]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast(f.dataset.demo);
    f.reset();
  }));

  const svc = $(".svc");
  if (svc) {
    const items = $$(".svc__item", svc), imgs = $$(".svc__media img", svc), price = $(".svc__price b", svc);
    const activate = (i) => {
      items.forEach((it, j) => it.classList.toggle("is-active", i === j));
      imgs.forEach((im, j) => im.classList.toggle("is-active", i === j));
      if (price) price.textContent = items[i].dataset.price;
    };
    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => activate(i));
      it.addEventListener("click", () => activate(i));
    });
    activate(0);
  }

  const fanItems = $$(".fan__item");
  if (fanItems.length) {
    const open = (i) => fanItems.forEach((it, j) => it.classList.toggle("is-open", i === j));
    fanItems.forEach((it, i) => it.addEventListener("mouseenter", () => open(i)));
    open(0);
  }

  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$(".tab", wrap);
    const panels = $$(".panel-tab", wrap);
    const show = (id) => {
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === id));
      panels.forEach((p) => p.classList.toggle("is-active", p.id === id));
    };
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.tab)));
    const hash = location.hash.slice(1);
    if (hash && panels.some((p) => p.id === hash)) show(hash);
  });

  const quotes = $(".quotes");
  if (quotes) {
    const step = () => quotes.querySelector(".quote").offsetWidth + 20;
    $("[data-prev]")?.addEventListener("click", () => quotes.scrollBy({ left: -step(), behavior: "smooth" }));
    $("[data-next]")?.addEventListener("click", () => quotes.scrollBy({ left: step(), behavior: "smooth" }));
  }

  const wizard = $("[data-booking]");
  if (!wizard) return yearStamp();

  const SERVICES = [
    { id: "klasik-cilt", cat: "Cilt Bakımı", name: "Klasik Cilt Bakımı", dur: 60, price: 1200 },
    { id: "hydrafacial", cat: "Cilt Bakımı", name: "Hydrafacial", dur: 50, price: 2500 },
    { id: "leke-bakim", cat: "Cilt Bakımı", name: "Leke Karşıtı Bakım", dur: 70, price: 1800 },
    { id: "lazer-bacak", cat: "Lazer Epilasyon", name: "Lazer · Tüm Bacak", dur: 40, price: 1500 },
    { id: "lazer-koltuk", cat: "Lazer Epilasyon", name: "Lazer · Koltuk Altı", dur: 15, price: 450 },
    { id: "lazer-tum", cat: "Lazer Epilasyon", name: "Lazer · Tüm Vücut", dur: 90, price: 3500 },
    { id: "kas-tasarim", cat: "Kaş & Kirpik", name: "Kaş Tasarımı", dur: 20, price: 250 },
    { id: "kas-laminasyon", cat: "Kaş & Kirpik", name: "Kaş Laminasyonu", dur: 45, price: 900 },
    { id: "kirpik-lifting", cat: "Kaş & Kirpik", name: "Kirpik Lifting", dur: 60, price: 1000 },
    { id: "manikur", cat: "Tırnak", name: "Manikür", dur: 40, price: 450 },
    { id: "kalici-oje", cat: "Tırnak", name: "Kalıcı Oje", dur: 50, price: 650 },
    { id: "protez-tirnak", cat: "Tırnak", name: "Protez Tırnak", dur: 90, price: 1200 },
    { id: "sac-kesim", cat: "Saç", name: "Kesim & Fön", dur: 60, price: 750 },
    { id: "sac-boya", cat: "Saç", name: "Saç Boyama", dur: 120, price: 1800 },
    { id: "keratin", cat: "Saç", name: "Keratin Bakımı", dur: 150, price: 3000 }
  ];
  const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  const state = { services: new Set(), expert: "İlk müsait uzman", date: null, time: null };

  const list = $("[data-services]", wizard);
  let lastCat = "";
  SERVICES.forEach((s) => {
    if (s.cat !== lastCat) {
      const h = document.createElement("p");
      h.className = "cat-label";
      h.textContent = s.cat;
      list.appendChild(h);
      lastCat = s.cat;
    }
    const label = document.createElement("label");
    label.className = "choice";
    label.innerHTML = `<input type="checkbox" value="${s.id}"><span class="choice__dot"></span><span class="choice__body"><strong></strong><span>${s.dur} dk</span></span><span class="choice__price">${tl(s.price)}</span>`;
    $("strong", label).textContent = s.name;
    list.appendChild(label);
  });
  const pre = new URLSearchParams(location.search).get("hizmet");
  $$("input", list).forEach((inp) => {
    if (inp.value === pre) { inp.checked = true; state.services.add(pre); }
    inp.addEventListener("change", () => {
      inp.checked ? state.services.add(inp.value) : state.services.delete(inp.value);
      update();
    });
  });

  $$("input[name=expert]", wizard).forEach((r) => r.addEventListener("change", () => { state.expert = r.value; update(); }));

  const daysBox = $("[data-days]", wizard), slotsBox = $("[data-slots]", wizard);
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "day";
    const closed = d.getDay() === 0;
    b.disabled = closed;
    b.innerHTML = `<small>${i === 0 ? "Bugün" : DAYS[d.getDay()]}</small><b>${d.getDate()}</b><span>${closed ? "Kapalı" : MONTHS[d.getMonth()]}</span>`;
    b.addEventListener("click", () => {
      $$(".day", daysBox).forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      state.date = d;
      state.time = null;
      renderSlots(d, i === 0);
      update();
    });
    daysBox.appendChild(b);
  }
  const renderSlots = (d, isToday) => {
    slotsBox.innerHTML = "";
    const seed = d.getDate() * 7 + d.getMonth() * 13;
    const closeHour = d.getDay() === 6 ? 18 : 20;
    for (let h = 10; h < closeHour; h++) {
      for (const m of [0, 30]) {
        const label = `${String(h).padStart(2, "0")}:${m ? "30" : "00"}`;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "slot";
        b.textContent = label;
        const busy = ((h * 2 + m / 30 + seed) % 5) === 0 || ((h + seed) % 7) === 0;
        const past = isToday && (h < today.getHours() + 1);
        b.disabled = busy || past;
        b.addEventListener("click", () => {
          $$(".slot", slotsBox).forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          state.time = label;
          update();
        });
        slotsBox.appendChild(b);
      }
    }
    $(".slots-title", wizard).hidden = false;
  };

  const steps = $$(".bstep", wizard);
  const marks = $$(".stepper span", wizard);
  let current = 0;
  const valid = [
    () => state.services.size > 0,
    () => true,
    () => state.date && state.time,
    () => true
  ];
  const go = (n) => {
    current = n;
    steps.forEach((s, i) => (s.hidden = i !== n));
    marks.forEach((m, i) => {
      m.classList.toggle("is-active", i === n);
      m.classList.toggle("is-done", i < n);
    });
    update();
    wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $$("[data-go-next]", wizard).forEach((b) => b.addEventListener("click", () => valid[current]() && go(current + 1)));
  $$("[data-go-prev]", wizard).forEach((b) => b.addEventListener("click", () => go(current - 1)));

  const sumList = $("[data-sum-list]"), sumTotal = $("[data-sum-total]"), sumDur = $("[data-sum-dur]");
  const sumExpert = $("[data-sum-expert]"), sumDate = $("[data-sum-date]");
  const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS[d.getDay()]}`;
  function update() {
    const chosen = SERVICES.filter((s) => state.services.has(s.id));
    sumList.innerHTML = chosen.length ? "" : '<span class="empty">Henüz hizmet seçmediniz</span>';
    chosen.forEach((s) => {
      const row = document.createElement("div");
      row.innerHTML = `<span></span><span>${tl(s.price)}</span>`;
      row.firstChild.textContent = s.name;
      sumList.appendChild(row);
    });
    const total = chosen.reduce((a, s) => a + s.price, 0);
    const dur = chosen.reduce((a, s) => a + s.dur, 0);
    sumTotal.textContent = tl(total);
    sumDur.textContent = dur ? `${Math.floor(dur / 60) ? Math.floor(dur / 60) + " sa " : ""}${dur % 60 ? (dur % 60) + " dk" : ""}` : "—";
    sumExpert.textContent = state.expert;
    sumDate.textContent = state.date ? fmtDate(state.date) + (state.time ? " · " + state.time : "") : "—";
    $$("[data-go-next]", wizard).forEach((b) => (b.disabled = !valid[current]()));
  }

  $("[data-booking-form]", wizard).addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#b-name", wizard).value.trim().split(" ")[0];
    $("[data-done-text]", wizard).textContent = `${name ? "Teşekkürler " + name + "! " : ""}${fmtDate(state.date)} saat ${state.time} için randevu talebin alındı. Onay mesajı birkaç dakika içinde telefonuna gelecek.`;
    steps.forEach((s) => (s.hidden = true));
    $(".stepper", wizard).hidden = true;
    $("[data-done]", wizard).hidden = false;
    wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  go(0);
  yearStamp();

  function yearStamp() { $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear())); }
})();
