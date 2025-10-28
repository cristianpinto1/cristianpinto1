import sys
import os
from PySide6.QtWidgets import (QDialog, QVBoxLayout, QLabel, QLineEdit,
                               QPushButton, QComboBox, QMessageBox)

# Ajustar la ruta para importar los modelos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import Area, Trabajador

class AreaDialog(QDialog):
    def __init__(self, parent=None, area=None):
        super().__init__(parent)
        self.setWindowTitle("Editar Área" if area else "Añadir Área")
        self.area = area

        self.layout = QVBoxLayout()

        self.name_label = QLabel("Nombre del Área:")
        self.name_input = QLineEdit(area.nombre if area else "")

        self.parent_label = QLabel("Área Padre (Opcional):")
        self.parent_combo = QComboBox()
        self.parent_combo.addItem("Ninguna", None)

        for a in Area.query.all():
            if not area or a.id != area.id:
                self.parent_combo.addItem(a.nombre, a.id)

        if area and area.parent:
            index = self.parent_combo.findData(area.parent.id)
            if index >= 0:
                self.parent_combo.setCurrentIndex(index)

        self.save_button = QPushButton("Guardar")

        self.layout.addWidget(self.name_label)
        self.layout.addWidget(self.name_input)
        self.layout.addWidget(self.parent_label)
        self.layout.addWidget(self.parent_combo)
        self.layout.addWidget(self.save_button)

        self.setLayout(self.layout)
        self.save_button.clicked.connect(self.accept)

    def get_data(self):
        return {
            "nombre": self.name_input.text(),
            "parent_id": self.parent_combo.currentData()
        }

class TrabajadorDialog(QDialog):
    def __init__(self, parent=None, trabajador=None):
        super().__init__(parent)
        self.setWindowTitle("Editar Trabajador" if trabajador else "Añadir Trabajador")
        self.trabajador = trabajador

        self.layout = QVBoxLayout()

        # Crear campos del formulario
        self.fields = {
            "nombre_completo": QLineEdit(trabajador.nombre_completo if trabajador else ""),
            "correo_electronico": QLineEdit(trabajador.correo_electronico if trabajador else ""),
            "telefono": QLineEdit(trabajador.telefono if trabajador else ""),
            "direccion_ip": QLineEdit(trabajador.direccion_ip if trabajador else ""),
            "hostname": QLineEdit(trabajador.hostname if trabajador else ""),
            "puesto": QLineEdit(trabajador.puesto if trabajador else ""),
            "area": QComboBox()
        }

        # Configurar y llenar el ComboBox de áreas
        self.fields["area"].addItem("Seleccionar área...", None)
        for area in Area.query.all():
            self.fields["area"].addItem(area.nombre, area.id)

        if trabajador and trabajador.area:
            index = self.fields["area"].findData(trabajador.area.id)
            if index >= 0:
                self.fields["area"].setCurrentIndex(index)

        # Añadir etiquetas y campos al layout
        self.layout.addWidget(QLabel("Nombre Completo:"))
        self.layout.addWidget(self.fields["nombre_completo"])
        self.layout.addWidget(QLabel("Correo Electrónico:"))
        self.layout.addWidget(self.fields["correo_electronico"])
        self.layout.addWidget(QLabel("Teléfono:"))
        self.layout.addWidget(self.fields["telefono"])
        self.layout.addWidget(QLabel("Dirección IP:"))
        self.layout.addWidget(self.fields["direccion_ip"])
        self.layout.addWidget(QLabel("Hostname:"))
        self.layout.addWidget(self.fields["hostname"])
        self.layout.addWidget(QLabel("Puesto:"))
        self.layout.addWidget(self.fields["puesto"])
        self.layout.addWidget(QLabel("Área:"))
        self.layout.addWidget(self.fields["area"])

        self.save_button = QPushButton("Guardar")
        self.layout.addWidget(self.save_button)
        self.setLayout(self.layout)

        self.save_button.clicked.connect(self.accept)

    def get_data(self):
        return {
            "nombre_completo": self.fields["nombre_completo"].text(),
            "correo_electronico": self.fields["correo_electronico"].text(),
            "telefono": self.fields["telefono"].text(),
            "direccion_ip": self.fields["direccion_ip"].text(),
            "hostname": self.fields["hostname"].text(),
            "puesto": self.fields["puesto"].text(),
            "area_id": self.fields["area"].currentData()
        }
