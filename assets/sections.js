/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Barre d'annonces
   ===================== */
const stickyAnnouncementBarInit = () => {
  const section = document.querySelector(".sticky-announcement-bar");
  if (!section) return;

  section.closest(".shopify-section").classList.add("sticky-top");

  const navbar = document.querySelector('[id*="__navbar"].sticky-top');
  if (!navbar) return;

  navbar.style.top =
    document.querySelector(".sticky-announcement-bar").clientHeight + "px";
};
stickyAnnouncementBarInit();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".sticky-announcement-bar")) {
    stickyAnnouncementBarInit();
  }
});

document.addEventListener("shopify:block:select", (event) => {
  const carousel = event.target.closest(".announcement-bar .carousel");

  if (carousel) {
    bootstrap.Carousel.getOrCreateInstance(carousel, { ride: false }).to(
      event.target.dataset.index
    );
  }
});

/* =====================
   Marquee
   ===================== */
const initializeMarqueeSections = () => {
  document.querySelectorAll(".marquee").forEach((section) => {
    const list = section.querySelector("ul");
    const marqueeWidth = list.scrollWidth;
    const marqueeLength = list.querySelectorAll("li").length;

    list.insertAdjacentHTML("beforeEnd", list.innerHTML);
    list.insertAdjacentHTML("beforeEnd", list.innerHTML);

    list.querySelectorAll("li").forEach((item, index) => {
      if (index >= marqueeLength) {
        item.setAttribute("aria-hidden", "true");
      }
    });

    let translateX = `-${marqueeWidth}`;

    if (document.documentElement.getAttribute("dir") === "rtl") {
      translateX = `${marqueeWidth}`;
    }

    let style = `
            <style>
                #marquee-${list.dataset.sectionId} ul {
                    animation-name: marquee-animation-${list.dataset.sectionId};
                    animation-duration: ${list.dataset.animationDuration}s;
                }
                @keyframes marquee-animation-${list.dataset.sectionId} {
                    to { transform: translateX(${translateX}px); }
                }
            </style>
        `;
    if (list.dataset.marqueeDirection === "right") {
      style += `
                <style>
                    @keyframes marquee-animation-${list.dataset.sectionId} {
                        from { transform: translateX(${translateX}px); }    
                        to { transform: 0; }    
                    }
                </style>
            `;
    }

    list.insertAdjacentHTML("beforeBegin", style);
  });
};
initializeMarqueeSections();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".marquee")) {
    initializeMarqueeSections();
  }
});

/* =====================
   Diaporama
   ===================== */
document.addEventListener("shopify:block:select", (event) => {
  const carousel = event.target.closest(".carousel");

  if (carousel) {
    bootstrap.Carousel.getOrCreateInstance(carousel, { ride: false }).to(
      event.target.dataset.index
    );
  }
});

/* =====================
   Produits recommandés
   ===================== */
const initializeProductsRecommended = async () => {
  const section = document.querySelector(".recommended-products");

  if (!section) return;

  const { sectionId, baseUrl, productId, limit, intent } = section.dataset;
  const url = `${baseUrl}?section_id=${sectionId}&product_id=${productId}&limit=${limit}&intent=${intent}`;
  const response = await fetch(url);
  const data = await response.text();

  section.closest(".shopify-section").outerHTML = data;

  document
    .querySelectorAll('.recommended-products [data-bs-toggle="popover"]')
    .forEach((el) => bootstrap.Popover.getOrCreateInstance(el));

  initializeProductsFeatured();

  const customEvent = new CustomEvent("init.shopiweb.recommended_products");
  window.dispatchEvent(customEvent);
};
initializeProductsRecommended();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".recommended-products")) {
    initializeProductsRecommended();
  }
});

/* =====================
   Produits en vedette
   ===================== */
