const cartItemSection = document.getElementById("cart__items");
let datasFromAPI;
let BASKET = [];
let couchesToDisplay = [];

fetch("http://localhost:3000/api/products")
  .then((response) => {
    return response.json();
  })
  .then((datas) => {
    datasFromAPI = datas;
  })
  .then(() => {
    const getValuesFromLocalStorage = () => {
      const KEYS = [];

      for (i = 0; i < localStorage.length; i++) {
        KEYS.push(localStorage.key([i]));
      }

      for (key of KEYS) {
        BASKET.push(JSON.parse(localStorage[key]));
      }
    };

    getValuesFromLocalStorage();
    // console.log(
    //   "FROM API: Données appelées de l'api sans traitement ",
    //   datasFromAPI
    // );

    for (Item of BASKET) {
      for (Couch of datasFromAPI) {
        if (Item.product_id === Couch._id) {
          couchesToDisplay.push([
            Couch,
            {
              color: Item.product_color,
              quantity: Item.product_quantity,
            },
          ]);
        }
      }
    }

    // console.log("CURRENTBASKET: Données brutes sorties du storage", BASKET);
    // console.log(
    //   "TO DISPLAY: Données parsées pour afficher et retrouver les couleurs et infos facilement",
    //   couchesToDisplay
    // );

    couchesToDisplay.map((couch, index) => {
      const newElem = document.createElement("article");
      newElem.innerHTML = `
				        <div class="cart__item__img">
				        <img src=${couch[0].imageUrl} alt=${couch[0].name}>
				      </div>
				      <div class="cart__item__content">
				        <div class="cart__item__content__description">
				          <h2>${couch[0].name}</h2>
				          <p>${couch[1].color}</p>
				          <p>${couch[0].price}</p>
				        </div>
				        <div class="cart__item__content__settings">
				          <div class="cart__item__content__settings__quantity">
				            <p>Qté : </p>
				            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value=${couch[1].quantity}>
				          </div>
				          <div class="cart__item__content__settings__delete">
				            <p class="deleteItem">Supprimer</p>
				          </div>
				        </div>
				      </div>`;

      newElem.classList.add("cart__item");
      newElem.setAttribute("data-id", couch[0]._id);
      newElem.setAttribute("data-color", couch[1].color);
      newElem.setAttribute("data-index", index);

      cartItemSection.appendChild(newElem);
    });
  })
  .then(() => {
    // gerer les infos de la commande finale
    async function displayTotalBasketPrice() {
      const allSelectedItemPrices = [];

      for (Item of couchesToDisplay) {
        allSelectedItemPrices.push(Item[0].price * Number(Item[1].quantity));
      }
      let totalPrice = await allSelectedItemPrices.reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        0
      );

      document.querySelector("#totalPrice").textContent = totalPrice + ".00";
    }
    // Gerer la modification et la suppression d'elements dans le panier
    const allArticles = document.querySelectorAll("article");

    // gestion des items par article
    allArticles.forEach((article) => {
      async function changeCouchQuantity(e) {
        const itemToModify = BASKET.findIndex(
          (item) =>
            item.product_id === article.dataset.id &&
            item.product_color === article.dataset.color
        );

        BASKET[itemToModify].product_quantity = e.target.value;

        await localStorage.setItem(
          localStorage.key(itemToModify),
          JSON.stringify(BASKET[itemToModify])
        );

        window.location.reload();
      }

      async function removeItemFromLocalStorage() {
        const itemToDelete = BASKET.findIndex(
          (item) =>
            item.product_id === article.dataset.id &&
            item.product_color === article.dataset.color
        );

        await localStorage.removeItem(localStorage.key(itemToDelete));
        BASKET.splice(itemToDelete, 1);
        window.location.reload();
      }

      displayTotalBasketPrice();

      // modifier QUANTITE
      const handleQuantity = article.querySelector(".itemQuantity");
      handleQuantity.addEventListener("change", changeCouchQuantity);
      //  ==========================

      // gerer SUPRESSION
      const deleteButton = article.querySelector(".deleteItem");
      deleteButton.addEventListener("click", removeItemFromLocalStorage);
      //  ==========================

      //   PARTIE ENVOIE DES DONNEES AU BACK
      //  ========================================================================>

      //   ENVOIE DES DONNES SAINES ET CONFIRMATION DE LA COMMANDE
      const validOrderButton = document.querySelector("#order");
      validOrderButton.addEventListener("click", sendDatasToAPIForConfirmation);

      // element HTML FORM
      const form = document.querySelector("form");

      // CHAQUE INPUTS
      let firstNameInput;
      let lastNameInput;
      let addressInput;
      let cityInput;
      let emailInput;
      // ===============

      async function sendDatasToAPIForConfirmation(event) {
        updateInputsValues();
        event.preventDefault();

        await collectAndSendDatasfromInputs(
          firstNameInput,
          lastNameInput,
          addressInput,
          cityInput,
          emailInput
        );
      }

      // GESTION DES ERREURS
      const missingInformations = "Vous devez remplir cette entrée";
      function generateErrorMessage(element, message = missingInformations) {
        const errorMessage = form.querySelector(`#${element}`);
        errorMessage.textContent = message;
        setTimeout(() => {
          errorMessage.textContent = "";
        }, 4000);
      }

      // vérification de chaque entrée du formulaire
      function inputsChecks(
        firstNameInput,
        lastNameInput,
        addressInput,
        cityInput,
        emailInput
      ) {
        let firstName = false;
        let lastName = false;
        let address = false;
        let city = false;
        let email = false;

        if (firstNameInput !== "") {
          let validCharacters = firstNameInput.match(/[a-zA-Z]/g);

          if (validCharacters.length !== firstNameInput.length) {
            generateErrorMessage(
              "firstNameErrorMsg",
              "Les chiffres et les caractères spéciaux ne sont pas autorisés pour cette entrée"
            );
          } else firstName = true;
        } else generateErrorMessage("firstNameErrorMsg");

        if (lastNameInput !== "") {
          let validCharacters = lastNameInput.match(/[a-zA-Z]/g);

          if (validCharacters.length !== lastNameInput.length) {
            generateErrorMessage(
              "lastNameErrorMsg",
              "Les chiffres et les caractères spéciaux ne sont pas autorisés pour cette entrée"
            );
          } else lastName = true;
        } else generateErrorMessage("lastNameErrorMsg");

        if (addressInput !== "") {
          address = true;
        } else generateErrorMessage("addressErrorMsg");

        if (cityInput !== "") {
          city = true;
        } else generateErrorMessage("cityErrorMsg");

        if (emailInput !== "") {
          if (!emailInput.includes("@")) {
            generateErrorMessage(
              "emailErrorMsg",
              "Cette entrée doit recevoir une donnée de type email (ex: email@exemple.com)"
            );
          } else email = true;
        } else generateErrorMessage("emailErrorMsg");

        if (firstName && lastName && address && city && email) {
          return true;
        } else return false;
      }

      //   ENVOIE DES DONNES FINALES AU BACKEND
      function sendFinalOrder(url, datas) {
        console.log(datas);
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datas),
        })
          .then((datas) => datas.json())
          .then((result) => {
            console.log("DATAS ENVOYEE AVEC SUCCES VOICI LES DATAS", result);
            window.location.assign(
              `http://127.0.0.1:5500/html/confirmation.html?orderId=${result.orderId}`
            );
          });
      }

      async function updateInputsValues() {
        firstNameInput = form.querySelector("#firstName").value;
        lastNameInput = form.querySelector("#lastName").value;
        addressInput = form.querySelector("#address").value;
        cityInput = form.querySelector("#city").value;
        emailInput = form.querySelector("#email").value;
      }

      // Recuperation des données saines après validation des inputs
      async function collectAndSendDatasfromInputs(
        firstName,
        lastName,
        address,
        city,
        email
      ) {
        let collectedUserDatas = {};

        const validationIsOkay = inputsChecks(
          firstName,
          lastName,
          address,
          city,
          email
        );

        if (validationIsOkay) {
          collectedUserDatas = {
            firstName,
            lastName,
            address,
            city,
            email,
          };

          const arrayOfOrderIDs = [];

          for (Product of BASKET) {
            arrayOfOrderIDs.push(Product.product_id);
          }

          const finalDatasToSend = {
            contact: collectedUserDatas,
            products: arrayOfOrderIDs,
          };

          // OK
          await sendFinalOrder(
            "http://localhost:3000/api/products/order",
            finalDatasToSend
          );
        }
      }
    });
  })
  .catch((e) => console.error(e));
