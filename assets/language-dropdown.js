/**
 * Gestion de la dropdown de langue et correction des liens de navigation
 * Corrige les erreurs 404 et assure la navigation multilingue
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Language Dropdown: Initializing...');
  
  // === GESTION DE LA DROPDOWN DE LANGUE UNIQUEMENT ===
  initializeLanguageDropdown();
  
  // === DÉSACTIVATION COMPLÈTE DES CORRECTIONS DE LIENS ===
  // Pour reproduire le comportement de test2-theme-labels-in-fields-20250711-034310
  // qui fonctionnait sans modification de liens
  console.log('Language Dropdown: Link modifications disabled - using native Shopify URLs');
  
  // NOTE: Tous les liens restent dans leur état original Shopify
  // pour éviter toute modification qui pourrait causer des 404
});

/**
 * Initialise la dropdown de langue avec gestion d'événements
 */
function initializeLanguageDropdown() {
  const dropdown = document.querySelector('.language-dropdown');
  const dropdownButton = document.querySelector('#languageDropdown');
  const dropdownMenu = document.querySelector('.language-dropdown .dropdown-menu');
  
  if (!dropdown || !dropdownButton || !dropdownMenu) {
    console.warn('Language Dropdown: Elements not found, creating fallback');
    createFallbackLanguageSelector();
    return;
  }
  
  console.log('Language Dropdown: Elements found, setting up events');
  
  // Gestion du clic sur le bouton
  dropdownButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const isOpen = dropdownButton.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });
  
  // Fermer la dropdown en cliquant ailleurs
  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
  
  // Gestion du clavier
  dropdownButton.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dropdownButton.click();
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });
  
  // Améliorer l'accessibilité des liens
  const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
  dropdownItems.forEach((item, index) => {
    item.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextItem = dropdownItems[index + 1];
        if (nextItem) nextItem.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevItem = dropdownItems[index - 1];
        if (prevItem) {
          prevItem.focus();
        } else {
          dropdownButton.focus();
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        dropdownButton.focus();
      }
    });
  });
  
  function openDropdown() {
    dropdownMenu.classList.add('show');
    dropdownButton.classList.add('show');
    dropdownButton.setAttribute('aria-expanded', 'true');
    
    // Focus sur le premier élément
    const firstItem = dropdownMenu.querySelector('.dropdown-item:not(.text-muted)');
    if (firstItem) {
      setTimeout(() => firstItem.focus(), 100);
    }
  }
  
  function closeDropdown() {
    dropdownMenu.classList.remove('show');
    dropdownButton.classList.remove('show');
    dropdownButton.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Crée un sélecteur de langue de fallback si la dropdown Bootstrap n'est pas disponible
 */
function createFallbackLanguageSelector() {
  const container = document.querySelector('.language-selector-right');
  if (!container) return;
  
  console.log('Language Dropdown: Creating fallback selector');
  
  // Récupérer les données de localisation depuis les méta ou le DOM
  const currentLanguage = document.documentElement.lang || 'fr';
  const availableLanguages = getAvailableLanguages();
  
  const fallbackHTML = `
    <div class="language-fallback">
      <button class="language-toggle" aria-label="Sélecteur de langue">
        ${getLanguageFlag(currentLanguage)} ${currentLanguage.toUpperCase()}
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="language-options" style="display: none;">
        ${availableLanguages.map(lang => `
          <a href="${getLanguageUrl(lang)}" class="language-option ${lang === currentLanguage ? 'active' : ''}">
            ${getLanguageFlag(lang)} ${getLanguageName(lang)}
          </a>
        `).join('')}
      </div>
    </div>
  `;
  
  container.innerHTML = fallbackHTML;
  
  // Ajouter les styles
  addFallbackStyles();
  
  // Ajouter les événements
  const toggle = container.querySelector('.language-toggle');
  const options = container.querySelector('.language-options');
  
  toggle.addEventListener('click', () => {
    const isOpen = options.style.display === 'block';
    options.style.display = isOpen ? 'none' : 'block';
    toggle.classList.toggle('open', !isOpen);
  });
  
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      options.style.display = 'none';
      toggle.classList.remove('open');
    }
  });
}

/**
 * Ajoute les styles pour le sélecteur de fallback
 */
