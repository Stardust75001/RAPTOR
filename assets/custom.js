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

  // ✅ Lazy loading auto sur toutes les images des stories (icônes et tooltips)
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  // ✅ Ajuster le padding-top du <main>
  function updateMainPadding() {
    const headerGroup = document.querySelector('.header-sticky-group');
    const main = document.querySelector('main');
    if (headerGroup && main) {
      main.style.paddingTop = headerGroup.offsetHeight + 'px';
    }
  }
  window.addEventListener('load', updateMainPadding);
  window.addEventListener('resize', updateMainPadding);

  // ✅ Surveiller le bouton de souscription Shopify
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

  // ✅ Vérification de la licence Shopiweb
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
});

// ✅ Utilitaire : attendre l’apparition d’un élément
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: ${selector}`));
    }, timeout);
  });
}

// ✅ Gestion ATC variante
function handleAtcFormVariantClick(element, event) {
  if (event) event.preventDefault();
  const form = element.closest("form");
  const variantId = element.getAttribute("data-variant-id");

  if (form && variantId) {
    const variantInput = form.querySelector('input[name="id"]');
    if (variantInput) variantInput.value = variantId;

    if (typeof handleAddToCartFormSubmit === 'function') {
      handleAddToCartFormSubmit(form, event);
    } else {
      form.submit();
    }
  }
}

// ✅ Gestion bouton Checkout
function handleCheckoutButtonClick(element, event) {
  if (event) event.preventDefault();
  const form = element.closest("form");
  if (form) form.submit();
}

// ✅ Formulaire ATC avec feedback visuel
function handleAddToCartFormSubmit(form, event) {
  if (event) event.preventDefault();

  const btn = form.querySelector(".btn-atc");
  if (btn) {
    btn.innerHTML = `
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>`;
  }

  form.classList.add("loading");

  fetch("/cart/add.js", {
    method: "POST",
    body: new FormData(form),
    headers: {
      Accept: "application/json"
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("✅ Produit ajouté au panier :", data);
      if (typeof updateCartDrawer === 'function') {
        updateCartDrawer();
      } else {
        window.location.reload();
      }
    })
    .catch(error => {
      console.error("❌ Erreur lors de l'ajout au panier :", error);
      form.classList.remove("loading");
    });
}

// ✅ Améliorations pour les formulaires newsletter
function initNewsletterEnhancements() {
  const newsletterForms = document.querySelectorAll('form[action*="contact"], #newsletter-popup-form');
  
  newsletterForms.forEach(form => {
    // Vérifie si c'est bien un formulaire newsletter
    const isNewsletterForm = form.querySelector('input[name="contact[tags]"][value="newsletter"]') || 
                            form.querySelector('input[name="contact[email]"]');
    
    if (!isNewsletterForm) return;
    
    const emailInput = form.querySelector('input[type="email"]');
    const nameInput = form.querySelector('input[name="contact[first_name]"]');
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (!emailInput || !submitButton) return;
    
    // Validation en temps réel de l'email
    emailInput.addEventListener('input', function() {
      const isValid = this.checkValidity();
      this.classList.toggle('is-valid', isValid && this.value.length > 0);
      this.classList.toggle('is-invalid', !isValid && this.value.length > 0);
    });
    
    // Validation du nom si présent
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        const isValid = this.value.trim().length >= 2;
        this.classList.toggle('is-valid', isValid);
        this.classList.toggle('is-invalid', this.value.length > 0 && !isValid);
      });
    }
    
    // Gestion de la soumission
    form.addEventListener('submit', function(e) {
      const emailValid = emailInput.checkValidity();
      const nameValid = !nameInput || nameInput.value.trim().length >= 2;
      
      if (!emailValid || !nameValid) {
        e.preventDefault();
        
        if (!emailValid) {
          emailInput.classList.add('is-invalid');
          emailInput.focus();
        } else if (!nameValid) {
          nameInput.classList.add('is-invalid');
          nameInput.focus();
        }
        return;
      }
      
      // Indication de chargement
      submitButton.disabled = true;
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Inscription...';
      
      // Restaurer l'état après 3 secondes (au cas où)
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }, 3000);
    });
  });
}

// Initialiser les améliorations newsletter
document.addEventListener('DOMContentLoaded', initNewsletterEnhancements);

// Réinitialiser après les changements de section (pour Shopify)
document.addEventListener('shopify:section:load', initNewsletterEnhancements);  // ✅ Newsletter Form Enhancement avec validation et accessibilité optimisée
function initNewsletterValidation() {
  const forms = document.querySelectorAll('.newsletter-form');
  
  forms.forEach(form => {
    const nameInput = form.querySelector('.newsletter-name-input');
    const emailInput = form.querySelector('.newsletter-email-input');
    const submitButton = form.querySelector('button[type="submit"], .newsletter-submit-btn');
    const statusDiv = form.querySelector('[id*="newsletter-status"]');
    
    // Fonctions de validation améliorées
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.trim());
    }
    
    function validateName(name) {
      return name.trim().length >= 2 && name.trim().length <= 50;
    }
    
    function updateFieldState(input, isValid, message = '') {
      const errorDiv = form.querySelector(`#${input.id.replace(input.id.split('-').pop(), 'error-' + input.id.split('-').pop())}`);
      
      // Nettoyer les états précédents
      input.classList.remove('success', 'error');
      input.setAttribute('aria-invalid', 'false');
      
      if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.setAttribute('aria-hidden', 'true');
      }
      
      if (input.value.length > 0) {
        if (isValid) {
          input.classList.add('success');
          input.setAttribute('aria-invalid', 'false');
        } else {
          input.classList.add('error');
          input.setAttribute('aria-invalid', 'true');
          if (errorDiv && message) {
            errorDiv.textContent = message;
            errorDiv.setAttribute('aria-hidden', 'false');
          }
        }
      }
    }
    
    function announceToScreenReader(message) {
      if (statusDiv) {
        statusDiv.textContent = message;
        // Reset après 3 secondes
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 3000);
      }
    }
    
    function updateSubmitButton(isFormValid) {
      if (submitButton) {
        if (isFormValid) {
          submitButton.removeAttribute('disabled');
          submitButton.setAttribute('aria-disabled', 'false');
        } else {
          submitButton.setAttribute('disabled', 'true');
          submitButton.setAttribute('aria-disabled', 'true');
        }
      }
    }
    
    function validateForm() {
      const isEmailValid = emailInput ? validateEmail(emailInput.value) : false;
      const isNameValid = nameInput ? (nameInput.value.length === 0 || validateName(nameInput.value)) : true;
      
      return isEmailValid && isNameValid;
    }
    
    // Validation en temps réel pour l'email
    if (emailInput) {
      emailInput.addEventListener('input', function() {
        const isValid = validateEmail(this.value);
        let message = '';
        
        if (this.value.length > 0 && !isValid) {
          message = 'Veuillez entrer une adresse email valide';
        }
        
        updateFieldState(this, isValid, message);
        updateSubmitButton(validateForm());
      });
      
      emailInput.addEventListener('blur', function() {
        if (this.value.length > 0 && !validateEmail(this.value)) {
          announceToScreenReader('Adresse email invalide');
        }
      });
    }
    
    // Validation en temps réel pour le nom
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        const isValid = this.value.length === 0 || validateName(this.value);
        let message = '';
        
        if (this.value.length > 0 && this.value.trim().length < 2) {
          message = 'Le prénom doit contenir au moins 2 caractères';
        } else if (this.value.length > 50) {
          message = 'Le prénom ne peut pas dépasser 50 caractères';
        }
        
        updateFieldState(this, isValid, message);
        updateSubmitButton(validateForm());
      });
    }
    
    // Gestion de la soumission du formulaire
    if (form.closest('form')) {
      form.closest('form').addEventListener('submit', function(e) {
        const isFormValid = validateForm();
        
        if (!isFormValid) {
          e.preventDefault();
          announceToScreenReader('Veuillez corriger les erreurs dans le formulaire');
          
          // Focus sur le premier champ invalide
          const firstInvalid = form.querySelector('.error');
          if (firstInvalid) {
            firstInvalid.focus();
          }
          return false;
        }
        
        // Animation du bouton de soumission
        if (submitButton) {
          const btnText = submitButton.querySelector('.btn-text');
          const btnLoader = submitButton.querySelector('.btn-loader');
          
          if (btnText) btnText.style.display = 'none';
          if (btnLoader) btnLoader.style.display = 'inline-block';
          
          submitButton.setAttribute('disabled', 'true');
          submitButton.setAttribute('aria-disabled', 'true');
          
          announceToScreenReader('Inscription en cours...');
        }
      });
    }
    
    // Validation initiale
    updateSubmitButton(validateForm());
    
    // Gestion des focus pour l'accessibilité
    [nameInput, emailInput].filter(Boolean).forEach(input => {
      input.addEventListener('focus', function() {
        this.classList.add('focused');
      });
      
      input.addEventListener('blur', function() {
        this.classList.remove('focused');
      });
      
      // Support pour les raccourcis clavier
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && validateForm()) {
          if (submitButton) {
            submitButton.click();
          }
        }
      });
    });
  });
}

