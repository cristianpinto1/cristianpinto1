document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const transcriptionOutput = document.getElementById('transcriptionOutput');
    const initialPlaceholder = '<p><em>Presiona el botón para comenzar la transcripción...</em></p>';

    let recognition;
    let recognizing = false;

    // Verificar si el navegador soporta Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.continuous = true; // El reconocimiento continúa incluso si el usuario hace una pausa
        recognition.interimResults = true; // Muestra resultados parciales mientras el usuario habla
        recognition.lang = 'es-ES'; // Establecer el idioma a español

        recognition.onstart = () => {
            recognizing = true;
            startButton.textContent = 'Detener Transcripción';
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

            // Mostrar transcripción final o provisional
            if (finalTranscript) {
                 // Si ya hay contenido y no es el placeholder, añadir un espacio o salto.
                if (transcriptionOutput.innerHTML !== initialPlaceholder && transcriptionOutput.innerHTML !== '<p><em>Escuchando...</em></p>') {
                    transcriptionOutput.innerHTML += `<p>${finalTranscript}</p>`;
                } else {
                    transcriptionOutput.innerHTML = `<p>${finalTranscript}</p>`;
                }
            } else if (interimTranscript) {
                 // Mostrar el resultado intermedio de forma que no cree multiples parrafos para la misma frase
                let currentContent = transcriptionOutput.querySelector('p:last-child');
                if (currentContent && currentContent.classList.contains('interim')) {
                    currentContent.innerHTML = `<em>${interimTranscript}</em>`;
                } else {
                     transcriptionOutput.innerHTML += `<p class="interim"><em>${interimTranscript}</em></p>`;
                }
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
                recognition.stop();
            }
        };

        recognition.onend = () => {
            recognizing = false;
            startButton.textContent = 'Iniciar Transcripción';
            // Si el último mensaje era "Escuchando..." y no hay transcripción, volver al placeholder
            if (transcriptionOutput.innerHTML.includes('<em>Escuchando...</em>') && transcriptionOutput.querySelectorAll('p').length === 1) {
                transcriptionOutput.innerHTML = initialPlaceholder;
            } else {
                // Eliminar el último "Escuchando..." o texto provisional si existe
                const interimPs = transcriptionOutput.querySelectorAll('p.interim');
                interimPs.forEach(p => p.remove());
            }
        };

        startButton.addEventListener('click', () => {
            if (recognizing) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error al iniciar el reconocimiento:", e);
                    transcriptionOutput.innerHTML = "<p><em>No se pudo iniciar el reconocimiento. Asegúrate de que el micrófono esté conectado y hayas dado permiso.</em></p>";
                }
            }
        });

    } else {
        startButton.disabled = true;
        transcriptionOutput.innerHTML = "<p><em>Lo sentimos, tu navegador no soporta la API de reconocimiento de voz. Prueba con Chrome o Edge.</em></p>";
        console.warn("Web Speech API no soportada por este navegador.");
    }
});