function addFallbackStyles() {
  if (document.getElementById('language-fallback-styles')) return;
  
  const styles = `
    <style id="language-fallback-styles">
      .language-fallback {
        position: relative;
      }
      .language-toggle {
        background: transparent;
        border: 1px solid white;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
      }
      .language-toggle:hover,
      .language-toggle.open {
        background: white;
        color: #889080;
      }
      .dropdown-arrow {
        transition: transform 0.2s;
        font-size: 10px;
      }
      .language-toggle.open .dropdown-arrow {
        transform: rotate(180deg);
      }
      .language-options {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1060;
        min-width: 150px;
        margin-top: 4px;
      }
      .language-option {
        display: block;
        padding: 8px 12px;
        color: #333;
        text-decoration: none;
        transition: background-color 0.2s;
      }
      .language-option:hover {
        background-color: #f8f9fa;
        color: #889080;
      }
      .language-option.active {
        background-color: #889080;
        color: white;
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
}

/**
 * Corrige les liens de navigation pour éviter les 404
 * VERSION SÉCURISÉE - Ne modifie que les liens vraiment problématiques
 */
function fixNavigationLinks() {
  console.log('Language Dropdown: Checking navigation links...');
  
  const currentLanguage = document.documentElement.lang || 'fr';
  const links = document.querySelectorAll('a[href]');
  let fixedCount = 0;
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    
    // Ignorer les liens externes, ancres, et déjà traités
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    
    // SEULEMENT corriger les liens Shopify problématiques qui retournent 404
    if (href.includes('shopify://')) {
      // Test simple : vérifier si le lien parent a des classes spécifiques problématiques
      const parentClasses = link.closest('[class*="stories"], [class*="carousel"], [class*="animated"]');
      if (parentClasses) {
        const correctedUrl = convertShopifyUrlSafely(href, currentLanguage);
        if (correctedUrl !== href) {
          link.setAttribute('href', correctedUrl);
          console.log(`Fixed problematic Shopify URL: ${href} → ${correctedUrl}`);
          fixedCount++;
        }
      }
    }
  });
  
  console.log(`Language Dropdown: Fixed ${fixedCount} problematic links`);
}

/**
 * Corrige spécifiquement les liens du carousel
 * VERSION SÉCURISÉE - Plus conservatrice
 */
function fixCarouselLinks() {
  console.log('Language Dropdown: Checking carousel links...');
  
  const carouselLinks = document.querySelectorAll('.stories-bar a, .carousel a, [class*="animated-stories"] a');
  const currentLanguage = document.documentElement.lang || 'fr';
  let fixedCount = 0;
  
  carouselLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('shopify://')) {
      // Seulement corriger si le lien semble vraiment cassé
      const correctedUrl = convertShopifyUrlSafely(href, currentLanguage);
      if (correctedUrl !== href) {
        link.setAttribute('href', correctedUrl);
        console.log(`Fixed carousel link: ${href} → ${correctedUrl}`);
        fixedCount++;
      }
    }
  });
  
  console.log(`Language Dropdown: Fixed ${fixedCount} carousel links`);
}

/**
 * Convertit les URLs Shopify en URLs localisées (VERSION SÉCURISÉE)
 * Retourne l'URL originale si aucune conversion sûre n'est possible
 */
function convertShopifyUrlSafely(shopifyUrl, language) {
  // Mapping conservateur SEULEMENT pour les URLs vraiment problématiques
  const safeUrlMappings = {
    'shopify://collections/travel-corner': '/collections/travel-corner',
    'shopify://collections/gourmet-bar': '/collections/gourmet-bar',
    'shopify://collections/playground': '/collections/playground',
    'shopify://collections/time-for-a-walk': '/collections/time-for-a-walk',
    'shopify://collections/spa': '/collections/spa',
    'shopify://collections/pet-tech': '/collections/pet-tech',
    'shopify://collections/fashion-district': '/collections/fashion-district',
    'shopify://collections/le-red-carpet': '/collections/le-red-carpet'
  };
  
  // Vérification directe dans le mapping sécurisé
  if (safeUrlMappings[shopifyUrl]) {
    return safeUrlMappings[shopifyUrl];
  }
  
  // Conversion générique SEULEMENT pour les formats reconnus
  const collectionMatch = shopifyUrl.match(/shopify:\/\/collections\/([a-z0-9\-]+)$/);
  if (collectionMatch) {
    const collection = collectionMatch[1];
    return `/collections/${collection}`;
  }
  
  // Si on ne peut pas convertir en sécurité, on garde l'original
  return shopifyUrl;
}

/**
 * Convertit les URLs Shopify en URLs localisées (FONCTION ORIGINALE CONSERVÉE)
 */
function convertShopifyUrl(shopifyUrl, language) {
  // Mapping des URLs Shopify vers les URLs de collection
  const urlMappings = {
    'shopify://collections/travel-corner': {
      'fr': '/collections/travel-corner',
      'en': '/en/collections/travel-corner', 
      'de': '/de/collections/travel-corner'
    },
    'shopify://collections/gourmet-bar': {
      'fr': '/collections/gourmet-bar',
      'en': '/en/collections/gourmet-bar',
      'de': '/de/collections/gourmet-bar'  
    },
    'shopify://collections/playground': {
      'fr': '/collections/playground',
      'en': '/en/collections/playground',
      'de': '/de/collections/playground'
    },
    'shopify://collections/time-for-a-walk': {
      'fr': '/collections/time-for-a-walk',
      'en': '/en/collections/time-for-a-walk',
      'de': '/de/collections/time-for-a-walk'
    },
    'shopify://collections/spa': {
      'fr': '/collections/spa',
      'en': '/en/collections/spa',
      'de': '/de/collections/spa'
    },
    'shopify://collections/pet-tech': {
      'fr': '/collections/pet-tech',
      'en': '/en/collections/pet-tech',
      'de': '/de/collections/pet-tech'
    },
    'shopify://collections/fashion-district': {
      'fr': '/collections/fashion-district',
      'en': '/en/collections/fashion-district',
      'de': '/de/collections/fashion-district'
    }
  };
  
  const mapping = urlMappings[shopifyUrl];
  if (mapping && mapping[language]) {
    return mapping[language];
  }
  
  // Fallback: conversion générique
  const collectionMatch = shopifyUrl.match(/shopify:\/\/collections\/(.+)/);
  if (collectionMatch) {
    const collection = collectionMatch[1];
    if (language === 'fr') {
      return `/collections/${collection}`;
    } else {
      return `/${language}/collections/${collection}`;
    }
  }
  
  return shopifyUrl; // Retourner l'URL originale si aucune conversion n'est possible
}

/**
 * Fonctions utilitaires pour le sélecteur de fallback
 */
function getAvailableLanguages() {
  // Essayer de récupérer depuis les liens de langue existants
  const languageLinks = document.querySelectorAll('[hreflang]');
  if (languageLinks.length > 0) {
    return Array.from(languageLinks).map(link => link.getAttribute('hreflang'));
  }
  
  // Fallback vers les langues par défaut
  return ['fr', 'en', 'de'];
}

function getLanguageUrl(langCode) {
  const currentPath = window.location.pathname;
  
  if (langCode === 'fr') {
    // Retirer le préfixe de langue pour le français
    return currentPath.replace(/^\/(en|de)/, '') || '/';
  } else {
    // Ajouter ou remplacer le préfixe de langue
    const pathWithoutLang = currentPath.replace(/^\/(en|de|fr)/, '') || '/';
    return `/${langCode}${pathWithoutLang}`;
  }
}

function getLanguageFlag(langCode) {
  const flags = {
    'fr': '🇫🇷',
    'en': '🇬🇧', 
    'de': '🇩🇪',
    'es': '🇪🇸',
    'it': '🇮🇹'
  };
  return flags[langCode] || '🌍';
}

function getLanguageName(langCode) {
  const names = {
    'fr': 'Français',
    'en': 'English',
    'de': 'Deutsch',
    'es': 'Español', 
    'it': 'Italiano'
  };
  return names[langCode] || langCode.toUpperCase();
}

/**
 * Vérifie l'intégrité de la navigation
 * Fonction de diagnostic pour s'assurer que tous les liens fonctionnent
 */
function validateNavigationIntegrity() {
  console.log('🔍 Navigation Integrity Check: Starting validation...');
  
  const issues = [];
  const links = document.querySelectorAll('a[href]');
  
  links.forEach((link, index) => {
    const href = link.getAttribute('href');
    const linkText = link.textContent.trim();
    const linkContext = link.closest('[class*="nav"], [class*="menu"], [class*="collection"], [class*="stories"]');
    
    // Vérifier les liens suspects
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      
      // Liens Shopify non convertis (potentiellement problématiques)
      if (href.includes('shopify://')) {
        issues.push({
          type: 'shopify-url',
          href: href,
          text: linkText,
          element: link,
          context: linkContext ? linkContext.className : 'unknown'
        });
      }
      
      // Liens relatifs sans collection ou page valide
      if (href.startsWith('/') && !href.match(/\/(collections|pages|products|blogs|cart|account)/)) {
        issues.push({
          type: 'suspicious-relative',
          href: href,
          text: linkText,
          element: link,
          context: linkContext ? linkContext.className : 'unknown'
        });
      }
    }
  });
  
  // Rapport des problèmes trouvés
  if (issues.length > 0) {
    console.warn(`🚨 Navigation Issues Found: ${issues.length} potential problems`);
    issues.forEach((issue, idx) => {
      console.warn(`${idx + 1}. ${issue.type}: "${issue.text}" → ${issue.href} (context: ${issue.context})`);
    });
    
    // Correction automatique des liens shopify uniquement
    const shopifyIssues = issues.filter(issue => issue.type === 'shopify-url');
    if (shopifyIssues.length > 0) {
      console.log('🔧 Auto-fixing Shopify URLs...');
      shopifyIssues.forEach(issue => {
        const correctedUrl = convertShopifyUrlSafely(issue.href, document.documentElement.lang || 'fr');
        if (correctedUrl !== issue.href) {
          issue.element.setAttribute('href', correctedUrl);
          console.log(`✅ Fixed: "${issue.text}" ${issue.href} → ${correctedUrl}`);
        }
      });
    }
  } else {
    console.log('✅ Navigation Integrity Check: All links appear to be valid!');
  }
  
  return {
    totalLinks: links.length,
    issues: issues.length,
    details: issues
  };
}

// Exécuter la validation après le chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Délai pour s'assurer que tout est chargé
  setTimeout(validateNavigationIntegrity, 1000);
});

// Export pour tests ou utilisation externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeLanguageDropdown,
    fixNavigationLinks,
    convertShopifyUrl
  };
}
