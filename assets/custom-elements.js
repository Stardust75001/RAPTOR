// custom-elements.js

let hasRegisteredElements = false;

document.addEventListener("DOMContentLoaded", () => {
  if (hasRegisteredElements) return;
  hasRegisteredElements = true;

  // Exemple 1 : simple bouton personnalisé avec compteur de clics
  if (!customElements.get('click-counter-button')) {
    try {
      class ClickCounterButton extends HTMLElement {
        constructor() {
          super();
          this.count = 0;
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.innerHTML = \`
            <button>Clicks: 0</button>
          \`;
          this.button = this.shadowRoot.querySelector('button');
          this.button.addEventListener('click', () => {
            this.count++;
            this.button.textContent = \`Clicks: \${this.count}\`;
          });
        }
      }
      customElements.define('click-counter-button', ClickCounterButton);
      console.log("✅ Custom element 'click-counter-button' registered");
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'enregistrement de 'click-counter-button':", error);
    }
  }

  // Exemple 2 : un composant simple qui affiche un message
  if (!customElements.get('hello-message')) {
    try {
      class HelloMessage extends HTMLElement {
        connectedCallback() {
          this.textContent = "Hello, this is a custom element!";
        }
      }
      customElements.define('hello-message', HelloMessage);
      console.log("✅ Custom element 'hello-message' registered");
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'enregistrement de 'hello-message':", error);
    }
  }

  // Exemple 3 : un composant avec attribut personnalisé
  if (!customElements.get('colored-box')) {
    try {
      class ColoredBox extends HTMLElement {
        static get observedAttributes() {
          return ['color'];
        }
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
          this.box = document.createElement('div');
          this.box.style.width = '100px';
          this.box.style.height = '100px';
          this.shadowRoot.appendChild(this.box);
        }
        attributeChangedCallback(name, oldValue, newValue) {
          if (name === 'color') {
            this.box.style.backgroundColor = newValue || 'lightgray';
          }
        }
      }
      customElements.define('colored-box', ColoredBox);
      console.log("✅ Custom element 'colored-box' registered");
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'enregistrement de 'colored-box':", error);
    }
  }

  // ✅ Privacy banner element
  if (!customElements.get('privacy-banner-element')) {
    try {
      class PrivacyBannerElement extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          this.innerHTML = \`
            <div class="privacy-banner-container" style="background:#816C58; color:white; padding: 20px; text-align: center; position: relative;">
              <span>We use cookies to improve your experience. By using this site, you accept our <a href="/pages/politique-de-confidentialite" style="color:#FFF; text-decoration:underline;">privacy policy</a>.</span>
              <button style="position: absolute; right: 15px; top: 15px; background: transparent; border: none; color: white; font-size: 20px; cursor: pointer;" aria-label="Close privacy banner">&times;</button>
            </div>
          \`;

          this.querySelector('button').addEventListener('click', () => {
            this.style.display = 'none';
          });
        }
      }
      customElements.define('privacy-banner-element', PrivacyBannerElement);
      console.log("✅ Custom element 'privacy-banner-element' registered");
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'enregistrement de 'privacy-banner-element':", error);
      // Optionnel : fallback avec un autre nom
      try {
        customElements.define('shopiweb-privacy-banner', PrivacyBannerElement);
        console.log("✅ Fallback custom element 'shopiweb-privacy-banner' registered");
      } catch (fallbackError) {
        console.error("❌ Impossible de définir le custom element fallback:", fallbackError);
      }
    }
  }

});
