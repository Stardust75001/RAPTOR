document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("cookieAccepted") || localStorage.getItem("cookieRefused")) return;

  const locale = document.documentElement.lang || "en";

  const translations = {
    fr: {
      message: "Ce site utilise des cookies pour améliorer votre expérience.",
      accept: "OK",
      reject: "Refuser",
      policy: "En savoir plus",
      policyUrl: "/politiques-de-confidentialite"
    },
    en: {
      message: "This website uses cookies to enhance your experience.",
      accept: "OK",
      reject: "Decline",
      policy: "Learn more",
      policyUrl: "/policies/privacy-policy"
    },
    de: {
      message: "Diese Website verwendet Cookies, um Ihr Erlebnis zu verbessern.",
      accept: "OK",
      reject: "Ablehnen",
      policy: "Mehr erfahren",
      policyUrl: "/datenschutz"
    }
  };

  const t = translations[locale] || translations["en"];

  const style = `
    #privacy-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: #ba986e;
      color: #fff;
      padding: 14px 20px;
      font-size: 15px;
      z-index: 9999;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.2);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 10px;
    }
    #privacy-banner button {
      background: #000;
      color: #fff;
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    #privacy-banner a {
      color: #fff;
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      #privacy-banner {
        flex-direction: column;
        font-size: 14px;
        padding: 20px 15px;
      }
      #privacy-banner button {
        width: 100%;
        max-width: 200px;
      }
    }
  `;

  const styleTag = document.createElement("style");
  styleTag.textContent = style;
  document.head.appendChild(styleTag);

  const banner = document.createElement("div");
  banner.id = "privacy-banner";
  banner.innerHTML = `
    <span>${t.message}</span>
    <a href="${t.policyUrl}" target="_blank" rel="noopener">${t.policy}</a>
    <button id="accept-cookies">${t.accept}</button>
    <button id="reject-cookies">${t.reject}</button>
  `;

  document.body.appendChild(banner);

  document.getElementById("accept-cookies").addEventListener("click", function () {
    localStorage.setItem("cookieAccepted", "true");
    banner.remove();
  });

  document.getElementById("reject-cookies").addEventListener("click", function () {
    localStorage.setItem("cookieRefused", "true");
    banner.remove();
  });
});