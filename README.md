# ClasesSinBarreras - Control Manual de Grabación (Fase 4 Completa)

ClasesSinBarreras es un sitio web diseñado para ayudar a estudiantes universitarios con discapacidad auditiva, proporcionando transcripción de audio a texto en tiempo real, gestión de usuarios, historial de transcripciones y resúmenes automáticos. En esta Fase 4, se introduce el **control manual completo sobre el inicio, la detención y el guardado de las grabaciones de transcripción.**

## Características Principales

*   **Transcripción en Tiempo Real:** (español).
    *   **Control Manual:** El usuario inicia la grabación con un clic, habla durante el tiempo que necesite (la transcripción se acumula), y finaliza la grabación con otro clic.
    *   **Guardado al Finalizar:** La transcripción completa, junto con su resumen automático, se guarda únicamente cuando el usuario detiene la grabación manualmente.
*   **Interfaz de Usuario Moderna.**
*   **Registro e Inicio de Sesión de Usuarios.**
*   **Almacenamiento de Transcripciones:** Con etiquetas de curso opcionales.
*   **Historial de Transcripciones:** Con filtros y opción de eliminar.
*   **Resúmenes Automáticos:** Generados con `sumy` al finalizar y guardar una grabación. Visibles en el historial y la página principal.
*   **Navegación Dinámica:** Adaptada al estado de autenticación.
*   **Servidor Unificado:** Frontend y Backend servidos por Flask.

## Tecnologías Utilizadas

**Frontend (servido por Flask):**
*   HTML5 (Jinja2 Templates)
*   CSS3
*   JavaScript (Vanilla JS)
*   Web Speech API

**Backend:**
*   Python
*   Flask (framework web, API RESTful, servidor de plantillas y archivos estáticos)
*   SQLAlchemy (ORM)
*   Flask-Login (gestión de sesiones)
*   SQLite (base de datos)
*   Sumy (generación de resúmenes)
*   NLTK (utilizado por Sumy)

## Estructura del Proyecto (Relevante)

*   `backend/`: Contiene toda la aplicación.
    *   `app.py`: Punto de entrada principal de la aplicación Flask, configuración.
    *   `static/`: Contiene todos los archivos CSS, JavaScript e imágenes.
        *   `style.css`, `auth_style.css`, `historial_style.css`, `nav_style.css`
        *   `script.js`, `auth.js`, `historial.js`, `auth_utils.js`
    *   `templates/`: Contiene las plantillas HTML.
        *   `index.html`, `login.html`, `register.html`, `historial.html`
    *   `auth.py`, `transcriptions.py`, `main_routes.py`: Blueprints para las diferentes partes de la aplicación.
    *   `models.py`: Definiciones de los modelos de base de datos.
    *   `requirements.txt`: Dependencias de Python.
    *   `clases_sin_barreras.db`: Archivo de la base de datos SQLite (se crea al inicializar).

## Configuración y Ejecución del Proyecto

### Prerrequisitos

*   Python 3.7+
*   pip
*   Navegador web moderno

### Pasos de Configuración y Ejecución

a.  **Clona o descarga el repositorio.**

b.  **Navega al directorio `backend/`.**
    ```bash
    cd backend
    # Nota: Toda la operación ahora se realiza desde la carpeta 'backend'
    ```

c.  **(Recomendado) Crea y activa un entorno virtual.**
    ```bash
    python -m venv venv
    # Windows: venv\Scripts\activate
    # macOS/Linux: source venv/bin/activate
    ```

d.  **Instala las dependencias de Python.**
    ```bash
    pip install -r requirements.txt
    ```

e.  **Descarga recursos de NLTK (necesario para Sumy).**
    Ejecuta una sesión de Python (dentro de tu entorno virtual) y corre:
    ```python
    import nltk
    nltk.download('punkt')
    nltk.download('stopwords')
    ```
    (Solo se necesita una vez por entorno).

f.  **Configura variables de entorno (opcional pero recomendado para `SECRET_KEY`).**
    Crea un archivo `.env` o `.flaskenv` en `backend/` (donde está `app.py`):
    ```
    FLASK_APP=app.py
    FLASK_DEBUG=True
    SECRET_KEY='tu_clave_secreta_muy_fuerte_aqui'
    ```

g.  **Inicializa/Actualiza la base de datos.**
    Desde el directorio `backend/` (con el entorno virtual activado):
    *   **Si es la primera vez o si ha habido cambios en los modelos:**
        1.  Si existe `clases_sin_barreras.db`, elimínalo.
        2.  Ejecuta: `flask init-db`
    *   *Para producción, usar migraciones (ej. Alembic).*

h.  **Inicia el servidor Flask.**
    Desde el directorio `backend/`:
    ```bash
    flask run
    # o también:
    # python app.py
    ```
    La aplicación estará disponible en `http://127.0.0.1:5000/` (o el puerto que se muestre). Todas las páginas (inicio, login, historial) y la API se sirven desde este único servidor.

i.  **Uso de la Transcripción:**
    *   En la página principal, haz clic en el botón del micrófono para **iniciar** la grabación.
    *   Habla durante el tiempo que necesites. La transcripción aparecerá en pantalla.
    *   Cuando hayas terminado, haz clic nuevamente en el mismo botón para **detener y guardar** la transcripción. El resumen se generará y mostrará en este momento (si estás logueado).
    *   Permite el acceso al micrófono en tu navegador.

### Nota sobre CORS
La configuración de CORS ya **no es necesaria** con este enfoque de servidor unificado, ya que todos los recursos se sirven desde el mismo origen.

## Contribuir
Las contribuciones son bienvenidas. Si tienes ideas para mejorar la aplicación o encuentras algún error, por favor abre un *issue* o envía un *pull request*.

## Licencia
Este proyecto es de código abierto y está disponible bajo la Licencia MIT.
