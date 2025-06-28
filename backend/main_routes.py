from flask import Blueprint, render_template
from flask_login import current_user # Podría ser útil para pasar datos del usuario a las plantillas

main_bp = Blueprint('main', __name__,
                    template_folder='templates', # Redundante si Flask ya está configurado para 'templates'
                    static_folder='static')    # Redundante si Flask ya está configurado para 'static'

@main_bp.route('/')
def index_page():
    # Se podrían pasar datos adicionales a la plantilla si fuera necesario
    return render_template('index.html', user=current_user)

@main_bp.route('/login')
def login_page():
    return render_template('login.html', user=current_user)

@main_bp.route('/register')
def register_page():
    return render_template('register.html', user=current_user)

@main_bp.route('/historial')
# @login_required # Podríamos añadir login_required aquí si queremos proteger la ruta a nivel de Flask,
                  # además de la protección/redirección que ya hace el JS.
                  # Si se añade, importar login_required de flask_login.
def historial_page():
    return render_template('historial.html', user=current_user)

# (Opcional) Ruta para servir favicon.ico si lo tuviéramos en static
# @main_bp.route('/favicon.ico')
# def favicon():
#     return main_bp.send_static_file('favicon.ico')
