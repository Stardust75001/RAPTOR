/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

const localStorageKey = "shopiweb_wishlist_v1";

/* =====================
   Retirer de la liste de souhaits
   ===================== */
window.handleWishlistItemRemoval = (btn) => {
  let wishlist = JSON.parse(localStorage.getItem(localStorageKey)) || [];

  wishlist = wishlist.filter(
    (elem) => elem.handle !== btn.dataset.productHandle
  );

  localStorage.setItem(localStorageKey, JSON.stringify(wishlist));

  initializeWishlist();
};

/* =====================
   Ajouter ou retirer de la liste de souhaits
   ===================== */
window.removeOrAddFromWishlist = async (btn) => {
  let wishlist = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  const isWishlisted = wishlist.some(
    (elem) => elem.handle === btn.dataset.productHandle
  );

  if (isWishlisted) {
    wishlist = wishlist.filter(
      (elem) => elem.handle !== btn.dataset.productHandle
    );
  } else {
    const response = await fetch(`/products/${btn.dataset.productHandle}.js`);
    const product = await response.json();

    const variants = product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      compare_at_price: variant.compare_at_price,
      price: variant.price,
      featured_image: {
        src: variant.featured_image?.src || null,
      },
    }));

    wishlist.push({
      id: product.id,
      handle: product.handle,
      url: product.url,
      title: product.title,
      compare_at_price: product.compare_at_price,
      price: product.price,
      price_varies: product.price_varies,
      featured_image: product.featured_image,
      vendor: product.vendor,
      time: Date.now(),
      variants,
    });
  }

  localStorage.setItem(localStorageKey, JSON.stringify(wishlist));

  initializeWishlist();
};

/* =====================
   Initialisation liste de souhaits
   ===================== */
