/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Mégamenu de la barre de navigation - Ouverture/fermeture 
   ===================== */
document
  .querySelectorAll("#navbar-desktop .dropdown-toggle")
  .forEach((dropdown) => {
    const init = () => {
      if (document.querySelector("#navbar-desktop .dropdown-menu.show")) {
        document.querySelector("#main").classList.add("main-hidden");
      } else {
        document.querySelector("#main").classList.remove("main-hidden");
      }
    };
    dropdown.addEventListener("shown.bs.dropdown", init);
    dropdown.addEventListener("hidden.bs.dropdown", init);
  });

/* =====================
   Mégamenu de la barre de navigation - Mode de déclenchement au survol pour les éléments du menu parent
   ===================== */
document
  .querySelectorAll("#navbar-desktop.menu-desktop-hover .nav-item.dropdown")
  .forEach((dropdown) => {
    const bsDropdown = bootstrap.Dropdown.getOrCreateInstance(
      dropdown.querySelector(".nav-link")
    );

    dropdown.addEventListener("mouseover", () => {
      document
        .querySelectorAll("#navbar-desktop.menu-desktop-hover .dropdown-menu")
        .forEach((menu) => {
          if (
            menu.previousElementSibling.dataset.index !==
            dropdown.querySelector(".nav-link").dataset.index
          ) {
            menu.classList.remove("show");
          }
        });
      bsDropdown.show();
    });

    dropdown.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!dropdown.matches(":hover")) {
          bsDropdown.hide();
        }
      }, 200);
    });
  });

/* =====================
   Quantité de paliers (plus/moins)
   ===================== */
window.onClickQtyPlusMinus = (btn) => {
  const input = btn.closest(".quantity-wrapper").querySelector("input");
  const inputValue = Number(input.value);

  if (btn.dataset.mode === "plus") {
    input.value = inputValue + 1;
  } else {
    if (input.value > Number(input.dataset.minQty)) {
      input.value = inputValue - 1;
    }
  }

  const event = new Event("change");
  input.dispatchEvent(event);
};

/* =====================
   Barre de navigation transparente
   ===================== */
const fixTransparentNavbarHeader = () => {
  document.querySelectorAll(".navbar.navbar-transparent").forEach((navbar) => {
    const hasTextBody = navbar.classList.contains("text-body");

    if (navbar && hasTextBody) {
      window.addEventListener("scroll", (event) => {
        if (window.scrollY > 0) {
          navbar.classList.add("text-body");
          navbar.classList.remove("text-white");
        } else {
          navbar.classList.remove("text-body");
          navbar.classList.add("text-white");
        }
      });
    }
  });
};
fixTransparentNavbarHeader();

/* =====================
   Partager des liens à l'aide de l'API WebShare
   ===================== */
window.onLinkShare = (btn, e) => {
  if (navigator.share) {
    navigator.share({
      title: btn.dataset.shareTitle,
      url: window.location.href,
    });
  } else {
    const popover = bootstrap.Popover.getOrCreateInstance(btn, {
      content: `
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" value="${window.location.href}">
                    <button id="btn-share-copy" class="btn btn-outline-secondary" type="button">${btn.dataset.textCopy}</button>
                </div>
            `,
      html: true,
      sanitize: false,
      placement: "top",
    });

    popover.show();

    document
      .querySelector("#btn-share-copy")
      ?.addEventListener("click", (e) => {
        navigator.clipboard.writeText(window.location.href);
        e.target.textContent = btn.dataset.textCopied;
      });

    setTimeout(() => {
      popover.hide();
      btn.blur();
    }, 4000);
  }
};

/* =====================
   Page de recherche - définir la valeur sélectionnée pour le champ de sélection des types
   ===================== */
const initializeSelectedSearchPage = () => {
  const select = document.querySelector("#search-header .form-select");

  if (!select) return;

  const params = new URLSearchParams(location.search);
  const type = params.get("type");

  if (!type) return;

  select.value = type;
};
initializeSelectedSearchPage();

/* =====================
   Comptes à rebours
   ===================== */
const initializeCountdownTimers = () => {
  document.querySelectorAll(".timer-countdown").forEach((elem) => {
    if (elem.classList.contains("init")) return;

    elem.classList.add("init");

    let end = Number(elem.dataset.time) * 1000;

    if (window.location.href.includes("shopiweb")) {
      end = Date.now() + 1.08e7;
    }

    const seconds = 1000;
    const minutes = seconds * 60;
    const hours = minutes * 60;
    const days = hours * 24;

    const x = setInterval(() => {
      const now = new Date().getTime();
      const difference = end - now;

      if (difference < 0) {
        clearInterval(x);
        elem.remove();
        return;
      }

      elem.removeAttribute("hidden");

      const d = Math.floor(difference / days);
      const h = Math.floor((difference % days) / hours);
      const m = Math.floor((difference % hours) / minutes);
      const s = Math.floor((difference % minutes) / seconds);

      if (d > 0) {
        elem.querySelector(
          "[data-days]"
        ).innerText = `${d}${elem.dataset.textD}`;
        elem
          .querySelector("[data-days]")
          .setAttribute("aria-label", `${d} ${elem.dataset.textDays}`);
        elem.querySelector("[data-days]").removeAttribute("hidden"); // Affiche les jours si supérieur à 0
      } else {
        elem.querySelector("[data-days]").setAttribute("hidden", "hidden");
      }

      elem.querySelector("[data-hours").innerText = `${h}${elem.dataset.textH}`;
      elem
        .querySelector("[data-hours")
        .setAttribute("aria-label", `${h} ${elem.dataset.textHours}`);
      elem.querySelector(
        "[data-minutes"
      ).innerText = `${m}${elem.dataset.textM}`;
      elem
        .querySelector("[data-minutes")
        .setAttribute("aria-label", `${m} ${elem.dataset.textMinutes}`);
      elem.querySelector(
        "[data-seconds"
      ).innerText = `${s}${elem.dataset.textS}`;
      elem
        .querySelector("[data-seconds")
        .setAttribute("aria-label", `${s} ${elem.dataset.textSeconds}`);

      if (h === 0 && d === 0) {
        elem.querySelector("[data-hours").setAttribute("hidden", "hidden");
      }
    }, seconds);
  });
};
initializeCountdownTimers();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".timer-countdown")) {
    initializeCountdownTimers();
  }
});

