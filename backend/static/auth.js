document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');

    const API_BASE_URL = '/auth';

    function showMessage(message, isError = false) {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = 'auth-message';
            if (isError) authMessage.classList.add('error');
            else authMessage.classList.add('success');
        }
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage('');

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
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = '/'; // CAMBIADO: Usar la ruta Flask para la página principal
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

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showMessage('');

            const identifier = loginForm.identifier.value;
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
                        window.location.href = '/'; // CAMBIADO: Usar la ruta Flask para la página principal
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
});
