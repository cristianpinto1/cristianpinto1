document.addEventListener('DOMContentLoaded', async () => {
    // auth_utils.js ya se encarga de la navegación y estado de login global.
    // Aquí nos enfocamos en la lógica de la página de historial.

    if (!isLoggedIn()) {
        // Si auth_utils.js no redirige, lo hacemos aquí como fallback.
        // O mejor, auth_utils.js podría tener una función ensureLoggedIn().
        alert("Debes iniciar sesión para ver tu historial.");
        window.location.href = 'login.html';
        return;
    }

    const transcriptionListContainer = document.getElementById('transcriptionListContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const dateFilterInput = document.getElementById('dateFilter');
    const courseFilterInput = document.getElementById('courseFilter');
    const applyFilterButton = document.getElementById('applyFilterButton');
    const clearFilterButton = document.getElementById('clearFilterButton');

    const API_TRANSCRIPTIONS_URL = '/api/transcriptions';

    async function fetchAndDisplayTranscriptions(date = '', course = '') {
        transcriptionListContainer.innerHTML = ''; // Limpiar lista anterior
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';

        let queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (course) queryParams.append('course', course);

        const url = `${API_TRANSCRIPTIONS_URL}?${queryParams.toString()}`;

        try {
            const response = await fetch(url); // GET por defecto
            if (!response.ok) {
                if (response.status === 401) { // No autorizado
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    logout(); // Usar la función de auth_utils.js
                    return;
                }
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const transcriptions = await response.json();
            loadingMessage.style.display = 'none';

            if (transcriptions.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                displayTranscriptions(transcriptions);
            }

        } catch (error) {
            console.error('Error al cargar transcripciones:', error);
            loadingMessage.style.display = 'none';
            transcriptionListContainer.innerHTML = '<p class="error-message">Error al cargar el historial. Inténtalo de nuevo más tarde.</p>';
        }
    }

    function displayTranscriptions(transcriptions) {
        transcriptions.forEach(t => {
            const item = document.createElement('div');
            item.className = 'transcription-item';
            item.setAttribute('data-id', t.id);

            const formattedDate = new Date(t.timestamp).toLocaleString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            item.innerHTML = `
                <button class="delete-button" title="Eliminar transcripción" data-id="${t.id}">×</button>
                <div class="item-header">
                    <span class="item-date">${formattedDate}</span>
                    <span class="item-course">${t.course_label || ''}</span>
                </div>
                <div class="item-content">
                    <p>${t.text_content.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            transcriptionListContainer.appendChild(item);
        });

        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteTranscription);
        });
    }

    async function handleDeleteTranscription(event) {
        const transcriptionId = event.target.dataset.id;
        if (!transcriptionId) return;

        if (!confirm("¿Estás seguro de que quieres eliminar esta transcripción? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            // Necesitamos un endpoint DELETE en el backend: /api/transcriptions/<id>
            const response = await fetch(`${API_TRANSCRIPTIONS_URL}/${transcriptionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Eliminar el elemento del DOM
                const itemToRemove = document.querySelector(`.transcription-item[data-id="${transcriptionId}"]`);
                if (itemToRemove) itemToRemove.remove();
                alert("Transcripción eliminada exitosamente.");
                // Si la lista queda vacía, mostrar mensaje
                if (transcriptionListContainer.children.length === 0) {
                    noResultsMessage.style.display = 'block';
                }

            } else {
                 if (response.status === 401) {
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    logout();
                    return;
                }
                const data = await response.json();
                alert(data.message || "Error al eliminar la transcripción.");
            }
        } catch (error) {
            console.error('Error al eliminar transcripción:', error);
            alert("Error de red o del servidor al intentar eliminar.");
        }
    }


    applyFilterButton.addEventListener('click', () => {
        fetchAndDisplayTranscriptions(dateFilterInput.value, courseFilterInput.value.trim());
    });

    clearFilterButton.addEventListener('click', () => {
        dateFilterInput.value = '';
        courseFilterInput.value = '';
        fetchAndDisplayTranscriptions();
    });

    // Carga inicial
    fetchAndDisplayTranscriptions();

    // NOTA: La funcionalidad de eliminar transcripción (handleDeleteTranscription)
    // requiere un nuevo endpoint en el backend: DELETE /api/transcriptions/<id>
    // Esto se abordará en un paso posterior si se decide implementar.
});
