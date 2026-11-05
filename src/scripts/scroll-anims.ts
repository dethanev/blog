import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./lenis";

gsap.registerPlugin(ScrollTrigger);

// Motion boots on the first interaction, so pins may be created after the
// user has already scrolled. Their spacers then push visible content down;
// shift the scroll position by the same amount before the next paint.
function keepViewportStable(init: () => void) {
  const anchor = Array.from(document.querySelector("main")?.children ?? []).find(
    (el) => el.getBoundingClientRect().top >= 0,
  );
  const before = anchor?.getBoundingClientRect().top;

  init();

  if (!anchor || before === undefined) return;
  const delta = anchor.getBoundingClientRect().top - before;
  if (Math.abs(delta) < 1) return;

  const target = window.scrollY + delta;
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(target, { immediate: true, force: true });
  } else {
    window.scrollTo(0, target);
  }
}

function initHeroPin() {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const title = document.querySelector<HTMLElement>("[data-hero-title]");
  if (!hero || !title) return;

  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=70%",
    pin: true,
    pinSpacing: true,
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      title.style.setProperty("--fill-progress", String(p));
      if (p > 0.4) {
        title.classList.add("heading-fill");
      } else {
        title.classList.remove("heading-fill");
      }
    },
  });
}

function initMarquees() {
  document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((track) => {
    if (track.dataset.marqueeReady === "true") return;
    track.dataset.marqueeReady = "true";

    const direction = track.dataset.marqueeDir === "right" ? -1 : 1;
    const baseSpeed = Number(track.dataset.marqueeSpeed ?? 60);
    const inner = track.firstElementChild as HTMLElement | null;
    if (!inner) return;

    let velocity = 0;
    let position = 0;
    let lastT = performance.now();
    let scrollVel = 0;

    ScrollTrigger.create({
      trigger: track,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        scrollVel = self.getVelocity() / 200;
      },
    });

    function tick(now: number) {
      const dt = (now - lastT) / 1000;
      lastT = now;
      const targetVel = baseSpeed * direction + scrollVel * 0.35;
      velocity += (targetVel - velocity) * 0.08;
      position += velocity * dt;
      const w = inner!.scrollWidth / 4;
      if (w > 0) {
        position = ((position % w) + w) % w;
      }
      inner!.style.transform = `translate3d(${-position}px, 0, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function initRevealCards() {
  document.querySelectorAll<HTMLElement>("[data-reveal]:not([hidden])").forEach((el, i) => {
    if (el.dataset.revealReady === "true") return;
    el.dataset.revealReady = "true";

    const dir = i % 2 === 0 ? -1 : 1;
    gsap.from(el, {
      x: 60 * dir,
      y: 30,
      rotate: dir * 1.5,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function initStaggerGrid() {
  document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((container) => {
    const items = container.querySelectorAll<HTMLElement>("[data-stagger-item]");
    if (items.length === 0) return;
    gsap.from(items, {
      y: 40,
      opacity: 0,
      rotate: () => (Math.random() - 0.5) * 6,
      duration: 0.55,
      ease: "back.out(1.7)",
      stagger: 0.08,
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        once: true,
      },
    });
  });
}

function initReadingProgress() {
  const bar = document.querySelector<HTMLElement>("[data-reading-progress]");
  const content = document.querySelector<HTMLElement>(".prose-body");
  if (!bar || !content) return;
  gsap.to(bar, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: content,
      start: "top center",
      end: "bottom center",
      scrub: true,
    },
  });
}

function initHeadingUnderlines() {
  document.querySelectorAll<HTMLElement>("[data-underline]").forEach((el) => {
    gsap.from(el, {
      "--underline-progress": 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

function initHorizontalScroll() {
  document.querySelectorAll<HTMLElement>("[data-h-scroll]").forEach((section) => {
    const track = section.querySelector<HTMLElement>("[data-h-track]");
    const progress = section.querySelector<HTMLElement>("[data-h-progress]");
    if (!track) return;

    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
  });
}

export function initScrollAnimations() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  keepViewportStable(() => {
    initHeroPin();
    initMarquees();
    initRevealCards();
    initStaggerGrid();
    initHorizontalScroll();
    initReadingProgress();
    initHeadingUnderlines();

    ScrollTrigger.refresh();
  });
}
