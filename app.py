from flask import Flask, render_template, url_for, flash, redirect, request, make_response
import io
import csv
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, current_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from forms import RegistrationForm, LoginForm, AreaForm, TrabajadorForm
from models import db, Usuario, Area, Trabajador

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a-super-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'
login_manager.login_message = "Por favor, inicia sesión para acceder a esta página."

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

@app.route('/')
@app.route('/inicio')
@login_required
def inicio():
    return render_template('inicio.html')

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if current_user.is_authenticated:
        return redirect(url_for('inicio'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        user = Usuario(username=form.username.data, password_hash=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión', 'success')
        return redirect(url_for('login'))
    return render_template('registro.html', title='Registro', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('inicio'))
    form = LoginForm()
    if form.validate_on_submit():
        user = Usuario.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=True)
            return redirect(url_for('inicio'))
        else:
            flash('Inicio de sesión fallido. Por favor, comprueba el usuario y la contraseña', 'danger')
    return render_template('login.html', title='Iniciar Sesión', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/areas')
@login_required
def areas():
    todas_las_areas = Area.query.all()
    return render_template('areas.html', areas=todas_las_areas)

@app.route('/area/nueva', methods=['GET', 'POST'])
@login_required
def nueva_area():
    form = AreaForm()
    if form.validate_on_submit():
        area = Area(nombre=form.nombre.data, parent=form.parent.data)
        db.session.add(area)
        db.session.commit()
        flash('¡El área ha sido creada!', 'success')
        return redirect(url_for('areas'))
    return render_template('crear_area.html', title='Nueva Área', form=form)

@app.route('/area/<int:area_id>/editar', methods=['GET', 'POST'])
@login_required
def editar_area(area_id):
    area = Area.query.get_or_404(area_id)
    form = AreaForm(obj=area)
    if form.validate_on_submit():
        area.nombre = form.nombre.data
        area.parent = form.parent.data
        db.session.commit()
        flash('¡El área ha sido actualizada!', 'success')
        return redirect(url_for('areas'))
    return render_template('crear_area.html', title='Editar Área', form=form)

@app.route('/area/<int:area_id>/eliminar', methods=['POST'])
@login_required
def eliminar_area(area_id):
    area = Area.query.get_or_404(area_id)
    db.session.delete(area)
    db.session.commit()
    flash('¡El área ha sido eliminada!', 'success')
    return redirect(url_for('areas'))

@app.route('/trabajadores')
@login_required
def trabajadores():
    todos_los_trabajadores = Trabajador.query.all()
    return render_template('trabajadores.html', trabajadores=todos_los_trabajadores)

@app.route('/trabajador/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_trabajador():
    form = TrabajadorForm()
    if form.validate_on_submit():
        trabajador = Trabajador(
            nombre_completo=form.nombre_completo.data,
            correo_electronico=form.correo_electronico.data,
            telefono=form.telefono.data,
            direccion_ip=form.direccion_ip.data,
            hostname=form.hostname.data,
            puesto=form.puesto.data,
            area=form.area.data
        )
        db.session.add(trabajador)
        db.session.commit()
        flash('¡El trabajador ha sido creado!', 'success')
        return redirect(url_for('trabajadores'))
    return render_template('crear_trabajador.html', title='Nuevo Trabajador', form=form)

@app.route('/trabajador/<int:trabajador_id>/editar', methods=['GET', 'POST'])
@login_required
def editar_trabajador(trabajador_id):
    trabajador = Trabajador.query.get_or_404(trabajador_id)
    form = TrabajadorForm(obj=trabajador)
    if form.validate_on_submit():
        trabajador.nombre_completo = form.nombre_completo.data
        trabajador.correo_electronico = form.correo_electronico.data
        trabajador.telefono = form.telefono.data
        trabajador.direccion_ip = form.direccion_ip.data
        trabajador.hostname = form.hostname.data
        trabajador.puesto = form.puesto.data
        trabajador.area = form.area.data
        db.session.commit()
        flash('¡El trabajador ha sido actualizado!', 'success')
        return redirect(url_for('trabajadores'))
    return render_template('crear_trabajador.html', title='Editar Trabajador', form=form)

@app.route('/trabajador/<int:trabajador_id>/eliminar', methods=['POST'])
@login_required
def eliminar_trabajador(trabajador_id):
    trabajador = Trabajador.query.get_or_404(trabajador_id)
    db.session.delete(trabajador)
    db.session.commit()
    flash('¡El trabajador ha sido eliminado!', 'success')
    return redirect(url_for('trabajadores'))

@app.route('/buscar')
@login_required
def buscar_trabajadores():
    query = request.args.get('q')
    if query:
        resultados = Trabajador.query.filter(
            (Trabajador.nombre_completo.contains(query)) |
            (Trabajador.correo_electronico.contains(query))
        ).all()
    else:
        resultados = []
    return render_template('resultados_busqueda.html', resultados=resultados, query=query)

@app.route('/exportar/trabajadores')
@login_required
def exportar_trabajadores():
    trabajadores = Trabajador.query.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Nombre Completo', 'Correo Electrónico', 'Teléfono', 'Dirección IP', 'Hostname', 'Puesto', 'Área'])
    for trabajador in trabajadores:
        writer.writerow([
            trabajador.nombre_completo,
            trabajador.correo_electronico,
            trabajador.telefono,
            trabajador.direccion_ip,
            trabajador.hostname,
            trabajador.puesto,
            trabajador.area.nombre
        ])
    output.seek(0)
    return make_response(output.getvalue(), 200, {'Content-Disposition': 'attachment; filename=trabajadores.csv', 'Content-Type': 'text/csv'})

@app.route('/exportar/areas')
@login_required
def exportar_areas():
    areas = Area.query.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Nombre', 'Área Padre'])
    for area in areas:
        parent_name = area.parent.nombre if area.parent else ''
        writer.writerow([area.nombre, parent_name])
    output.seek(0)
    return make_response(output.getvalue(), 200, {'Content-Disposition': 'attachment; filename=areas.csv', 'Content-Type': 'text/csv'})

if __name__ == '__main__':
    app.run(debug=True)
