const currentUrl = window.location.href;
const url = new URL(currentUrl);
const orderId = url.searchParams.get("orderId");

/**
 * affiche le numero de commande
 
 */
function fillOrderConfirmation() {
  const confirmation = document.querySelector("#orderId");

  confirmation.style.fontWeight = "bold";
  confirmation.textContent = orderId;
}

fillOrderConfirmation();
