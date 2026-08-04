const btn = document.getElementById('menu-btn');
const overlay = document.getElementById('overlay');
const menu = document.getElementById('mobile-menu');
const counters = document.querySelectorAll('.counter');
let scrollStarted = false;

btn.addEventListener('click', navToggle);
document.addEventListener('scroll', scrollPage);

function navToggle() {
  btn.classList.toggle('open');
  overlay.classList.toggle('overlay-show');
  document.body.classList.toggle('stop-scrolling');
  menu.classList.toggle('show-menu');
}

function scrollPage() {
  const scrollPos = window.scrollY;

  if (scrollPos > 100 && !scrollStarted) {
    countUp();
    scrollStarted = true;
  } else if (scrollPos < 100 && scrollStarted) {
    reset();
    scrollStarted = false;
  }
}

function countUp() {
  counters.forEach((counter) => {
    counter.innerText = '0';

    const updateCounter = () => {
      const target = +counter.getAttribute('data-target');
      const c = +counter.innerText;
      const increment = target / 100;

      if (c < target) {
        counter.innerText = `${Math.ceil(c + increment)}`;
        setTimeout(updateCounter, 75);
      } else {
        counter.innerText = target;
      }
    };

    updateCounter();
  });
}

function reset() {
  counters.forEach((counter) => (counter.innerHTML = '0'));
}

/* ─── Scroll-triggered reveal ─── */

const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((el) => revealObserver.observe(el));

/* ─── Section in-view (video Ken Burns + dot nav) ─── */

const sections = document.querySelectorAll('section[data-section]');
const dots = document.querySelectorAll('.section-dots .dot');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const idx = entry.target.dataset.section;

      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        dots.forEach((d) => d.classList.remove('active'));
        const activeDot = document.querySelector(`.dot[data-target="${idx}"]`);
        if (activeDot) activeDot.classList.add('active');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  },
  { threshold: 0.55 }
);

sections.forEach((s) => sectionObserver.observe(s));

/* ─── Dot click → scroll to section ─── */

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const target = dot.dataset.target;
    const section = document.querySelector(`section[data-section="${target}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ─── Scroll arrow → next section ─── */

document.querySelectorAll('.scroll-arrow').forEach((arrow) => {
  arrow.addEventListener('click', () => {
    const parent = arrow.closest('section');
    const next = parent.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ─── Video autoplay guard ───

   Mobile Safari refuses or silently drops autoplay when several videos
   compete for decoders, so the section that is on screen gets played and
   the others are paused. play() is also retried on the first tap, since
   some browsers only release playback after a user gesture. */

const videos = document.querySelectorAll('section video');

function tryPlay(video) {
  const played = video.play();
  if (played && typeof played.catch === 'function') {
    played.catch(() => {});
  }
}

const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tryPlay(entry.target);
      } else {
        entry.target.pause();
      }
    });
  },
  { threshold: 0.25 }
);

videos.forEach((video) => {
  // Muted is a hard requirement for autoplay; set it here too in case the
  // attribute is lost.
  video.muted = true;
  videoObserver.observe(video);
});

function resumePlayback() {
  videos.forEach((video) => {
    if (video.paused) tryPlay(video);
  });
}

document.addEventListener('touchstart', resumePlayback, { once: true, passive: true });
document.addEventListener('click', resumePlayback, { once: true });

/* ─── First section: reveal immediately ─── */

const firstReveal = document.querySelector('.section-a .reveal');
if (firstReveal) {
  requestAnimationFrame(() => firstReveal.classList.add('is-visible'));
}
