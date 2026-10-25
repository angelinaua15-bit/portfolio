(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const preloader = document.getElementById("preloader");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const progress = document.querySelector(".progress span");

  const showPage = () => root.classList.add("is-shown");

  const finishIntro = () => {
    showPage();
    if (preloader) {
      preloader.style.transition = "transform 0.9s cubic-bezier(.77,0,.18,1)";
      preloader.style.transform = "translateY(-100%)";
      setTimeout(() => preloader.remove(), 1000);
    }
  };

  if (reduce || typeof gsap === "undefined") {
    finishIntro();
  } else {
    const bar = document.querySelector(".preloader__bar i");
    gsap.timeline({ onComplete: finishIntro })
      .to(bar, { width: "100%", duration: 0.9, ease: "power2.inOut" })
      .to(".preloader__name, .preloader__kicker", { y: -12, opacity: 0, duration: 0.35 }, "-=0.1");

    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".reveal", {
      y: 24,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: "power3.out",
      delay: 1.25
    });

    gsap.utils.toArray(".service, .step, .stat, .carousel").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out"
      });
    });

    const process = document.querySelector(".process");
    if (process) {
      ScrollTrigger.create({
        trigger: process,
        start: "top 75%",
        once: true,
        onEnter: () => process.classList.add("is-drawn")
      });
    }

    document.querySelectorAll(".stat strong").forEach((node) => {
      const target = Number(node.dataset.count || 0);
      node.textContent = "0";
      ScrollTrigger.create({
        trigger: node,
        start: "top 85%",
        once: true,
        onEnter: () => {
          const state = { n: 0 };
          gsap.to(state, {
            n: target,
            duration: 1.3,
            ease: "power2.out",
            onUpdate: () => { node.textContent = String(Math.round(state.n)); }
          });
        }
      });
    });
  }

  if (!reduce && typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9
    });
    if (typeof ScrollTrigger !== "undefined") lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    window.__lenis = lenis;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        closeMenu();
        lenis.scrollTo(target, { offset: -20, duration: 1.2 });
      });
    });
  }

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-solid", y > window.innerHeight * 0.72);
    if (progress && max > 0) progress.style.width = `${(y / max) * 100}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() {
    if (!menu || !burger) return;
    menu.hidden = true;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    if (window.__lenis) window.__lenis.start();
  }

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.classList.toggle("is-open", !open);
      menu.hidden = open;
      document.body.classList.toggle("nav-open", !open);
      if (window.__lenis) (open ? window.__lenis.start() : window.__lenis.stop());
    });
  }

  document.querySelectorAll(".faq__item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const open = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq__item").forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector("button").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  if (fine && !reduce) {
    const cursor = document.querySelector(".cursor");
    if (cursor) {
      let x = 0;
      let y = 0;
      let cx = 0;
      let cy = 0;
      window.addEventListener("pointermove", (event) => {
        x = event.clientX;
        y = event.clientY;
        cursor.classList.add("is-on");
      });
      window.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
      const loop = () => {
        cx += (x - cx) * 0.18;
        cy += (y - cy) * 0.18;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        requestAnimationFrame(loop);
      };
      loop();
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("pointerenter", () => cursor.classList.add("is-link"));
        el.addEventListener("pointerleave", () => cursor.classList.remove("is-link"));
      });
    }

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  const track = document.querySelector(".carousel__track");
  if (track) {
    const slides = Array.from(track.querySelectorAll(".slide"));
    const now = document.getElementById("slideNow");
    const bar = document.getElementById("slideBar");
    const prev = document.getElementById("prevSlide");
    const next = document.getElementById("nextSlide");
    let current = 0;
    const pad = (n) => String(n + 1).padStart(2, "0");

    const setActive = (i) => {
      current = i;
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      if (now) now.textContent = pad(i);
      if (bar) bar.style.transform = `translateX(${i * 100}%)`;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    };
    const goTo = (i) => {
      const k = Math.max(0, Math.min(slides.length - 1, i));
      const left = slides[k].offsetLeft - slides[0].offsetLeft;
      track.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    };
    const sync = () => {
      const x = track.scrollLeft;
      let best = 0;
      let dist = Infinity;
      slides.forEach((s, k) => {
        const d = Math.abs(s.offsetLeft - slides[0].offsetLeft - x);
        if (d < dist) { dist = d; best = k; }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
      if (best !== current || !slides[best].classList.contains("is-active")) setActive(best);
    };
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }, { passive: true });
    prev && prev.addEventListener("click", () => goTo(current - 1));
    next && next.addEventListener("click", () => goTo(current + 1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });
    slides.forEach((s, k) => s.addEventListener("click", (e) => {
      if (track.dataset.dragged) { e.preventDefault(); return; }
      if (k !== current) { e.preventDefault(); goTo(k); }
    }));

    if (fine) {
      let down = false;
      let moved = false;
      let startX = 0;
      let startLeft = 0;
      track.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        down = true; moved = false;
        startX = e.clientX; startLeft = track.scrollLeft;
      });
      window.addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-drag"); }
        if (moved) track.scrollLeft = startLeft - dx;
      });
      window.addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        if (moved) {
          track.classList.remove("is-drag");
          track.dataset.dragged = "1";
          setTimeout(() => { delete track.dataset.dragged; }, 50);
          sync();
          goTo(current);
        }
      });
    }
    setActive(0);
  }

  setTimeout(showPage, 2200);
})();
