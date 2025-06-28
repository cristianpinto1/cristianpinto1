from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, Transcription
import datetime

# Importaciones para Sumy
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
# Elegir un sumarizador, por ejemplo, LsaSummarizer o TextRankSummarizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
# from sumy.summarizers.text_rank import TextRankSummarizer as Summarizer
# from sumy.summarizers.luhn import LuhnSummarizer as Summarizer


LANGUAGE = "spanish"
SENTENCES_COUNT = 3 # Número de frases para el resumen

transcriptions_bp = Blueprint('transcriptions', __name__)

@transcriptions_bp.route('/transcriptions', methods=['POST'])
@login_required
def save_transcription():
    data = request.get_json()
    text_content = data.get('text_content')
    course_label = data.get('course_label', None)

    if not text_content:
        return jsonify({'message': 'El contenido del texto no puede estar vacío'}), 400

    new_transcription = Transcription(
        user_id=current_user.id,
        text_content=text_content,
        course_label=course_label
        # El campo 'summary' se llenará después
    )
    db.session.add(new_transcription)
    db.session.commit() # Guardar primero para obtener el ID y la transcripción base

    # Generar y guardar el resumen
    summary_text = None # Inicializar summary_text
    try:
        parser = PlaintextParser.from_string(new_transcription.text_content, Tokenizer(LANGUAGE))
        stemmer = Stemmer(LANGUAGE)
        summarizer = Summarizer(stemmer) # Usar el Summarizer importado
        summarizer.stop_words = get_stop_words(LANGUAGE)

        summary_sentences = []
        for sentence in summarizer(parser.document, SENTENCES_COUNT):
            summary_sentences.append(str(sentence))
        summary_text = " ".join(summary_sentences)

        new_transcription.summary = summary_text
        db.session.add(new_transcription) # Añadir de nuevo para actualizar el campo summary
        db.session.commit()
    except Exception as e:
        # Si falla la generación del resumen, no queremos que falle toda la operación.
        # Simplemente lo registramos y continuamos. El campo 'summary' quedará null.
        print(f"Error al generar resumen para transcripción ID {new_transcription.id}: {e}")
        # Podríamos querer hacer db.session.rollback() aquí si la sesión está sucia,
        # pero como el error es después del primer commit, solo afectaría al summary.
        # No es crítico si el summary queda null.

    return jsonify({
        'message': 'Transcripción guardada exitosamente',
        'transcription': {
            'id': new_transcription.id,
            'text_content': new_transcription.text_content,
            'timestamp': new_transcription.timestamp.isoformat(),
            'course_label': new_transcription.course_label,
            'summary': new_transcription.summary # Devolver el resumen
        }
    }), 201

@transcriptions_bp.route('/transcriptions', methods=['GET'])
@login_required
def get_transcriptions():
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
            'course_label': t.course_label,
            'summary': t.summary # Devolver también el resumen aquí
        })
    return jsonify(output), 200

@transcriptions_bp.route('/transcriptions/<int:transcription_id>', methods=['DELETE'])
@login_required
def delete_transcription(transcription_id):
    transcription = db.session.get(Transcription, transcription_id)
    if not transcription:
         return jsonify({'message': 'Transcripción no encontrada'}), 404

    if transcription.user_id != current_user.id:
        return jsonify({'message': 'No autorizado para eliminar esta transcripción'}), 403

    db.session.delete(transcription)
    db.session.commit()
    return jsonify({'message': 'Transcripción eliminada exitosamente'}), 200
