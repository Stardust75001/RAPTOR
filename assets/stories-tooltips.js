function debug(...args) {
  if (typeof isDev !== 'undefined' && isDev) {
    console.debug('[Stories Tooltip]', ...args);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const isMobile = window.matchMedia("(hover: none)").matches;
  debug("isMobile:", isMobile);

  document.querySelectorAll(".animated-stories-link").forEach(link => {
    const tooltip = link.querySelector(".tooltip-bubble");
    if (!tooltip) return;

    // Desktop : hover = tooltip, clic = navigation directe
    if (!isMobile) {
      link.addEventListener("mouseenter", () => {
        tooltip.classList.add("hover-visible");
        debug("Hover enter on", link);
        setTimeout(() => adjustTooltipPosition(tooltip), 0);
      }, { passive: true });

      link.addEventListener("mouseleave", () => {
        tooltip.classList.remove("hover-visible");
        debug("Hover leave on", link);
        resetTooltipPosition(tooltip);
      }, { passive: true });

      // Pas besoin de bloquer le clic → navigation normale
    }

    // Mobile : 1er clic affiche tooltip, 2e clic déclenche navigation
    else {
      let tappedOnce = false;

      link.addEventListener("click", e => {
        if (!tappedOnce) {
          e.preventDefault();
          debug("1er tap on", link);

          // Cache autres infobulles
          document.querySelectorAll(".tooltip-bubble.tap-visible").forEach(el => {
            el.classList.remove("tap-visible");
          });

          tooltip.classList.add("tap-visible");
          setTimeout(() => adjustTooltipPosition(tooltip), 0);
          tappedOnce = true;

          // Reset si pas de second clic
          setTimeout(() => {
            tooltip.classList.remove("tap-visible");
            tappedOnce = false;
            resetTooltipPosition(tooltip);
          }, 2000);
        } else {
          debug("2e tap - navigating");
          // Laisse le lien s'ouvrir normalement
        }
      });
    }
  });
});

// Ajustement position tooltip (évite débordement)
function adjustTooltipPosition(tooltip) {
  // Positionne toujours au centre de l’icône
  tooltip.style.left = "50%";
  tooltip.style.top = "50%";
  tooltip.style.transform = "translate(-50%, -50%)";
}

function resetTooltipPosition(tooltip) {
  tooltip.style.left = "50%";
  tooltip.style.top = "50%";
  tooltip.style.transform = "translate(-50%, -50%)";
}