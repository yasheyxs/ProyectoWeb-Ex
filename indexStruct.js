// Definición de un array con elementos de menú que incluyen texto, ruta y opcionalmente id y función onclick
const menuItems = [
    { text: 'Inicio', path: '../html/privatehome.html' },
    { text: 'Hamburguesas', path: '../html/burger.html' },
    { text: 'Empanadas', path: '../html/empanadas.html' },
    { text: 'Bebidas', path: '../html/bebidas.html' },
    { text: 'Contacto', path: '../html/privatehome.html#contacto' },
    { text: 'Carrito', path: '../html/carrito.html' },
    { text: 'Cerrar sesión', path: '#', id: 'logout-button', onclick: 'handleLogout()' }
];

// Función para llenar la barra de navegación con elementos del menú
function fillNavbar() {
    // Obtener el elemento de la barra de navegación
    const navbar = document.querySelector('.navbar');

    // Limpiar cualquier contenido existente en la barra de navegación
    navbar.innerHTML = '';

    // Iterar sobre cada elemento del menú
    menuItems.forEach(item => {
        // Crear un elemento de lista como un enlace
        const listItem = document.createElement('a');

        // Establecer la ruta y el texto del enlace según los datos del elemento del menú
        listItem.href = item.path;
        listItem.textContent = item.text;

        // Establecer el id del elemento de lista si está presente en el elemento del menú
        listItem.id = item.id;

        // Si hay una función onclick especificada en el elemento del menú, establecerla como atributo
        if (item.onclick) {
            listItem.setAttribute('onclick', item.onclick);
        }

        // Agregar el elemento de lista a la barra de navegación
        navbar.appendChild(listItem);
    });
}

// Esperar a que el DOM esté completamente cargado antes de llamar a fillNavbar
document.addEventListener('DOMContentLoaded', fillNavbar);