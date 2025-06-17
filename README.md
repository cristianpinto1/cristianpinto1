# ClasesSinBarreras

ClasesSinBarreras es un sitio web diseñado para ayudar a estudiantes universitarios con discapacidad auditiva, proporcionando transcripción de audio a texto en tiempo real. Esta Fase 2 introduce la gestión de usuarios, almacenamiento persistente de transcripciones y un historial consultable.

## Características Principales

*   **Transcripción en Tiempo Real:** Captura el audio del micrófono y lo transcribe a texto directamente en el navegador (español).
*   **Interfaz de Usuario Moderna:** Diseño actualizado con un botón de micrófono central y animaciones.
*   **Registro e Inicio de Sesión de Usuarios:** Permite a los usuarios crear cuentas y gestionar sus sesiones.
*   **Almacenamiento de Transcripciones:** Las transcripciones finalizadas se guardan automáticamente en una base de datos si el usuario ha iniciado sesión.
*   **Etiquetado de Cursos:** Opción para añadir una etiqueta de curso/materia a cada transcripción.
*   **Historial de Transcripciones:** Página dedicada donde los usuarios pueden ver, filtrar (por fecha y etiqueta) y eliminar sus transcripciones guardadas.
*   **Navegación Dinámica:** La interfaz se adapta mostrando opciones relevantes según el estado de autenticación del usuario.

## Tecnologías Utilizadas

**Frontend:**
*   HTML5
*   CSS3 (con archivos de estilo modulares)
*   JavaScript (Vanilla JS, con lógica separada para autenticación, historial y transcripción)
*   Web Speech API (para el reconocimiento de voz)

**Backend:**
*   Python
*   Flask (para el framework web y API RESTful)
*   SQLAlchemy (ORM para la interacción con la base de datos)
*   Flask-Login (para la gestión de sesiones de usuario)
*   Flask-Bcrypt (para el hashing de contraseñas - implícito si se usa `werkzeug.security`)
*   SQLite (base de datos relacional ligera)

## Configuración y Ejecución del Proyecto

### Prerrequisitos

*   Python 3.7+
*   pip (manejador de paquetes de Python)
*   Un navegador web moderno (Chrome, Edge, Firefox con Web Speech API habilitada)

### 1. Configuración del Backend

a.  **Clona o descarga este repositorio.**
    ```bash
    # git clone <URL_DEL_REPOSITORIO>
    # cd <NOMBRE_DEL_DIRECTORIO_DEL_REPOSITORIO>
    ```

b.  **Navega al directorio del backend.**
    ```bash
    cd backend
    ```

c.  **(Recomendado) Crea y activa un entorno virtual.**
    ```bash
    python -m venv venv
    # En Windows:
    # venv\Scripts\activate
    # En macOS/Linux:
    # source venv/bin/activate
    ```

d.  **Instala las dependencias de Python.**
    ```bash
    pip install -r requirements.txt
    ```

e.  **Configura las variables de entorno (opcional pero recomendado).**
    Crea un archivo `.env` (o `.flaskenv`) en el directorio `backend/` con el siguiente contenido (ajusta según sea necesario):
    ```
    FLASK_APP=app.py
    FLASK_DEBUG=True  # Poner a False en producción
    SECRET_KEY='una_clave_secreta_muy_fuerte_y_aleatoria_aqui'
    # No es necesario DATABASE_URL si se usa la configuración por defecto de SQLite en app.py
    ```
    *Nota: `FLASK_APP` puede ser redundante si se sigue la estructura de `create_app` y se ejecuta con `flask run` o `python app.py`.*
    *La `SECRET_KEY` es crucial para la seguridad de las sesiones.*

f.  **Inicializa la base de datos.**
    Desde el directorio `backend/` y con el entorno virtual activado:
    ```bash
    flask init-db
    # O el nombre del comando que se haya definido en app.py para db.create_all()
    # Si ejecutas python app.py directamente, la BD se crea automáticamente si no existe (para desarrollo).
    ```
    Esto creará el archivo `clases_sin_barreras.db` en el directorio `backend/`.

g.  **Inicia el servidor Flask.**
    ```bash
    flask run
    # o
    # python app.py
    ```
    Por defecto, el servidor Flask se ejecutará en `http://127.0.0.1:5000/`.

### 2. Ejecución del Frontend

El frontend está compuesto por archivos HTML, CSS y JavaScript estáticos.

a.  **Abre los archivos HTML en tu navegador.**
    Navega al directorio `frontend/` y abre `index.html` (o `login.html` para empezar) en tu navegador web.
    *   Puedes hacer doble clic en el archivo o arrastrarlo a la ventana de tu navegador.
    *   Para una mejor experiencia y para evitar problemas con las rutas de la API (si el backend no está en el mismo origen), puedes servir la carpeta `frontend` usando un servidor HTTP simple. Por ejemplo, con Python:
        ```bash
        # Desde el directorio raíz del proyecto
        cd frontend
        python -m http.server 8080
        # Luego accede a http://localhost:8080/
        ```
        *Si haces esto, asegúrate de que las rutas de API en los scripts JS (ej. `/auth/login`, `/api/transcriptions`) funcionen correctamente. Si el backend está en `localhost:5000` y el frontend en `localhost:8080`, necesitarás configurar CORS en el backend Flask o usar un proxy inverso en producción.*

b.  **Permite el acceso al micrófono.**
    Cuando la página de transcripción (`index.html`) cargue, tu navegador te pedirá permiso para acceder al micrófono. Debes permitirlo.

### Notas sobre CORS (Cross-Origin Resource Sharing)

Si sirves el frontend desde un puerto diferente al del backend Flask (ej. frontend en `http://localhost:8080` y backend en `http://localhost:5000`), necesitarás habilitar CORS en tu aplicación Flask para permitir las solicitudes desde el origen del frontend.

Puedes hacerlo usando la extensión `Flask-CORS`:
1.  Añade `Flask-CORS` a `backend/requirements.txt`.
2.  Instálalo: `pip install Flask-CORS`.
3.  En `backend/app.py`, dentro de `create_app()`:
    ```python
    from flask_cors import CORS

    def create_app():
        app = Flask(__name__)
        CORS(app, supports_credentials=True, origins=["http://localhost:8080"]) # O el origen de tu frontend
        # ... resto de la configuración ...
        return app
    ```
    *`supports_credentials=True` es importante para que Flask-Login funcione correctamente con CORS.*


