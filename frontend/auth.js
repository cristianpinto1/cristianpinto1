document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');

    const API_BASE_URL = '/auth'; // Usamos rutas relativas, asumiendo que el frontend se sirve desde el mismo dominio/puerto o proxy

    // Función para mostrar mensajes
    function showMessage(message, isError = false) {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = 'auth-message'; // Reset class
            if (isError) {
                authMessage.classList.add('error');
            } else {
                authMessage.classList.add('success');
            }
        }
    }

    // Manejador para el formulario de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(''); // Limpiar mensajes previos

            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            if (!username || !email || !password) {
                showMessage('Todos los campos son obligatorios.', true);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('¡Registro exitoso! Redirigiendo al inicio...');
                    // Guardar info del usuario o token si es necesario (Flask-Login usa cookies de sesión por defecto)
                    // Por ejemplo, podríamos guardar el estado de logueado:
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));

                    setTimeout(() => {
                        window.location.href = 'index.html'; // Redirigir a la página principal
                    }, 2000);
                } else {
                    showMessage(data.message || 'Error en el registro.', true);
                }
            } catch (error) {
                console.error('Error en registro:', error);
                showMessage('Error de conexión o del servidor.', true);
            }
        });
    }

    // Manejador para el formulario de Inicio de Sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage(''); // Limpiar mensajes previos

            const identifier = loginForm.identifier.value; // username o email
            const password = loginForm.password.value;

            if (!identifier || !password) {
                showMessage('Todos los campos son obligatorios.', true);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('¡Inicio de sesión exitoso! Redirigiendo...');
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));

                    setTimeout(() => {
                        // Idealmente, redirigir a la página de historial o a la principal
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showMessage(data.message || 'Error en el inicio de sesión.', true);
                }
            } catch (error) {
                console.error('Error en login:', error);
                showMessage('Error de conexión o del servidor.', true);
            }
        });
    }

    // Lógica para logout (ejemplo, podría estar en un script global o en el header)
    // Esto es un ejemplo y necesitaría un botón/enlace de logout en el HTML.
    // Por ahora, lo dejamos aquí como referencia.
    /*
    const logoutButton = document.getElementById('logoutButton'); // Asumiendo que existe este botón
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/logout`, { method: 'POST' });
                const data = await response.json();
                if (response.ok) {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('currentUser');
                    showMessage('Cierre de sesión exitoso.');
                    window.location.href = 'login.html';
                } else {
                    showMessage(data.message || 'Error al cerrar sesión.', true);
                }
            } catch (error) {
                console.error('Error en logout:', error);
                showMessage('Error de conexión o del servidor.', true);
            }
        });
    }
    */

    // Verificar estado de login al cargar cualquier página que incluya auth.js
    // Esto es más para actualizar la UI, la protección de rutas real es del backend.
    // Lo moveremos a un script global o a las páginas relevantes más adelante.
    /*
    async function checkLoginStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/status`);
            const data = await response.json();
            if (data.logged_in) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                // Aquí se podría actualizar la UI, ej. mostrar nombre de usuario, ocultar login/register
            } else {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                // Actualizar UI, ej. mostrar login/register
            }
        } catch (error) {
            console.error('Error al verificar estado de login:', error);
            // Mantener estado local si hay error de red
        }
    }
    // checkLoginStatus(); // Llamar al cargar
    */
});
