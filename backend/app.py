import os
from flask import Flask
from flask_login import LoginManager
# from flask_cors import CORS # Mantener por si se necesita revertir o para otros desarrollos

from .models import db, User
from .auth import auth_bp
from .transcriptions import transcriptions_bp
from .main_routes import main_bp # <--- NUEVA IMPORTACIÓN

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def create_app():
    app = Flask(__name__,
                static_folder='static',       # Definir explícitamente la carpeta de estáticos
                template_folder='templates'   # Definir explícitamente la carpeta de plantillas
               )

    # CORS(app, supports_credentials=True, origins=["http://localhost:8080"]) # Ya no es necesario con este enfoque

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_12345') # Usar una variable de entorno en producción
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'clases_sin_barreras.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login' # Ruta para redirigir si @login_required falla
                                            # (auth es el nombre del blueprint, login es la función de la vista)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(transcriptions_bp, url_prefix='/api')
    app.register_blueprint(main_bp) # <--- REGISTRO DEL NUEVO BLUEPRINT (sin prefijo para servir '/')

    @app.cli.command('init-db')
    def init_db_command():
        '''Crea las tablas de la base de datos.'''
        with app.app_context():
            db.create_all()
        print('Base de datos inicializada.')

    return app

if __name__ == '__main__':
    app = create_app()
    db_path = os.path.join(BASE_DIR, 'clases_sin_barreras.db')
    if not os.path.exists(db_path):
        with app.app_context(): # Necesario para operaciones de BD fuera de una petición
            db.create_all()
            print("Base de datos creada en desarrollo al iniciar app.py.")
    app.run(debug=True, port=5000) # Puerto por defecto es 5000
