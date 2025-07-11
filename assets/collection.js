/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Recharger l'ensemble de la collection de produits avec un contenu actualisé
   ===================== */
const reloadCollection = async () => {
  const productListing = document.querySelector(".collection .product-listing");

  if (productListing) {
    productListing.style.opacity = "0.2"; 
  }

  window.scrollTo({ top: 0, behavior: "smooth" }); 

  const response = await fetch(window.location.href); 
  const htmlContent = await response.text();
  const parser = new DOMParser();
  const updatedDocument = parser.parseFromString(htmlContent, "text/html");

  // Replace the main product collection with its updated version
  const updatedCollection = updatedDocument.querySelector(".collection");
  if (updatedCollection) {
    document.querySelector(".collection")?.replaceWith(updatedCollection);
    productListing.style.opacity = "1";
  }

  // Update additional UI components related to the collection
  updateUIComponents(updatedDocument);

  // Reinitialize Bootstrap popovers in the collection
  document
    .querySelectorAll('.collection [data-bs-toggle="popover"]')
    .forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });

  // Notify the application that the collection has been updated
  window.dispatchEvent(new CustomEvent("onCollectionShopiwebUpdate"));
};

// Updates filter components and other interactive elements within the offcanvas filters
const updateUIComponents = (updatedDocument) => {
  // Update collapsible filter internals
  document
    .querySelectorAll("#offcanvas-filters .collapse-inner")
    .forEach((collapse) => {
      const collapseId = collapse.closest(".collapse").getAttribute("id");
      const newCollapseContent = updatedDocument.querySelector(
        `#offcanvas-filters #${collapseId} .collapse-inner`
      );
      if (newCollapseContent) {
        collapse.replaceWith(newCollapseContent);
      }
    });

  // Replace specific filter UI components such as footer, clear all button, and sort by selector
  const uiSelectors = [
    "#offcanvas-filters .offcanvas-footer",
    "#offcanvas-filters .btn-filters-clear-all",
    '#offcanvas-filters [name="sort_by"]',
  ];
  uiSelectors.forEach((selector) => {
    const newElement = updatedDocument.querySelector(selector);
    document.querySelector(selector)?.replaceWith(newElement);
  });
};

/* =====================
   Utilitaire pour mettre à jour l'URL avec de nouveaux paramètres de requête
   ===================== */
const updateUrlWithQueryParams = (form) => {
  const params = new URLSearchParams(new FormData(form));
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
};

/* =====================
   Mise à jour de la collection en fonction des changements de filtre
   ===================== */
window.onChangeCollectionFilter = async (inputElement) => {
  const form = inputElement.closest("form");
  updateUrlWithQueryParams(form);
  await reloadCollection();
};

/* =====================
   Gestion des changements de filtres de prix de la collection
   ===================== */
const setupPriceFilterListeners = () => {
  document.querySelectorAll(".filter-amounts input").forEach((input) => {
    input.addEventListener(
      "input",
      window.debounce(async () => {
        updateUrlWithQueryParams(input.closest("form"));
        await reloadCollection();
      }, 750)
    );
  });
};
setupPriceFilterListeners();
window.addEventListener(
  "onCollectionShopiwebUpdate",
  setupPriceFilterListeners
);

/* =====================
   Développe tous les filtres cachés en cliquant sur le bouton
   ===================== */
window.onClickFiltersViewMore = (button) => {
  button
    .closest(".collapse")
    .querySelectorAll(".form-check")
    .forEach((check) => {
      check.removeAttribute("hidden");
    });
  button.remove();
};

/* =====================
   Efface tous les filtres et recharge la collection
   ===================== */
window.onClickClearAllFilters = async (button) => {
  const form = button.closest("form");
  const sortValue = form.querySelector('[name="sort_by"]').value;
  const params = new URLSearchParams();
  params.set("sort_by", sortValue);
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
  await reloadCollection();
};

/* =====================
   Initialise les curseurs du filtre de prix
   ===================== */
const initializePriceFilterSliders = () => {
  document.querySelectorAll(".amount-selection-slider").forEach((slider) => {
    const minValueField = slider
      .closest("form")
      .querySelector('[name="filter.v.price.gte"]');
    const maxValueField = slider
      .closest("form")
      .querySelector('[name="filter.v.price.lte"]');

    if (slider.noUiSlider) {
      slider.noUiSlider.destroy();
    }

    noUiSlider.create(slider, {
      start: [Number(slider.dataset.minValue), Number(slider.dataset.maxValue)],
      connect: true,
      range: {
        min: Number(slider.dataset.rangeMin),
        max: Number(slider.dataset.rangeMax),
      },
    });

    slider.noUiSlider.on("update", (values) => {
      minValueField.value = values[0];
      maxValueField.value = values[1];
    });

    slider.noUiSlider.on("change", () => {
      minValueField.dispatchEvent(new Event("input"));
      maxValueField.dispatchEvent(new Event("input"));
    });
  });
};
initializePriceFilterSliders();
window.addEventListener(
  "onCollectionShopiwebUpdate",
  initializePriceFilterSliders
);

/* =====================
   Met à jour les paramètres de l'URL
   ===================== */
const updateQueryParameters = (key, value) => {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  return `${window.location.pathname}?${params.toString()}`;
};

/* =====================
   Gère les changements dans le tri de la collection
   ===================== */
window.onChangeCollectionSortBy = (sortByValue) => {
  const updatedUrl = updateQueryParameters("sort_by", sortByValue);
  window.history.replaceState({}, "", updatedUrl);
  reloadCollection();
};

