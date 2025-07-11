document.addEventListener('DOMContentLoaded', function () {
  const brokenLinks = JSON.parse(localStorage.getItem('brokenLinks') || '[]');
  const links = Array.from(document.querySelectorAll('a[href^="/"]'));

  links.forEach(link => {
    const url = link.href;

    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (!response.ok && response.status === 404) {
          const entry = {
            url,
            text: link.textContent.trim(),
            page: window.location.href,
            timestamp: new Date().toISOString()
          };
          brokenLinks.push(entry);
          localStorage.setItem('brokenLinks', JSON.stringify(brokenLinks));

          // Envoi à Sentry (optionnel)
          if (window.Sentry) {
            Sentry.captureMessage(`Broken link detected: ${url}`, {
              level: 'warning',
              extra: entry
            });
          }
        }
      });
  });

  // ⏰ Simulation envoi toutes les 24h (86 400 000 ms)
  setTimeout(() => {
    const data = JSON.parse(localStorage.getItem('brokenLinks') || '[]');
    if (data.length > 0) {
      fetch('https://your-server.com/api/send-broken-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `📉 Rapport Shopify – Liens cassés (${new Date().toLocaleDateString()})`,
          to: 'hello@yourdomain.com',
          data
        })
      }).then(() => {
        console.log('✅ Rapport envoyé par mail');
        localStorage.removeItem('brokenLinks');
      }).catch(console.error);
    }
  }, 5000); // ou déclenche uniquement si `new Date().getHours() === 4` par ex
});