from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, Transcription
import datetime

transcriptions_bp = Blueprint('transcriptions', __name__)

@transcriptions_bp.route('/transcriptions', methods=['POST'])
@login_required # Solo usuarios logueados pueden guardar transcripciones
def save_transcription():
    data = request.get_json()
    text_content = data.get('text_content')
    course_label = data.get('course_label', None) # Opcional

    if not text_content:
        return jsonify({'message': 'El contenido del texto no puede estar vacío'}), 400

    new_transcription = Transcription(
        user_id=current_user.id,
        text_content=text_content,
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
@login_required # Solo usuarios logueados pueden ver sus transcripciones
def get_transcriptions():
    # Obtener parámetros de filtrado de la query string
    date_filter_str = request.args.get('date') # Formato YYYY-MM-DD
    course_filter = request.args.get('course')

    query = Transcription.query.filter_by(user_id=current_user.id)

    if date_filter_str:
        try:
            # Filtrar por el día completo
            filter_date = datetime.datetime.strptime(date_filter_str, '%Y-%m-%d').date()
            start_of_day = datetime.datetime.combine(filter_date, datetime.time.min)
            end_of_day = datetime.datetime.combine(filter_date, datetime.time.max)
            query = query.filter(Transcription.timestamp >= start_of_day, Transcription.timestamp <= end_of_day)
        except ValueError:
            return jsonify({'message': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}), 400

    if course_filter:
        query = query.filter(Transcription.course_label.ilike(f"%{course_filter}%")) # Búsqueda flexible

    # Ordenar por fecha descendente (más recientes primero)
    transcriptions = query.order_by(Transcription.timestamp.desc()).all()

    output = []
    for t in transcriptions:
        output.append({
            'id': t.id,
            'text_content': t.text_content,
            'timestamp': t.timestamp.isoformat(), # Formato ISO para fácil parseo en JS
            'course_label': t.course_label
        })

    return jsonify(output), 200
