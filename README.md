# ClasesSinBarreras - Diseño Responsivo (Fase 5 Completa)

ClasesSinBarreras es un sitio web diseñado para ayudar a estudiantes universitarios con discapacidad auditiva, proporcionando transcripción de audio a texto en tiempo real, gestión de usuarios, historial de transcripciones y resúmenes automáticos. En esta Fase 5, **el diseño de la aplicación se ha hecho responsivo** para adaptarse a diferentes tamaños de pantalla.

## Características Principales

*   **Transcripción en Tiempo Real:** (español).
    *   Control Manual: El usuario inicia, detiene y guarda las grabaciones.
*   **Interfaz de Usuario Moderna y Responsiva:** El diseño se adapta a ordenadores de escritorio, portátiles, tablets y teléfonos móviles.
*   **Registro e Inicio de Sesión de Usuarios.**
*   **Almacenamiento de Transcripciones:** Con etiquetas de curso opcionales.
*   **Historial de Transcripciones:** Con filtros y opción de eliminar.
*   **Resúmenes Automáticos:** Generados con `sumy`.
*   **Navegación Dinámica:** Adaptada al estado de autenticación.
*   **Servidor Unificado:** Frontend y Backend servidos por Flask.

## Tecnologías Utilizadas
**Frontend (servido por Flask):**
*   HTML5 (Jinja2 Templates)
*   CSS3 (Media Queries para responsividad, Flexbox, Grid)
*   JavaScript (Vanilla JS)
*   Web Speech API

**Backend:**
*   Python
*   Flask
*   SQLAlchemy
*   Flask-Login
*   SQLite
*   Sumy
*   NLTK

## Estructura del Proyecto (Relevante)
*   `backend/`: Contiene toda la aplicación.
    *   `app.py`: Punto de entrada principal.
    *   `static/`: Archivos CSS, JavaScript.
    *   `templates/`: Plantillas HTML.
    *   `auth.py`, `transcriptions.py`, `main_routes.py`: Blueprints.
    *   `models.py`: Modelos de base de datos.
    *   `requirements.txt`: Dependencias.
    *   `clases_sin_barreras.db`: Base de datos SQLite.

## Configuración y Ejecución del Proyecto

### Prerrequisitos
*   Python 3.7+
*   pip
*   Navegador web moderno

### Pasos de Configuración y Ejecución
a.  Clona/descarga el repositorio.
b.  Navega a `backend/`.
c.  Crea/activa entorno virtual.
d.  Instala dependencias: `pip install -r requirements.txt`.
e.  Descarga recursos NLTK: `import nltk; nltk.download('punkt'); nltk.download('stopwords')`.
f.  Configura variables de entorno (`.env` o `.flaskenv` para `SECRET_KEY`).
g.  Inicializa/Actualiza base de datos: (Elimina `.db` si hay cambios de modelo), `flask init-db`.
h.  Inicia servidor Flask: `flask run` o `python app.py`. (Accede en `http://127.0.0.1:5000/`).
i.  Uso de la Transcripción:
    *   En la página principal, haz clic en el botón del micrófono para **iniciar** la grabación.
    *   Habla durante el tiempo que necesites.
    *   Haz clic nuevamente para **detener y guardar**.
    *   Permite el acceso al micrófono.

## Contribuir
Las contribuciones son bienvenidas. Si tienes ideas para mejorar la aplicación o encuentras algún error, por favor abre un *issue* o envía un *pull request*.

## Licencia
Este proyecto es de código abierto y está disponible bajo la Licencia MIT.
