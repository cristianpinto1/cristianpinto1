import sys
import os
import csv
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout,
                               QHBoxLayout, QTabWidget, QTableView, QPushButton,
                               QMessageBox, QLineEdit, QFileDialog)
from PySide6.QtCore import QAbstractTableModel, Qt, QSortFilterProxyModel

# --- Ajuste de la Ruta de Importación ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from models import db, Area, Trabajador
from desktop.auth import LoginWindow
from desktop.forms import AreaDialog, TrabajadorDialog

# --- Conexión a la Base de Datos ---
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, '..', 'instance', 'site.db')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# --- (Modelos de Tabla permanecen igual) ---
class AreaTableModel(QAbstractTableModel):
    def __init__(self, data):
        super().__init__()
        self._data = data
        self.headers = ["ID", "Nombre", "Área Padre"]

    def data(self, index, role):
        if role == Qt.DisplayRole:
            area = self._data[index.row()]
            if index.column() == 0: return str(area.id)
            if index.column() == 1: return area.nombre
            if index.column() == 2: return area.parent.nombre if area.parent else "N/A"
        return None

    def rowCount(self, index): return len(self._data)
    def columnCount(self, index): return len(self.headers)
    def headerData(self, section, orientation, role):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self.headers[section]
        return None

class TrabajadorTableModel(QAbstractTableModel):
    def __init__(self, data):
        super().__init__()
        self._data = data
        self.headers = ["ID", "Nombre Completo", "Correo", "Puesto", "Área"]

    def data(self, index, role):
        if role == Qt.DisplayRole:
            trabajador = self._data[index.row()]
            if index.column() == 0: return str(trabajador.id)
            if index.column() == 1: return trabajador.nombre_completo
            if index.column() == 2: return trabajador.correo_electronico
            if index.column() == 3: return trabajador.puesto
            if index.column() == 4: return trabajador.area.nombre if trabajador.area else "N/A"
        return None

    def rowCount(self, index): return len(self._data)
    def columnCount(self, index): return len(self.headers)
    def headerData(self, section, orientation, role):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self.headers[section]
        return None

