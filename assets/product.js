/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Formulaire (ATC) basé sur la variante
   ===================== */
window.handleAtcFormVariantClick = async (btn, event) => {
  const form = btn.closest("form");
  form.querySelector('[name="id"]').value = btn.dataset.variantId;

  window.handleAddToCartFormSubmit(form, event);
};

/* =====================
   Formulaire principal d'ajout au panier (ATC)
   ===================== */
window.handleAddToCartFormSubmit = async (form, event) => {
  event.preventDefault();

  const btn = form.querySelector(".btn-atc");

  btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;

  form.classList.add("loading");

  const response = await fetch("/cart/add.js", {
    method: "POST",
    body: new FormData(form),
  });

  form.classList.remove("loading");
  btn.innerHTML = window.theme.product.addedToCart;

  setTimeout(() => {
    btn.innerHTML = btn.dataset.textAddToCart;
  }, 2000);

  window.updateCartContents(response);

  if (form.hasAttribute("data-shopiweb-upsell-modal")) return;
  if (btn.closest(".modal")) return;

  if (document.querySelector("#offcanvas-cart")) {
    bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-cart").show();
  }
};

/* =====================
   Mise à jour de divers éléments en cas de changement de variante nécessitant une nouvelle recherche de documents
   ===================== */
window.addEventListener("variantChange.shopiweb.product", async (event) => {
  const inventoryBar = document.querySelector("#inventory-bar");

  if (inventoryBar) {
    inventoryBar.style.opacity = ".25";
  }

  try {
    const response = await fetch(window.location.href);
    const text = await response.text();
    const newDocument = new DOMParser().parseFromString(text, "text/html");

    document.querySelector("#inventory-bar")?.replaceWith(newDocument.querySelector("#inventory-bar"));
    document.querySelector("#product-qty-breaks")?.replaceWith(newDocument.querySelector("#product-qty-breaks"));
    document.querySelector("#product-store-availability-wrapper")?.replaceWith(newDocument.querySelector("#product-store-availability-wrapper"));

    if (document.querySelector('.page-type-product')) {
      document.querySelector('.product-variant-selector')?.replaceWith(newDocument.querySelector('.product-variant-selector'));
    }

    initializeInventoryBar();
    initializeQuantityBreaks(); // Correction du nom de la fonction

    document.querySelectorAll('[role="tooltip"]').forEach((el) => el.remove());

    document.querySelectorAll('.product-options [data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la variante :", error);
  }
});
/* =====================
   Options d'achat (plans de vente/abonnement)
   ===================== */
const initializePurchaseOptions = () => {
  const wrapper = document.querySelector("#purchase-options-product");

  if (!wrapper) return;

  wrapper.querySelectorAll('[name="purchase_option"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.id === "purchase-options-one-time") {
        wrapper
          .querySelector("#purchase-delivery-options")
          .setAttribute("hidden", "hidden");
        wrapper.querySelector('[name="selling_plan"]').disabled = true;

        if (input.closest("#product-template")) {
          const url = new URL(window.location);
          url.searchParams.delete("selling_plan");
          window.history.replaceState({}, "", url);
        }
      } else {
        wrapper
          .querySelector("#purchase-delivery-options")
          .removeAttribute("hidden");
        wrapper.querySelector('[name="selling_plan"]').disabled = false;

        if (input.closest("#product-template")) {
          const url = new URL(window.location);
          url.searchParams.set(
            "variant",
            wrapper.closest(".product-content").querySelector('[name="id"]')
              .value
          );
          url.searchParams.set(
            "selling_plan",
            wrapper.querySelector('[name="selling_plan"]').value
          );
          window.history.replaceState({}, "", url);
        }
      }
    });
  });

  const selectDeliverEvery = wrapper.querySelector(
    "#options-select-purchase-delivery"
  );

  if (selectDeliverEvery) {
    selectDeliverEvery.addEventListener("change", () => {
      if (selectDeliverEvery.closest("#product-template")) {
        const url = new URL(window.location);
        url.searchParams.set(
          "selling_plan",
          wrapper.querySelector('[name="selling_plan"]').value
        );
        window.history.replaceState({}, "", url);
      }
    });
  }

  if (wrapper.dataset.subSelectedFirst === "true") {
    wrapper.querySelector("input#purchase-options-subscription").checked = true;
    wrapper
      .querySelector("input#purchase-options-subscription")
      .dispatchEvent(new Event("change"));
  }
};
initializePurchaseOptions();

