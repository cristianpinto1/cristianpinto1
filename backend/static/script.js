document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Haz clic en el micrófono para comenzar la transcripción...</em></p>';
    const saveStatusElement = document.getElementById('saveStatus');
    const courseLabelInput = document.getElementById('courseLabelInput');
    const currentSummaryOutputContainer = document.getElementById('currentSummaryOutputContainer');
    const currentSummaryOutput = document.getElementById('currentSummaryOutput');

    let recognition;
    let recognizing = false;

    function showSaveStatus(message, isError = false) {
        if (saveStatusElement) {
            saveStatusElement.textContent = message;
            saveStatusElement.className = 'save-status';
            if (isError) saveStatusElement.classList.add('error');
            else saveStatusElement.classList.add('success');
            setTimeout(() => { if (saveStatusElement) saveStatusElement.textContent = ''; }, 3000);
        }
    }

    function displayCurrentSummary(summaryText) {
        if (currentSummaryOutputContainer && currentSummaryOutput) {
            if (summaryText && summaryText.trim() !== "") {
                currentSummaryOutput.innerHTML = `<p>${summaryText.replace(/\n/g, '<br>')}</p>`;
                currentSummaryOutputContainer.style.display = 'block';
            } else {
                currentSummaryOutput.innerHTML = '<p><em>No se generó un resumen o está vacío.</em></p>';
                currentSummaryOutputContainer.style.display = 'block'; // Mostrar el mensaje de no resumen
            }
        }
    }

    async function saveTranscription(text_content) {
        if (localStorage.getItem('isLoggedIn') !== 'true') return;

        const course_label_value = courseLabelInput ? courseLabelInput.value.trim() : null;
        const course_label_to_send = course_label_value === "" ? null : course_label_value;

        // Mostrar "Generando resumen..."
        if (currentSummaryOutputContainer && currentSummaryOutput) {
            currentSummaryOutput.innerHTML = '<p><em>Guardando y generando resumen...</em></p>';
            currentSummaryOutputContainer.style.display = 'block';
        }


        try {
            const response = await fetch('/api/transcriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text_content: text_content,
                    course_label: course_label_to_send
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSaveStatus('Transcripción guardada.');
                if (data.transcription && data.transcription.summary) {
                    displayCurrentSummary(data.transcription.summary);
                } else {
                    displayCurrentSummary(null); // Indicar que no hubo resumen
                }
            } else {
                showSaveStatus(data.message || 'Error al guardar.', true);
                if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Ocultar si hay error
            }
        } catch (error) {
            showSaveStatus('Error de red al guardar.', true);
            if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Ocultar si hay error de red
        }
    }

    // ... (resto de script.js sin cambios, basado en la última versión del paso anterior) ...
    // El código de Web Speech API (onstart, onresult, onerror, onend, etc.)
    // se mantiene como en la última actualización.
    // La única función modificada es saveTranscription y la adición de displayCurrentSummary.

    // --- COPIAR EL RESTO DE SCRIPT.JS DESDE LA VERSIÓN ANTERIOR ---
    // (Esto es una simulación, el worker debería tener acceso al estado completo)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            recognizing = true;
            document.body.classList.add('recording');
            micButton.setAttribute('aria-label', 'Detener Transcripción');
            if (currentSummaryOutputContainer) currentSummaryOutputContainer.style.display = 'none'; // Ocultar resumen anterior al iniciar nueva grabación

            const listeningIndicatorExists = transcriptionOutput.querySelector('p.listening-indicator');
            if(!listeningIndicatorExists) {
                const listeningP = document.createElement('p');
                listeningP.innerHTML = '<em>Escuchando...</em>';
                listeningP.classList.add('listening-indicator');
                if (transcriptionOutput.innerHTML.trim() === initialPlaceholder.trim()) {
                    transcriptionOutput.innerHTML = '';
                    transcriptionOutput.appendChild(listeningP);
                } else {
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
                 if (event.results[0][0].transcript.length > 0) {
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

                    saveTranscription(trimmedFinalSegment); // Esto llamará a displayCurrentSummary
                }
            }

            if (interimTranscript) {
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
            document.body.classList.remove('recording');
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');

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

            const meaningfulParagraphs = transcriptionOutput.querySelectorAll('p:not(.interim):not(.listening-indicator):not(.error-message)');
            if (meaningfulParagraphs.length === 0 && transcriptionOutput.textContent.trim() === '') {
                 if (transcriptionOutput.innerHTML.includes('initialPlaceholder')) {}
                 else if (!transcriptionOutput.querySelector('.error-message')) {
                    transcriptionOutput.innerHTML = initialPlaceholder;
                 }
            }
        };

        micButton.addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
            } else {
                const errorMessages = transcriptionOutput.querySelectorAll('p.error-message');
                errorMessages.forEach(msg => msg.remove());
                try {
                    recognition.start();
                } catch (e) {
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
    // --- FIN DE COPIAR EL RESTO DE SCRIPT.JS ---
});
