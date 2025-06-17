import os
from flask import Flask
from flask_login import LoginManager
from .models import db, User # Importar db y User desde models.py en el mismo directorio

# Directorio base de la aplicación
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def create_app():
    app = Flask(__name__)

    # Configuraciones
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tu_clave_secreta_predeterminada_muy_segura') # Es mejor usar variables de entorno
    # Configuración de la base de datos SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'clases_sin_barreras.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicializar extensiones
    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login' # Nombre de la función de vista para el login (se definirá más tarde)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        # Flask-Login necesita esta función para recargar el objeto usuario desde el ID de usuario almacenado en la sesión
        return User.query.get(int(user_id))

    # Registrar Blueprints (se añadirán más tarde para auth y transcripciones)
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from .transcriptions import transcriptions_bp
    app.register_blueprint(transcriptions_bp, url_prefix='/api')


    # Comando para crear la base de datos y las tablas
    @app.cli.command('init-db')
    def init_db_command():
        '''Crea las tablas de la base de datos.'''
        with app.app_context(): # Asegurarse de estar en el contexto de la aplicación
            db.create_all()
        print('Base de datos inicializada.')

    return app

# Si ejecutas este archivo directamente (python app.py), puedes iniciar el servidor de desarrollo
if __name__ == '__main__':
    app = create_app()
    # Crear la base de datos si no existe al ejecutar directamente (solo para desarrollo fácil)
    db_path = os.path.join(BASE_DIR, 'clases_sin_barreras.db')
    if not os.path.exists(db_path):
        with app.app_context():
            db.create_all()
            print("Base de datos creada en desarrollo.")
    app.run(debug=True)
