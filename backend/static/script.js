document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');
    const micButtonSVG = micButton.querySelector('svg path'); // Para cambiar el ícono si es necesario
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Haz clic en el micrófono para comenzar la transcripción...</em></p>';
    const saveStatusElement = document.getElementById('saveStatus');
    const courseLabelInput = document.getElementById('courseLabelInput');
    const currentSummaryOutputContainer = document.getElementById('currentSummaryOutputContainer');
    const currentSummaryOutput = document.getElementById('currentSummaryOutput');

    let recognition;
    let recognizing = false;
    let currentSessionTranscript = "";

    // Íconos SVG como strings (ejemplos simples, podrían ser más elaborados)
    const micIconPath = "M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H208V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z";
    const stopIconPath = "M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"; // Un cuadrado simple para stop

    function updateMicButtonUI(isRecording) {
        if (isRecording) {
            micButton.setAttribute('aria-label', 'Detener y Guardar Transcripción');
            // micButtonSVG.setAttribute('d', stopIconPath); // Cambiar a ícono de stop
            micButton.classList.add('is-recording'); // Para cambiar color/estilo con CSS
            document.body.classList.add('recording'); // Para animaciones de ondas, etc.
        } else {
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');
            // micButtonSVG.setAttribute('d', micIconPath); // Cambiar a ícono de mic
            micButton.classList.remove('is-recording');
            document.body.classList.remove('recording');
        }
    }

    function showSaveStatus(message, isError = false) {
        // ... (sin cambios)
        if (saveStatusElement) {
            saveStatusElement.textContent = message;
            saveStatusElement.className = 'save-status';
            if (isError) saveStatusElement.classList.add('error');
            else saveStatusElement.classList.add('success');
            setTimeout(() => { if (saveStatusElement) saveStatusElement.textContent = ''; }, 3000);
        }
    }

    function displayCurrentSummary(summaryText) {
        // ... (sin cambios)
        if (currentSummaryOutputContainer && currentSummaryOutput) {
            if (summaryText && summaryText.trim() !== "") {
                currentSummaryOutput.innerHTML = `<p>${summaryText.replace(/\n/g, '<br>')}</p>`;
                currentSummaryOutputContainer.style.display = 'block';
            } else {
                currentSummaryOutput.innerHTML = '<p><em>No se generó un resumen o está vacío.</em></p>';
                currentSummaryOutputContainer.style.display = 'block';
            }
        }
    }

    async function saveTranscription(text_content) {
        // ... (sin cambios, pero ahora se llama desde onend)
        if (!text_content || text_content.trim() === "") {
            showSaveStatus("Nada que guardar.", true);
            if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none';
            return;
        }
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none';
            return;
        }
        const course_label_value = courseLabelInput ? courseLabelInput.value.trim() : null;
        const course_label_to_send = course_label_value === "" ? null : course_label_value;
        if (currentSummaryOutputContainer && currentSummaryOutput) {
            currentSummaryOutput.innerHTML = '<p><em>Guardando y generando resumen...</em></p>';
            currentSummaryOutputContainer.style.display = 'block';
        }
        try {
            const response = await fetch('/api/transcriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text_content: text_content, course_label: course_label_to_send }),
            });
            const data = await response.json();
            if (response.ok) {
                showSaveStatus('Transcripción guardada.');
                if (data.transcription && data.transcription.summary) {
                    displayCurrentSummary(data.transcription.summary);
                } else {
                    displayCurrentSummary(null);
                }
            } else {
                showSaveStatus(data.message || 'Error al guardar.', true);
                if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none';
            }
        } catch (error) {
            showSaveStatus('Error de red al guardar.', true);
            if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none';
        }
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            recognizing = true; // 'recognizing' ahora indica que el motor está activo.
                               // El estado de la UI del botón se maneja fuera.
            // document.body.classList.add('recording'); // Esto se maneja en updateMicButtonUI
            // micButton.setAttribute('aria-label', 'Detener y Guardar Transcripción'); // Se maneja en updateMicButtonUI

            const listeningIndicatorExists = transcriptionOutput.querySelector('p.listening-indicator');
            if(!listeningIndicatorExists) {
                const listeningP = document.createElement('p');
                listeningP.innerHTML = '<em>Escuchando...</em>';
                listeningP.classList.add('listening-indicator');
                const meaningfulContent = transcriptionOutput.querySelector('p:not(.listening-indicator):not(.interim)');
                if (!meaningfulContent || transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim()) {
                    transcriptionOutput.innerHTML = '';
                }
                transcriptionOutput.appendChild(listeningP);
            }
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
        };

        recognition.onresult = (event) => {
            // ... (lógica de acumulación en currentSessionTranscript y actualización de UI sin cambios)
            let interimTranscript = '';
            let finalTranscriptSegment = '';
            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();
            if (transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim() && event.results.length > 0) {
                 if (event.results[0][0].transcript.length > 0) transcriptionOutput.innerHTML = '';
            }
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscriptSegment += transcriptPart.trim() + ' ';
                else interimTranscript += transcriptPart;
            }
            if (finalTranscriptSegment) {
                currentSessionTranscript += finalTranscriptSegment;
                const interimP = transcriptionOutput.querySelector('p.interim');
                if (interimP) interimP.remove();
                const newFinalP = document.createElement('p');
                newFinalP.textContent = finalTranscriptSegment.trim();
                if (newFinalP.textContent) transcriptionOutput.appendChild(newFinalP);
            }
            if (interimTranscript) {
                let currentParagraph = transcriptionOutput.querySelector('p.interim');
                if (!currentParagraph) {
                    currentParagraph = document.createElement('p');
                    currentParagraph.classList.add('interim');
                    const listeningIndicatorRef = transcriptionOutput.querySelector('p.listening-indicator');
                    if (listeningIndicatorRef) transcriptionOutput.insertBefore(currentParagraph, listeningIndicatorRef);
                    else transcriptionOutput.appendChild(currentParagraph);
                }
                currentParagraph.innerHTML = `<em>${interimTranscript}</em>`;
            }
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
        };

        recognition.onerror = (event) => {
            // ... (manejo de errores sin cambios significativos, pero 'recognizing' no se cambia aquí)
            console.error('Error en el reconocimiento de voz:', event.error);
            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();
            const interimP = transcriptionOutput.querySelector('p.interim');
            if (interimP) interimP.remove();
            let errorMessage = 'Ocurrió un error con la transcripción.';
            if (event.error === 'no-speech') errorMessage = 'No se detectó voz. Inténtalo de nuevo.';
            else if (event.error === 'audio-capture') errorMessage = 'No se pudo acceder al micrófono. Asegúrate de dar permiso.';
            else if (event.error === 'not-allowed') errorMessage = 'Permiso para el micrófono denegado. Habilítalo en la configuración de tu navegador.';
            const errorP = document.createElement('p');
            errorP.innerHTML = `<em>${errorMessage}</em>`;
            errorP.classList.add('error-message');
            transcriptionOutput.appendChild(errorP);
            transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
        };

        recognition.onend = () => {
            recognizing = false; // El motor de reconocimiento se ha detenido.
            updateMicButtonUI(false); // Actualizar UI del botón a estado "no grabando"

            const listeningIndicator = transcriptionOutput.querySelector('p.listening-indicator');
            if (listeningIndicator) listeningIndicator.remove();
            const interimP = transcriptionOutput.querySelector('p.interim');
            if (interimP) {
                const finalText = interimP.textContent.trim();
                if (finalText && finalText !== "Escuchando...") {
                    interimP.classList.remove('interim');
                    interimP.innerHTML = finalText;
                } else {
                    interimP.remove();
                }
            }

            // Guardar la transcripción acumulada AHORA, después de que 'recognition' haya terminado.
            if (currentSessionTranscript.trim() !== "") {
               saveTranscription(currentSessionTranscript);
            } else if (transcriptionOutput.querySelectorAll('p:not(.error-message)').length === 0) {
                // Si no hay transcripción y no hay errores, mostrar placeholder
                // Esto evita mostrar "Nada que guardar" si el usuario simplemente detuvo sin hablar.
                transcriptionOutput.innerHTML = initialPlaceholder;
                if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none';
            }


            // No limpiar currentSessionTranscript aquí, se limpia al INICIAR una nueva grabación.
        };

        micButton.addEventListener('click', () => {
            if (recognizing) { // Si está grabando (motor activo) -> queremos detener y guardar
                recognition.stop(); // Esto disparará 'onend', donde se guarda.
                // updateMicButtonUI(false) se llamará en onend.
            } else { // Si no está grabando (motor inactivo) -> queremos iniciar
                currentSessionTranscript = ""; // Reiniciar transcripción de la sesión
                transcriptionOutput.innerHTML = initialPlaceholder; // Limpiar salida visual
                if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Ocultar resumen anterior
                const errorMessages = transcriptionOutput.querySelectorAll('p.error-message');
                errorMessages.forEach(msg => msg.remove()); // Limpiar errores anteriores

                try {
                    recognition.start(); // Esto disparará 'onstart'
                    updateMicButtonUI(true); // Actualizar UI del botón a estado "grabando"
                } catch (e) {
                    console.error("Error al iniciar el reconocimiento (síncrono):", e);
                    transcriptionOutput.innerHTML = "<p><em>No se pudo iniciar el reconocimiento. Revisa la consola del navegador.</em></p>";
                    updateMicButtonUI(false);
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