/* =====================
   Fonctions permettant de charger d'autres produits dans une collection à la suite d'une action de l'utilisateur.
   ===================== */
const showLoadingIndicator = (button) => {
  button.style.width = `${button.offsetWidth + 2}px`;
  button.style.height = `${button.offsetHeight + 2}px`;
  button.innerHTML = `
        <div class="spinner-border mx-auto spinner-border-sm" style="width: 1.2rem; height: 1.2rem" role="status">
            <span class="visually-hidden">En attente...</span>
        </div>
    `;
};

const updateCollectionContent = async (button, direction) => {
  const url = button.dataset[direction + "Url"];
  window.history.replaceState({}, "", url);

  const response = await fetch(window.location.href);
  const data = await response.text();
  const parser = new DOMParser();
  const newDocument = parser.parseFromString(data, "text/html");

  const productListSelector = ".collection .product-listing";
  const productListHtml =
    newDocument.querySelector(productListSelector).innerHTML;

  const insertMethod = direction === "next" ? "beforeend" : "afterbegin";
  document
    .querySelector(productListSelector)
    .insertAdjacentHTML(insertMethod, productListHtml);

  const paginationElement = document.querySelector("#paging-collection");
  paginationElement.replaceWith(
    newDocument.querySelector("#paging-collection")
  );

  document
    .querySelectorAll('.collection [data-bs-toggle="popover"]')
    .forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });

  window.dispatchEvent(new CustomEvent("onCollectionShopiwebUpdate"));
};

window.onClickCollectionLoadMore = async (button, event) => {
  event.preventDefault();
  showLoadingIndicator(button);
  await updateCollectionContent(button, "next");
};

window.onClickCollectionLoadPrevious = async (button, event) => {
  event.preventDefault();
  showLoadingIndicator(button);
  await updateCollectionContent(button, "previous");
};

/* =====================
   Pagination infinie automatique
   ===================== */
const initializeAutoPagination = () => {
  const pagination = document.querySelector("#paging-collection");
  if (!pagination) return;

  const observerOptions = { threshold: 0, rootMargin: "0px 0px -100px 0px" };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const loadMoreButton = pagination.querySelector(".button-loading-more");
        if (loadMoreButton) loadMoreButton.click();
      }
    });
  }, observerOptions);

  observer.observe(pagination);
};

initializeAutoPagination();
window.addEventListener("onCollectionShopiwebUpdate", initializeAutoPagination);

// Attaches or detaches a sticky utilities bar based on scroll position
const toggleStickyUtilitiesBar = () => {
  const utilitiesBar = document.querySelector("#collection-controls");
  if (!utilitiesBar) return;

  const navbarHeight =
    document.querySelector('[id*="__navbar"].sticky-top')?.clientHeight || 0;
  const announcementBarHeight =
    document.querySelector('[id*="__announcement-bar"].sticky-top')
      ?.clientHeight || 0;
  const stickyTriggerHeight = 700; // Adjusted fixed value for when to trigger sticky behavior

  const adjustStickyStatus = () => {
    if (window.scrollY > stickyTriggerHeight) {
      utilitiesBar.classList.add("sticky-top");
      utilitiesBar.style.top = `${navbarHeight + announcementBarHeight}px`;
      setTimeout(() => utilitiesBar.classList.add("show"), 200);
    } else {
      utilitiesBar.classList.remove("show");
      setTimeout(() => {
        utilitiesBar.classList.remove("sticky-top");
        utilitiesBar.style.top = "0";
      }, 200);
    }
  };

  // Throttling the scroll event listener to improve performance
  const throttledAdjust = window.throttle(adjustStickyStatus, 200);
  document.addEventListener("scroll", throttledAdjust);

  // Periodic check to reset sticky status near the top of the page
  setInterval(() => {
    if (window.scrollY < 50) {
      utilitiesBar.classList.remove("sticky-top", "show");
      utilitiesBar.style.top = "0";
    }
  }, 1000);
};

// Initialize the sticky utilities bar logic
toggleStickyUtilitiesBar();

// Re-initialize sticky utilities bar when the collection updates
window.addEventListener("onCollectionShopiwebUpdate", () => {
  setTimeout(toggleStickyUtilitiesBar, 1000);
});

// This function reveals all color swatches for a product and removes the trigger button
window.showCompleteSwatchSet = (triggerButton, event) => {
  const swatchContainer = triggerButton.closest(".color-swatches");
  swatchContainer.querySelectorAll("li").forEach((swatch) => {
    swatch.removeAttribute("hidden");
  });
  triggerButton.remove();
};

/* =====================
   Bannière de collection
   ===================== */
const initializeCollectionBanners = () => {
  const productListing = document.querySelector(".collection .product-listing");

  if (!productListing) return;

  // Process each banner and insert it before the specified product item
  document.querySelectorAll(".collection-card").forEach((b) => {
    const injectionIndex = Number(b.dataset.inject) - 1; 
    const targetItem = productListing.children[injectionIndex]; 

    if (targetItem) {
      targetItem.insertAdjacentElement("beforebegin", b);
    }
  });
};
initializeCollectionBanners();

// Handle the loading of Shopify sections which might include collection banners
document.addEventListener("shopify:section:load", (event) => {
  if (event.target.querySelector(".collection-card")) {
    // Re-initialize banners upon dynamic content loading to ensure correct placement
    initializeCollectionBanners();
  }
});
