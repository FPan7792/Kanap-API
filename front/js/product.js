const currentUrl = window.location.href;
const url = new URL(currentUrl);
const id = url.searchParams.get("id");
console.log(id);

let requestedCouch; // l'élement produit ciblé par la requete
const titleInHead = document.querySelector("title");
const title = document.getElementById("title");
const price = document.getElementById("price");
const description = document.getElementById("description");
const colorSelection = document.querySelector("select"); // il faudra y ajouter 2 elements option + les values + le texte
const requestedQuantity = document.querySelector("#quantity");

const fillPageWithDatas = () => {
  titleInHead.textContent = requestedCouch.name;
  title.textContent = requestedCouch.name;
  price.textContent = requestedCouch.price;
  description.textContent = requestedCouch.description;

  requestedCouch.colors.forEach((color) => {
    const colorOption = document.createElement("option");
    colorOption.value = color;
    colorOption.textContent = color;
    colorSelection.appendChild(colorOption);
  });
};

fetch("http://localhost:3000/api/products")
  .then((response) => {
    return response.json();
  })
  .then((datas) => {
    for (Element of datas) {
      if (Element._id === id) {
        requestedCouch = Element;
      }
    }
  })
  .catch((e) => console.error(e))
  .then(() => {
    fillPageWithDatas(); // remplir la page de données
  });

const addItemToBasket = async () => {
  if (colorSelection.value !== "") {
    requestedQuantity.value++;

    let itemToAdd = {
      product_id: id,
      product_quantity: requestedQuantity.value,
      product_color: colorSelection.value,
    };

    parsedItemToAdd = JSON.stringify(itemToAdd);

    await localStorage.setItem(
      requestedCouch.name + " " + colorSelection.value,
      parsedItemToAdd
    );
  } else alert("Veuillez choisir une couleur pour votre produit");
};

const addToCartButton = document.querySelector("#addToCart");

addToCartButton.addEventListener("click", addItemToBasket);
colorSelection.addEventListener("change", () => (requestedQuantity.value = 0));
