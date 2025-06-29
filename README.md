# ClasesSinBarreras - Refinamiento y Mejoras Visuales (Fase 6 Completa)

ClasesSinBarreras es un sitio web diseñado para ayudar a estudiantes universitarios con discapacidad auditiva. Proporciona transcripción de audio a texto en tiempo real con control manual, gestión de usuarios, historial de transcripciones, y procesamiento básico de lenguaje natural (PLN) para limpieza y segmentación del texto. La aplicación cuenta con un diseño responsivo y una estética visual mejorada, servida integralmente por Flask.

## Características Principales

*   **Transcripción en Tiempo Real:** (español).
    *   **Control Manual:** El usuario inicia, detiene y guarda las grabaciones de forma explícita.
    *   **Procesamiento de Texto (PLN):** El texto transcrito se limpia de algunas palabras de relleno comunes y se segmenta en frases usando spaCy antes de guardarse, mejorando su legibilidad.
*   **Interfaz de Usuario Moderna y Responsiva:**
    *   Diseño limpio y funcional inspirado en la claridad de interfaces como Common Voice de Mozilla.
    *   Se adapta a ordenadores de escritorio, portátiles, tablets y teléfonos móviles.
    *   Tipografía "Lato" y paleta de colores consistente (azules, grises, blanco).
*   **Registro e Inicio de Sesión de Usuarios.**
*   **Almacenamiento de Transcripciones:** Con etiquetas de curso opcionales.
*   **Historial de Transcripciones:** Con filtros (fecha, etiqueta) y opción de eliminar.
*   **Navegación Dinámica:** Adaptada al estado de autenticación del usuario.
*   **Servidor Unificado:** Frontend y Backend servidos por Flask.

## Tecnologías Utilizadas

**Frontend (servido por Flask):**
*   HTML5 (Jinja2 Templates)
*   CSS3 (Variables CSS, Media Queries para responsividad, Flexbox, Grid)
*   JavaScript (Vanilla JS)
*   Web Speech API

**Backend:**
*   Python
*   Flask (framework web, API RESTful, servidor de plantillas y archivos estáticos)
*   SQLAlchemy (ORM)
*   Flask-Login (gestión de sesiones)
*   SQLite (base de datos)
*   **spaCy** (para segmentación de frases y procesamiento de lenguaje natural básico)

## Estructura del Proyecto (Relevante)

*   `backend/`: Contiene toda la aplicación.
    *   `app.py`: Punto de entrada principal.
    *   `static/`: Archivos CSS, JavaScript.
    *   `templates/`: Plantillas HTML.
    *   `auth.py`, `transcriptions.py`, `main_routes.py`: Blueprints.
    *   `models.py`: Definiciones de los modelos de base de datos (el campo `summary` fue eliminado).
    *   `requirements.txt`: Dependencias de Python (sin `sumy`, `nltk`; con `spacy`).
    *   `clases_sin_barreras.db`: Base de datos SQLite.

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

e.  **Descarga el modelo de lenguaje de spaCy para español.**
    (Solo se necesita una vez por entorno, si no se ha hecho antes)
    ```bash
    python -m spacy download es_core_web_sm
    ```

f.  **Configura variables de entorno (opcional pero recomendado para `SECRET_KEY`).**
    Crea un archivo `.env` o `.flaskenv` en `backend/`:
    ```
    FLASK_APP=app.py
    FLASK_DEBUG=True
    SECRET_KEY='tu_clave_secreta_muy_fuerte_aqui_y_diferente'
    ```

g.  **Inicializa/Actualiza la base de datos.**
    Desde el directorio `backend/` (con el entorno virtual activado):
    *   **Si es la primera vez, o si ha habido cambios en los modelos (como la eliminación del campo `summary`):**
        1.  Si existe `clases_sin_barreras.db`, **elimínalo**.
        2.  Ejecuta: `flask init-db`
    *   *Para producción, usar migraciones (ej. Alembic).*

h.  **Inicia el servidor Flask.**
    Desde el directorio `backend/`:
    ```bash
    flask run
    # o también:
    # python app.py
    ```
    La aplicación estará disponible en `http://127.0.0.1:5000/`.

i.  **Uso de la Transcripción:**
    *   En la página principal, haz clic en el botón del micrófono para **iniciar** la grabación.
    *   Habla durante el tiempo que necesites.
    *   Haz clic nuevamente para **detener y guardar**. El texto se procesará (limpieza/segmentación) antes de guardarse.
    *   Permite el acceso al micrófono en tu navegador.

## Contribuir
Las contribuciones son bienvenidas. Si tienes ideas para mejorar la aplicación o encuentras algún error, por favor abre un *issue* o envía un *pull request*.

## Licencia
Este proyecto es de código abierto y está disponible bajo la Licencia MIT.
