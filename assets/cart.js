/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Actualiser le contenu du panier
   ===================== */
window.updateCartContents = async (response) => {
  try {
    const offcanvasCart = document.querySelector("#offcanvas-cart");
    const cartPage = document.querySelector("#cart");

    offcanvasCart?.classList.add("loading");
    cartPage?.classList.add("loading");

    const newResponse = await fetch(window.location.href);
    const text = await newResponse.text();
    const newDocument = new DOMParser().parseFromString(text, "text/html");

    offcanvasCart?.querySelector(".offcanvas-body")?.replaceWith(
      newDocument.querySelector("#offcanvas-cart .offcanvas-body")
    );
    offcanvasCart?.querySelector(".offcanvas-footer")?.replaceWith(
      newDocument.querySelector("#offcanvas-cart .offcanvas-footer")
    );
    cartPage?.replaceWith(newDocument.querySelector("#cart"));

    document.querySelectorAll(".cart-count-badge").forEach((badge) => {
      badge.textContent = newDocument.querySelector(".cart-count-badge")?.textContent || "0";
      badge.removeAttribute("hidden");
    });

    offcanvasCart?.classList.remove("loading");
    cartPage?.classList.remove("loading");

    window.dispatchEvent(new Event("updated.shopiweb.cart"));

    if (response.ok) {
      const data = await response.json();
      if (response.url.includes("add.js")) {
        offcanvasCart?.querySelector("#offcanvas-cart-alert-add")?.removeAttribute("hidden");
        if (data.items?.length > 1) {
          const elem = offcanvasCart?.querySelector("[data-alert-items-added]");
          elem.textContent = elem.textContent.replace("[count]", data.items.length);
          elem.removeAttribute("hidden");
        } else {
          offcanvasCart?.querySelector("[data-alert-item-added]")?.removeAttribute("hidden");
        }
      } else {
        offcanvasCart?.querySelector("#offcanvas-cart-alert-updated")?.removeAttribute("hidden");
      }
    } else {
      const data = await response.json();
      const alert = document.querySelector("#offcanvas-cart-alert-error");
      alert.querySelector("span").textContent = `${data.message} - ${data.description}`;
      alert.removeAttribute("hidden");
    }

    if (offcanvasCart?.querySelector("#offcanvas-cart-empty")) {
      setTimeout(() => bootstrap.Offcanvas.getOrCreateInstance(offcanvasCart).hide(), 1000);
    }

    if (offcanvasCart?.querySelector("#cart-shipping-rates")) {
      new Shopify.CountryProvinceSelector("shipping-rates-modal-country", "shipping-rates-modal-province", {
        hideElement: "shipping-rates-modal-province-wrapper",
      });
    }
  } catch (error) {
    console.error("Erreur updateCartContents:", error);
  }
};

window.handleCartNoteSave = async (btn) => {
  btn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status" style="width: 1rem; height: 1rem"><span class="visually-hidden">Loading...</span></div>`;
  const note = btn.closest("#cart-note").querySelector('[name="note"]').value;
  await fetch("/cart/update.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  btn.innerHTML = `✓ <span class="visually-hidden">${btn.dataset.textNoteSaved}</span>`;
  setTimeout(() => { btn.innerHTML = btn.dataset.textBtnSave; }, 4000);
};

window.handleCartItemRemoval = async (btn) => {
  const response = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: btn.dataset.lineItemKey, quantity: 0 }),
  });
  window.updateCartContents(response);
};

window.handleCartQuantityChange = async (input) => {
  const response = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: input.dataset.lineItemKey, quantity: input.value }),
  });
  window.updateCartContents(response);
};

const initializeCartGoal = () => {
  const progressBar = document.querySelector("#cart-goal .progress-bar");
  if (progressBar) setTimeout(() => { progressBar.style.width = progressBar.dataset.width; }, 250);
};
initializeCartGoal();
window.addEventListener("updated.shopiweb.cart", initializeCartGoal);

const initializeCartGoalFreeProduct = async () => {
  const cartGoal = document.querySelector("#cart-goal");
  if (!cartGoal || !cartGoal.dataset.goalCompleted || !cartGoal.dataset.freeProductHandle) return;

  const goalCompleted = cartGoal.dataset.goalCompleted === 'true';
  const handle = cartGoal.dataset.freeProductHandle;
  let isAlreadyInCart = [...document.querySelectorAll('[data-cart-line-item]')].some(e => e.dataset.productHandle === handle);

  if (goalCompleted && !isAlreadyInCart) {
    const variantId = Number(cartGoal.dataset.freeProductVariantId);
    const response = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
    });
    window.updateCartContents(response);
  }
};
window.addEventListener("updated.shopiweb.cart", initializeCartGoalFreeProduct);

