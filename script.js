/* =========================================================
   FRANCIS MANGA PORTFOLIO
   JavaScript controls:
   • Mobile navigation
   • Scroll reveal (with stagger)
   • Portfolio filters
   • Artwork lightbox
   • Parallax character
   • Mouse movement effects
   • Custom cursor
   • Scroll progress
   • Page transitions (curtain wipe)
========================================================= */

/* =========================================================
   PAGE LOADER
   Shown and hidden entirely from JS rather than a timed CSS
   animation, and fully removed from the DOM once done. If a
   renderer doesn't execute this script, the loader's default
   CSS state is display:none — it simply never appears rather
   than getting stuck visible.
========================================================= */

const loader = document.querySelector(".page-loader");

if (loader) {
  loader.classList.add("is-active");

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("is-hiding");

      loader.addEventListener("transitionend", () => loader.remove(), {
        once: true,
      });
    }, 600);
  });
}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuButton = document.querySelector(".menu-toggle");

const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    navigation.classList.toggle("open");
    menuButton.setAttribute(
      "aria-expanded",
      navigation.classList.contains("open"),
    );
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation?.classList.remove("open");
  });
});

/* =========================================================
   SCROLL REVEAL
   Elements that share a parent get a short stagger so
   groups of cards / stats arrive as one composed beat
   instead of popping in independently.
========================================================= */

const revealGroups = new Map();

document.querySelectorAll(".reveal").forEach((element) => {
  const parent = element.parentElement;
  const siblingIndex = revealGroups.get(parent) ?? 0;

  element.style.setProperty(
    "--reveal-delay",
    `${Math.min(siblingIndex, 5) * 0.08}s`,
  );

  revealGroups.set(parent, siblingIndex + 1);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   PORTFOLIO FILTER
========================================================= */

const filters = document.querySelectorAll(".filter");

const archiveCards = document.querySelectorAll(".archive-card");

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    filters.forEach((item) => {
      item.classList.remove("active");
    });

    filter.classList.add("active");

    const category = filter.dataset.filter;

    archiveCards.forEach((card) => {
      const cardCategory = card.dataset.category;

      if (category === "all" || category === cardCategory) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

/* =========================================================
   LIGHTBOX
   Manga panel opens into fullscreen artwork.
========================================================= */

const lightbox = document.querySelector(".lightbox");

const lightboxImage = document.querySelector(".lightbox img");

const lightboxTitle = document.querySelector(".lightbox-title");

const lightboxClose = document.querySelector(".lightbox-close");

// Scroll-lock helpers.
// Just setting `overflow: hidden` on the body isn't enough on
// several mobile browsers: the page keeps its existing scroll
// offset underneath, and a `position: fixed` overlay can end up
// anchored to that offset instead of the visible screen — which
// is why the lightbox looked like it needed extra scrolling to
// see fully. Pinning the body itself in place (and restoring the
// scroll position on close) keeps the lightbox exactly where the
// user is looking, on every browser.
let lockedScrollY = 0;

function lockScroll() {
  lockedScrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = "100%";
}

function unlockScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, lockedScrollY);
}

document.querySelectorAll(".archive-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (!lightbox) return;

    const image = card.querySelector("img");

    const title = card.querySelector("h2");

    lightboxImage.src = image.src;

    lightboxImage.alt = image.alt;

    if (lightboxTitle && title) {
      lightboxTitle.textContent = title.textContent;
    }

    lightbox.classList.add("active");

    lockScroll();
  });
});

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("active");

  unlockScroll();
}

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

/* =========================================================
   CHARACTER PARALLAX
   Tiny movement makes the PNG feel alive.
========================================================= */

const characters = document.querySelectorAll(
  ".hero-character img, .page-character img, .about-character img",
);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (!prefersReducedMotion) {
  window.addEventListener("mousemove", (event) => {
    if (window.innerWidth < 900) return;

    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    characters.forEach((character) => {
      character.style.transform = `translate(${x * 15}px, ${y * -15}px)`;
    });
  });
}

