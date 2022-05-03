class Couch {
  constructor(index, colors, _id, name, price, imageUrl, description, altTxt) {
    this.index = index;
    this.colors = colors;
    this._id = _id;
    this.name = name;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this.altTxt = altTxt;
  }
}

const itemsSection = document.getElementById("items"); // section qui va contenir les données dynamiques
const tabOfCouches = []; // tableau qui va contenir les données de l'api une fois traitées

function displayError(error) {
  console.log(error);
  const item = document.createElement("p");
  item.textContent = error;
  itemsSection.appendChild(item);
}

function fillItemsSectionWithDatas() {
  tabOfCouches.forEach((elem) => {
    // creation d'une carte dans le HTML pour chaque element du tableau
    const item = document.createElement("a");

    item.setAttribute("href", `./product.html?id=${elem._id}`);

    item.innerHTML = `<article>
              <img src=${elem.imageUrl} alt=${elem.altTxt}>
              <h3 class="productName">${elem.name}</h3>
              <p class="productDescription">${elem.description}</p>
            </article>`;

    itemsSection.appendChild(item);
  });
}

getDatasFromAPI();

function getDatasFromAPI() {
  fetch("http://localhost:3000/api/products")
    .then((response) => {
      return response.json();
    })
    .then((datas) => {
      for (Element of datas) {
        const newCouch = new Couch(
          tabOfCouches.length,
          Element.colors,
          Element._id,
          Element.name,
          Element.price,
          Element.imageUrl,
          Element.description,
          Element.altTxt
        );

        tabOfCouches.push(newCouch);
      }
    })
    .catch((e) => displayError(e))
    .then(fillItemsSectionWithDatas)
    .finally(() => console.log(tabOfCouches));
}
