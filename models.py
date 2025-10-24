from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class Usuario(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def __repr__(self):
        return f"Usuario('{self.username}')"

class Area(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('area.id'))
    parent = db.relationship('Area', remote_side=[id], backref='sub_areas')
    trabajadores = db.relationship('Trabajador', backref='area', lazy=True)

    def __repr__(self):
        return f"Area('{self.nombre}')"

class Trabajador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(100), nullable=False)
    correo_electronico = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(20))
    direccion_ip = db.Column(db.String(45))
    hostname = db.Column(db.String(100))
    puesto = db.Column(db.String(100))
    area_id = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=False)

    def __repr__(self):
        return f"Trabajador('{self.nombre_completo}', '{self.puesto}')"
