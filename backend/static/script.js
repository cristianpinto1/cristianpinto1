document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');
    // const micButtonSVG = micButton.querySelector('svg path'); // No se usa actualmente para cambiar icono
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Haz clic en el micrófono para comenzar la transcripción...</em></p>';
    const saveStatusElement = document.getElementById('saveStatus');
    const courseLabelInput = document.getElementById('courseLabelInput');
    // const currentSummaryOutputContainer = document.getElementById('currentSummaryOutputContainer'); // Eliminado
    // const currentSummaryOutput = document.getElementById('currentSummaryOutput'); // Eliminado

    let recognition;
    let recognizing = false;
    let currentSessionTranscript = "";

    // const micIconPath = "..."; // No se usa actualmente
    // const stopIconPath = "..."; // No se usa actualmente

    function updateMicButtonUI(isRecording) {
        if (isRecording) {
            micButton.setAttribute('aria-label', 'Detener y Guardar Transcripción');
            micButton.classList.add('is-recording');
            document.body.classList.add('recording');
        } else {
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');
            micButton.classList.remove('is-recording');
            document.body.classList.remove('recording');
        }
    }

    function showSaveStatus(message, isError = false) {
        if (saveStatusElement) {
            saveStatusElement.textContent = message;
            saveStatusElement.className = 'save-status';
            if (isError) saveStatusElement.classList.add('error');
            else saveStatusElement.classList.add('success');
            setTimeout(() => { if (saveStatusElement) saveStatusElement.textContent = ''; }, 3000);
        }
    }

    // La función displayCurrentSummary() ha sido eliminada.

    async function saveTranscription(text_content) {
        if (!text_content || text_content.trim() === "") {
            showSaveStatus("Nada que guardar.", true);
            return;
        }
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            return;
        }

        const course_label_value = courseLabelInput ? courseLabelInput.value.trim() : null;
        const course_label_to_send = course_label_value === "" ? null : course_label_value;

        // Mensaje ajustado: ya no se menciona el resumen.
        showSaveStatus("Guardando transcripción...", false); // Mensaje de "Guardando..."

        try {
            const response = await fetch('/api/transcriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text_content: text_content,
                    course_label: course_label_to_send
                }),
            });
            const data = await response.json(); // Aunque no usemos data.transcription.summary, la respuesta puede tener otros datos útiles.
            if (response.ok) {
                showSaveStatus('Transcripción guardada.');
                // Ya no hay llamada a displayCurrentSummary.
            } else {
                showSaveStatus(data.message || 'Error al guardar.', true);
            }
        } catch (error) {
            showSaveStatus('Error de red al guardar.', true);
        }
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            recognizing = true;
            // if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Eliminado

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
            recognizing = false;
            updateMicButtonUI(false);
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
            if (currentSessionTranscript.trim() !== "") {
               saveTranscription(currentSessionTranscript);
            } else if (transcriptionOutput.querySelectorAll('p:not(.error-message)').length === 0) {
                transcriptionOutput.innerHTML = initialPlaceholder;
                // if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Eliminado
            }
        };

        micButton.addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
            } else {
                currentSessionTranscript = "";
                transcriptionOutput.innerHTML = initialPlaceholder;
                // if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Eliminado
                const errorMessages = transcriptionOutput.querySelectorAll('p.error-message');
                errorMessages.forEach(msg => msg.remove());
                try {
                    recognition.start();
                    updateMicButtonUI(true);
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
