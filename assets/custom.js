document.addEventListener("DOMContentLoaded", function () {
  let lastClicked = null;

  document.querySelectorAll('.animated-stories-link').forEach(function (el) {
    el.addEventListener('click', function (e) {
      const tooltip = el.querySelector('.tooltip-bubble');
      if (!tooltip) return;

      const isMobile = window.matchMedia("(hover: none), (pointer: coarse)").matches;

      if (isMobile) {
        if (lastClicked === el && tooltip.classList.contains('visible')) return;

        e.preventDefault();
        document.querySelectorAll('.tooltip-bubble.visible').forEach(tip => tip.classList.remove('visible'));
        tooltip.classList.add('visible');
        lastClicked = el;

        setTimeout(() => {
          tooltip.classList.remove('visible');
          lastClicked = null;
        }, 3000);
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.animated-stories-link')) {
      document.querySelectorAll('.tooltip-bubble.visible').forEach(tip => tip.classList.remove('visible'));
      lastClicked = null;
    }
  });

  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  function updateMainPadding() {
    const headerGroup = document.querySelector('.header-sticky-group');
    const main = document.querySelector('main');
    if (headerGroup && main) {
      main.style.paddingTop = headerGroup.offsetHeight + 'px';
    }
  }
  window.addEventListener('load', updateMainPadding);
  window.addEventListener('resize', updateMainPadding);

  const SUBSCRIPTION_BTN_SELECTOR = '#shopify-subscription-policy-button';
  if (document.querySelector(SUBSCRIPTION_BTN_SELECTOR)) {
    waitForElement(SUBSCRIPTION_BTN_SELECTOR)
      .then(button => {
        new MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.attributeName === 'class' && button.classList.contains('is-checked')) {
              console.log("✅ Bouton de souscription coché");
            }
          }
        }).observe(button, { attributes: true });
      })
      .catch(error => {
        console.warn("❌ Bouton de souscription introuvable :", error);
      });
  }

  try {
    fetch('https://services.shopiweb.fr/api/licenses/get_by_domain/f6d72e-0f.myshopify.com/premium')
      .then(response => {
        if (!response.ok) throw new Error('Erreur réseau');
        return response.json();
      })
      .then(data => {
        console.log('✅ Licence Shopiweb valide :', data);
      })
      .catch(error => {
        console.warn('⚠️ Validation de licence échouée : fonctionnement limité.', error);
      });
  } catch (error) {
    console.warn('❌ Erreur critique lors du fetch de licence Shopiweb :', error);
  }

  initNewsletterEnhancements();
  initNewsletterValidation();
  initNewsletterAccessibility();
  handleResponsiveNewsletter();
});

document.addEventListener('shopify:section:load', function () {
  initNewsletterEnhancements();
  initNewsletterValidation();
  initNewsletterAccessibility();
  handleResponsiveNewsletter();
});

if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:select', function () {
    setTimeout(() => {
      initNewsletterEnhancements();
      initNewsletterValidation();
      initNewsletterAccessibility();
      handleResponsiveNewsletter();
    }, 100);
  });
}

// 📌 Tu dois coller ici toutes tes fonctions :
// handleAtcFormVariantClick()
// handleCheckoutButtonClick()
// handleAddToCartFormSubmit()
// initNewsletterEnhancements()
// initNewsletterValidation()
// initNewsletterAccessibility()
// handleResponsiveNewsletter()
// waitForElement()

// ✅ Elles doivent être copiées à la suite dans l’ordre exact.