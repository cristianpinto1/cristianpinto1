from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo, ValidationError
from models import Usuario

class RegistrationForm(FlaskForm):
    username = StringField('Usuario',
                           validators=[DataRequired(), Length(min=2, max=20)])
    password = PasswordField('Contraseña', validators=[DataRequired()])
    confirm_password = PasswordField('Confirmar Contraseña',
                                     validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Registrarse')

    def validate_username(self, username):
        user = Usuario.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Ese nombre de usuario ya existe. Por favor, elige otro.')

from wtforms.validators import Optional
from wtforms_sqlalchemy.fields import QuerySelectField
from models import Area

class LoginForm(FlaskForm):
    username = StringField('Usuario',
                           validators=[DataRequired(), Length(min=2, max=20)])
    password = PasswordField('Contraseña', validators=[DataRequired()])
    submit = SubmitField('Iniciar Sesión')

def area_query():
    return Area.query

class AreaForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    parent = QuerySelectField('Área Padre (Opcional)', query_factory=area_query, allow_blank=True, get_label='nombre', validators=[Optional()])
    submit = SubmitField('Guardar')

class TrabajadorForm(FlaskForm):
    nombre_completo = StringField('Nombre Completo', validators=[DataRequired()])
    correo_electronico = StringField('Correo Electrónico', validators=[DataRequired()])
    telefono = StringField('Teléfono')
    direccion_ip = StringField('Dirección IP')
    hostname = StringField('Hostname')
    puesto = StringField('Puesto')
    area = QuerySelectField('Área', query_factory=area_query, allow_blank=False, get_label='nombre')
    submit = SubmitField('Guardar')