// Initialisation complète de l'accessibilité newsletter
function initNewsletterAccessibility() {
  // Améliorer les labels existants
  document.querySelectorAll('.newsletter-label').forEach(label => {
    if (label.textContent && !label.querySelector('.sr-only')) {
      const isRequired = label.closest('.newsletter-field-group')?.querySelector('[required]');
      if (isRequired && !label.textContent.includes('requis')) {
        const srSpan = document.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = ' (requis)';
        label.appendChild(srSpan);
      }
    }
  });
  
  // Améliorer les boutons de soumission
  document.querySelectorAll('.newsletter-form button[type="submit"]').forEach(button => {
    if (!button.getAttribute('aria-label')) {
      button.setAttribute('aria-label', 'S\'inscrire à la newsletter');
    }
  });
  
  // Ajouter des landmarks ARIA si nécessaire
  document.querySelectorAll('.newsletter-form').forEach(form => {
    if (!form.getAttribute('role')) {
      form.setAttribute('role', 'form');
    }
    
    const parentForm = form.closest('form');
    if (parentForm && !parentForm.getAttribute('novalidate')) {
      parentForm.setAttribute('novalidate', 'true'); // Utiliser notre validation personnalisée
    }
  });
}

// Fonction pour surveiller les changements de viewport (responsive)
function handleResponsiveNewsletter() {
  const mediaQueries = {
    mobile: window.matchMedia('(max-width: 767px)'),
    tablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)'),
    desktop: window.matchMedia('(min-width: 1025px)')
  };
  
  function updateResponsiveFeatures() {
    document.querySelectorAll('.newsletter-form').forEach(form => {
      // Ajuster la taille des champs selon l'écran
      const inputs = form.querySelectorAll('.newsletter-name-input, .newsletter-email-input');
      
      if (mediaQueries.mobile.matches) {
        inputs.forEach(input => {
          input.style.fontSize = '16px'; // Évite le zoom automatique iOS
        });
      }
    });
  }
  
  // Écouter les changements de taille d'écran
  Object.values(mediaQueries).forEach(mq => {
    mq.addEventListener('change', updateResponsiveFeatures);
  });
  
  updateResponsiveFeatures();
}
      
      if (emailInput) {
        emailInput.addEventListener('input', () => {
          const isValid = validateEmail(emailInput.value);
          updateFieldState(emailInput, isValid);
        });
        
        emailInput.addEventListener('blur', () => {
          const isValid = validateEmail(emailInput.value);
          updateFieldState(emailInput, isValid);
          if (!isValid && emailInput.value.length > 0) {
            announceToScreenReader('Format d\'email invalide');
          }
        });
      }
      
      if (nameInput) {
        nameInput.addEventListener('input', () => {
          const isValid = validateName(nameInput.value);
          updateFieldState(nameInput, isValid);
        });
        
        nameInput.addEventListener('blur', () => {
          const isValid = validateName(nameInput.value);
          updateFieldState(nameInput, isValid);
          if (!isValid && nameInput.value.length > 0) {
            announceToScreenReader('Le prénom doit contenir au moins 2 caractères');
          }
        });
      }
      
      // Gestion de la soumission
      if (submitButton) {
        form.addEventListener('submit', (e) => {
          let isFormValid = true;
          let errorMessages = [];
          
          if (emailInput && !validateEmail(emailInput.value)) {
            updateFieldState(emailInput, false);
            errorMessages.push('Email invalide');
            isFormValid = false;
          }
          
          if (nameInput && nameInput.value && !validateName(nameInput.value)) {
            updateFieldState(nameInput, false);
            errorMessages.push('Prénom invalide');
            isFormValid = false;
          }
          
          if (!isFormValid) {
            e.preventDefault();
            announceToScreenReader('Erreurs dans le formulaire: ' + errorMessages.join(', '));
            
            // Focus sur le premier champ en erreur
            const firstErrorField = form.querySelector('.is-invalid');
            if (firstErrorField) {
              firstErrorField.focus();
            }
            return false;
// Initialisation de toutes les fonctions newsletter
document.addEventListener('DOMContentLoaded', function() {
  initNewsletterValidation();
  initNewsletterAccessibility();
  handleResponsiveNewsletter();
});

// Réinitialiser après les changements de section Shopify
document.addEventListener('shopify:section:load', function() {
  initNewsletterValidation();
  initNewsletterAccessibility();
  handleResponsiveNewsletter();
});

// Support pour les thèmes avec chargement dynamique
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:select', function() {
    setTimeout(() => {
      initNewsletterValidation();
      initNewsletterAccessibility();
      handleResponsiveNewsletter();
    }, 100);
  });
}