/* =========================================================
   RANDOM SFX ROTATION
   Adds subtle manga-panel life.
========================================================= */

const sfx = document.querySelectorAll(".onomato, .page-sfx");

sfx.forEach((element, index) => {
  element.style.animationDelay = `${index * 0.15}s`;
});

/* =========================================================
   NAVBAR — HIDE ON SCROLL + SHADOW WHEN SCROLLED
   Also drives the scroll-progress bar.
========================================================= */

const navbar = document.querySelector(".navbar");

const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);

let lastScroll = window.scrollY;

function updateOnScroll() {
  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll && currentScroll > 180) {
    navbar?.style.setProperty("transform", "translateY(-100%)");
  } else {
    navbar?.style.setProperty("transform", "translateY(0)");
  }

  navbar?.classList.toggle("scrolled", currentScroll > 20);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  const progress = docHeight > 0 ? (currentScroll / docHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;

  lastScroll = currentScroll;
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

/* =========================================================
   CUSTOM CURSOR
   A quiet dot-and-ring cursor on precision pointers only —
   grows around anything clickable.
========================================================= */

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursorDot = document.createElement("div");
  cursorDot.className = "cursor-dot";

  const cursorRing = document.createElement("div");
  cursorRing.className = "cursor-ring";

  document.body.append(cursorDot, cursorRing);

  let ringX = 0;
  let ringY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    cursorDot.style.transform = `translate(${targetX}px, ${targetY}px)`;

    if (!document.body.classList.contains("cursor-ready")) {
      document.body.classList.add("cursor-ready");
    }
  });

  function animateRing() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;

    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(animateRing);
  }

  animateRing();

  const interactiveSelector =
    "a, button, .comic-btn, .filter, .archive-card, .featured-card, .manga-panel, .design-card, .process-card, .contact-card, .tools-grid div";

  document.querySelectorAll(interactiveSelector).forEach((element) => {
    element.addEventListener("mouseenter", () =>
      cursorRing.classList.add("is-active"),
    );

    element.addEventListener("mouseleave", () =>
      cursorRing.classList.remove("is-active"),
    );
  });
}

/* =========================================================
   PAGE TRANSITIONS
   A brief black cross-fade replaces the old opacity flash.
   The curtain element is created and removed on the fly —
   it never lives permanently in the DOM, so it can't linger
   as a stray full-screen layer during normal browsing.
========================================================= */

document.querySelectorAll("a").forEach((link) => {
  const href = link.getAttribute("href");

  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("http")
  )
    return;

  link.addEventListener("click", (event) => {
    event.preventDefault();

    const curtain = document.createElement("div");
    curtain.className = "page-curtain";

    const panelLeft = document.createElement("div");
    panelLeft.className = "curtain-panel left";

    const panelRight = document.createElement("div");
    panelRight.className = "curtain-panel right";

    const label = document.createElement("span");
    label.textContent = "NEXT CHAPTER";

    curtain.append(panelLeft, panelRight, label);

    document.body.appendChild(curtain);

    // force a reflow so the initial (off-screen) transform is
    // committed before we flip to is-active — guarantees the
    // slide-in transition actually plays
    void curtain.offsetWidth;

    // panels slide in and collide
    curtain.classList.add("is-active");

    // text pops in right after collision
    setTimeout(() => {
      curtain.classList.add("show-text");
    }, 480);

    // navigate once text has been visible for a beat
    setTimeout(() => {
      window.location.href = href;
    }, 1200);
  });
});

/* =========================================================
   IMAGE FALLBACK
   No broken-image apocalypse.
========================================================= */

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    image.style.background = "linear-gradient(135deg,#222,#555)";

    image.style.minHeight = "250px";

    image.style.objectFit = "contain";
  });
});