/* =====================
   Animations au défilement
   ===================== */
const scrollAnimationsFix = () => {
  const isSettingEnabled = document.querySelector(".scroll-on-animations");

  if (!isSettingEnabled) {
    document
      .querySelectorAll(".animate__animated.opacity-0")
      .forEach((elem) => {
        elem.classList.remove("animate__animated", "opacity-0");
      });
    document
      .querySelectorAll(".dropdown-megamenu .animate__animated")
      .forEach((elem) => {
        elem.classList.remove("animate__animated");
      });
  }
};
scrollAnimationsFix();

/* =====================
   Articles précédents/suivants
   ===================== */
const initializePrevNextArticleButtons = async () => {
  const wrapper = document.querySelector("#article-prev-next");

  if (!wrapper) return;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const threshold = 600;

  window.addEventListener("scroll", () => {
    if (window.scrollY > threshold) {
      wrapper.classList.add("show");
    } else {
      wrapper.classList.remove("show");
    }
  });
};
initializePrevNextArticleButtons();

/* =====================
   Style Rivyo Reviews app
   ===================== */
const initializeRivyoReviews = () => {
  const wrapper = document.querySelector(".tydal-reviews-iframe-panel-wrapper");

  if (!wrapper) return;

  wrapper.classList.add("container");
};
initializeRivyoReviews();

if (window.location.href.includes("shopiweb")) {
  document
    .querySelectorAll(".dropdown-megamenu .dropdown-item.active")
    .forEach((item) => {
      item.classList.remove("active");
    });
  document
    .querySelectorAll("#offcanvas-menu .dropdown-item.active")
    .forEach((item) => {
      item.classList.remove("active");
    });
}

/* =====================
   Cookie Shopiweb app
   ===================== */
document.addEventListener("DOMContentLoaded", function () {
  const cookies = document.cookie;

  function getCookieValue(name) {
    let result = document.cookie.match(
      "(^|[^;]+)\\s*" + name + "\\s*=\\s*([^;]+)"
    );
    return result ? result.pop() : "";
  }

  var cooks = getCookieValue("cooks");

  if (cooks) {
    var cookiePopup = document.querySelector(".cookie-popup");
    if (cookiePopup) {
      cookiePopup.classList.add("hidepops");
    }
  }
});

function noaddCookie() {
  document.cookie = "cooks=false; expires=" + getExpirationDate(30);
  var cookiePopup = document.querySelector(".cookie-popup");
  if (cookiePopup) {
    cookiePopup.classList.add("hidepops");
  }
}

function addCookie() {
  document.cookie = "cooks=true; expires=" + getExpirationDate(60);
  var cookiePopup = document.querySelector(".cookie-popup");
  if (cookiePopup) {
    cookiePopup.classList.add("hidepops");
  }
}

function getExpirationDate(days) {
  var date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toUTCString();
}

/* =====================
   barre de progression du défilement
   ===================== */
const scrollProgressBar = document.getElementById("scroll-progress-bar");
if (scrollProgressBar) {
  function progressBarScroll() {
    let winScroll =
        document.body.scrollTop || document.documentElement.scrollTop,
      height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight,
      scrolled = (winScroll / height) * 100;
    scrollProgressBar.style.width = scrolled + "%";
  }

  window.onscroll = function () {
    progressBarScroll();
  };
}

/* =====================
   envelopper les applications dans un conteneur
   ===================== */
document
  .querySelectorAll(".shopify-section > .shopify-app-block")
  .forEach((elem) => {
    elem.classList.add("container");
  });

/* =====================
   Shopify Abonnements App
   ===================== */
document
  .querySelectorAll('.shopify_subscriptions_fieldset input[type="radio"]')
  .forEach((input) => {
    input.classList.add("form-check-input");
  });

/* =====================
   Titre de l'onglet inactif
   ===================== */
const initializeInactiveTabTitle = () => {
  const text = document.documentElement.dataset.inactiveTabText;

  if (!text) return;

  const originalTitle = document.title;
  let index = 0;
  let myInterval;

  function setPageTitle() {
    index = ++index;
    const newtitle = index === 0 ? "" : text.slice(0, index);
    document.title = newtitle;

    if (index === text.length) {
      index = 0;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      myInterval = setInterval(setPageTitle, 50);
    } else {
      clearInterval(myInterval);
      index = 0;
      document.title = originalTitle;
    }
  });
};
initializeInactiveTabTitle();

/* =====================
   Formulaire de localisation
   ===================== */
document
  .querySelectorAll(".shopify-localization-form button")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("form").querySelector('[name="country_code"]').value =
        btn.dataset.isoCode;
      btn.closest("form").submit();
    });
  });