const initializeWishlist = () => {
  const wishlist = JSON.parse(localStorage.getItem(localStorageKey)) || [];

  document.querySelectorAll(".btn-wishlist-add-remove").forEach((btn) => {
    const isWishlisted = wishlist.some(
      (elem) => elem.handle === btn.dataset.productHandle
    );

    if (isWishlisted) {
      btn.querySelector("svg").setAttribute("fill", "currentColor");
      btn.setAttribute("aria-label", btn.dataset.textRemove);
      btn.classList.add("is-wishlisted");
    } else {
      btn.querySelector("svg").setAttribute("fill", "none");
      btn.setAttribute("aria-label", btn.dataset.textAdd);
      btn.classList.remove("is-wishlisted");
    }
  });

  document.querySelectorAll(".wishlist-count-badge").forEach((badge) => {
    if (wishlist.length === 0) {
      badge.setAttribute("hidden", "hidden");
    } else {
      badge.removeAttribute("hidden");
      badge.textContent = wishlist.length;
    }
  });

  if (wishlist.length) {
    const productList = document.querySelector(
      "#offcanvas-wishlist-product-listing"
    );
    let productListItems = "";

    wishlist.forEach((product) => {
      let variantOptions = "";

      product.variants.forEach((variant) => {
        variantOptions += `
                    <option 
                        value="${variant.id}"
                        data-compare-at-price="${
                          variant.compare_at_price || ""
                        }"
                        data-price="${variant.price}"
                        data-variant-image="${
                          variant.featured_image.src
                            ? Shopify.resizeImage(
                                variant.featured_image.src,
                                `${productList.dataset.imgWidth}x${productList.dataset.imgHeight}`,
                                "center"
                              )
                            : ""
                        }">
                        ${variant.title}
                    </option>
                `;
      });

      productListItems += `
                <li class="product-item py-3">
                    <div class="row align-items-center mx-n3">
                        <div class="col-4 px-3">
                            <a class="" href="${product.url}" tabindex="-1">
                                <img 
                                    class="product-item-img img-fluid rounded ${
                                      productList.dataset.imgThumbnail
                                    }" 
                                    src="${Shopify.resizeImage(
                                      product.featured_image || "no-image.gif",
                                      `${productList.dataset.imgWidth}x${productList.dataset.imgHeight}`,
                                      "center"
                                    )}"
                                    alt="" 
                                    width="${productList.dataset.imgWidth}"
                                    height="${productList.dataset.imgHeight}"
                                    loading="lazy">
                            </a>
                        </div>
                        <div class="col-8 px-3">
                            <h3 class="product-item-title h6 mb-0">
                                <a href="${product.url}" class="link-dark">
                                    ${product.title}
                                </a>
                            </h3>
                            <div class="stp-star mb-3"
                               data-id="${product.id}">
                            </div>
                            <p class="product-item-price small mb-3">
                                <span ${
                                  product.compare_at_price > product.price
                                    ? ""
                                    : "hidden"
                                }>
                                    <span class="product-item-price-final me-1">
                                        <span class="visually-hidden">
                                            ${
                                              productList.dataset.textPriceSale
                                            } &nbsp;
                                        </span>
                                        <span ${
                                          product.price_varies ? "" : "hidden"
                                        }>
                                            ${productList.dataset.textPriceFrom}
                                        </span>
                                        ${Shopify.formatMoney(product.price)}
                                    </span>
                                    <span class="product-item-price-compare text-muted">
                                        <span class="visually-hidden">
                                            ${
                                              productList.dataset
                                                .textPriceRegular
                                            } &nbsp;
                                        </span>
                                        <s>
                                            ${Shopify.formatMoney(
                                              product.compare_at_price
                                            )}
                                        </s>
                                    </span>
                                </span>
                                <span class="product-item-price-final" ${
                                  product.compare_at_price > product.price
                                    ? "hidden"
                                    : ""
                                }>
                                    <span ${
                                      product.price_varies ? "" : "hidden"
                                    }>
                                        ${productList.dataset.textPriceFrom}
                                    </span>
                                    ${Shopify.formatMoney(product.price)}
                                </span>
                            </p>
                            <div class="form-wrapper" ${
                              productList.dataset.showAtcForm === "true"
                                ? ""
                                : "hidden"
                            }>
                                <form method="post" action="/cart/add" accept-charset="UTF-8" class="shopify-product-form" enctype="multipart/form-data" onsubmit="handleAddToCartFormSubmit(this, event)">
                                    <input type="hidden" name="form_type" value="product">
                                    <input type="hidden" name="utf8" value="✓">
                                        <div class="d-flex">
                                            <select 
                                                class="form-select form-select-sm w-100 me-3" 
                                                name="id" 
                                                aria-label="${
                                                  productList.dataset
                                                    .textSelectVariant
                                                }"
                                                onchange="handleProductItemVariantChange(this, event)"
                                                ${
                                                  product.variants.length === 1
                                                    ? "hidden"
                                                    : ""
                                                }>
                                                ${variantOptions}
                                            </select>
                                        <button
                                            class="btn-atc btn btn-sm btn-primary px-4 flex-shrink-0"
                                            data-product-handle="${
                                              product.handle
                                            }"
                                            type="submit"
                                            name="add"
                                            data-text-add-to-cart="${
                                              productList.dataset.textAdd
                                            }">
                                            ${productList.dataset.textAdd}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <button 
                                class="btn-remove btn btn-sm"
                                data-product-handle="${product.handle}"
                                onclick="handleWishlistItemRemoval(this)"
                                aria-label="${
                                  productList.dataset.textWishlistRemove
                                }">
                                <svg xmlns="http://www.w3.org/2000/svg" class="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </li>
            `;
    });
    productList.innerHTML = productListItems;

    window.SPR?.initDomEls();
    window.SPR?.loadBadges();

    document.querySelectorAll("#offcanvas-wishlist .btn-atc").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          window.handleWishlistItemRemoval(btn);
          bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-wishlist").hide();
        }, 300);
      });
    });

    document
      .querySelector("#offcanvas-wishlist-empty")
      .setAttribute("hidden", "hidden");
    document
      .querySelector("#offcanvas-wishlist-product-listing")
      .removeAttribute("hidden");
  } else {
    document
      .querySelector("#offcanvas-wishlist-empty")
      .removeAttribute("hidden");
    document
      .querySelector("#offcanvas-wishlist-product-listing")
      .setAttribute("hidden", "hidden");
    document.querySelector("#offcanvas-wishlist-product-listing").innerHTML =
      "";
  }
};
initializeWishlist();

window.addEventListener("updated.shopiweb.cart", initializeWishlist);
window.addEventListener("onCollectionShopiwebUpdate", initializeWishlist);
window.addEventListener(
  "init.shopiweb.recommended_products",
  initializeWishlist
);