const initializeProductsFeatured = () => {
  document
    .querySelectorAll(".featured-products:not(.init)")
    .forEach((section) => {
      section.classList.add("init");

      const element = section.querySelector(".splide");

      if (!element) {
        return;
      }

      const mySplide = new Splide(element, {
        arrows: element.dataset.arrows === "true",
        pagination: element.dataset.pagination === "true",
        easing: element.dataset.easing,
        speed: Number(element.dataset.speed),
        perMove: Number(element.dataset.perMove),
        autoplay: element.dataset.autoplay === "true",
        interval: Number(element.dataset.interval),
        per_move: Number(element.dataset.perMove),
        rewind: element.dataset.rewind === "true",
        mediaQuery: "min",
        breakpoints: {
          0: {
            perPage: Number(element.dataset.breakpointXs),
            padding:
              element.dataset.breakpointXsPartial === "true"
                ? { right: "16%" }
                : 0,
          },
          576: { perPage: Number(element.dataset.breakpointSm), padding: 0 },
          768: { perPage: Number(element.dataset.breakpointMd), padding: 0 },
          992: { perPage: Number(element.dataset.breakpointLg), padding: 0 },
          1200: { perPage: Number(element.dataset.breakpointXl), padding: 0 },
          1400: { perPage: Number(element.dataset.breakpointXxl), padding: 0 },
        },
      });

      const fixArrowsPos = () => {
        let top = section.querySelector(".product-item-img")?.clientHeight / 2;

        if (section.querySelector(".product-item .card")) {
          top = section.querySelector(".card")?.clientHeight / 2;
        }

        section.querySelectorAll(".splide__arrow").forEach((arrow) => {
          arrow.style.top = `${top}px`;
        });
      };

      const fixPagination = () => {
        if (window.matchMedia("(max-width: 575px").matches) {
          const pagination = section.querySelector(".splide__pagination");

          if (!pagination) return;

          section.querySelector(".splide__pagination--mobile")?.remove();

          const total = pagination.querySelectorAll("button").length;

          let text = element.dataset.textSlideOf.replace(
            "[x]",
            mySplide.index + 1
          );
          text = text.replace("[total]", total);

          pagination.insertAdjacentHTML(
            "beforebegin",
            `
                    <div class="splide__pagination--mobile text-muted small">
                        ${text}
                    </div>
                `
          );
        }
      };

      mySplide.on("ready resize", () => {
        fixArrowsPos();
        fixPagination();
      });

      mySplide.on("move", () => {
        fixPagination();
      });

      mySplide.mount();
    });
};
initializeProductsFeatured();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".featured-products")) {
    initializeProductsFeatured();
  }
});

/* =====================
   Récemment consultés
   ===================== */
