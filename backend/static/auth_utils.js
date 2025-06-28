// Funciones de utilidad para la autenticación y UI compartida

const API_AUTH_BASE_URL = '/auth'; // Rutas de API comienzan con /auth

function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

async function logout() {
    try {
        const response = await fetch(`${API_AUTH_BASE_URL}/logout`, { method: 'POST' });
        // Asumimos que Flask-Login y el backend manejan la cookie de sesión correctamente.
        // No es necesario enviar headers de autorización especiales si se usan cookies HttpOnly.
        const data = await response.json();
        if (response.ok) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            // alert('Cierre de sesión exitoso.'); // Comentado para UX más fluida
            window.location.href = '/login'; // CAMBIADO: Usar la ruta Flask
        } else {
            alert(data.message || 'Error al cerrar sesión.');
        }
    } catch (error) {
        console.error('Error en logout:', error);
        alert('Error de conexión o del servidor al cerrar sesión.');
    }
}

function updateNavigation() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    // Estas rutas deben coincidir con las definidas en main_routes.py
    const transcripcionUrl = '/';       // Ruta para index_page
    const historialUrl = '/historial'; // Ruta para historial_page
    const loginUrl = '/login';         // Ruta para login_page
    const registroUrl = '/register';   // Ruta para register_page

    if (isLoggedIn()) {
        const user = getCurrentUser();
        nav.innerHTML = `
            <a href="${transcripcionUrl}">Transcripción</a>
            <a href="${historialUrl}">Historial</a>
            <span style="color: #e0e0e0; margin-left:15px;">Hola, ${user ? user.username : 'Usuario'}!</span>
            <button id="logoutButton" class="nav-button">Cerrar Sesión</button>
        `;
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    } else {
        nav.innerHTML = `
            <a href="${transcripcionUrl}">Transcripción</a>
            <a href="${loginUrl}">Iniciar Sesión</a>
            <a href="${registroUrl}">Registrarse</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});
