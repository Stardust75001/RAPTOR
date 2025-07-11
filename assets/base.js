// ✅ Debug flag toggle
const isDev = false;

function log(...args) {
  if (isDev) console.log(...args);
}

function debug(...args) {
  if (isDev) console.debug(...args);
}

log("Shopiweb Theme - Premium Shopify Theme by shopiweb.fr | En savoir plus sur https://www.shopiweb.fr");

window.addEventListener("scroll", () => {
  document.documentElement.classList.toggle("has-scrolled", window.scrollY > 0);
  debug("Scroll event triggered. Y:", window.scrollY);
});

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el));
document.querySelector(".btn.shopify-challenge__button")?.classList.add("btn-primary");

debug("Tooltip and popover initialized");

const errors = document.querySelector(".errors");
if (errors) {
  errors.classList.add("alert", "alert-danger");
  debug("Error block styled with alert classes");
}

Shopify.resizeImage = (src, size, crop = "") => {
  return src
    .replace(/_(pico|icon|thumb|small|compact|medium|large|grande|original|1024x1024|2048x2048|master)+\./g, ".")
    .replace(/\.(jpg|png|gif|jpeg)/g, match => {
      if (crop.length) crop = `_crop_${crop}`;
      return `_${size}${crop}${match}`;
    });
};

Shopify.formatMoney = function (cents, format) {
  if (typeof cents === "string") cents = cents.replace(".", "");
  let value = "";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || this.money_format;

  function d(o, d) {
    return typeof o === "undefined" ? d : o;
  }

  function f(n, p, t, dSep) {
    p = d(p, 2);
    t = d(t, ",");
    dSep = d(dSep, ".");
    if (isNaN(n) || n == null) return 0;
    n = (n / 100).toFixed(p);
    const parts = n.split(".");
    const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + t);
    const cents = parts[1] ? dSep + parts[1] : "";
    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = f(cents, d, undefined, undefined);
      break;
    case "amount_no_decimals":
      value = f(cents, 0, undefined, undefined);
      break;
    case "amount_with_comma_separator":
      value = f(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = f(cents, 0, ".", ",");
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

window.debounce = (cb, wait = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => cb.apply(this, args), wait);
  };
};

window.throttle = (cb, time = 200) => {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last >= time) {
      cb();
      last = now;
    }
  };
};

// Gestion IntersectionObserver avec fallback observeAll
const intersectionCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("entered");

      entry.target.querySelectorAll(".animate__animated.opacity-0").forEach(el => {
        el.classList.remove("opacity-0");

        const animateClass = el.dataset.animateClass;
        if (animateClass && typeof animateClass === 'string' && animateClass.trim() !== '') {
          el.classList.add(animateClass);
          debug("Added animation class:", animateClass);
        }
      });
    }
  });
};

const observerOptions = {
  threshold: 0,
  rootMargin: "0px 0px -200px 0px"
};

if (IntersectionObserver.prototype.observeAll) {
  const observer = new IntersectionObserver(intersectionCallback, observerOptions);
  observer.observeAll(document.querySelectorAll(".enter-view"));
} else {
  console.warn('observeAll is not available. Falling back to individual observation.');
  const observer = new IntersectionObserver(intersectionCallback, observerOptions);
  document.querySelectorAll(".enter-view").forEach(el => observer.observe(el));
}

window.createNewCookie = (n, v, d) => {
  let date, exp;
  if (d) {
    date = new Date();
    date.setDate(date.getDate() + d);
    exp = "; expires=" + date.toUTCString();
  } else {
    exp = "";
  }
  document.cookie = n + "=" + v + exp + "; path=/";
  debug("Cookie created:", n);
};

const initializeScrollToTopButton = () => {
  const btn = document.querySelector("#btn-scroll-top");
  if (!btn) return;

  document.addEventListener(
    "scroll",
    window.throttle(() => {
      const scrollThreshold = parseInt(btn.dataset.scroll, 10);
      btn.classList.toggle("btn-show", !isNaN(scrollThreshold) && window.scrollY > scrollThreshold);
      debug("ScrollToTop toggle, Y:", window.scrollY);
    }, 700)
  );
};
initializeScrollToTopButton();

const initializeVideoLazyLoad = () => {
  const lazyVideos = [...document.querySelectorAll("video.lazy-video")];
  if ("IntersectionObserver" in window) {
    const lazyVideoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(video => {
          if (video.isIntersecting) {
            for (const source of video.target.children) {
              if (
                typeof source.tagName === "string" &&
                source.tagName === "SOURCE" &&
                source.dataset.src
              ) {
                source.src = source.dataset.src;
              }
            }

            if (
              video.target.hasAttribute("data-poster") &&
              video.target.dataset.poster
            ) {
              video.target.poster = video.target.dataset.poster;
            }

            video.target.load();
            video.target.classList.remove("lazy-video");
            lazyVideoObserver.unobserve(video.target);
            debug("Video lazy-loaded:", video.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 200px 0px" }
    );

    lazyVideos.forEach(video => {
      lazyVideoObserver.observe(video);
    });
    debug("Video lazy loader initialized");
  }
};
initializeVideoLazyLoad();

document.addEventListener("shopify:section:load", () => {
  document.querySelectorAll(".enter-view").forEach(elem => {
    elem.classList.add("entered");
  });
  document.querySelectorAll(".animate__animated.opacity-0").forEach(el => {
    el.classList.remove("opacity-0");
  });
  debug("Shopify section reloaded");
});

// === Sticky/Footer/Header from BUBBLE ===