const initializeViewedRecently = async () => {
  const localStorageKey = "shopiweb_recently_viewed_v1";

  document
    .querySelectorAll(".recently-viewed:not(.init2)")
    .forEach((section) => {
      section.classList.add("init2");

      const recentlyViewed =
        JSON.parse(localStorage.getItem(localStorageKey)) || [];

      let productListItems = "";

      recentlyViewed.forEach((product, index) => {
        if (index + 1 <= Number(section.dataset.limit)) {
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
                                    `${section.dataset.imgWidth}x${section.dataset.imgHeight}`,
                                    "center"
                                  )
                                : ""
                            }">
                            ${variant.title}
                        </option>
                    `;
          });

          productListItems += `
                    <li class="product-item splide__slide p-3 p-lg-4 mb-4">
                        <a 
                            class="product-link position-relative d-block link-dark" 
                            href="${product.url}">
                            <img 
                                class="product-item-img img-fluid mb-4 rounded ${
                                  section.dataset.imgThumbnail
                                }" 
                                src="${Shopify.resizeImage(
                                  product.featured_image || "no-image.gif",
                                  `${section.dataset.imgWidth}x${section.dataset.imgHeight}`,
                                  "center"
                                )}"
                                alt="" 
                                width="${section.dataset.imgWidth}"
                                height="${section.dataset.imgHeight}"
                                loading="lazy">
                            <h3 class="product-item-title mb-2 ${
                              section.dataset.productTitleSize
                            } ${section.dataset.productTitleTruncate}">
                                ${product.title}
                            </h3>
                        </a>
                        <div class="product-item-vendor mb-2 text-muted small text-uppercase" ${
                          section.dataset.productVendor === "true"
                            ? ""
                            : "hidden"
                        }>${product.vendor}</div>
                        <div class="shopify-product-reviews-badge" data-id="${
                          product.id
                        }"></div>
                        <p class="product-item-price mb-4">
                            <span ${
                              product.compare_at_price > product.price
                                ? ""
                                : "hidden"
                            }>
                                <span class="product-item-price-final me-1">
                                    <span class="visually-hidden">
                                        ${section.dataset.textPriceSale} &nbsp;
                                    </span>
                                    <span ${
                                      product.price_varies ? "" : "hidden"
                                    }>
                                        ${section.dataset.textPriceFrom}
                                    </span>
                                    ${Shopify.formatMoney(product.price)}
                                </span>
                                <span class="product-item-price-compare text-muted">
                                    <span class="visually-hidden">
                                        ${
                                          section.dataset.textPriceRegular
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
                                <span ${product.price_varies ? "" : "hidden"}>
                                    ${section.dataset.textPriceFrom}
                                </span>
                                ${Shopify.formatMoney(product.price)}
                            </span>
                        </p>
                        <div class="mb-2" ${
                          section.dataset.showAtcForm === "true" ? "" : "hidden"
                        }>
                            <form method="post" action="/cart/add" accept-charset="UTF-8" class="shopify-product-form" enctype="multipart/form-data" onsubmit="handleAddToCartFormSubmit(this, event)">
                                <input type="hidden" name="form_type" value="product">
                                <input type="hidden" name="utf8" value="✓">
                                <select 
                                    class="form-select w-100 mb-3" 
                                    name="id" 
                                    aria-label="${
                                      section.dataset.textSelectVariant
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
                                    class="btn-atc btn btn-md btn-primary w-100" 
                                    type="submit"
                                    name="add"
                                    data-text-add-to-cart="${
                                      section.dataset.textAddToCart
                                    }">
                                    ${section.dataset.textAddToCart}
                                </button>
                            </form>
                        </div>
                        <div class="" ${
                          section.dataset.showWishlist === "true"
                            ? ""
                            : "hidden"
                        }>
                            <button 
                                class="btn-wishlist-add-remove btn btn-sm w-100"
                                type="button"
                                data-product-handle="${product.handle}"
                                data-text-add="${
                                  section.dataset.textWishlistAdd
                                }"
                                data-text-remove="${
                                  section.dataset.textWishlistRemove
                                }"
                                aria-label="${section.dataset.textWishlistAdd}"
                                onclick="removeOrAddFromWishlist(this)">
                                <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span>${
                                  section.dataset.textWishlistBtnLabel
                                }</span>
                            </button>
                        </div>
                    </li>
                `;
        }
      });

      section.querySelector(".product-listing").innerHTML = productListItems;

      window.SPR?.initDomEls();
      window.SPR?.loadBadges();

      if (recentlyViewed.length > 0) {
        section.removeAttribute("hidden");
      }

      section.classList.remove("init");
      initializeProductsFeatured();
    });

  if (document.body.classList.contains("page-type-product")) {
    const productHandle =
      document.querySelector("#product-template").dataset.productHandle;

    const response = await fetch(`${productHandle}.js`);
    const product = await response.json();

    let recentlyViewed =
      JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const isViewed = recentlyViewed.some(
      (elem) => elem.handle === product.handle
    );

    if (isViewed) {
      recentlyViewed = recentlyViewed.filter(
        (elem) => elem.handle !== product.handle
      );
    }

    const variants = product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      compare_at_price: variant.compare_at_price,
      price: variant.price,
      featured_image: {
        src: variant.featured_image?.src || null,
      },
    }));

    recentlyViewed.unshift({
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

    if (recentlyViewed.length > 50) {
      recentlyViewed.pop();
    }

    localStorage.setItem(localStorageKey, JSON.stringify(recentlyViewed));
  }
};
initializeViewedRecently();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".recently-viewed")) {
    initializeViewedRecently();
  }
});

/* =====================
   Témoignages
   ===================== */
const initializeTestimonials = () => {
  document.querySelectorAll(".testimonials").forEach((section) => {
    const element = section.querySelector(".splide");

    const mySplide = new Splide(element, {
      type: element.dataset.loop === "true" ? "loop" : "slide",
      arrows: element.dataset.arrows === "true",
      pagination: element.dataset.pagination === "true",
      easing: element.dataset.easing,
      speed: Number(element.dataset.speed),
      perMove: Number(element.dataset.perMove),
      autoplay: element.dataset.autoplay === "true",
      interval: Number(element.dataset.interval),
      per_move: Number(element.dataset.perMove),
      rewind: element.dataset.rewind === "true",
      mediaQuery: "min",
      breakpoints: {
        0: { perPage: Number(element.dataset.breakpointXs), padding: "10%" },
        576: { perPage: Number(element.dataset.breakpointSm), padding: 0 },
        768: { perPage: Number(element.dataset.breakpointMd), padding: 0 },
        992: { perPage: Number(element.dataset.breakpointLg), padding: 0 },
        1200: { perPage: Number(element.dataset.breakpointXl), padding: 0 },
        1400: { perPage: Number(element.dataset.breakpointXxl), padding: 0 },
      },
    });

    const fixArrowsPos = () => {
      const top = section.querySelector(".card").clientHeight / 2;
      section.querySelectorAll(".splide__arrow").forEach((arrow) => {
        arrow.style.top = `${top}px`;
      });
    };

    const fixPagination = () => {
      if (window.matchMedia("(max-width: 575px").matches) {
        const pagination = section.querySelector(".splide__pagination");

        if (!pagination) return;

        section.querySelector(".splide__pagination--mobile")?.remove();

        const total = pagination.querySelectorAll("button").length;

        let text = element.dataset.textSlideOf.replace(
          "[x]",
          mySplide.index + 1
        );
        text = text.replace("[total]", total);

        pagination.insertAdjacentHTML(
          "beforebegin",
          `
                    <div class="splide__pagination--mobile text-muted small">
                        ${text}
                    </div>
                `
        );
      }
    };

    mySplide.on("ready resize", () => {
      fixArrowsPos();
      fixPagination();
    });

    mySplide.on("move", () => {
      fixPagination();
    });

    mySplide.mount();
  });
};
initializeTestimonials();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".testimonials")) {
    initializeTestimonials();
  }
});

/* =====================
   Galerie Instagram
   ===================== */
const initializeGalleryInstagram = () => {
  document
    .querySelectorAll(".instagram-gallery")
    .forEach(async (section, index) => {
      if (index === 0) {
        const splideScrollScript = document.createElement("script");
        splideScrollScript.src = section.dataset.vendorSplideScrollScript;
        document.head.appendChild(splideScrollScript);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const element = section.querySelector(".splide");

      let speed = Number(element.dataset.speed);

      if (element.dataset.direction === "right") {
        speed = -Math.abs(speed);
      }

      const mySplide = new Splide(element, {
        type: "loop",
        drag: "free",
        focus: "center",
        arrows: element.dataset.arrows === "true",
        pagination: false,
        easing: element.dataset.easing,
        gap: Number(element.dataset.gap),
        mediaQuery: "min",
        breakpoints: {
          0: { perPage: Number(element.dataset.breakpointXs), padding: 0 },
          576: { perPage: Number(element.dataset.breakpointSm), padding: 0 },
          768: { perPage: Number(element.dataset.breakpointMd), padding: 0 },
          992: { perPage: Number(element.dataset.breakpointLg), padding: 0 },
          1200: { perPage: Number(element.dataset.breakpointXl), padding: 0 },
          1400: { perPage: Number(element.dataset.breakpointXxl), padding: 0 },
        },
        autoScroll: {
          speed,
        },
      });
      mySplide.mount(window.splide.Extensions);
    });
};
initializeGalleryInstagram();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".instagram-gallery")) {
    initializeGalleryInstagram();
  }
});

/* =====================
   Slider TikTok
   ===================== */
const initializeSliderTikTok = () => {
  document.querySelectorAll(".tiktok-slider").forEach((section) => {
    const element = section.querySelector(".splide");

    const mySplide = new Splide(element, {
      arrows: element.dataset.arrows === "true",
      pagination: false,
      easing: element.dataset.easing,
      perMove: Number(element.dataset.perMove),
      autoplay: element.dataset.autoplay === "true",
      interval: Number(element.dataset.interval),
      per_move: Number(element.dataset.perMove),
      rewind: element.dataset.rewind === "true",
      gap: Number(element.dataset.gap),
      mediaQuery: "min",
      breakpoints: {
        0: { perPage: Number(element.dataset.breakpointXs), padding: "15%" },
        576: { perPage: Number(element.dataset.breakpointSm), padding: 0 },
        768: { perPage: Number(element.dataset.breakpointMd), padding: 0 },
        992: { perPage: Number(element.dataset.breakpointLg), padding: 0 },
        1200: { perPage: Number(element.dataset.breakpointXl), padding: 0 },
        1400: { perPage: Number(element.dataset.breakpointXxl), padding: 0 },
      },
    });
    mySplide.mount();

    section.querySelectorAll("video").forEach((video) => {
      const videoWrapper = video.closest(".video-wrapper");
      const soundBtn = videoWrapper.querySelector("[data-toggle-sound]");

      video.addEventListener("click", (e) => {
        section
          .querySelectorAll(`video:not([data-index="${video.dataset.index}"])`)
          .forEach((video) => {
            video.pause();
            video.closest(".video-wrapper").classList.remove("is-playing");
          });

        if (videoWrapper.classList.contains("is-playing")) {
          video.pause();
          videoWrapper.classList.remove("is-playing");
        } else {
          video.play();
          videoWrapper.classList.add("is-playing");

          if (section.dataset.volume === "on") {
            video.muted = false;
            soundBtn
              .querySelector(".icon-volume-off")
              .setAttribute("hidden", "hidden");
            soundBtn.querySelector(".icon-volume-on").removeAttribute("hidden");
          }
        }
      });

      soundBtn?.addEventListener("click", () => {
        video.muted = !video.muted;

        if (video.muted) {
          soundBtn.querySelector(".icon-volume-off").removeAttribute("hidden");
          soundBtn
            .querySelector(".icon-volume-on")
            .setAttribute("hidden", "hidden");
          section.setAttribute("data-volume", "off");
        } else {
          soundBtn
            .querySelector(".icon-volume-off")
            .setAttribute("hidden", "hidden");
          soundBtn.querySelector(".icon-volume-on").removeAttribute("hidden");
          section.setAttribute("data-volume", "on");
        }
      });
    });

    mySplide.on("moved", (newIndex, prevIndex) => {
      const video = section.querySelector(`video[data-index="${newIndex}"]`);
      const videoWrapper = video.closest(".video-wrapper");
      const soundBtn = videoWrapper.querySelector("[data-toggle-sound]");

      if (video) {
        section
          .querySelectorAll(`video:not([data-index="${newIndex}"])`)
          .forEach((video) => {
            video.muted = true;
            video.pause();
            video.closest(".video-wrapper").classList.remove("is-playing");
          });

        video.play();

        videoWrapper.classList.add("is-playing");

        if (
          section.dataset.volume === "on" &&
          !navigator.userAgent.match(/(iPad|iPhone)/g)
        ) {
          video.muted = false;
          soundBtn
            .querySelector(".icon-volume-off")
            .setAttribute("hidden", "hidden");
          soundBtn.querySelector(".icon-volume-on").removeAttribute("hidden");
        }
      }
    });
  });
};
initializeSliderTikTok();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".tiktok-slider")) {
    initializeSliderTikTok();
  }
});

/* =====================
   Image parallaxe
   ===================== */
const initializeImageParallax = () => {
  document
    .querySelectorAll(".parallax-image")
    .forEach(async (section, index) => {
      if (index === 0) {
        const vendorScript = document.createElement("script");
        vendorScript.src = section.dataset.vendorScript;
        document.head.appendChild(vendorScript);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const imgMobile = section.querySelector(".img-mobile");
      const imgDesktop = section.querySelector(".img-desktop");

      if (imgMobile) {
        new simpleParallax(imgMobile, {
          orientation: imgMobile.dataset.orientation,
          scale: Number(imgMobile.dataset.scale) / 100,
        });
      }

      if (imgDesktop) {
        new simpleParallax(imgDesktop, {
          orientation: imgDesktop.dataset.orientation,
          scale: Number(imgDesktop.dataset.scale) / 100,
        });
      }
    });
};

initializeImageParallax();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".parallax-image")) {
    initializeImageParallax();
  }
});

/* =====================
   Sticky AddToCart
   ===================== */
const initializeStickyAddToCart = async () => {
  const wrapper = document.querySelector("#sticky-atc");

  if (!wrapper) return;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const threshold =
    document
      .querySelector('.product-content form[action*="/cart/add"]')
      .getBoundingClientRect().bottom + window.scrollY;

  window.addEventListener("scroll", () => {
    if (window.scrollY > threshold) {
      wrapper.classList.add("show");
      document.body.style.paddingBottom = wrapper.clientHeight + "px";
    } else {
      wrapper.classList.remove("show");
      document.body.style.paddingBottom = 0;
    }
  });
};
initializeStickyAddToCart();

/* =====================
   Newsletter Popup
   ===================== */
const initializePopupNewsletter = async () => {
  if (Shopify.designMode) return;

  const modal = document.querySelector("#newsletter-popup-modal");
  if (!modal) return;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modal);

  if (window.location.href.includes("newsletter-popup")) {
    bsModal.show();
    return;
  }

  if (document.cookie.indexOf("shopiweb-newsletter-popup") > -1) return;

  await new Promise((resolve) =>
    setTimeout(resolve, Number(modal.dataset.delay) * 1000)
  );

  window.createNewCookie(
    "shopiweb-newsletter-popup",
    true,
    Number(modal.dataset.daysToWait)
  );

  bsModal.show();
};
initializePopupNewsletter();

document.addEventListener("shopify:section:select", (e) => {
  if (e.target.querySelector("#newsletter-popup-modal")) {
    const bsModal = bootstrap.Modal.getOrCreateInstance(
      "#newsletter-popup-modal"
    );
    bsModal.hide();
    bsModal.show();
  }
});

/* =====================
   Comparaison d'images
   ===================== */
const initializeCompareImage = () => {
  document.onreadystatechange = () => {
    if (document.readyState === "complete") {
      document.querySelectorAll(".image-compare-slider").forEach((slider) => {
        new ImageCompare(slider, {
          controlColor: slider.dataset.controlColor,
          controlShadow: true,
          addCircle: slider.dataset.addCircle === "true",
          addCircleBlur: false,
          showLabels: slider.dataset.showLabels === "true",
          labelOptions: {
            before: slider.dataset.labelBefore,
            after: slider.dataset.labelAfter,
            onHover: slider.dataset.labelOnHover === "true",
          },
          smoothing: slider.dataset.smoothing === "true",
          smoothingAmount: Number(slider.dataset.smoothingAmount),
          hoverStart: slider.dataset.hoverStart === "true",
          verticalMode: slider.dataset.verticalMode === "true",
          startingPoint: Number(slider.dataset.startingPoint),
          fluidMode: false,
        }).mount();
      });
    }
  };
};
initializeCompareImage();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".image-compare-slider")) {
    initializeCompareImage();
  }
});

/* =====================
   Stories animées
   ===================== */
const initializeStoriesAnimated = () => {
  const localStorageKeyMain = "shopiweb_animated_stories";
  const localStorageKeyTime = "shopiweb_animated_stories_time";

  document.querySelectorAll(".animated-stories-link").forEach((link) => {
    let storiesRead =
      JSON.parse(localStorage.getItem(localStorageKeyMain)) || [];

    if (
      new Date().getTime() >
      Number(localStorage.getItem(localStorageKeyTime)) + 8.64e7
    ) {
      storiesRead = [];
    }

    const storyIsRead = storiesRead.some(
      (elem) => elem === link.getAttribute("href")
    );

    if (storyIsRead) {
      link.classList.add("story-is-read");
    }

    link.addEventListener("click", (e) => {
      if (!storyIsRead) {
        storiesRead.push(link.getAttribute("href"));
      }

      localStorage.setItem(localStorageKeyMain, JSON.stringify(storiesRead));
      localStorage.setItem(localStorageKeyTime, new Date().getTime());
    });
  });
};
initializeStoriesAnimated();

/* =====================
   Quiz générateur
   ===================== */
const initializeQuiz = () => {
  document.querySelectorAll("section.quiz").forEach((quiz) => {
    const quizHeader = quiz.querySelector(".quiz-header");
    const quizItems = quiz.querySelector(".quiz-items");
    const prevBtn = quiz.querySelector(".btn-quiz-prev");
    const progressBar = quiz.querySelector(".progress-bar");
    const progressBarText = quiz.querySelector(".progress-bar-text");
    const results = quiz.querySelector(".quiz-results");

    const selectedValues = [];

    progressBar.style.width = 100 / Number(progressBar.dataset.total) + "%";

    quizItems.querySelectorAll(".btn-quiz-value").forEach((btn) => {
      btn.addEventListener("click", () => {
        const block = btn.closest("[data-question");

        quiz.querySelectorAll(".quiz-items .btn-quiz-value").forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-current", "false");
        });

        btn.classList.add("active");
        btn.setAttribute("aria-current", "step");

        setTimeout(() => {
          block.setAttribute("hidden", "hidden");
          block.nextElementSibling?.removeAttribute("hidden");
          block.nextElementSibling?.querySelector(".title").focus();

          prevBtn.removeAttribute("hidden");
          progressBar.style.width =
            ((Number(block.dataset.question) + 1) /
              Number(progressBar.dataset.total)) *
              100 +
            "%";
          progressBarText.querySelector("span").textContent =
            Number(block.dataset.question) + 1;

          selectedValues.push(btn.dataset.value);

          if (
            Number(block.dataset.question) === Number(progressBar.dataset.total)
          ) {
            quizHeader.remove();
            quizItems.remove();
            progressBar.closest(".progress").remove();
            progressBarText.remove();
            prevBtn.remove();

            results.removeAttribute("hidden");

            console.log(selectedValues);

            results
              .querySelectorAll(".product-listing")
              .forEach((prouductList) => {
                let listValues = prouductList.dataset.values.split(",");
                listValues = listValues.map((e) => String(e).trim());

                console.log(listValues);
                console.log(selectedValues);

                if (selectedValues.every((item) => listValues.includes(item))) {
                  prouductList.removeAttribute("hidden");
                }
              });
          }
        }, 500);
      });
    });

    quiz.querySelector(".btn-quiz-prev").addEventListener("click", () => {
      const currentBlock = quiz.querySelector("[data-question]:not([hidden]");

      currentBlock.setAttribute("hidden", "hidden");
      currentBlock.previousElementSibling.removeAttribute("hidden");

      if (Number(currentBlock.dataset.question) === 2) {
        prevBtn.setAttribute("hidden", "hidden");
      }

      progressBar.style.width =
        ((Number(currentBlock.dataset.question) - 2) /
          Number(progressBar.dataset.total)) *
          100 +
        "%";
      progressBarText.querySelector("span").textContent =
        Number(currentBlock.dataset.question) - 1;

      selectedValues.pop();
    });
  });
};
initializeQuiz();

/* =====================
   Compteurs animés (Cercle)
   ===================== */
// Animation des cercles, avec ajustement pour commencer l'animation seulement quand visible
const initializeCircleAnimations = () => {
  const circleElements = document.querySelectorAll(".animated-counter-circle");

  const circleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          if (circle.getAttribute("data-animated") !== "true") {
            const progressEnd = parseInt(circle.getAttribute("data-value"), 10);
            const speed =
              parseInt(circle.getAttribute("data-speed"), 10) * 1000;
            // Appel à updateCircle pour chaque cercle
            updateCircle(circle, speed, progressEnd);
          }
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -200px 0px" }
  );

  circleElements.forEach((circle) => {
    circleObserver.observe(circle);
  });
};

/* =====================
   Compteurs animés
   ===================== */
// Initialisation des compteurs animés
const initializeCountersAnimated = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target
            .querySelectorAll(".animated-counter")
            .forEach((counter) => {
              if (counter.getAttribute("data-animated") !== "true") {
                const speed = Number(counter.dataset.speed) * 1000;
                const value = +counter.dataset.value;
                // Appel à counterAnimate pour chaque compteur
                counterAnimate(counter, speed, value);
              }
            });
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -200px 0px" }
  );

  document.querySelectorAll(".animated-counters").forEach((el) => {
    observer.observe(el);
  });
};

// Fonction pour animer les compteurs
const counterAnimate = (counter, speed, value) => {
  let currentValue = 0;
  const incrementPerStep = value / (speed / 10);

  const update = () => {
    if (currentValue < value) {
      currentValue += incrementPerStep;
      counter.querySelector("em").textContent = Math.ceil(currentValue);
      setTimeout(update, 10);
    } else {
      counter.querySelector("em").textContent = value.toString();
      counter.setAttribute("data-animated", "false");
    }
  };
  update();
};

// Fonction pour animer les cercles
const updateCircle = (circle, speed, progressEnd) => {
  let progressCurrent = 0;
  // Ajustement : Assurez-vous que le cercle s'arrête à la bonne valeur
  // Le calcul pour 'incrementPerStep' doit refléter la progression en fonction de la valeur maximale (100) par rapport à la durée.
  const incrementPerStep = 100 / (speed / 10); // 100 représente le pourcentage complet

  const update = () => {
    if (progressCurrent < progressEnd) {
      progressCurrent += (incrementPerStep * progressEnd) / 100; // Ajustez cette ligne
      if (progressCurrent > progressEnd) progressCurrent = progressEnd; // Assure que la valeur ne dépasse pas la valeur cible
      circle.style.background = `conic-gradient(${
        circle.dataset.circleActiveColor
      } ${3.6 * progressCurrent}deg, ${
        circle.dataset.circleInactiveColor
      } 0deg)`;
      if (progressCurrent < progressEnd) {
        // Continuer l'animation seulement si le progress n'a pas atteint la fin
        setTimeout(update, 10);
      } else {
        circle.setAttribute("data-animated", "false"); // Marque l'animation comme terminée
      }
    }
  };
  update();
};

// Initialisation des animations au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  initializeCountersAnimated();
  initializeCircleAnimations();
});

// Écouter les événements Shopify pour réinitialiser les animations si nécessaire
document.addEventListener("shopify:section:load", () => {
  initializeCountersAnimated();
  initializeCircleAnimations();
});

/* =====================
   Image Texte Compteurs
   ===================== */
const imageTextCounters = (element, targetPercentage, callback) => {
    if(!element) return;
    let currentPercentage = 0;
    const duration = 2000;
    const stepTime = duration / targetPercentage;

    const interval = setInterval(() => {
        currentPercentage++;
        element.style.setProperty('--percentage', `${currentPercentage}%`);
        element.querySelector('.progress-value').textContent = `${currentPercentage}%`;

        if (currentPercentage >= targetPercentage) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, stepTime);
}

const initializeImageTextCountersAnimated = () => {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressElement = entry.target;
                const targetPercentage = progressElement.getAttribute('data-percentage');
                imageTextCounters(progressElement, targetPercentage, () => {
                    observer.unobserve(entry.target);
                });
            }
        });
    }, { threshold: 0.30 });

    document.querySelectorAll('.progress-circle').forEach((el) => {
        observer.observe(el);
    });
}

initializeImageTextCountersAnimated();

/* =====================
   Texte défilant
   ===================== */
const initializeSectionsScrolling = () => {
  document.querySelectorAll(".scrolling").forEach((section) => {
    const list = section.querySelector("ul");
    const scrollingWidth = list.scrollWidth;
    const scrollingLength = list.querySelectorAll("li").length;

    list.insertAdjacentHTML("beforeEnd", list.innerHTML);
    list.insertAdjacentHTML("beforeEnd", list.innerHTML);

    list.querySelectorAll("li").forEach((item, index) => {
      if (index >= scrollingLength) {
        item.setAttribute("aria-hidden", "true");
      }
    });

    let translateX = `-${scrollingWidth}`;

    if (document.documentElement.getAttribute("dir") === "rtl") {
      translateX = `${scrollingWidth}`;
    }

    let style = `
            <style>
                #scrolling-${list.dataset.sectionId} ul {
                    animation-name: scrolling-animation-${list.dataset.sectionId};
                    animation-duration: ${list.dataset.animationDuration}s;
                }
                @keyframes scrolling-animation-${list.dataset.sectionId} {
                    to { transform: translateX(${translateX}px); }
                }
            </style>
        `;
    if (list.dataset.scrollingDirection === "right") {
      style += `
                <style>
                    @keyframes scrolling-animation-${list.dataset.sectionId} {
                        from { transform: translateX(${translateX}px); }    
                        to { transform: 0; }    
                    }
                </style>
            `;
    }

    list.insertAdjacentHTML("beforeBegin", style);
  });
};
initializeSectionsScrolling();

document.addEventListener("shopify:section:load", (e) => {
  if (e.target.querySelector(".scrolling")) {
    initializeSectionsScrolling();
  }
});

/* =====================
   Sticky vidéo
   ===================== */
const initializeStickyVideo = () => {
  if (Shopify.designMode) return;

  document.querySelectorAll(".sticky-video").forEach((section) => {
    const delay = window.localStorage.getItem("shopiweb-sticky-video-delay");

    let show = false;

    if (delay) {
      if (Date.now() >= delay) {
        show = true;
      }
    } else {
      show = true;
    }

    if (show) {
      setTimeout(() => {
        section.classList.add("show");
      }, Number(section.dataset.showAfter) * 1000);
    }

    const closeBtn = section.querySelector(".btn-close-custom");
    const video = section.querySelector("video"); // Obtenir la référence à l'élément vidéo

    closeBtn.addEventListener("click", () => {
      section.classList.remove("show");

      if (video) {
        video.pause(); 
      }

      const closingDelayInHours = Number(section.dataset.closingDelay);
      window.localStorage.setItem(
        "shopiweb-sticky-video-delay",
        Date.now() + closingDelayInHours * 3600000
      );
    });
  });
};
initializeStickyVideo();

document.addEventListener("shopify:section:select", (e) => {
  if (e.target.querySelector(".sticky-video")) {
    document.querySelector(".sticky-video").classList.add("show");
  } else {
    document.querySelector(".sticky-video").classList.remove("show");
  }
});

/* =====================
   Barre de réduction
   ===================== */
const initializeBarsDiscount = async () => {
  const discountBars = document.querySelectorAll(".discount-bar");
  discountBars.forEach((bar) => {
    const copyCodeBtn = bar.querySelector(".copyCodeBtn"); // Changé en classe
    if (!copyCodeBtn) return;
    const copyDiscountText = bar.querySelector(".copyDiscountText"); // Changé en classe
    const copiedCodeCheckMark = bar.querySelector(".copiedCodeCheckMark"); // Changé en classe
    const copyCodeIcon = bar.querySelector(".copyCodeIcon"); // Changé en classe
    const discountCode = copyCodeBtn.dataset.discountCode;
    copyCodeBtn.addEventListener("click", function () {
      navigator.clipboard
        .writeText(discountCode)
        .then(() => {
          copyDiscountText.textContent = "Copié !";
          copiedCodeCheckMark.classList.remove("d-none");
          copyCodeIcon.classList.add("d-none");

          setTimeout(() => {
            copyDiscountText.textContent = discountCode;
            copiedCodeCheckMark.classList.add("d-none");
            copyCodeIcon.classList.remove("d-none");
          }, 1500);
        })
        .catch((err) => {
          console.error("Error copying text: ", err);
        });
    });
  });
};
initializeBarsDiscount();

/* =====================
   Collage Dynamique
   ===================== */
document.addEventListener("DOMContentLoaded", function () {
  if (window.collageDynamiqueSectionId) {
    var gridSelector =
      "#collage-dynamique-" + window.collageDynamiqueSectionId + " .row";
    var grid = document.querySelector(gridSelector);
    if (grid) {
      var imgs = grid.querySelectorAll('img[loading="lazy"]');
      var loadedImages = 0;

      imgs.forEach((img) => {
        img.addEventListener("load", function () {
          loadedImages++;
          if (loadedImages === imgs.length) {
            new Masonry(grid, {
              itemSelector: ".col-sm-6.col-lg-4",
              percentPosition: true,
            });
          }
        });
        if (img.complete) {
          img.dispatchEvent(new Event("load"));
        }
      });
    } else {
      console.error("Grid not found for selector:", gridSelector);
    }
  }
});

/* =====================
   FAQ
   ===================== */
document.addEventListener("shopify:block:select", (event) => {
  if (!event.target.closest(".faq")) return;

  const collapse = event.target.querySelector(".accordion-collapse");

  if (collapse) {
    bootstrap.Collapse.getOrCreateInstance(collapse).show();
  }
});