# --- Ventana Principal de la Aplicación ---
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Organizador de Base de Datos")
        self.setGeometry(100, 100, 800, 600)
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)
        self.create_areas_tab()
        self.create_trabajadores_tab()

    def create_areas_tab(self):
        tab = QWidget()
        layout = QVBoxLayout()
        button_layout = QHBoxLayout()

        self.area_table = QTableView()

        add_btn = QPushButton("Añadir Área")
        edit_btn = QPushButton("Editar Área")
        del_btn = QPushButton("Eliminar Área")
        export_btn = QPushButton("Exportar a CSV")

        button_layout.addWidget(add_btn)
        button_layout.addWidget(edit_btn)
        button_layout.addWidget(del_btn)
        button_layout.addStretch()
        button_layout.addWidget(export_btn)

        layout.addLayout(button_layout)
        layout.addWidget(self.area_table)

        tab.setLayout(layout)
        self.tabs.addTab(tab, "Áreas")

        add_btn.clicked.connect(self.add_area)
        edit_btn.clicked.connect(self.edit_area)
        del_btn.clicked.connect(self.delete_area)
        export_btn.clicked.connect(self.export_areas)

        self.load_areas_data()

    def create_trabajadores_tab(self):
        tab = QWidget()
        layout = QVBoxLayout()

        # Layout para botones y búsqueda
        top_layout = QHBoxLayout()
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Buscar por nombre, correo o puesto...")
        add_btn = QPushButton("Añadir Trabajador")
        edit_btn = QPushButton("Editar Trabajador")
        del_btn = QPushButton("Eliminar Trabajador")
        export_btn = QPushButton("Exportar a CSV")

        top_layout.addWidget(self.search_input)
        top_layout.addWidget(add_btn)
        top_layout.addWidget(edit_btn)
        top_layout.addWidget(del_btn)
        top_layout.addStretch()
        top_layout.addWidget(export_btn)

        self.trabajador_table = QTableView()

        layout.addLayout(top_layout)
        layout.addWidget(self.trabajador_table)

        tab.setLayout(layout)
        self.tabs.addTab(tab, "Trabajadores")

        add_btn.clicked.connect(self.add_trabajador)
        edit_btn.clicked.connect(self.edit_trabajador)
        del_btn.clicked.connect(self.delete_trabajador)
        export_btn.clicked.connect(self.export_trabajadores)
        self.search_input.textChanged.connect(self.filter_trabajadores)

        self.load_trabajadores_data()

    def load_areas_data(self):
        self.area_table.setModel(AreaTableModel(Area.query.all()))

    def load_trabajadores_data(self):
        self.trabajador_model = TrabajadorTableModel(Trabajador.query.all())

        # Modelo proxy para filtrado/búsqueda
        self.proxy_model = QSortFilterProxyModel()
        self.proxy_model.setSourceModel(self.trabajador_model)
        self.proxy_model.setFilterKeyColumn(-1) # Buscar en todas las columnas
        self.proxy_model.setFilterCaseSensitivity(Qt.CaseInsensitive)

        self.trabajador_table.setModel(self.proxy_model)

    def filter_trabajadores(self, text):
        self.proxy_model.setFilterFixedString(text)

    def export_to_csv(self, model, filename):
        path, _ = QFileDialog.getSaveFileName(self, "Guardar Archivo CSV", filename, "CSV Files (*.csv)")
        if not path:
            return

        try:
            with open(path, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                # Escribir cabeceras
                headers = [model.headerData(i, Qt.Horizontal, Qt.DisplayRole) for i in range(model.columnCount(None))]
                writer.writerow(headers)
                # Escribir datos
                for row in range(model.rowCount(None)):
                    row_data = [model.data(model.index(row, col), Qt.DisplayRole) for col in range(model.columnCount(None))]
                    writer.writerow(row_data)
            QMessageBox.information(self, "Éxito", f"Datos exportados correctamente a {path}")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"No se pudo exportar el archivo: {e}")

    def export_areas(self):
        self.export_to_csv(self.area_table.model(), "areas.csv")

    def export_trabajadores(self):
        self.export_to_csv(self.trabajador_table.model(), "trabajadores.csv")

    # --- (Métodos CRUD permanecen igual) ---
    def add_area(self):
        dialog = AreaDialog()
        if dialog.exec():
            data = dialog.get_data()
            if not data['nombre']:
                QMessageBox.warning(self, "Error", "El nombre del área no puede estar vacío.")
                return
            new_area = Area(nombre=data['nombre'], parent_id=data['parent_id'])
            db.session.add(new_area)
            db.session.commit()
            self.load_areas_data()

    def edit_area(self):
        selected_index = self.area_table.selectionModel().currentIndex()
        if not selected_index.isValid():
            QMessageBox.warning(self, "Atención", "Selecciona un área para editar.")
            return

        area_id = int(self.area_table.model().index(selected_index.row(), 0).data())
        area = Area.query.get(area_id)

        dialog = AreaDialog(area=area)
        if dialog.exec():
            data = dialog.get_data()
            area.nombre = data['nombre']
            area.parent_id = data['parent_id']
            db.session.commit()
            self.load_areas_data()

    def delete_area(self):
        selected_index = self.area_table.selectionModel().currentIndex()
        if not selected_index.isValid():
            QMessageBox.warning(self, "Atención", "Selecciona un área para eliminar.")
            return

        area_id = int(self.area_table.model().index(selected_index.row(), 0).data())
        area = Area.query.get(area_id)

        reply = QMessageBox.question(self, 'Confirmar', f"¿Eliminar '{area.nombre}'?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        if reply == QMessageBox.Yes:
            db.session.delete(area)
            db.session.commit()
            self.load_areas_data()

    def add_trabajador(self):
        dialog = TrabajadorDialog()
        if dialog.exec():
            data = dialog.get_data()
            if not data['nombre_completo'] or not data['correo_electronico'] or not data['area_id']:
                QMessageBox.warning(self, "Error", "Nombre, correo y área son obligatorios.")
                return
            new_trabajador = Trabajador(**data)
            db.session.add(new_trabajador)
            db.session.commit()
            self.load_trabajadores_data()

    def edit_trabajador(self):
        # Obtener el índice fuente del modelo proxy
        proxy_index = self.trabajador_table.selectionModel().currentIndex()
        if not proxy_index.isValid():
            QMessageBox.warning(self, "Atención", "Selecciona un trabajador para editar.")
            return
        source_index = self.proxy_model.mapToSource(proxy_index)

        trabajador_id = int(self.trabajador_model.index(source_index.row(), 0).data())
        trabajador = Trabajador.query.get(trabajador_id)

        dialog = TrabajadorDialog(trabajador=trabajador)
        if dialog.exec():
            data = dialog.get_data()
            for key, value in data.items():
                setattr(trabajador, key, value)
            db.session.commit()
            self.load_trabajadores_data()

    def delete_trabajador(self):
        proxy_index = self.trabajador_table.selectionModel().currentIndex()
        if not proxy_index.isValid():
            QMessageBox.warning(self, "Atención", "Selecciona un trabajador para eliminar.")
            return
        source_index = self.proxy_model.mapToSource(proxy_index)

        trabajador_id = int(self.trabajador_model.index(source_index.row(), 0).data())
        trabajador = Trabajador.query.get(trabajador_id)

        reply = QMessageBox.question(self, 'Confirmar', f"¿Eliminar a '{trabajador.nombre_completo}'?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        if reply == QMessageBox.Yes:
            db.session.delete(trabajador)
            db.session.commit()
            self.load_trabajadores_data()

# --- Punto de Entrada ---
if __name__ == "__main__":
    qt_app = QApplication(sys.argv)
    with app.app_context():
        login_dialog = LoginWindow()
        if login_dialog.exec():
            main_window = MainWindow()
            main_window.show()
            sys.exit(qt_app.exec())
        else:
            sys.exit(0)
