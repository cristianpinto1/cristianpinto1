from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin # UserMixin proporciona implementaciones predeterminadas para los métodos que Flask-Login espera
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users' # Buena práctica definir explícitamente el nombre de la tabla

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False) # Añadido campo email
    password_hash = db.Column(db.String(256), nullable=False) # Aumentada la longitud por si acaso
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Relación con las transcripciones
    transcriptions = db.relationship('Transcription', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Transcription(db.Model):
    __tablename__ = 'transcriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text_content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)
    course_label = db.Column(db.String(100), nullable=True) # Etiqueta para curso o materia

    def __repr__(self):
        return f'<Transcription {self.id} by User {self.user_id}>'
