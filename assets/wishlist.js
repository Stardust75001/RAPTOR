/* 
 * WISHLIST FIX - CORRECTION DÉFINITIVE
 * Correction du problème "Your wishlist is empty" pour RAPTOR
 * Replace la fonction initializeWishlist défaillante
 */

(function() {
  'use strict';

  const STORAGE_KEY = "shopiweb_wishlist_v1";
  
  // 🔧 FONCTION CORRECTE POUR INITIALISER LA WISHLIST
  function fixedInitializeWishlist() {
    console.log('🔧 Fixed wishlist initialization starting...');
    
    let wishlist = [];
    
    // Récupération sécurisée des données
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        wishlist = JSON.parse(rawData);
        if (!Array.isArray(wishlist)) {
          console.warn('⚠️ Wishlist data is not an array, resetting...');
          wishlist = [];
        }
      }
    } catch (error) {
      console.error('❌ Error parsing wishlist data:', error);
      wishlist = [];
      // Nettoyer les données corrompues
      localStorage.removeItem(STORAGE_KEY);
    }
    
    console.log('📊 Wishlist contains', wishlist.length, 'items');
    
    // 1. Mise à jour des boutons add/remove
    updateWishlistButtons(wishlist);
    
    // 2. Mise à jour des badges de comptage
    updateWishlistBadges(wishlist);
    
    // 3. Mise à jour de l'affichage offcanvas
    updateOffcanvasDisplay(wishlist);
  }
  
  // 🔘 MISE À JOUR DES BOUTONS ADD/REMOVE
  function updateWishlistButtons(wishlist) {
    document.querySelectorAll(".btn-wishlist-add-remove").forEach((btn) => {
      const productHandle = btn.dataset.productHandle;
      if (!productHandle) return;
      
      const isWishlisted = wishlist.some(item => item.handle === productHandle);
      const svg = btn.querySelector("svg");
      
      if (isWishlisted) {
        if (svg) svg.setAttribute("fill", "currentColor");
        btn.setAttribute("aria-label", btn.dataset.textRemove || "Remove from wishlist");
        btn.classList.add("is-wishlisted");
      } else {
        if (svg) svg.setAttribute("fill", "none");
        btn.setAttribute("aria-label", btn.dataset.textAdd || "Add to wishlist");
        btn.classList.remove("is-wishlisted");
      }
    });
  }
  
  // 🏷️ MISE À JOUR DES BADGES DE COMPTAGE
  function updateWishlistBadges(wishlist) {
    document.querySelectorAll(".wishlist-count-badge").forEach((badge) => {
      if (wishlist.length === 0) {
        badge.setAttribute("hidden", "hidden");
        badge.style.display = "none";
      } else {
        badge.removeAttribute("hidden");
        badge.style.display = "inline-block";
        badge.textContent = wishlist.length;
      }
    });
  }
  
  // 🗂️ MISE À JOUR DE L'AFFICHAGE OFFCANVAS
  function updateOffcanvasDisplay(wishlist) {
    const emptyElement = document.querySelector("#offcanvas-wishlist-empty");
    const listingElement = document.querySelector("#offcanvas-wishlist-product-listing");
    
    if (!emptyElement || !listingElement) {
      console.warn('⚠️ Wishlist DOM elements not found');
      return;
    }
    
    if (wishlist.length === 0) {
      // Afficher le message vide
      showEmptyWishlist(emptyElement, listingElement);
    } else {
      // Afficher les produits
      showWishlistProducts(wishlist, emptyElement, listingElement);
    }
  }
  
  // 📭 AFFICHER WISHLIST VIDE
  function showEmptyWishlist(emptyElement, listingElement) {
    console.log('📭 Showing empty wishlist message');
    
    // Afficher le message vide
    emptyElement.removeAttribute("hidden");
    emptyElement.style.display = "block";
    
    // Cacher la liste des produits
    listingElement.setAttribute("hidden", "hidden");
    listingElement.style.display = "none";
    listingElement.innerHTML = "";
  }
  
  // 📦 AFFICHER LES PRODUITS DE LA WISHLIST
  function showWishlistProducts(wishlist, emptyElement, listingElement) {
    console.log('📦 Showing wishlist products:', wishlist.length, 'items');
    
    // Cacher le message vide
    emptyElement.setAttribute("hidden", "hidden");
    emptyElement.style.display = "none";
    
    // Afficher la liste des produits
    listingElement.removeAttribute("hidden");
    listingElement.style.display = "block";
    
    // Générer le HTML des produits
    generateProductListHTML(wishlist, listingElement);
  }
  
  // 🏗️ GÉNÉRER LE HTML DES PRODUITS
  function generateProductListHTML(wishlist, listingElement) {
    const imgWidth = listingElement.dataset.imgWidth || '300';
    const imgHeight = listingElement.dataset.imgHeight || '300';
    const imgThumbnail = listingElement.dataset.imgThumbnail || '';
    const showAtcForm = listingElement.dataset.showAtcForm === 'true';
    
    let productListItems = "";
    
    wishlist.forEach((product) => {
      // Validation des données produit
      if (!product.handle || !product.title) {
        console.warn('⚠️ Invalid product data:', product);
        return;
      }
      
      // Génération des options de variants
      let variantOptions = "";
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          const comparePrice = variant.compare_at_price || "";
          const price = variant.price || 0;
          const variantImage = variant.featured_image?.src ? 
            `${variant.featured_image.src}` : "";
          
          variantOptions += `
            <option 
                value="${variant.id}"
                data-compare-at-price="${comparePrice}"
                data-price="${price}"
                data-variant-image="${variantImage}">
                ${variant.title || 'Default'}
            </option>
          `;
        });
      }
      
      // Image du produit avec fallback
      const productImage = product.featured_image || "/assets/no-image.gif";
      const productUrl = product.url || `/products/${product.handle}`;
      const productPrice = product.price || 0;
      const productComparePrice = product.compare_at_price || 0;
      
      productListItems += `
        <li class="product-item py-3">
            <div class="row align-items-center mx-n3">
                <div class="col-4 px-3">
                    <a href="${productUrl}" tabindex="-1">
                        <img 
                            class="product-item-img img-fluid rounded ${imgThumbnail}" 
                            src="${productImage}"
                            alt="${product.title}" 
                            width="${imgWidth}"
                            height="${imgHeight}"
                            loading="lazy">
                    </a>
                </div>
                <div class="col-8 px-3">
                    <h3 class="product-item-title h6 mb-0">
                        <a href="${productUrl}" class="link-dark">
                            ${product.title}
                        </a>
                    </h3>
                    <div class="stp-star mb-3" data-id="${product.id}"></div>
                    <p class="product-item-price small mb-3">
                        ${generatePriceHTML(productPrice, productComparePrice, product.price_varies)}
                    </p>
                    ${showAtcForm ? generateAtcFormHTML(product, variantOptions) : ''}
                    <button 
                        class="btn-remove btn btn-sm btn-outline-danger"
                        data-product-handle="${product.handle}"
                        onclick="handleWishlistItemRemoval(this)"
                        aria-label="Remove from wishlist">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Remove
                    </button>
                </div>
            </div>
        </li>
      `;
    });
    
    listingElement.innerHTML = productListItems;
    
    // Initialiser les évaluations si disponible
    if (window.SPR) {
      window.SPR.initDomEls();
      window.SPR.loadBadges();
    }
    
    // Ajouter les événements aux boutons ATC
    addAtcButtonEvents();
  }
  
  // 💰 GÉNÉRER LE HTML DU PRIX
  function generatePriceHTML(price, comparePrice, priceVaries) {
    const formatMoney = window.Shopify?.formatMoney || ((price) => `€${(price / 100).toFixed(2)}`);
    
    if (comparePrice && comparePrice > price) {
      return `
        <span class="product-item-price-final me-1">
            ${priceVaries ? 'From ' : ''}${formatMoney(price)}
        </span>
        <span class="product-item-price-compare text-muted">
            <s>${formatMoney(comparePrice)}</s>
        </span>
      `;
    } else {
      return `
        <span class="product-item-price-final">
            ${priceVaries ? 'From ' : ''}${formatMoney(price)}
        </span>
      `;
    }
  }
  
  // 🛒 GÉNÉRER LE FORMULAIRE ADD TO CART
  function generateAtcFormHTML(product, variantOptions) {
    const hasMultipleVariants = product.variants && product.variants.length > 1;
    
    return `
      <div class="form-wrapper mb-2">
          <form method="post" action="/cart/add" accept-charset="UTF-8" class="shopify-product-form" enctype="multipart/form-data">
              <input type="hidden" name="form_type" value="product">
              <input type="hidden" name="utf8" value="✓">
              <div class="d-flex gap-2">
                  <select 
                      class="form-select form-select-sm flex-grow-1" 
                      name="id" 
                      ${hasMultipleVariants ? '' : 'style="display:none"'}
                      aria-label="Select variant">
                      ${variantOptions}
                  </select>
                  <button
                      class="btn-atc btn btn-sm btn-primary flex-shrink-0"
                      data-product-handle="${product.handle}"
                      type="submit"
                      name="add">
                      Add to Cart
                  </button>
              </div>
          </form>
      </div>
    `;
  }
  
  // 🔗 AJOUTER LES ÉVÉNEMENTS AUX BOUTONS ATC
  function addAtcButtonEvents() {
    document.querySelectorAll("#offcanvas-wishlist .btn-atc").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        
        const form = btn.closest('form');
        if (form) {
          // Utiliser la fonction handleAddToCartFormSubmit si disponible
          if (typeof window.handleAddToCartFormSubmit === 'function') {
            window.handleAddToCartFormSubmit(form, e);
          } else {
            // Fallback simple
            form.submit();
          }
          
          // Fermer l'offcanvas après un délai
          setTimeout(() => {
            if (typeof bootstrap !== 'undefined') {
              const offcanvas = bootstrap.Offcanvas.getInstance("#offcanvas-wishlist");
              if (offcanvas) offcanvas.hide();
            }
          }, 300);
        }
      });
    });
  }
  
  // 🚀 INITIALISATION ET REMPLACEMENT
  function initializeWishlistFix() {
    console.log('🚀 Initializing wishlist fix...');
    
    // Remplacer la fonction originale
    if (typeof window.initializeWishlist === 'function') {
      window.initializeWishlist = fixedInitializeWishlist;
      console.log('✅ Original initializeWishlist function replaced');
    } else {
      window.initializeWishlist = fixedInitializeWishlist;
      console.log('✅ initializeWishlist function created');
    }
    
    // Lancer immédiatement
    setTimeout(fixedInitializeWishlist, 100);
    
    // Écouter les événements de mise à jour
    window.addEventListener("updated.shopiweb.cart", fixedInitializeWishlist);
    window.addEventListener("onCollectionShopiwebUpdate", fixedInitializeWishlist);
    window.addEventListener("init.shopiweb.recommended_products", fixedInitializeWishlist);
    
    // Surveiller les changements localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        console.log('🔄 Wishlist storage updated, refreshing...');
        setTimeout(fixedInitializeWishlist, 100);
      }
    });
    
    console.log('✅ Wishlist fix initialized successfully');
  }
  
  // 📡 LANCEMENT AUTOMATIQUE
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWishlistFix);
  } else {
    initializeWishlistFix();
  }
  
  // 🎯 EXPOSITION GLOBALE POUR DEBUG
  window.WishlistFix = {
    initialize: fixedInitializeWishlist,
    updateButtons: updateWishlistButtons,
    updateBadges: updateWishlistBadges,
    updateDisplay: updateOffcanvasDisplay
  };
  
})();
