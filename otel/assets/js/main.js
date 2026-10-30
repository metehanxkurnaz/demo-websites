/* Azelia Otel — interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Preloader
  window.addEventListener("load", () => {
    const pre = $(".preloader");
    if (pre) setTimeout(() => pre.classList.add("is-done"), 350);
  });

  // Sticky header
  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  const burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        document.body.style.overflow = "";
      })
    );
  }

  // Active nav link
  const page = location.pathname.split("/").pop() || "index.html";
  $$(".nav__links a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("is-active");
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  // Count-up stats
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  // Testimonials slider
  const slides = $$(".testimonial");
  const dotsWrap = $(".dots");
  if (slides.length && dotsWrap) {
    let i = 0, timer;
    slides.forEach((_, idx) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Yorum " + (idx + 1));
      b.addEventListener("click", () => { go(idx); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);
    const go = (n) => {
      slides[i].classList.remove("is-active"); dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active"); dots[i].classList.add("is-active");
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
    go(0); restart();
  }

  // Booking date defaults
  const fmt = (d) => d.toISOString().split("T")[0];
  const today = new Date();
  $$('input[type="date"][data-offset]').forEach((inp) => {
    const d = new Date(today);
    d.setDate(d.getDate() + parseInt(inp.dataset.offset, 10));
    inp.value = fmt(d);
    inp.min = fmt(today);
  });

  // Toast
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

  // Demo forms
  $$("form[data-demo]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast(form.dataset.demo);
      if (form.dataset.reset !== "false") form.reset();
      $$('input[type="date"][data-offset]', form).forEach((inp) => {
        const d = new Date(today);
        d.setDate(d.getDate() + parseInt(inp.dataset.offset, 10));
        inp.value = fmt(d);
      });
    })
  );

  // Filters (rooms + gallery)
  $$("[data-filter-group]").forEach((group) => {
    const target = group.dataset.filterGroup;
    const items = $$(`[data-category]`, $(target));
    $$(".filter-btn", group).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$(".filter-btn", group).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.dataset.filter;
        items.forEach((it) => {
          const show = f === "all" || it.dataset.category.split(" ").includes(f);
          it.classList.toggle("is-hidden", !show);
        });
      })
    );
  });

  // Lightbox
  const galleryItems = $$(".gallery__item");
  if (galleryItems.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<button class="lightbox__close" aria-label="Kapat">&times;</button>
      <button class="lightbox__prev" aria-label="Önceki">&#8592;</button>
      <img alt="">
      <button class="lightbox__next" aria-label="Sonraki">&#8594;</button>`;
    document.body.appendChild(lb);
    const img = $("img", lb);
    let current = 0;
    const visible = () => galleryItems.filter((g) => !g.classList.contains("is-hidden"));
    const show = (idx) => {
      const list = visible();
      current = (idx + list.length) % list.length;
      const src = $("img", list[current]);
      img.src = src.dataset.full || src.src;
      img.alt = src.alt;
    };
    galleryItems.forEach((g) =>
      g.addEventListener("click", () => {
        show(visible().indexOf(g));
        lb.classList.add("is-open");
      })
    );
    const close = () => lb.classList.remove("is-open");
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(current - 1); });
    $(".lightbox__next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(current + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // Year
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
