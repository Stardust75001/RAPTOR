/* 
 * WISHLIST DEBUG & FIX - RAPTOR THEME
 * Correction du problème "Your wishlist is empty" 
 * Diagnostic et solutions pour localStorage et initialisation
 */

(function() {
  'use strict';

  const STORAGE_KEY = "shopiweb_wishlist_v1";
  
  // 🔍 DIAGNOSTIC COMPLET
  function diagnosticWishlist() {
    console.log('🔍 === DIAGNOSTIC WISHLIST ===');
    
    // Vérifier localStorage
    const rawWishlist = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Raw localStorage data:', rawWishlist);
    
    let parsedWishlist;
    try {
      parsedWishlist = JSON.parse(rawWishlist) || [];
      console.log('📋 Parsed wishlist:', parsedWishlist);
      console.log('📊 Wishlist length:', parsedWishlist.length);
    } catch (error) {
      console.error('❌ Parse error:', error);
      parsedWishlist = [];
    }
    
    // Vérifier les éléments DOM
    const emptyElement = document.querySelector("#offcanvas-wishlist-empty");
    const listingElement = document.querySelector("#offcanvas-wishlist-product-listing");
    const badgeElements = document.querySelectorAll(".wishlist-count-badge");
    
    console.log('🎯 DOM Elements:');
    console.log('- Empty message element:', emptyElement);
    console.log('- Product listing element:', listingElement);
    console.log('- Badge elements count:', badgeElements.length);
    
    if (emptyElement) {
      console.log('- Empty element hidden:', emptyElement.hasAttribute('hidden'));
      console.log('- Empty element style.display:', emptyElement.style.display);
    }
    
    if (listingElement) {
      console.log('- Listing element hidden:', listingElement.hasAttribute('hidden'));
      console.log('- Listing element style.display:', listingElement.style.display);
      console.log('- Listing element innerHTML length:', listingElement.innerHTML.length);
    }
    
    badgeElements.forEach((badge, index) => {
      console.log(`- Badge ${index + 1} hidden:`, badge.hasAttribute('hidden'));
      console.log(`- Badge ${index + 1} text:`, badge.textContent);
    });
    
    return {
      rawData: rawWishlist,
      parsedData: parsedWishlist,
      domElements: {
        empty: emptyElement,
        listing: listingElement,
        badges: badgeElements
      }
    };
  }
  
  // 🔧 CORRECTION FORCÉE
  function forceWishlistRefresh() {
    console.log('🔧 === CORRECTION FORCÉE ===');
    
    const wishlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    console.log('🔄 Forcing refresh with data:', wishlist);
    
    const emptyElement = document.querySelector("#offcanvas-wishlist-empty");
    const listingElement = document.querySelector("#offcanvas-wishlist-product-listing");
    
    if (!emptyElement || !listingElement) {
      console.error('❌ Critical DOM elements missing');
      return false;
    }
    
    if (wishlist.length > 0) {
      console.log('✅ Wishlist has items, showing products');
      
      // Cacher le message vide
      emptyElement.setAttribute("hidden", "hidden");
      emptyElement.style.display = "none";
      
      // Afficher la liste des produits
      listingElement.removeAttribute("hidden");
      listingElement.style.display = "block";
      
      // Forcer la regénération du contenu
      if (typeof window.initializeWishlist === 'function') {
        window.initializeWishlist();
      }
      
    } else {
      console.log('ℹ️ Wishlist is empty, showing empty message');
      
      // Afficher le message vide
      emptyElement.removeAttribute("hidden");
      emptyElement.style.display = "block";
      
      // Cacher la liste des produits
      listingElement.setAttribute("hidden", "hidden");
      listingElement.style.display = "none";
      listingElement.innerHTML = "";
    }
    
    // Mettre à jour les badges
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
    
    console.log('✅ Correction forcée terminée');
    return true;
  }
  
  // 🧪 TESTS AUTOMATIQUES
  function runWishlistTests() {
    console.log('🧪 === TESTS AUTOMATIQUES ===');
    
    const tests = [
      {
        name: 'localStorage accessible',
        test: () => typeof localStorage !== 'undefined'
      },
      {
        name: 'Wishlist data exists',
        test: () => localStorage.getItem(STORAGE_KEY) !== null
      },
      {
        name: 'DOM elements present',
        test: () => {
          return document.querySelector("#offcanvas-wishlist-empty") &&
                 document.querySelector("#offcanvas-wishlist-product-listing");
        }
      },
      {
        name: 'initializeWishlist function exists',
        test: () => typeof window.initializeWishlist === 'function'
      },
      {
        name: 'Bootstrap available',
        test: () => typeof bootstrap !== 'undefined'
      }
    ];
    
    tests.forEach(({ name, test }) => {
      try {
        const result = test();
        console.log(`${result ? '✅' : '❌'} ${name}: ${result ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        console.log(`❌ ${name}: ERROR - ${error.message}`);
      }
    });
  }
  
  // 🔬 ANALYSEUR DE CONTENU WISHLIST
  function analyzeWishlistContent() {
    console.log('🔬 === ANALYSE CONTENU WISHLIST ===');
    
    const wishlist = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (wishlist.length === 0) {
      console.log('📭 Wishlist vide');
      return;
    }
    
    wishlist.forEach((item, index) => {
      console.log(`📦 Item ${index + 1}:`, {
        handle: item.handle,
        title: item.title,
        url: item.url,
        hasVariants: item.variants && item.variants.length > 0,
        hasImage: item.featured_image !== null
      });
    });
  }
  
  // 🚀 INITIALISATION PERSONNALISÉE
  function customWishlistInit() {
    console.log('🚀 === INITIALISATION PERSONNALISÉE ===');
    
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', customWishlistInit);
      return;
    }
    
    // Attendre que les éléments wishlist soient présents
    const checkElements = setInterval(() => {
      const emptyElement = document.querySelector("#offcanvas-wishlist-empty");
      const listingElement = document.querySelector("#offcanvas-wishlist-product-listing");
      
      if (emptyElement && listingElement) {
        clearInterval(checkElements);
        
        console.log('✅ Éléments DOM détectés, lancement correction');
        
        // Diagnostic initial
        diagnosticWishlist();
        
        // Tests
        runWishlistTests();
        
        // Analyse du contenu
        analyzeWishlistContent();
        
        // Correction forcée
        setTimeout(() => {
          forceWishlistRefresh();
        }, 500);
        
        // Surveillance des changements
        const observer = new MutationObserver(() => {
          console.log('🔄 Changement détecté, re-vérification...');
          setTimeout(forceWishlistRefresh, 100);
        });
        
        observer.observe(listingElement, {
          childList: true,
          attributes: true,
          attributeFilter: ['hidden', 'style']
        });
        
      }
    }, 100);
    
    // Timeout de sécurité
    setTimeout(() => {
      clearInterval(checkElements);
      console.log('⏰ Timeout atteint, vérification manuelle');
      forceWishlistRefresh();
    }, 5000);
  }
  
  // 💉 INJECTION DANS LE SCOPE GLOBAL
  window.WishlistDebug = {
    diagnostic: diagnosticWishlist,
    forceRefresh: forceWishlistRefresh,
    runTests: runWishlistTests,
    analyzeContent: analyzeWishlistContent,
    customInit: customWishlistInit
  };
  
  // 🎯 AUTO-LANCEMENT
  console.log('🎯 Wishlist Debug & Fix chargé');
  customWishlistInit();
  
  // 📡 ÉCOUTE DES ÉVÉNEMENTS WISHLIST
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      console.log('📡 Changement localStorage détecté');
      setTimeout(forceWishlistRefresh, 100);
    }
  });
  
  // 🔄 OVERRIDE DE LA FONCTION ORIGINALE SI NÉCESSAIRE
  const originalInit = window.initializeWishlist;
  if (typeof originalInit === 'function') {
    window.initializeWishlist = function() {
      console.log('🔄 initializeWishlist appelée - ajout du debug');
      originalInit.apply(this, arguments);
      setTimeout(() => {
        diagnosticWishlist();
        forceWishlistRefresh();
      }, 200);
    };
  }
  
})();

// 🎮 COMMANDES CONSOLE POUR DEBUG MANUEL
console.log(`
🎮 === COMMANDES CONSOLE DISPONIBLES ===
WishlistDebug.diagnostic()     - Diagnostic complet
WishlistDebug.forceRefresh()   - Correction forcée
WishlistDebug.runTests()       - Tests automatiques
WishlistDebug.analyzeContent() - Analyse contenu wishlist
WishlistDebug.customInit()     - Réinitialisation
`);
