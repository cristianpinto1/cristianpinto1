# Organizador de Base de Datos

Esta es una aplicación web desarrollada en Python con Flask para gestionar, organizar y consultar información jerárquica de una organización de manera eficiente.

## Características

-   **Gestión de Entidades:** Permite registrar áreas, jefaturas o departamentos.
-   **Jerarquía:** Soporta la creación de sub-entidades o niveles jerárquicos.
-   **Gestión de Trabajadores:** Permite asociar trabajadores a cada área con información detallada (nombre, correo, teléfono, IP, etc.).
-   **Autenticación:** Sistema de registro e inicio de sesión para usuarios.
-   **Búsqueda:** Funcionalidad para buscar trabajadores por nombre o correo.
-   **Exportación:** Permite exportar los datos de áreas y trabajadores a formato CSV.
-   **Interfaz en Español:** Toda la interfaz de usuario está en español.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

-   **Python 3.8 o superior:** [Descargar Python](https://www.python.org/downloads/)
-   **pip:** El gestor de paquetes de Python (normalmente se instala con Python).
-   **git:** Para clonar el repositorio.

## Guía de Instalación y Ejecución

Sigue estos pasos para poner en marcha la aplicación en tu entorno local.

### 1. Clonar el Repositorio

Abre tu terminal o línea de comandos y clona este repositorio en tu máquina:
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO>
```

### 2. Crear un Entorno Virtual (Recomendado)

Es una buena práctica trabajar dentro de un entorno virtual para aislar las dependencias del proyecto.

-   **Crear el entorno:**
    ```bash
    python -m venv venv
    ```

-   **Activar el entorno:**
    -   En Windows:
        ```bash
        venv\\Scripts\\activate
        ```
    -   En macOS y Linux:
        ```bash
        source venv/bin/activate
        ```
    *Verás `(venv)` al principio de la línea de tu terminal, indicando que el entorno está activo.*

### 3. Instalar las Dependencias

Con el entorno virtual activado, instala todas las librerías necesarias ejecutando:
```bash
pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-WTF Flask-Login WTForms-SQLAlchemy
```

### 4. Configurar la Base de Datos

La primera vez que ejecutes el proyecto, necesitas inicializar la base de datos.

-   **Define la variable de entorno para Flask:**
    -   En Windows:
        ```bash
        set FLASK_APP=app.py
        ```
    -   En macOS y Linux:
        ```bash
        export FLASK_APP=app.py
        ```

-   **Ejecuta las migraciones para crear las tablas de la base de datos:**
    ```bash
    flask db init  # Solo si la carpeta 'migrations' no existe
    flask db migrate -m "Migración inicial"
    flask db upgrade
    ```
    *Esto creará un archivo `site.db` en la carpeta `instance/` que contendrá toda la información.*

### 5. Ejecutar la Aplicación

Una vez configurada la base de datos, puedes iniciar el servidor de desarrollo de Flask:
```bash
flask run
```

La aplicación estará disponible en tu navegador en la siguiente dirección: **http://127.0.0.1:5000**

## Cómo Empezar a Usar la Aplicación

1.  **Regístrate:** Ve a la página principal y haz clic en "Registrarse" para crear tu primer usuario.
2.  **Inicia Sesión:** Utiliza tus credenciales para acceder al sistema.
3.  **Crea Áreas:** Navega a la sección "Áreas" y empieza a crear las áreas principales y sub-áreas de tu organización.
4.  **Añade Trabajadores:** Ve a la sección "Trabajadores" para registrar a los empleados y asignarlos a sus respectivas áreas.
5.  **Busca y Exporta:** Utiliza la barra de búsqueda para encontrar trabajadores o los botones "Exportar a CSV" para descargar los datos.