window.handleCheckoutButtonClick = (btn) => {
  btn.style.height = `${btn.clientHeight}px`;
  btn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status" style="width: 1.2rem; height: 1.2rem"><span class="visually-hidden">Loading...</span></div>`;
};

window.fetchShippingRates = async (btn) => {
  const modal = document.querySelector("#shipping-rates-modal");
  btn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status" style="width: 1rem; height: 1rem"><span class="visually-hidden">Loading...</span></div>`;

  ["danger", "warning", "success"].forEach(type => {
    modal.querySelector(`#shipping-rates-modal-alert-${type}`).innerHTML = "";
    modal.querySelector(`#shipping-rates-modal-alert-${type}`).setAttribute("hidden", "hidden");
  });

  const country = modal.querySelector("#shipping-rates-modal-country").value;
  const province = modal.querySelector("#shipping-rates-modal-province").value;
  const zip = modal.querySelector("#shipping-rates-modal-zip").value;

  try {
    const prepare = await fetch(`/cart/prepare_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`, { method: "POST" });
    if (!prepare.ok) throw await prepare.json();

    const asyncRes = await fetch(`/cart/async_shipping_rates.json?shipping_address[zip]=${zip}&shipping_address[country]=${country}&shipping_address[province]=${province}`);
    const data = await asyncRes.json();

    if (data.shipping_rates.length) {
      const list = data.shipping_rates.map(rate => `<li><strong>${rate.presentment_name}</strong>: ${rate.price} ${rate.currency}</li>`).join("");
      modal.querySelector("#shipping-rates-modal-alert-success").innerHTML = `<ul class="ps-5 mb-0">${list}</ul>`;
      modal.querySelector("#shipping-rates-modal-alert-success").removeAttribute("hidden");
    } else {
      modal.querySelector("#shipping-rates-modal-alert-warning").innerHTML = `<p class="mb-0">${modal.dataset.textNoResults}</p>`;
      modal.querySelector("#shipping-rates-modal-alert-warning").removeAttribute("hidden");
    }
  } catch (err) {
    const list = Object.entries(err).map(([k, v]) => `<li><strong>${k}</strong>: ${v}</li>`).join("");
    modal.querySelector("#shipping-rates-modal-alert-danger").innerHTML = `<ul class="ps-5 mb-0">${list}</ul>`;
    modal.querySelector("#shipping-rates-modal-alert-danger").removeAttribute("hidden");
  }
  btn.innerHTML = btn.dataset.text;
};

const initializeStickySummaryCard = () => {
  const card = document.querySelector("#cart-summary");
  if (!card || window.matchMedia("max-width: 991px").matches) return;
  const navbar = document.querySelector('[id*="__navbar"].sticky-top')?.clientHeight || 0;
  const announcement = document.querySelector('[id*="__announcement-bar"].sticky-top')?.clientHeight || 0;
  card.style.position = "sticky";
  card.style.top = `${navbar + announcement + 20}px`;
};
initializeStickySummaryCard();
window.addEventListener("updated.shopiweb.cart", initializeStickySummaryCard);

const fixOffcanvasScrolling = () => {
  document.querySelectorAll('#offcanvas-cart [data-bs-toggle="collapse"]').forEach(elem => {
    elem.addEventListener("click", () => {
      setTimeout(() => {
        const body = document.querySelector("#offcanvas-cart .offcanvas-body");
        body.scroll({ top: body.scrollHeight, behavior: "smooth" });
      }, 250);
    });
  });
};
fixOffcanvasScrolling();
window.addEventListener("updated.shopiweb.cart", fixOffcanvasScrolling);

const initializeShippingProtection = async () => {
  const enabled = document.querySelector('[data-shipping-protection-enabled="true"]');
  const autoInit = document.querySelector('[data-shipping-protection-auto-initialize="true"]');
  if (!enabled || !autoInit) return;

  if (!localStorage.getItem("shopiweb-shipping-protection-initialize")) {
    const variantId = Number(document.querySelector("[data-shipping-protection-variant-id]").dataset.shippingProtectionVariantId);
    const response = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
    });
    window.updateCartContents(response);
    localStorage.setItem("shopiweb-shipping-protection-initialize", true);
  }
};
window.addEventListener("updated.shopiweb.cart", initializeShippingProtection);

window.onChangeCartShippingProtection = async (input) => {
  const isAdd = input.checked;
  const payload = isAdd
    ? { items: [{ quantity: 1, id: Number(input.value) }] }
    : { id: input.dataset.lineItemKey, quantity: 0 };
  const url = isAdd ? "/cart/add.js" : "/cart/change.js";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  window.updateCartContents(response);
};