// utils.js

/**
 * debounce - limite la fréquence d'exécution d'une fonction.
 * @param {Function} func - La fonction à exécuter.
 * @param {number} wait - Temps d'attente en ms.
 * @param {boolean} immediate - Exécuter immédiatement ou non.
 * @returns {Function} Fonction débitrée.
 */
window.debounce = function(func, wait, immediate) {
  let timeout;
  return function(...args) {
    const context = this;

    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};