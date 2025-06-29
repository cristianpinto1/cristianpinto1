from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, Transcription
import datetime

# Importaciones para spaCy
import spacy
from spacy.lang.es.stop_words import STOP_WORDS as SPACY_STOP_WORDS # Stop words de spaCy para español

# Cargar el modelo de spaCy. Esto puede tardar un poco la primera vez que se llama en el servidor.
# Considerar cargarlo al inicio de la aplicación Flask si el rendimiento es crítico.
# Por ahora, se cargará al primer uso de la ruta.
NLP_ES = None
try:
    NLP_ES = spacy.load('es_core_web_sm')
except OSError:
    print("Modelo de spaCy 'es_core_web_sm' no encontrado. Por favor, descárgalo ejecutando:")
    print("python -m spacy download es_core_web_sm")
    # La aplicación podría seguir funcionando sin PLN si el modelo no está,
    # o podríamos decidir que es un error crítico. Por ahora, NLP_ES será None.

# Lista personalizada de palabras de relleno/muletillas comunes en español (para expandir)
# Estas son adicionales a las que spaCy podría manejar o para un control más fino.
CUSTOM_FILLERS = {
    "pues", "bueno", "eh", "em", "este", "osea", "o sea", "digamos",
    "como", "verdad", "sabes", "entiendes", "mira", "fijate", "fíjate",
    "entonces", "claro", "vale", "ajá", "aja", "uhm", "umm", "ah"
}
# Unir con las de spaCy si se desea, pero cuidado, las de spaCy son más generales.
# Por ahora, usaremos solo nuestra lista personalizada para un control más explícito de muletillas.

transcriptions_bp = Blueprint('transcriptions', __name__)

def process_text_with_pln(text):
    if not NLP_ES or not text:
        return text # Devuelve el texto original si spaCy no está cargado o el texto es vacío

    doc = NLP_ES(text)

    processed_phrases = []
    for sent in doc.sents:
        # Ejemplo de limpieza básica:
        # 1. Convertir a minúsculas para la comparación de fillers (opcional, depende del caso de uso)
        # 2. Quitar fillers de una lista personalizada.
        # 3. Reconstruir la frase. Podríamos también lematizar o quitar puntuación excesiva si se quisiera.

        # Tokenizar la frase y quitar fillers
        # No convertimos a minúsculas para mantener la capitalización original en el texto final,
        # pero comparamos fillers en minúsculas.
        tokens_no_fillers = [token.text for token in sent if token.text.lower() not in CUSTOM_FILLERS]

        # Reconstruir la frase
        phrase_text = " ".join(tokens_no_fillers)

        # Corregir múltiples espacios que pudieron quedar por la eliminación de tokens
        phrase_text = " ".join(phrase_text.split())

        if phrase_text.strip(): # Solo añadir si la frase no quedó vacía
            # Capitalizar la primera letra de la frase si no lo está y la frase es significativa
            if len(phrase_text) > 1 and phrase_text[0].islower():
                 # Podríamos ser más inteligentes aquí para no capitalizar después de ciertos signos.
                 # Por ahora, una capitalización simple.
                phrase_text = phrase_text[0].upper() + phrase_text[1:]

            processed_phrases.append(phrase_text)

    # Unir las frases procesadas. Usar un espacio simple.
    # Podríamos usar ". " si queremos forzar un punto al final de cada frase de spaCy,
    # pero la segmentación de spaCy ya debería manejar bien los finales de frase.
    final_text = " ".join(processed_phrases)

    # Asegurar que el texto termine con un signo de puntuación adecuado si no lo tiene.
    if final_text and final_text[-1].isalnum():
        final_text += "."

    return final_text if final_text.strip() else text # Devolver original si el procesado queda vacío

@transcriptions_bp.route('/transcriptions', methods=['POST'])
@login_required
def save_transcription():
    data = request.get_json()
    text_content = data.get('text_content')
    course_label = data.get('course_label', None)

    if not text_content:
        return jsonify({'message': 'El contenido del texto no puede estar vacío'}), 400

    # Procesar el texto con PLN
    processed_text_content = process_text_with_pln(text_content)

    new_transcription = Transcription(
        user_id=current_user.id,
        text_content=processed_text_content, # Guardar el texto procesado
        course_label=course_label
    )
    db.session.add(new_transcription)
    db.session.commit()

    return jsonify({
        'message': 'Transcripción guardada exitosamente',
        'transcription': {
            'id': new_transcription.id,
            'text_content': new_transcription.text_content,
            'timestamp': new_transcription.timestamp.isoformat(),
            'course_label': new_transcription.course_label
        }
    }), 201

@transcriptions_bp.route('/transcriptions', methods=['GET'])
@login_required
def get_transcriptions():
    # ... (sin cambios en esta función, ya devuelve text_content que ahora estará procesado)
    date_filter_str = request.args.get('date')
    course_filter = request.args.get('course')
    query = Transcription.query.filter_by(user_id=current_user.id)
    if date_filter_str:
        try:
            filter_date = datetime.datetime.strptime(date_filter_str, '%Y-%m-%d').date()
            start_of_day = datetime.datetime.combine(filter_date, datetime.time.min)
            end_of_day = datetime.datetime.combine(filter_date, datetime.time.max)
            query = query.filter(Transcription.timestamp >= start_of_day, Transcription.timestamp <= end_of_day)
        except ValueError:
            return jsonify({'message': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400
    if course_filter:
        query = query.filter(Transcription.course_label.ilike(f"%{course_filter}%"))
    transcriptions = query.order_by(Transcription.timestamp.desc()).all()
    output = []
    for t in transcriptions:
        output.append({
            'id': t.id,
            'text_content': t.text_content,
            'timestamp': t.timestamp.isoformat(),
            'course_label': t.course_label
        })
    return jsonify(output), 200

@transcriptions_bp.route('/transcriptions/<int:transcription_id>', methods=['DELETE'])
@login_required
def delete_transcription(transcription_id):
    # ... (sin cambios en esta función)
    transcription = db.session.get(Transcription, transcription_id)
    if not transcription:
         return jsonify({'message': 'Transcripción no encontrada'}), 404
    if transcription.user_id != current_user.id:
        return jsonify({'message': 'No autorizado para eliminar esta transcripción'}), 403
    db.session.delete(transcription)
    db.session.commit()
    return jsonify({'message': 'Transcripción eliminada exitosamente'}), 200
