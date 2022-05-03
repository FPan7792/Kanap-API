const currentUrl = window.location.href;
const url = new URL(currentUrl);
const orderId = url.searchParams.get("orderId");

const confirmation = document.querySelector("#orderId");

function fillOrderConfirmation() {
  confirmation.style.fontWeight = "bold";
  confirmation.textContent = orderId;
}

fillOrderConfirmation();
