function displayDefaultBanner() {
  const banner = document.getElementById('privacy-banner');
  if (banner) {
    banner.innerHTML = `
      <div class="default-privacy-banner">
        We use cookies to improve your experience. By using this site, you accept our privacy policy.
        <button onclick="this.parentElement.remove()">Close</button>
      </div>
    `;
    banner.style.display = 'block';
  } else {
    console.warn('[Privacy Banner] Element #privacy-banner introuvable dans le DOM.');
  }
}

function isValidData(data) {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.eventName === 'string' &&
    typeof data.payload === 'object' &&
    data.payload !== null &&
    Object.keys(data.payload).length > 0
  );
}

async function fetchData(url, retries = 3) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[Privacy Banner] Retry #${4 - retries} after failure:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchData(url, retries - 1);
    } else {
      throw error;
    }
  }
}

function sendToMonorail(data) {
  try {
    if (isValidData(data)) {
      navigator.sendBeacon(
        'https://monorail-edge.shopifysvc.com/v1/produce',
        JSON.stringify(data)
      );
      console.log("✅ Consent data sent to Monorail Edge.");
    } else {
      console.warn("⛔ Invalid consent data. Not sent:", data);
    }
  } catch (err) {
    console.error("❌ Error sending data to Monorail Edge:", err);
  }
}

function triggerWebPixelEvent(name, payload = {}) {
  try {
    if (
      window.webPixelsManagerAPI &&
      typeof window.webPixelsManagerAPI.publishCustomEvent === "function"
    ) {
      window.webPixelsManagerAPI.publishCustomEvent(name, payload);
    } else if (
      window.Shopify?.analytics?.replayQueue
    ) {
      window.Shopify.analytics.replayQueue.push([name, payload]);
    }
  } catch (err) {
    console.error("❌ Web Pixels event error:", err);
  }
}

const elementName = 'privacy-banner-element';
const fallbackName = 'shopiweb-privacy-banner-element';

if (!customElements.get(elementName)) {
  try {
    customElements.define(elementName, class extends HTMLElement {
      connectedCallback() {
        // logique au montage (principal)
      }
    });
  } catch (error) {
    console.warn(`⚠️ Failed to define ${elementName}:`, error);
    try {
      customElements.define(fallbackName, class extends HTMLElement {
        connectedCallback() {
          // fallback logique
        }
      });
      console.log(`✅ Defined fallback custom element: ${fallbackName}`);
    } catch (innerError) {
      console.error('❌ Could not define custom element with any name:', innerError);
    }
  }
} else {
  console.log(`ℹ️ ${elementName} is already defined.`);
}

fetchData('https://cdn.shopify.com/s/files/1/0861/3180/2460/files/privacy_settings.json?v=1748186789')
  .then(data => {
    console.log('✅ Privacy settings loaded:', data);

    const eventData = {
      eventName: "consent_banner_displayed",
      payload: {
        consent_state: data.consent_state || 'unknown',
        shop_id: window.Shopify?.shop || 'unknown'
      }
    };

    sendToMonorail(eventData);
    triggerWebPixelEvent("page_viewed", {});
  })
  .catch(error => {
    console.error('⚠️ Privacy settings fetch failed after retries:', error);
    displayDefaultBanner();
  });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".animate__animated.opacity-0").forEach(el => {
    const className = el.dataset.animateClass?.trim();
    if (className) {
      el.classList.add(className);
    }
  });
});