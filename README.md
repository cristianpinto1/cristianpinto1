# Organizador de Base de Datos - Versión de Escritorio

Esta es una aplicación de escritorio desarrollada en Python con PySide6 (Qt for Python) para gestionar, organizar y consultar información jerárququica de una organización.

## Características

-   **Gestión de Entidades:** Permite registrar áreas, jefaturas o departamentos con soporte para jerarquías.
-   **Gestión de Trabajadores:** Permite asociar trabajadores a cada área con información detallada.
-   **Autenticación Segura:** Sistema de registro e inicio de sesión de usuarios con contraseñas seguras.
-   **Interfaz Intuitiva:** Gestión de Áreas y Trabajadores en pestañas separadas con tablas interactivas.
-   **Funcionalidad Completa:** Soporte para operaciones CRUD (Crear, Leer, Editar, Eliminar).
-   **Búsqueda y Exportación:** Incluye una barra de búsqueda para filtrar trabajadores y la capacidad de exportar datos a formato CSV.

## Requisitos Previos

-   **Python 3.8 o superior**
-   **pip** (gestor de paquetes de Python)

## Guía de Instalación y Ejecución

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### 1. Clonar o Descargar el Repositorio

Abre tu terminal y navega al directorio donde deseas instalar el proyecto.

### 2. Crear un Entorno Virtual (Recomendado)

```bash
python -m venv venv
```
-   **Activar el entorno:**
    -   En Windows: `venv\\Scripts\\activate`
    -   En macOS/Linux: `source venv/bin/activate`

### 3. Instalar las Dependencias

Con el entorno activado, instala todas las librerías necesarias:
```bash
pip install Flask Flask-SQLAlchemy Flask-Migrate PySide6 werkzeug
```
*(Flask y Werkzeug se usan para la gestión de la base de datos y el hashing de contraseñas, no para la web).*

### 4. Configurar la Base de Datos

La primera vez que uses la aplicación, necesitas inicializar la base de datos.

-   **Define la variable de entorno para Flask (necesario para los comandos de `db`):**
    -   En Windows: `set FLASK_APP=desktop/main.py`
    -   En macOS/Linux: `export FLASK_APP=desktop/main.py`
    *(Nota: Apuntamos a main.py porque contiene la configuración de la app Flask necesaria para SQLAlchemy).*

-   **Ejecuta las migraciones para crear las tablas:**
    ```bash
    flask db init  # Solo si la carpeta 'migrations' no existe
    flask db migrate -m "Migración inicial para escritorio"
    flask db upgrade
    ```
    *Esto creará el archivo de base de datos `site.db` en la carpeta `instance/`.*

### 5. Ejecutar la Aplicación

Una vez configurada la base de datos, puedes iniciar la aplicación de escritorio:
```bash
python desktop/main.py
```

La ventana de inicio de sesión aparecerá. Puedes registrar un nuevo usuario y luego iniciar sesión para acceder a la aplicación principal.
