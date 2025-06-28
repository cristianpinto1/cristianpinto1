document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
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
        transcriptionListContainer.innerHTML = '';
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';

        let queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (course) queryParams.append('course', course);

        const url = `${API_TRANSCRIPTIONS_URL}?${queryParams.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
                    logout();
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
        transcriptions.forEach((t, index) => { // Añadido index para IDs únicos de resumen
            const item = document.createElement('div');
            item.className = 'transcription-item';
            item.setAttribute('data-id', t.id);

            const formattedDate = new Date(t.timestamp).toLocaleString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            let summaryHTML = '';
            if (t.summary && t.summary.trim() !== '') {
                const summaryId = `summary-${t.id}-${index}`; // ID único para el div del resumen
                summaryHTML = `
                    <div class="item-summary-container">
                        <button class="toggle-summary-button" data-summary-target="#${summaryId}">Mostrar Resumen</button>
                        <div class="item-summary" id="${summaryId}" style="display:none;">
                            <h4>Resumen:</h4>
                            <p>${t.summary.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                `;
            }

            item.innerHTML = `
                <button class="delete-button" title="Eliminar transcripción" data-id="${t.id}">×</button>
                <div class="item-header">
                    <span class="item-date">${formattedDate}</span>
                    <span class="item-course">${t.course_label || ''}</span>
                </div>
                <div class="item-content">
                    <p>${t.text_content.replace(/\n/g, '<br>')}</p>
                </div>
                ${summaryHTML}
            `; // Se añade el HTML del resumen aquí
            transcriptionListContainer.appendChild(item);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteTranscription);
        });

        document.querySelectorAll('.toggle-summary-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.dataset.summaryTarget;
                const summaryDiv = document.querySelector(targetId);
                if (summaryDiv) {
                    if (summaryDiv.style.display === 'none') {
                        summaryDiv.style.display = 'block';
                        e.target.textContent = 'Ocultar Resumen';
                    } else {
                        summaryDiv.style.display = 'none';
                        e.target.textContent = 'Mostrar Resumen';
                    }
                }
            });
        });
    }

    async function handleDeleteTranscription(event) {
        const transcriptionId = event.target.dataset.id;
        if (!transcriptionId) return;

        if (!confirm("¿Estás seguro de que quieres eliminar esta transcripción? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await fetch(`${API_TRANSCRIPTIONS_URL}/${transcriptionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const itemToRemove = document.querySelector(`.transcription-item[data-id="${transcriptionId}"]`);
                if (itemToRemove) itemToRemove.remove();
                // alert("Transcripción eliminada exitosamente."); // Quitar alerta para UX más fluida
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

    fetchAndDisplayTranscriptions();
});
