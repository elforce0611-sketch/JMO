/* =========================================================
   soom 숨 — interactions
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 스크롤 시 네비게이션 그림자 ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 모바일 메뉴 토글 ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (toggle && mobileMenu) {
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "메뉴 열기");
      mobileMenu.hidden = true;
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "메뉴 열기" : "메뉴 닫기");
      mobileMenu.hidden = open;
    });
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // 같은 화면에 함께 들어온 요소는 살짝 시차를 두고 등장
            const delay = Math.min(i * 60, 240);
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- 숫자 카운트업 ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReduced || target === 0) {
      el.textContent = (target === 0 && suffix ? suffix : target.toLocaleString("ko-KR") + suffix);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString("ko-KR") + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 제품 카테고리 필터 ---------- */
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".product-card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- 영상 모달 ---------- */
  const modal = document.getElementById("storyModal");
  const openBtn = document.getElementById("playStory");
  const modalVideo = document.getElementById("modalVideo");
  let lastFocused = null;

  const openModal = () => {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const closeEl = modal.querySelector(".modal__close");
    if (closeEl) closeEl.focus();
    if (modalVideo && modalVideo.play) modalVideo.play().catch(() => {});
  };
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (modalVideo && modalVideo.pause) modalVideo.pause();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (modal) {
    modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  /* ---------- 뉴스레터 폼 검증 ---------- */
  const form = document.getElementById("subscribeForm");
  const emailInput = document.getElementById("email");
  const msg = document.getElementById("formMsg");
  if (form && emailInput && msg) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();
      if (!emailRe.test(value)) {
        msg.textContent = "올바른 이메일 주소를 입력해 주세요.";
        msg.classList.add("is-error");
        emailInput.focus();
        return;
      }
      msg.classList.remove("is-error");
      msg.textContent = "구독해 주셔서 감사합니다. 곧 첫 소식을 보내드릴게요 🌿";
      form.reset();
    });
    emailInput.addEventListener("input", () => {
      if (msg.textContent) {
        msg.textContent = "";
        msg.classList.remove("is-error");
      }
    });
  }
})();
