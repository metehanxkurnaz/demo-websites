(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
    });
    $$(".nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("nav-open")));
  }

  const page = location.pathname.split("/").pop() || "index.html";
  $$(".nav__links a").forEach((a) => a.getAttribute("href") === page && a.classList.add("is-active"));

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "", prefix = el.dataset.prefix || "";
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("tr-TR") + suffix;
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
  $$("form[data-demo]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast(form.dataset.demo);
    form.reset();
  }));

  const QUESTIONS = [
    { q: "Yerleşim yeri içinde otomobiller için azami hız sınırı kaç km/s'dir?", o: ["30 km/s", "50 km/s", "70 km/s", "90 km/s"], a: 1, e: "Aksi bir işaret yoksa yerleşim yeri içinde otomobiller için hız sınırı 50 km/s'dir." },
    { q: "Trafik ışıklarında yanan sarı ışık sürücüye neyi bildirir?", o: ["Hızlanarak geçmesini", "Durmaya hazırlanmasını, kavşağa girmemesini", "Sadece sağa dönebileceğini", "Yolun kapalı olduğunu"], a: 1, e: "Sarı ışık, kırmızı yanacağını haber verir; sürücü durmaya hazırlanmalıdır." },
    { q: "Hususi otomobil sürücüleri için yasal alkol sınırı kaç promildir?", o: ["0,00", "0,20", "0,50", "1,00"], a: 2, e: "Hususi otomobil sürücüleri için sınır 0,50 promildir; ticari araç sürücülerinde alkol hiç kabul edilmez." },
    { q: "Işıksız ve işaretsiz (kontrolsüz) bir kavşakta geçiş hakkı kimdedir?", o: ["Soldan gelen araçta", "Büyük araçta", "Sağdan gelen araçta", "Hızlı gelen araçta"], a: 2, e: "Kontrolsüz kavşaklarda sağdan gelen araca yol verilir." },
    { q: "Yaya geçidine yaklaşırken geçitte yaya varsa ne yapılmalıdır?", o: ["Korna çalınarak uyarılmalı", "Yavaşlamadan geçilmeli", "Durup yayaya yol verilmeli", "Selektör yapılmalı"], a: 2, e: "Yaya geçidinde yayaların geçiş önceliği vardır; sürücü durup yol vermelidir." },
    { q: "Emniyet kemeri takmak hangi koltuklarda zorunludur?", o: ["Sadece sürücü koltuğunda", "Sadece ön koltuklarda", "Kemer bulunan tüm koltuklarda", "Sadece şehirlerarası yolda"], a: 2, e: "Araçta kemer bulunan tüm koltuklarda emniyet kemeri takmak zorunludur." },
    { q: "Takip mesafesi için genel kural nedir?", o: ["Her zaman 10 metre", "Hızın (km/s) yarısı kadar metre", "Hızın iki katı kadar metre", "Bir araç boyu"], a: 1, e: "Örneğin 90 km/s hızla giderken öndeki araçla en az 45 metre mesafe bırakılmalıdır." },
    { q: "Otoyolda otomobiller için azami hız sınırı kaç km/s'dir?", o: ["90 km/s", "100 km/s", "120 km/s", "140 km/s"], a: 2, e: "Aksi bir işaret yoksa otoyollarda otomobiller için hız sınırı 120 km/s'dir." },
    { q: "İlk yardımda ABC değerlendirmesindeki \"A\" neyi ifade eder?", o: ["Ambulans çağırmayı", "Hava yolunun açıklığını", "Ağrının yerini", "Ateş ölçümünü"], a: 1, e: "A (Airway): hava yolu açıklığı, B: solunum, C: dolaşım kontrolüdür." },
    { q: "Motor yağı seviyesi neyle kontrol edilir?", o: ["Yağ çubuğu ile", "Hararet göstergesiyle", "Takometre ile", "Akü göstergesiyle"], a: 0, e: "Motor soğukken ve araç düz zemindeyken yağ çubuğu ile kontrol edilir." }
  ];
  const LETTERS = ["A", "B", "C", "D"];

  const renderQuestion = (card, item, onAnswer) => {
    $("h4", card).textContent = item.q;
    const opts = $(".options", card);
    const explain = $(".qcard__explain", card);
    opts.innerHTML = "";
    explain.classList.remove("is-visible");
    item.o.forEach((text, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "option";
      b.innerHTML = `<b>${LETTERS[i]}</b><span></span>`;
      $("span", b).textContent = text;
      b.addEventListener("click", () => {
        $$(".option", opts).forEach((x, j) => {
          x.disabled = true;
          if (j === item.a) x.classList.add("is-correct");
        });
        if (i !== item.a) b.classList.add("is-wrong");
        explain.textContent = (i === item.a ? "Doğru! " : "Yanlış. ") + item.e;
        explain.classList.add("is-visible");
        onAnswer && onAnswer(i === item.a);
      });
      opts.appendChild(b);
    });
  };

  const single = $('[data-quiz="single"]');
  if (single) {
    let idx = Math.floor(Math.random() * QUESTIONS.length);
    const next = $("[data-next]", single);
    const show = () => {
      $("[data-counter]", single).textContent = `Soru ${idx + 1} / ${QUESTIONS.length}`;
      renderQuestion(single, QUESTIONS[idx]);
    };
    next && next.addEventListener("click", () => { idx = (idx + 1) % QUESTIONS.length; show(); });
    show();
  }

  const full = $('[data-quiz="full"]');
  if (full) {
    const card = $(".qcard", full);
    const bar = $(".quiz__progress span", full);
    const nextBtn = $("[data-next]", full);
    const resultBox = $(".result", full);
    let idx = 0, score = 0, answered = false;
    const show = () => {
      answered = false;
      nextBtn.disabled = true;
      nextBtn.textContent = idx === QUESTIONS.length - 1 ? "Sonucu Gör" : "Sonraki Soru";
      $("[data-counter]", card).textContent = `Soru ${idx + 1} / ${QUESTIONS.length}`;
      $("[data-score]", card).textContent = `Doğru: ${score}`;
      bar.style.width = (idx / QUESTIONS.length) * 100 + "%";
      renderQuestion(card, QUESTIONS[idx], (ok) => {
        answered = true;
        if (ok) score++;
        $("[data-score]", card).textContent = `Doğru: ${score}`;
        nextBtn.disabled = false;
      });
    };
    nextBtn.addEventListener("click", () => {
      if (!answered) return;
      if (idx < QUESTIONS.length - 1) { idx++; show(); return; }
      bar.style.width = "100%";
      card.hidden = true;
      $(".quiz__nav", full).hidden = true;
      const pct = Math.round((score / QUESTIONS.length) * 100);
      $("[data-result-score]", resultBox).textContent = pct;
      $("[data-result-text]", resultBox).textContent = pct >= 70
        ? `${QUESTIONS.length} sorudan ${score} doğru. E-sınav barajı olan 70 puanın üzerindesin, harika bir başlangıç!`
        : `${QUESTIONS.length} sorudan ${score} doğru. E-sınav barajı 70 puan; derslerimizle bu barajı rahatça geçebilirsin.`;
      resultBox.hidden = false;
    });
    $("[data-restart]", full).addEventListener("click", () => {
      idx = 0; score = 0;
      card.hidden = false;
      $(".quiz__nav", full).hidden = false;
      resultBox.hidden = true;
      show();
    });
    show();
  }

  const list = $("[data-checklist]");
  if (list) {
    const KEY = "rota-belgeler";
    const boxes = $$("input[type=checkbox]", list);
    const bar = $("[data-check-bar]"), label = $("[data-check-label]");
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { saved = []; }
    boxes.forEach((b, i) => { b.checked = saved.includes(i); });
    const update = () => {
      const done = boxes.filter((b) => b.checked).length;
      bar.style.width = (done / boxes.length) * 100 + "%";
      label.textContent = `${done} / ${boxes.length} belge hazır`;
      try { localStorage.setItem(KEY, JSON.stringify(boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0))); } catch (e) {}
    };
    boxes.forEach((b) => b.addEventListener("change", update));
    update();
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
