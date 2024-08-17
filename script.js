function handleLogin(event) {
    event.preventDefault();

    // Obtener valores de los campos de correo electrónico y contraseña
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Realizar una solicitud fetch para obtener datos de usuario desde JSON
    fetch('../user.json')
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            // Buscar el usuario que coincide con el correo electrónico y la contraseña
            const user = data.users.find(u => u.email === email && u.password === password);

            // Si se encuentra el usuario, almacenar sus datos en sessionStorage y redirigir
            if (user) {
                sessionStorage.setItem('user', JSON.stringify(user));
                window.location.href = '../html/privatehome.html';
            } else {
                console.error('Credenciales incorrectas');
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function handleRegistration(event) {
    event.preventDefault();

    // Obtener valores de los campos de registro
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const birthdate = document.getElementById('register-birthdate').value;

    // Crear un objeto de usuario con los datos proporcionados
    const user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        birthdate: birthdate,
    };

    // Almacenar los datos del usuario en sessionStorage y redirigir
    sessionStorage.setItem('user', JSON.stringify(user));
    window.location.href = '../html/privatehome.html';
}

function isLoggedIn() {
    return sessionStorage.getItem('user') !== null;
}

function handleLogout() {
    sessionStorage.removeItem('user');
    window.location.href = '../html/loginregister.html';
}

// Función para crear una card para un producto
function createCard(product) {
    const card = document.createElement('div');
    card.classList.add('box');
    card.id = `${product.category.toLowerCase()}-${product.id}`;
    card.innerHTML = `
        <span class="price"> $${product.price} </span>
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <a class="btn" onclick="addToCart(${product.id})">Pídela ahora</a>
        <div class="container">
            <button class="decrement" onclick="stepper(document.getElementById('my-input-${product.id}'), false)"> - </button>
            <input type="number" value="0" min="0" max="20" step="1" id="my-input-${product.id}" readonly>
            <button class="increment" onclick="stepper(document.getElementById('my-input-${product.id}'), true)"> + </button>
        </div>
    `;
    return card;
}

// Función para renderizar productos en un contenedor específico
function renderProducts(container, category) {
    const productContainer = document.getElementById(container);

    if (productContainer) {
        //solicitud fetch para obtener datos de productos desde el JSON
        fetch('../productos.json')
            .then(res => res.json())
            .then(data => {
                const products = data.categories.find(cat => cat.name === category);

                if (products) {
                    // Crear cards para cada producto y agregarlas al contenedor
                    products.products.forEach(product => {
                        const card = createCard({ ...product, category: category });
                        productContainer.appendChild(card);
                    });
                } else {
                    console.error(`Products not found for category: ${category}`);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    } else {
        console.error(`Product container with id '${container}' not found`);
    }
}

function stepper(input, isIncrement) {
    // Obtener valores de atributos del input
    let min = parseInt(input.getAttribute("min"));
    let max = parseInt(input.getAttribute("max"));
    let step = parseInt(input.getAttribute("step"));
    let val = parseInt(input.value);
    let calcStep = isIncrement ? step : -step;
    let newValue = val + calcStep;

    // Asegurarse de que el nuevo valor esté dentro de los límites
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
    }
}

// Función asincrónica para agregar un producto al carrito
async function addToCart(productId) {
    // Obtener el producto por su ID
    const product = await getProductById(productId);
    const quantityInput = document.getElementById(`my-input-${productId}`);
    const quantity = parseInt(quantityInput.value, 10);

    // Verificar la validez de la cantidad y la existencia del producto
    if (!isNaN(quantity) && quantity > 0 && product) {
        const cartItem = { ...product, quantity };
        addToLocalStorageCart(cartItem);
        showNotification('Tu producto ha sido agregado al carrito de compras');
        setTimeout(() => {
            closeNotification();
        }, 2000);
        window.location.reload();
    } else {
        console.error('Cantidad inválida o producto no encontrado');
    }
}

function showNotification(message) {
    alert(message);
}

function closeNotification() {
    // La ventana emergente se cerrará automáticamente
}

// Función asincrónica para obtener un producto por su ID
async function getProductById(productId) {
    try {
        const response = await fetch('../productos.json');
        const data = await response.json();
        for (const category of data.categories) {
            const product = category.products.find(p => p.id === productId);
            if (product) {
                return { ...product, category: category.name };
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

// Función para agregar un artículo al carrito en el almacenamiento local
function addToLocalStorageCart(cartItem) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === cartItem.id);

    // Actualizar la cantidad si el artículo ya está en el carrito, de lo contrario, agregarlo
    if (existingItem) {
        existingItem.quantity += cartItem.quantity;
    } else {
        cart.push(cartItem);
    }

    // Almacenar el carrito actualizado en el localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para actualizar la interfaz de usuario del carrito
function updateCartUI() {
    const cartContainer = document.getElementById('carrito-container');
    const realizarCompraBtn = document.getElementById('realizar-compra-btn');
    if (cartContainer && realizarCompraBtn) {
        cartContainer.innerHTML = '';
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;

        // Crear tarjetas de carrito para cada artículo y calcular el total
        for (const item of cart) {
            const cartCard = createCartCard(item);
            cartContainer.appendChild(cartCard);
            total += item.price * item.quantity;
        }

        // Actualizar el total y mostrar o ocultar el botón de compra
        updateTotal(total);

        if (cart.length > 0) {
            realizarCompraBtn.style.display = 'block';
        } else {
            realizarCompraBtn.style.display = 'none';
        }
    } else {
        console.error('Elemento con ID "carrito-container" o "realizar-compra-btn" no encontrado');
    }
}

// Función para crear una tarjeta de carrito para un artículo
function createCartCard(cartItem) {
    const cartCard = document.createElement('div');
    cartCard.classList.add('cart-box');
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('cart-img-container');
    imgContainer.innerHTML = `<img src="${cartItem.image}" alt="${cartItem.name}">`;
    const textContainer = document.createElement('div');
    textContainer.classList.add('cart-text-container');
    const totalPrice = !isNaN(cartItem.price) && !isNaN(cartItem.quantity) ? Math.abs(cartItem.price * cartItem.quantity) : 0;
    textContainer.innerHTML = `
        <h3 style="font-size: 2.5rem;">${cartItem.name}</h3>
        <p style="font-size: 2rem;">Cantidad: ${cartItem.quantity}</p>
        <span class="price" style="font-size: 2rem;"> $${totalPrice.toFixed(2)}</span>
        <button class="remove-btn" onclick="removeFromCart(${cartItem.id})">Eliminar</button>
    `;
    cartCard.appendChild(imgContainer);
    cartCard.appendChild(textContainer);

    updateTotal(totalPrice);
    return cartCard;
}

// Función para eliminar un artículo
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const removedItem = cart.find(item => item.id === productId);
    
    if (removedItem) {
        const removedItemTotal = removedItem.price * removedItem.quantity;
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateTotalAndUI(cart);
    }
}

// Función para actualizar el total y la interfaz de usuario del carrito
function updateTotalAndUI(cart) {
    const total = cart.length > 0 ? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0;
    updateTotal(total);
    updateCartUI();
}

// Función para actualizar el total mostrado en la interfaz de usuario
function updateTotal(price) {
    const currentTotalElement = document.getElementById('total-price');
    if (currentTotalElement) {
        currentTotalElement.innerText = `$${price.toFixed(2)}`;
    }
}

// Función para realizar la compra y mostrar un mensaje de agradecimiento
function realizarCompra() {
    alert("Gracias por tu compra!");
    localStorage.removeItem('cart');
    updateCartUI();
    updateTotal(0);
}