/* =====================
   Sélecteur d'options de produits - Écouter les événements de changement
   ===================== */
window.handleProductOptionChange = async (input) => {
  const selectedOptions = [];

  input
    .closest("form")
    .querySelectorAll(".product-option")
    .forEach((elem) => {
      if (elem.type === "radio") {
        if (elem.checked) {
          selectedOptions.push(elem.value);
        }
      } else {
        selectedOptions.push(elem.value);
      }
    });

  const variantSelected = window.productVariants.find(
    (variant) =>
      JSON.stringify(variant.options) === JSON.stringify(selectedOptions)
  );

  console.log(variantSelected);

  const btn = input.closest("form").querySelector(".btn-atc");

  if (variantSelected) {
    input.closest("form").querySelector('[name="id"]').value =
      variantSelected.id;

    if (variantSelected.available) {
      btn.disabled = false;
      btn.innerHTML = window.theme.product.addToCart;
    } else {
      btn.disabled = true;
      btn.innerHTML = window.theme.product.soldOut;
    }

    if (variantSelected.compare_at_price > variantSelected.price) {
      input
        .closest(".product-content")
        .querySelector(".product-price").innerHTML = `
                  <span class="product-price-final me-3">
                      <span class="visually-hidden">
                          ${window.theme.product.priceSale} &nbsp;
                      </span>
                      ${Shopify.formatMoney(variantSelected.price)}
                  </span>
                  <span class="product-price-compare text-muted">
                      <span class="visually-hidden">
                          ${window.theme.product.priceFrom} &nbsp;
                      </span>
                      <s>
                          ${Shopify.formatMoney(
                            variantSelected.compare_at_price
                          )}
                      </s>
                  </span>
              `;
    } else {
      input
        .closest(".product-content")
        .querySelector(".product-price").innerHTML = `
                  <span class="product-price-final">
                      ${Shopify.formatMoney(variantSelected.price)}
                  </span>
              `;
    }
    if (variantSelected.available && variantSelected.compare_at_price) {
      input
        .closest(".product-content")
        .querySelector(".product-price")
        .insertAdjacentHTML(
          "beforeend",
          `
                  <span class="price-badge-sale badge">
                      ${window.theme.product.save}: ${Math.round(
            (1 - variantSelected.price / variantSelected.compare_at_price) * 100
          )}%
                  </span>    
              `
        );
    } else if (!variantSelected.available) {
      input
        .closest(".product-content")
        .querySelector(".product-price")
        .insertAdjacentHTML(
          "beforeend",
          `
                  <span class="price-badge-sold-out badge">
                      ${window.theme.product.soldOut}
                  </span>
              `
        );
    }

    const purchaseOptionsWrapper = document.querySelector(
      "#purchase-options-product"
    );

    if (purchaseOptionsWrapper) {
      purchaseOptionsWrapper.querySelector(
        "input#purchase-options-one-time + label [data-price]"
      ).textContent = Shopify.formatMoney(variantSelected.price);
      purchaseOptionsWrapper.querySelector(
        "input#purchase-options-subscription + label [data-price]"
      ).textContent = Shopify.formatMoney(
        variantSelected.selling_plan_allocations[0].price
      );
    }

    const skuWrapper = input
      .closest(".product-content")
      .querySelector(".current-variant-sku");

    if (skuWrapper) {
      if (variantSelected.sku.length) {
        skuWrapper.textContent = variantSelected.sku;
        skuWrapper.removeAttribute("hidden");
      } else {
        skuWrapper.setAttribute("hidden", "hidden");
      }
    }

    if (input.closest("#product-template")) {
      const url = new URL(window.location);
      url.searchParams.set("variant", variantSelected.id);
      window.history.replaceState({}, "", url);
    }

    const customEvent = new CustomEvent("variantChange.shopiweb.product", {
      detail: variantSelected,
    });
    window.dispatchEvent(customEvent);
  } else {
    btn.disabled = true;
    btn.innerHTML = window.theme.product.unavailable;
  }

  if (input.closest(".color-swatches")) {
    input
      .closest(".product-option-wrapper")
      .querySelector(".color-swatches-title span").textContent = input.value;
  }

  if (input.closest(".size-buttons")) {
    input
      .closest(".product-option-wrapper")
      .querySelector(".size-buttons-title span").textContent = input.value;
  }
};

