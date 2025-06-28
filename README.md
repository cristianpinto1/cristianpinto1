# ClasesSinBarreras - Fase 3

ClasesSinBarreras es un sitio web diseñado para ayudar a estudiantes universitarios con discapacidad auditiva, proporcionando transcripción de audio a texto en tiempo real. Esta Fase 3 introduce la **generación automática de resúmenes** para las transcripciones.

## Características Principales

*   **Transcripción en Tiempo Real:** Captura el audio del micrófono y lo transcribe a texto directamente en el navegador (español).
*   **Interfaz de Usuario Moderna:** Diseño actualizado con un botón de micrófono central y animaciones.
*   **Registro e Inicio de Sesión de Usuarios:** Permite a los usuarios crear cuentas y gestionar sus sesiones.
*   **Almacenamiento de Transcripciones:** Las transcripciones finalizadas se guardan automáticamente en una base de datos si el usuario ha iniciado sesión.
*   **Etiquetado de Cursos:** Opción para añadir una etiqueta de curso/materia a cada transcripción.
*   **Historial de Transcripciones:** Página dedicada donde los usuarios pueden ver, filtrar (por fecha y etiqueta) y eliminar sus transcripciones guardadas.
*   **Resúmenes Automáticos:**
    *   Se genera un resumen extractivo de cada transcripción guardada utilizando la biblioteca `sumy`.
    *   El resumen se muestra tanto en la página de historial (expandible/colapsable) como en la página principal inmediatamente después de guardar una transcripción.
*   **Navegación Dinámica:** La interfaz se adapta mostrando opciones relevantes según el estado de autenticación del usuario.

## Tecnologías Utilizadas

**Frontend:**
*   HTML5
*   CSS3 (con archivos de estilo modulares)
*   JavaScript (Vanilla JS)
*   Web Speech API

**Backend:**
*   Python
*   Flask (framework web y API RESTful)
*   SQLAlchemy (ORM)
*   Flask-Login (gestión de sesiones)
*   SQLite (base de datos)
*   **Sumy** (para la generación de resúmenes extractivos)
*   **NLTK** (utilizado por Sumy para tokenización y stopwords)

## Configuración y Ejecución del Proyecto

### Prerrequisitos

*   Python 3.7+
*   pip
*   Navegador web moderno

### 1. Configuración del Backend

a.  **Clona/descarga el repositorio.**
b.  **Navega a `backend/`.**
c.  **(Recomendado) Crea y activa un entorno virtual.**
    ```bash
    python -m venv venv
    # Windows: venv\Scripts\activate
    # macOS/Linux: source venv/bin/activate
    ```
d.  **Instala las dependencias.**
    ```bash
    pip install -r requirements.txt
    ```
e.  **Descarga recursos de NLTK (necesario para Sumy).**
    Ejecuta una sesión de Python (dentro de tu entorno virtual si estás usando uno) y corre los siguientes comandos:
    ```python
    import nltk
    nltk.download('punkt') # Para tokenización
    nltk.download('stopwords') # Para palabras vacías (stop words)
    ```
    Esto solo necesita hacerse una vez por entorno.

f.  **Configura variables de entorno (opcional pero recomendado para `SECRET_KEY`).**
    Crea un archivo `.env` o `.flaskenv` en `backend/`:
    ```
    FLASK_APP=app.py
    FLASK_DEBUG=True
    SECRET_KEY='tu_super_clave_secreta_aqui'
    ```
g.  **Inicializa/Actualiza la base de datos.**
    *   **Si es la primera vez o si ha habido cambios en los modelos (como añadir el campo `summary`):**
        1.  Si existe un archivo de base de datos (ej. `clases_sin_barreras.db` en `backend/`), **elimínalo**.
        2.  Ejecuta el comando de inicialización:
            ```bash
            flask init-db
            # O el nombre del comando definido en app.py
            ```
    *   *En un entorno de producción, se utilizaría un sistema de migraciones de base de datos como Alembic para aplicar cambios de esquema sin perder datos.*

h.  **Inicia el servidor Flask.**
    ```bash
    flask run
    # o: python app.py
    ```
    (Por defecto en `http://127.0.0.1:5000/`)

### 2. Ejecución del Frontend

a.  Sirve la carpeta `frontend/` usando un servidor HTTP simple. Desde la raíz del proyecto:
    ```bash
    cd frontend
    python -m http.server 8080
    ```
    Accede a `http://localhost:8080/` en tu navegador.

b.  **Permite el acceso al micrófono** en `index.html`.

### Notas sobre CORS

Si sirves el frontend y el backend en puertos diferentes, asegúrate de que CORS esté configurado en `backend/app.py` (ver sección en Fase 2 del README o el código actual).
