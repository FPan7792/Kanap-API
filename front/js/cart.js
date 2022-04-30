const cartItemSection = document.getElementById('cart__items');
let datasFromAPI;
let BASKET = [];
let couchesToDisplay = [];

fetch('http://localhost:3000/api/products')
	.then((response) => {
		return response.json();
	})
	.then((datas) => {
		function fetchCollectedDatas() {
			datasFromAPI = datas;
		}
		fetchCollectedDatas();
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
		console.log(
			"FROM API: Données appelées de l'api sans traitement ",
			datasFromAPI
		);

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

		console.log('CURRENTBASKET: Données brutes sorties du storage', BASKET);
		console.log(
			'TO DISPLAY: Données parsées pour afficher et retrouver les couleurs et infos facilement',
			couchesToDisplay
		);

		couchesToDisplay.map((couch, index) => {
			const newElem = document.createElement('article');
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

			newElem.classList.add('cart__item');
			newElem.setAttribute('data-id', couch[0]._id);
			newElem.setAttribute('data-color', couch[1].color);
			newElem.setAttribute('data-index', index);

			cartItemSection.appendChild(newElem);
		});
	})
	.then(() => {
		// gerer les infos de la commande finale
		async function displayTotalBasketPrice() {
			const allSelectedItemPrices = [];

			for (Item of couchesToDisplay) {
				allSelectedItemPrices.push(
					Item[0].price * Number(Item[1].quantity)
				);
			}
			let totalPrice = await allSelectedItemPrices.reduce(
				(previousValue, currentValue) => previousValue + currentValue,
				0
			);

			document.querySelector('#totalPrice').textContent = totalPrice + '.00';
		}
		// Gerer la modification et la suppression d'elements dans le panier
		const allArticles = document.querySelectorAll('article');

		// gestion des items par article
		allArticles.forEach((article) => {
			// QUANTITE
			function modifyItemQuantity() {
				const handleQuantity = article.querySelector('.itemQuantity');
				handleQuantity.addEventListener('change', changeCouchQuantity);
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
			}

			// SUPRESSION
			function deleteItem() {
				const deleteButton = article.querySelector('.deleteItem');
				deleteButton.addEventListener('click', removeItemFromLocalStorage);

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
			}

			displayTotalBasketPrice();
			modifyItemQuantity();
			deleteItem();

			const validOrderButton = document.querySelector('#order');
			validOrderButton.addEventListener('click', sendDatasForConfirmation);

			async function sendDatasForConfirmation(event) {
				event.preventDefault();

				// element HTML FORM
				const form = document.querySelector('form');

				// CHAQUE INPUTS
				const firstNameInput = form.querySelector('#firstName').value;
				const lastNameInput = form.querySelector('#lastName').value;
				const addressInput = form.querySelector('#address').value;
				const cityInput = form.querySelector('#city').value;
				const emailInput = form.querySelector('#email').value;
				// ===============

				function inputsChecks() {
					let firstName = false;
					let lastName = false;
					let address = false;
					let city = false;
					let email = false;

					const missingInformations = 'Vous devez remplir cette entrée';
					function generateErrorMessage(
						element,
						message = missingInformations
					) {
						const errorMessage = form.querySelector(`#${element}`);
						errorMessage.textContent = message;
						setTimeout(() => {
							errorMessage.textContent = '';
						}, 4000);
					}

					if (firstNameInput !== '') {
						let validCharacters = firstNameInput.match(/[a-zA-Z]/g);

						if (validCharacters.length !== firstNameInput.length) {
							generateErrorMessage(
								'firstNameErrorMsg',
								'Les chiffres et les caractères spéciaux ne sont pas autorisés pour cette entrée'
							);
						} else firstName = true;
					} else generateErrorMessage('firstNameErrorMsg');

					if (lastNameInput !== '') {
						let validCharacters = lastNameInput.match(/[a-zA-Z]/g);

						if (validCharacters.length !== lastNameInput.length) {
							generateErrorMessage(
								'lastNameErrorMsg',
								'Les chiffres et les caractères spéciaux ne sont pas autorisés pour cette entrée'
							);
						} else lastName = true;
					} else generateErrorMessage('lastNameErrorMsg');

					if (addressInput !== '') {
						address = true;
					} else generateErrorMessage('addressErrorMsg');

					if (cityInput !== '') {
						city = true;
					} else generateErrorMessage('cityErrorMsg');

					if (emailInput !== '') {
						if (!emailInput.includes('@')) {
							generateErrorMessage(
								'emailErrorMsg',
								'Cette entrée doit recevoir une donnée de type email (ex: email@exemple.com)'
							);
						} else email = true;
					} else generateErrorMessage('emailErrorMsg');

					if (firstName && lastName && address && city && email) {
						return true;
					} else return false;
				}

				function collectAndParseDatasfromInputs() {
					let collectedUserDatas = {};
					const validationIsOkay = inputsChecks();
					if (validationIsOkay) {
						collectedUserDatas = {
							firstName: firstNameInput,
							lastName: lastNameInput,
							address: addressInput,
							city: cityInput,
							email: emailInput,
						};

						const arrayOfOrderIDs = [];

						for (Product of BASKET) {
							arrayOfOrderIDs.push(Product.product_id);
						}

						const finalDatasToSend = {
							contact: collectedUserDatas,
							products: arrayOfOrderIDs,
						};

						// OBJET FINAL A ENVOYER
						console.log(finalDatasToSend);

						// envoi de la commande au backend pour confirmation
						function sendfinalOrder() {
							fetch('http://localhost:3000/api/products/order', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(finalDatasToSend),
							});
						}
						sendfinalOrder();
					}
				}

				await collectAndParseDatasfromInputs();
			}
		});
	})
	.catch((e) => console.error(e));