/* =====================
   Article - Changement de la variante
   ===================== */
window.handleProductItemVariantChange = (select, event) => {
  if (select.options[select.selectedIndex].dataset.variantImage?.length) {
    select.closest(".product-item").querySelector(".product-item-img").src =
      select.options[select.selectedIndex].dataset.variantImage;
  }

  const compareAtPrice =
    select.options[select.selectedIndex].dataset.compareAtPrice;
  const price = select.options[select.selectedIndex].dataset.price;

  if (compareAtPrice.length) {
    select
      .closest(".product-item")
      .querySelector(".product-item-price").innerHTML = `
            <span class="product-item-price-final me-1">
                <span class="visually-hidden">
                    ${window.theme.product.priceSale} &nbsp;
                </span>
                ${Shopify.formatMoney(price)}
            </span>
            <span class="product-item-price-compare text-muted">
                <span class="visually-hidden">
                    ${window.theme.product.priceFrom} &nbsp;
                </span>
                <s>
                    ${Shopify.formatMoney(compareAtPrice)}
                </s>
            </span>
        `;
  } else {
    select
      .closest(".product-item")
      .querySelector(".product-item-price").innerHTML = `
            <span class="product-item-price-final">
                ${Shopify.formatMoney(price)}
            </span>
        `;
  }
};

/* =====================
   Bouton (Acheter maintenant)
   ===================== */
window.handleBuyButtonClick = (btn) => {
  btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
  const form = btn.closest("form");
  const variantId = form.querySelector('[name="id"]').value;
  const qty = Number(form.querySelector('input[name="quantity"]')?.value || 1);
  window.location.href = `/cart/${variantId}:${qty}`;
};

/* =====================
   Galerie de produits
   ===================== */
