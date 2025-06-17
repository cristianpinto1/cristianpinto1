document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Haz clic en el micrófono para comenzar la transcripción...</em></p>';
    const saveStatusElement = document.getElementById('saveStatus');
    const courseLabelInput = document.getElementById('courseLabelInput'); // Obtener el input

    let recognition;
    let recognizing = false;

    function showSaveStatus(message, isError = false) {
        if (saveStatusElement) {
            saveStatusElement.textContent = message;
            saveStatusElement.className = 'save-status'; // Reset
            if (isError) {
                saveStatusElement.classList.add('error');
            } else {
                saveStatusElement.classList.add('success');
            }
            setTimeout(() => {
                if (saveStatusElement) saveStatusElement.textContent = '';
            }, 3000);
        }
    }

    async function saveTranscription(text_content) {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            // showSaveStatus("Inicia sesión para guardar tus transcripciones."); // Opcional: mensaje si no logueado
            return;
        }

        const course_label_value = courseLabelInput ? courseLabelInput.value.trim() : null;
        // Enviar null si la etiqueta está vacía, de lo contrario enviar el valor.
        const course_label_to_send = course_label_value === "" ? null : course_label_value;

        try {
            const response = await fetch('/api/transcriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text_content: text_content,
                    course_label: course_label_to_send // Usar el valor procesado
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Transcripción guardada:', data);
                showSaveStatus('Transcripción guardada.');
            } else {
                console.error('Error al guardar transcripción:', data.message);
                showSaveStatus(data.message || 'Error al guardar.', true);
            }
        } catch (error) {
            console.error('Error de red al guardar transcripción:', error);
            showSaveStatus('Error de red al guardar.', true);
        }
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = true; // Sigue escuchando
        recognition.interimResults = true; // Muestra resultados parciales
        recognition.lang = 'es-ES'; // Idioma español

        recognition.onstart = () => {
            recognizing = true;
            document.body.classList.add('recording');
            micButton.setAttribute('aria-label', 'Detener Transcripción');

            const listeningIndicatorExists = transcriptionOutput.querySelector('p.listening-indicator');
            if(!listeningIndicatorExists) {
                const listeningP = document.createElement('p');
                listeningP.innerHTML = '<em>Escuchando...</em>';
                listeningP.classList.add('listening-indicator');
                // Si el contenido actual es el placeholder, reemplazarlo.
                if (transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim()) {
                    transcriptionOutput.innerHTML = '';
                    transcriptionOutput.appendChild(listeningP);
                } else {
                    // Si ya hay contenido, añadir "Escuchando..." al final.
                    transcriptionOutput.appendChild(listeningP);
                }
            }
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscriptSegment = '';

            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();

            if (transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim() && event.results.length > 0) {
                 if (event.results[0][0].transcript.length > 0) { // Solo limpiar si hay algo que mostrar
                    transcriptionOutput.innerHTML = '';
                 }
            }

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptSegment += transcriptPart + ' ';
                } else {
                    interimTranscript += transcriptPart;
                }
            }

            if (finalTranscriptSegment) {
                const trimmedFinalSegment = finalTranscriptSegment.trim();
                if (trimmedFinalSegment) {
                    const interimP = transcriptionOutput.querySelector('p.interim');
                    if (interimP) interimP.remove();

                    const newFinalP = document.createElement('p');
                    newFinalP.textContent = trimmedFinalSegment;
                    transcriptionOutput.appendChild(newFinalP);

                    saveTranscription(trimmedFinalSegment);
                }
            }

            if (interimTranscript) { // Mostrar siempre el intermedio si existe
                let currentParagraph = transcriptionOutput.querySelector('p.interim');
                if (!currentParagraph) {
                    currentParagraph = document.createElement('p');
                    currentParagraph.classList.add('interim');
                    transcriptionOutput.appendChild(currentParagraph);
                }
                currentParagraph.innerHTML = `<em>${interimTranscript}</em>`;
            }
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
        };

        recognition.onerror = (event) => {
            console.error('Error en el reconocimiento de voz:', event.error);
            recognizing = false;
            document.body.classList.remove('recording');
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');

            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();
            const interimP = transcriptionOutput.querySelector('p.interim');
            if (interimP) interimP.remove();

            let errorMessage = 'Ocurrió un error con la transcripción.';
            // ... (mensajes de error como antes) ...
            if (event.error === 'no-speech') {
                errorMessage = 'No se detectó voz. Inténtalo de nuevo.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No se pudo acceder al micrófono. Asegúrate de dar permiso.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Permiso para el micrófono denegado. Habilítalo en la configuración de tu navegador.';
            }

            const errorP = document.createElement('p');
            errorP.innerHTML = `<em>${errorMessage}</em>`;
            errorP.classList.add('error-message'); // Para posible estilo
            transcriptionOutput.appendChild(errorP);
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;

            // No detener explícitamente recognition.stop() aquí, onend se encargará si es necesario.
        };

        recognition.onend = () => {
            recognizing = false;
            document.body.classList.remove('recording');
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');

            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();

            const interimP = transcriptionOutput.querySelector('p.interim');
            if (interimP) {
                const finalText = interimP.textContent.trim();
                if (finalText && finalText !== "Escuchando...") { // Evitar guardar "Escuchando..."
                    interimP.classList.remove('interim');
                    interimP.innerHTML = finalText;
                    // No guardamos aquí, ya que se guarda en isFinal. Esto podría ser un fragmento.
                } else {
                    interimP.remove();
                }
            }

            // Si no hay párrafos reales (no intermedios, no errores, no escuchando) y el contenido es vacío o placeholder, restaurar placeholder.
            const meaningfulParagraphs = transcriptionOutput.querySelectorAll('p:not(.interim):not(.listening-indicator):not(.error-message)');
            if (meaningfulParagraphs.length === 0 && transcriptionOutput.textContent.trim() === '') {
                 if (transcriptionOutput.innerHTML.includes('initialPlaceholder')) { // Si el placeholder se renderizó como texto
                    // no hacer nada, ya está el placeholder
                 } else if (!transcriptionOutput.querySelector('.error-message')) { // Y no hay un mensaje de error
                    transcriptionOutput.innerHTML = initialPlaceholder;
                 }
            }
        };

        micButton.addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
            } else {
                // Limpiar mensajes de error previos al intentar de nuevo
                const errorMessages = transcriptionOutput.querySelectorAll('p.error-message');
                errorMessages.forEach(msg => msg.remove());

                // Si el contenido es solo el placeholder, o si solo hay errores, se puede limpiar para el "Escuchando..."
                if (transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim() || errorMessages.length > 0 && transcriptionOutput.querySelectorAll('p:not(.error-message)').length === 0) {
                    // onstart se encargará de poner "Escuchando..."
                }

                try {
                    recognition.start();
                } catch (e) { // Este catch es para errores síncronos al llamar a start()
                    console.error("Error al iniciar el reconocimiento (síncrono):", e);
                    transcriptionOutput.innerHTML = "<p><em>No se pudo iniciar el reconocimiento. Revisa la consola del navegador.</em></p>";
                    document.body.classList.remove('recording');
                    micButton.setAttribute('aria-label', 'Iniciar Transcripción');
                }
            }
        });

    } else {
        micButton.disabled = true;
        micButton.style.backgroundColor = '#ccc';
        micButton.setAttribute('aria-label', 'Reconocimiento de voz no soportado');
        transcriptionOutput.innerHTML = "<p><em>Lo sentimos, tu navegador no soporta la API de reconocimiento de voz. Prueba con Chrome, Edge o Firefox (puede requerir configuración).</em></p>";
        console.warn("Web Speech API no soportada por este navegador.");
    }
});
