from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Faltan datos (usuario, email o contraseña)'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'El nombre de usuario ya existe'}), 409 # 409 Conflict

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'El email ya está registrado'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user) # Iniciar sesión automáticamente después del registro
    return jsonify({'message': 'Usuario registrado exitosamente', 'user': {'id': new_user.id, 'username': new_user.username, 'email': new_user.email}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier') # Puede ser username o email
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'message': 'Faltan datos (identificador o contraseña)'}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()

    if user and user.check_password(password):
        login_user(user) # Flask-Login maneja la sesión
        return jsonify({'message': 'Inicio de sesión exitoso', 'user': {'id': user.id, 'username': user.username, 'email': user.email}}), 200

    return jsonify({'message': 'Credenciales incorrectas'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required # Solo usuarios logueados pueden desloguearse
def logout():
    logout_user() # Flask-Login maneja la sesión
    return jsonify({'message': 'Cierre de sesión exitoso'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': {'id': current_user.id, 'username': current_user.username, 'email': current_user.email}}), 200
    else:
        return jsonify({'logged_in': False}), 200