const initializeProductGallery = () => {
  document
    .querySelectorAll(".product-gallery:not(.init)")
    .forEach((gallery) => {
      gallery.classList.add("init");

      const main = new Splide(gallery.querySelector(".main-splide"), {
        start: Number(gallery.dataset.start),
        rewind: true,
        arrows: false,
        rewindByDrag: true,
        pagination: false,
        noDrag: "model-viewer",
        mediaQuery: "min",
        breakpoints: {
          0: {
            padding: {
              right: gallery.dataset.showThumbsMobile === "false" ? "4rem" : 0,
            },
          },
          992: { padding: 0 },
        },
        direction: document.documentElement.getAttribute("dir"),
      });

      const totalSlides = gallery.querySelectorAll(
        ".main-splide .splide__slide"
      ).length;

      const thumbs = new Splide(gallery.querySelector(".thumbs-splide"), {
        start: Number(gallery.dataset.start),
        arrows: Number(gallery.dataset.mediaCount > 3),
        gap: ".5rem",
        rewind: true,
        rewindByDrag: true,
        pagination: false,
        isNavigation: true,
        focus: totalSlides > 5 ? "center" : 0,
        mediaQuery: "min",
        breakpoints: {
          0: { perPage: 5 },
          576: { perPage: 5 },
          768: { perPage: 5 },
          992: { perPage: 5 },
          1200: { perPage: 5 },
          1400: { perPage: 5 },
        },
        direction: document.documentElement.getAttribute("dir"),
      });

      main.on("move", (newIndex, prevIndex) => {
        const iframe = gallery.querySelector(
          `.splide__slide:nth-child(${prevIndex + 1}) iframe`
        );
        const video = gallery.querySelector(
          `.splide__slide:nth-child(${prevIndex + 1}) video`
        );
        if (iframe) {
          // eslint-disable-next-line no-self-assign
          iframe.src = iframe.src;
        }
        if (video) {
          video.pause();
        }
      });

      window.addEventListener(
        "variantChange.shopiweb.product",
        (event) => {
          const variantSelected = event.detail;

          if (variantSelected.featured_media) {
            main.go(variantSelected.featured_media.position - 1);
          }
        },
        false
      );

      main.sync(thumbs);
      main.mount();
      thumbs.mount();

      if (window.matchMedia("(min-width: 992px)").matches) {
        const navbarHeight =
          document.querySelector('[id*="__navbar"].sticky-top')?.clientHeight ||
          0;
        const announcementBarHeight =
          document.querySelector('[id*="__announcement-bar"].sticky-top')
            ?.clientHeight || 0;

        const galleryWrapper = gallery.closest(".product-gallery-wrapper");
        if (!galleryWrapper) return;
        galleryWrapper.style.position = "sticky";
        galleryWrapper.style.top = `${
          navbarHeight + announcementBarHeight + 20
        }px`;
        galleryWrapper.style.zIndex = "1";
      }

      if (window.GLightbox) {
        // eslint-disable-next-line no-unused-vars
        const lightbox = GLightbox({
          selector: `[data-gallery="product-gallery-${gallery.dataset.productId}"]`,
          videosWidth: "1290px",
          loop: true,
        });
        lightbox.on("open", () => {
          gallery.querySelectorAll("video").forEach((video) => {
            video.pause();
          });
        });
        lightbox.on("slide_changed", ({ prev, current }) => {
          main.go(current.index);
        });
      }

      const modelViewer = gallery.querySelector("model-viewer");

      if (modelViewer) {
        const increaseBtn = gallery.querySelector(
          "[data-model-3d-increase-zoom]"
        );
        const decreaseBtn = gallery.querySelector(
          "[data-model-3d-decrease-zoom]"
        );
        const fullscreenBtn = gallery.querySelector(
          "[data-model-3d-fullscreen]"
        );

        increaseBtn.addEventListener("click", () => {
          modelViewer.zoom(1);
        });

        decreaseBtn.addEventListener("click", () => {
          modelViewer.zoom(-1);
        });

        fullscreenBtn.addEventListener("click", () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
            fullscreenBtn
              .querySelector(".bi-fullscreen")
              .removeAttribute("hidden");
            fullscreenBtn
              .querySelector(".bi-fullscreen-exit")
              .setAttribute("hidden", "hidden");
          } else {
            modelViewer
              .closest(".product-gallery-model-3d")
              .requestFullscreen();
            fullscreenBtn
              .querySelector(".bi-fullscreen")
              .setAttribute("hidden", "hidden");
            fullscreenBtn
              .querySelector(".bi-fullscreen-exit")
              .removeAttribute("hidden");
          }
        });
      }
    });
};
initializeProductGallery();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".product-gallery")) {
    initializeProductGallery();
  }
});

window.addEventListener(
  "updated.shopiweb.collection",
  initializeProductGallery
);

/* =====================
   Barre d'inventaire
   ===================== */
const initializeInventoryBar = () => {
  const wrapper = document.querySelector("#inventory-bar");

  if (!wrapper) return;

  const progressBar = wrapper.querySelector(".progress-bar");

  setTimeout(() => {
    progressBar.style.width = progressBar.dataset.width;
  }, 250);
};
initializeInventoryBar();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector("#inventory-bar")) {
    initializeInventoryBar();
  }
});

/* =====================
   Upsell modal
   ===================== */
const initializeUpsellModal = () => {
  const modal = document.querySelector("#modal-upsell-product");
  if (!modal) return;

  const form = document.querySelector(
    '#product-content form[onsubmit*="handleAddToCartFormSubmit"]'
  );
  if (!form) return;

  form.setAttribute("data-shopiweb-upsell-modal", "true");

  form.addEventListener("submit", (e) => {
    const modal = bootstrap.Modal.getOrCreateInstance("#modal-upsell-product");
    modal.show();
  });

   document.querySelectorAll("#modal-upsell-product .btn-atc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const footerBtn = document.querySelector(
        "#modal-upsell-product .modal-footer .btn"
      );
      footerBtn.classList.remove(footerBtn.dataset.defaultClass);
      footerBtn.classList.add(footerBtn.dataset.activeClass);
    });
  });

  modal.addEventListener("hidden.bs.modal", () => {
    if (document.querySelector("#offcanvas-cart")) {
      bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-cart").show();
    }
  });
};
initializeUpsellModal();