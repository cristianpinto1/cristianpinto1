// Funciones de utilidad para la autenticación y UI compartida

const API_AUTH_BASE_URL = '/auth';

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
        const data = await response.json();
        if (response.ok) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            // alert('Cierre de sesión exitoso.'); // O un mensaje más sutil
            window.location.href = 'login.html'; // Redirigir a login
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

    if (isLoggedIn()) {
        const user = getCurrentUser();
        nav.innerHTML = `
            <a href="index.html">Transcripción</a>
            <a href="historial.html">Historial</a>
            <span style="color: #e0e0e0; margin-left:15px;">Hola, ${user ? user.username : 'Usuario'}!</span>
            <button id="logoutButton" class="nav-button">Cerrar Sesión</button>
        `;
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    } else {
        nav.innerHTML = `
            <a href="index.html">Transcripción</a>
            <a href="login.html">Iniciar Sesión</a>
            <a href="register.html">Registrarse</a>
        `;
    }
}

// Ejecutar al cargar el script para todas las páginas que lo incluyan
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});
