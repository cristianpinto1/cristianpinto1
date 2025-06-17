document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton'); // Cambiado de startButton a micButton
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Haz clic en el micrófono para comenzar la transcripción...</em></p>';

    let recognition;
    let recognizing = false;

    // Verificar si el navegador soporta Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            recognizing = true;
            document.body.classList.add('recording'); // Añade clase para cambiar estilos (ej. color del botón/animación)
            micButton.setAttribute('aria-label', 'Detener Transcripción');
            transcriptionOutput.innerHTML = '<p><em>Escuchando...</em></p>';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                let baseHTML = transcriptionOutput.innerHTML;
                if (baseHTML === initialPlaceholder || baseHTML === '<p><em>Escuchando...</em></p>') {
                    baseHTML = ''; // Limpiar si solo está el placeholder o "Escuchando..."
                }
                // Evitar múltiples párrafos vacíos si la transcripción final es rápida
                const lastP = transcriptionOutput.querySelector('p:last-child');
                if (lastP && lastP.innerHTML.trim() === '' && !lastP.classList.contains('interim')) {
                    lastP.remove();
                }

                transcriptionOutput.innerHTML = baseHTML + `<p>${finalTranscript.trim()}</p>`;
                // Scroll al final
                transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;


            } else if (interimTranscript) {
                let currentParagraph = transcriptionOutput.querySelector('p.interim');
                if (!currentParagraph) {
                    // Si no hay párrafo intermedio, y el contenido no es el placeholder o "Escuchando..."
                    // lo añadimos. Si es placeholder o "Escuchando...", lo reemplazamos.
                    if (transcriptionOutput.innerHTML === initialPlaceholder || transcriptionOutput.innerHTML === '<p><em>Escuchando...</em></p>') {
                        transcriptionOutput.innerHTML = '';
                    }
                    currentParagraph = document.createElement('p');
                    currentParagraph.classList.add('interim');
                    transcriptionOutput.appendChild(currentParagraph);
                }
                currentParagraph.innerHTML = `<em>${interimTranscript}</em>`;
                transcriptionOutput.scrollTop = transcriptionOutput.scrollHeight;
            }
        };

        recognition.onerror = (event) => {
            console.error('Error en el reconocimiento de voz:', event.error);
            let errorMessage = 'Ocurrió un error con la transcripción.';
            if (event.error === 'no-speech') {
                errorMessage = 'No se detectó voz. Inténtalo de nuevo.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No se pudo acceder al micrófono. Asegúrate de dar permiso.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Permiso para el micrófono denegado. Habilítalo en la configuración de tu navegador.';
            }
            transcriptionOutput.innerHTML = `<p><em>${errorMessage}</em></p>`;
            if (recognizing) {
                recognition.stop(); // Asegurarse de detener si hay error y estaba reconociendo
            }
        };

        recognition.onend = () => {
            recognizing = false;
            document.body.classList.remove('recording'); // Quita clase de grabación
            micButton.setAttribute('aria-label', 'Iniciar Transcripción');

            const interimP = transcriptionOutput.querySelector('p.interim');
            if (interimP) {
                interimP.remove(); // Limpiar el párrafo intermedio
            }

            // Si solo quedó "Escuchando..." o está vacío (y no fue por un error que ya mostró mensaje)
            // o si el último mensaje es el de "Escuchando...", volver al placeholder.
            const hasErrorMessages = transcriptionOutput.innerHTML.includes('Ocurrió un error') || transcriptionOutput.innerHTML.includes('No se detectó voz') || transcriptionOutput.innerHTML.includes('No se pudo acceder al micrófono') || transcriptionOutput.innerHTML.includes('Permiso para el micrófono denegado');

            if (!hasErrorMessages && (transcriptionOutput.innerHTML.trim() === '' || transcriptionOutput.innerHTML === '<p><em>Escuchando...</em></p>')) {
                transcriptionOutput.innerHTML = initialPlaceholder;
            }
        };

        micButton.addEventListener('click', () => { // Cambiado de startButton a micButton
            if (recognizing) {
                recognition.stop();
            } else {
                // Limpiar transcripción anterior antes de empezar una nueva, si no es un error
                const hasErrorMessages = transcriptionOutput.innerHTML.includes('Ocurrió un error') || transcriptionOutput.innerHTML.includes('No se detectó voz') || transcriptionOutput.innerHTML.includes('No se pudo acceder al micrófono') || transcriptionOutput.innerHTML.includes('Permiso para el micrófono denegado');
                if (!hasErrorMessages) {
                    transcriptionOutput.innerHTML = initialPlaceholder;
                }
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error al iniciar el reconocimiento:", e);
                    transcriptionOutput.innerHTML = "<p><em>No se pudo iniciar el reconocimiento. Asegúrate de que el micrófono esté conectado y hayas dado permiso.</em></p>";
                    document.body.classList.remove('recording'); // Asegurarse que no quede en estado 'recording'
                    micButton.setAttribute('aria-label', 'Iniciar Transcripción');
                }
            }
        });

    } else {
        micButton.disabled = true; // Cambiado de startButton a micButton
        micButton.style.backgroundColor = '#ccc'; // Indicar visualmente que está deshabilitado
        micButton.setAttribute('aria-label', 'Reconocimiento de voz no soportado');
        transcriptionOutput.innerHTML = "<p><em>Lo sentimos, tu navegador no soporta la API de reconocimiento de voz. Prueba con Chrome, Edge o Firefox (puede requerir configuración).</em></p>";
        console.warn("Web Speech API no soportada por este navegador.");
    }
});
