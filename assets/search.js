/* ========================================================================
   INFORMATIONS GÉNÉRALES SUR LE SITE
   Propriété de © 2019/2024 Shopiweb.fr
   Pour plus d'informations, visitez : https://www.shopiweb.fr
   ======================================================================== */

/* =====================
   Recherche prédictive
   ===================== */
if (!customElements.get("search-predictive")) {
  class SearchPredictive extends HTMLElement {
    constructor() {
      super();

      this.input = this.querySelector('input[type="search"]');
      this.results = this.querySelector("#search-predictive");
      this.alert = this.querySelector("#search-predictive-alert");
      this.footer =
        this.closest("#offcanvas-search").querySelector(".offcanvas-footer");
      this.popularProducts = this.closest("#offcanvas-search").querySelector(
        "#search-popular-products-wrapper"
      );
      this.speechBtn = this.querySelector(".btn-search-by-voice");

      this.input.addEventListener(
        "input",
        this.debounce((event) => {
          this.onChange();
        }, 300).bind(this)
      );

      document
        .querySelector("#offcanvas-search")
        ?.addEventListener("shown.bs.offcanvas", () => {
          this.input.focus();
        });

      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        this.speechBtn?.addEventListener("click", () => {
          this.speechRecognition();
        });
      } else {
        this.speechBtn?.remove();
      }

      document.querySelectorAll("#offcanvas-search .btn-atc").forEach((btn) => {
        btn.addEventListener("click", () => {
          setTimeout(() => {
            bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-search").hide();
          }, 300);
        });
      });
    }

    open() {
      this.results.style.display = "block";

      const countResults = this.results.querySelectorAll(".product-item").length;

      switch (countResults) {
        case 0:
          this.alert.textContent = this.alert.dataset.textNoResults;
          break;
        case 1:
          this.alert.textContent = this.alert.dataset.textResultFound;
          break;
        default:
          this.alert.textContent = this.alert.dataset.textResultsFound.replace(
            "[count]",
            countResults
          );
          break;
      }

      this.footer.removeAttribute("hidden");

      window.SPR?.initDomEls();
      window.SPR?.loadBadges();

      this.popularProducts?.setAttribute("hidden", "hidden");
    }

    async fetchSearchResults(searchTerm) {
      let resourcesType = "product";

      if (this.input.dataset.searchCollections === "true") {
        resourcesType += ",collection";
      }
      if (this.input.dataset.searchPages === "true") {
        resourcesType += ",page";
      }
      if (this.input.dataset.searchArticles === "true") {
        resourcesType += ",article";
      }

      const response = await fetch(
        `/search/suggest?q=${searchTerm}&resources[type]=${resourcesType}&resources[limit]=10&section_id=search-predictive`
      );

      if (!response.ok) {
        this.close();
        throw new Error(response.status);
      }

      const text = await response.text();
      const resultsMarkup = new DOMParser()
        .parseFromString(text, "text/html")
        .querySelector("#shopify-section-search-predictive").innerHTML;
      this.results.innerHTML = resultsMarkup;

      this.open();
    }

    onChange() {
      const searchTerm = this.input.value.trim();

      this.footer.querySelector('[name="q"]').value = searchTerm;
      this.footer.querySelector(".btn").textContent = `${this.footer.querySelector(".btn").dataset.textSearchFor} "${searchTerm}"`;

      if (!searchTerm.length) {
        this.close();
        return;
      }

      this.fetchSearchResults(searchTerm);
    }

    close() {
      this.results.style.display = "none";
      this.alert.textContent = "";
      this.footer.setAttribute("hidden", "hidden");

      this.popularProducts?.removeAttribute("hidden");
    }

    speechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.onstart = () => {
        this.speechBtn.classList.add("speech-started");
        setTimeout(() => {
          this.speechBtn.classList.remove("speech-started");
        }, 5000);
      };

      recognition.onspeechend = () => {
        this.speechBtn.classList.remove("speech-started");
      };

      recognition.onresult = (event) => {
        if (event.results) {
          this.input.value = event.results[0][0].transcript;
          this.onChange();
        }
      };

      recognition.start();
    }

    debounce(fn, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }
  }

  customElements.define("search-predictive", SearchPredictive);
}

window.closeSearchOffcanvas = (btn, event) => {
  setTimeout(() => {
    bootstrap.Offcanvas.getOrCreateInstance("#offcanvas-search").hide();
  }, 300);
};