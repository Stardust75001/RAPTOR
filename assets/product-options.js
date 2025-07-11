document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.product-option').forEach(input => {
    input.addEventListener('change', handleProductOptionChange);
  });
});

function handleProductOptionChange(e) {
  const form = e.target.closest('form') || document;
  const productId = e.target.dataset.productId;
  const selectedOptions = [];

  form.querySelectorAll(`.product-option[name^="option-"]`).forEach(el => {
    if (el.tagName === 'SELECT' || el.checked) {
      selectedOptions.push(el.value);
    }
  });

  const variants = window.productVariants[productId];
  const matchedVariant = variants.find(v =>
    v.options.every((opt, i) => opt === selectedOptions[i])
  );

  if (matchedVariant) {
    // ✅ MAJ prix
    const priceEl = document.querySelector(`.product-price[data-product-id="${productId}"]`);
    if (priceEl) {
      priceEl.textContent = Shopify.formatMoney(matchedVariant.price, "{{ shop.money_format }}");
    }

    // ✅ MAJ image
    const imageEl = document.querySelector(`.product-image[data-product-id="${productId}"]`);
    if (imageEl && matchedVariant.featured_image) {
      imageEl.src = matchedVariant.featured_image;
    }

    // ✅ MAJ input hidden ID
    const variantInput = document.querySelector(`input[name="id"][data-product-id="${productId}"]`);
    if (variantInput) {
      variantInput.value = matchedVariant.id;
    }

    // ✅ MAJ bouton ATC
    const atcBtn = document.querySelector(`#add-to-cart-${productId}`);
    if (atcBtn) {
      atcBtn.disabled = !matchedVariant.available;
      atcBtn.innerText = matchedVariant.available ? 'Ajouter au panier' : 'Indisponible';
    }
  }
}