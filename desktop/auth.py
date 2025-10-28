import sys
import os
from PySide6.QtWidgets import (QApplication, QWidget, QVBoxLayout, QLabel,
                               QLineEdit, QPushButton, QMessageBox, QDialog)
from werkzeug.security import generate_password_hash, check_password_hash

# Ajustar la ruta para importar los modelos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import db, Usuario

class LoginWindow(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Iniciar Sesión / Registro")
        self.setModal(True)  # Bloquea la ventana principal hasta que se cierre
        self.layout = QVBoxLayout()

        self.username_label = QLabel("Usuario:")
        self.username_input = QLineEdit()
        self.password_label = QLabel("Contraseña:")
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password)

        self.login_button = QPushButton("Iniciar Sesión")
        self.register_button = QPushButton("Registrarse")

        self.layout.addWidget(self.username_label)
        self.layout.addWidget(self.username_input)
        self.layout.addWidget(self.password_label)
        self.layout.addWidget(self.password_input)
        self.layout.addWidget(self.login_button)
        self.layout.addWidget(self.register_button)

        self.setLayout(self.layout)

        # Conectar señales (eventos de clic)
        self.login_button.clicked.connect(self.handle_login)
        self.register_button.clicked.connect(self.handle_register)

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        if not username or not password:
            QMessageBox.warning(self, "Error", "El usuario y la contraseña no pueden estar vacíos.")
            return

        user = Usuario.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            QMessageBox.information(self, "Éxito", "Inicio de sesión correcto.")
            self.accept()  # Cierra el diálogo con un estado de éxito
        else:
            QMessageBox.warning(self, "Error", "Usuario o contraseña incorrectos.")

    def handle_register(self):
        username = self.username_input.text()
        password = self.password_input.text()

        if not username or not password:
            QMessageBox.warning(self, "Error", "El usuario y la contraseña no pueden estar vacíos.")
            return

        if Usuario.query.filter_by(username=username).first():
            QMessageBox.warning(self, "Error", "El nombre de usuario ya existe.")
            return

        hashed_password = generate_password_hash(password)
        new_user = Usuario(username=username, password_hash=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            QMessageBox.information(self, "Éxito", "Usuario registrado correctamente. Ahora puedes iniciar sesión.")
        except Exception as e:
            db.session.rollback()
            QMessageBox.critical(self, "Error de Base de Datos", f"No se pudo registrar al usuario: {e}")

# Para pruebas directas (opcional)
if __name__ == '__main__':
    from flask import Flask

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '..', 'instance', 'site.db')

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    db.init_app(app)

    qt_app = QApplication(sys.argv)
    with app.app_context():
        login_dialog = LoginWindow()
        if login_dialog.exec():
            print("Autenticación exitosa.")
        else:
            print("Autenticación fallida o cancelada.")
    sys.exit()
