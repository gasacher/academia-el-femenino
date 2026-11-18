import os
import sqlite3

## La base queda en la carpeta del backend. Se crea sola la primera vez.
RUTA = os.path.join(os.path.dirname(__file__), "academia.db")


def conectar():
    ## with abre, guarda y cierra, igual que con los archivos.
    conexion = sqlite3.connect(RUTA)
    ## Para leer cada fila como un diccionario: fila["nombre"]
    conexion.row_factory = sqlite3.Row
    ## Las claves foráneas no se activan solas en SQLite.
    conexion.execute("PRAGMA foreign_keys = ON")
    return conexion


def crear_tablas():
    with conectar() as conexion:
        conexion.execute("""
            CREATE TABLE IF NOT EXISTS cursos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                nivel TEXT NOT NULL,
                dias TEXT NOT NULL,
                cupo INTEGER NOT NULL
            )
        """)
        conexion.execute("""
            CREATE TABLE IF NOT EXISTS alumnas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                edad INTEGER NOT NULL,
                posicion TEXT NOT NULL,
                curso_id INTEGER NOT NULL,
                FOREIGN KEY (curso_id) REFERENCES cursos(id)
            )
        """)
    sembrar_si_esta_vacia()


def sembrar_si_esta_vacia():
    ## Datos de ejemplo para poder mostrar la API y el chatbot sin cargar todo a mano.
    with conectar() as conexion:
        cantidad = conexion.execute("SELECT COUNT(*) AS total FROM cursos").fetchone()["total"]
        if cantidad > 0:
            return

        cursos = [
            ("Arqueras iniciales", "Inicial", "Martes y jueves 18:00", 12),
            ("Defensoras formativas", "Formativo", "Lunes y miércoles 19:00", 16),
            ("Mediocampo competitivo", "Competitivo", "Viernes 17:00 y sábado 10:00", 14),
        ]
        for curso in cursos:
            conexion.execute(
                "INSERT INTO cursos (nombre, nivel, dias, cupo) VALUES (?, ?, ?, ?)",
                curso,
            )

        alumnas = [
            ("Luna Pereyra", 14, "Arquera", 1),
            ("Mia Gómez", 13, "Arquera", 1),
            ("Sofía Ruiz", 15, "Defensora central", 2),
            ("Valentina Castro", 16, "Lateral", 2),
            ("Emma Díaz", 17, "Mediocampista", 3),
            ("Juana Fernández", 16, "Volante", 3),
            ("Catalina López", 18, "Mediocampista", 3),
        ]
        for alumna in alumnas:
            conexion.execute(
                "INSERT INTO alumnas (nombre, edad, posicion, curso_id) VALUES (?, ?, ?, ?)",
                alumna,
            )


def _curso(fila):
    return {
        "id": fila["id"],
        "nombre": fila["nombre"],
        "nivel": fila["nivel"],
        "dias": fila["dias"],
        "cupo": fila["cupo"],
    }


def _alumna(fila):
    return {
        "id": fila["id"],
        "nombre": fila["nombre"],
        "edad": fila["edad"],
        "posicion": fila["posicion"],
        "curso_id": fila["curso_id"],
        "curso_nombre": fila["curso_nombre"],
    }


def listar_cursos(busqueda=None):
    with conectar() as conexion:
        sql = "SELECT id, nombre, nivel, dias, cupo FROM cursos"
        valores = ()
        if busqueda:
            sql += " WHERE nombre LIKE ? OR nivel LIKE ?"
            comodin = f"%{busqueda}%"
            valores = (comodin, comodin)
        sql += " ORDER BY nombre"
        filas = conexion.execute(sql, valores).fetchall()
        return [_curso(fila) for fila in filas]


def obtener_curso(id):
    with conectar() as conexion:
        fila = conexion.execute(
            "SELECT id, nombre, nivel, dias, cupo FROM cursos WHERE id = ?",
            (id,),
        ).fetchone()
        if fila is None:
            return None

        curso = _curso(fila)
        alumnas = conexion.execute(
            """
            SELECT alumnas.id, alumnas.nombre, alumnas.edad, alumnas.posicion,
                   alumnas.curso_id, cursos.nombre AS curso_nombre
            FROM alumnas
            JOIN cursos ON cursos.id = alumnas.curso_id
            WHERE alumnas.curso_id = ?
            ORDER BY alumnas.nombre
            """,
            (id,),
        ).fetchall()
        curso["alumnas"] = [_alumna(alumna) for alumna in alumnas]
        return curso


def crear_curso(datos):
    with conectar() as conexion:
        cursor = conexion.execute(
            "INSERT INTO cursos (nombre, nivel, dias, cupo) VALUES (?, ?, ?, ?)",
            (datos["nombre"], datos["nivel"], datos["dias"], datos["cupo"]),
        )
        nuevo_id = cursor.lastrowid
    ## Se lee después de cerrar la conexión, cuando el INSERT ya quedó guardado.
    return obtener_curso(nuevo_id)


def actualizar_curso(id, datos):
    with conectar() as conexion:
        resultado = conexion.execute(
            """
            UPDATE cursos
            SET nombre = ?, nivel = ?, dias = ?, cupo = ?
            WHERE id = ?
            """,
            (datos["nombre"], datos["nivel"], datos["dias"], datos["cupo"], id),
        )
        if resultado.rowcount == 0:
            return None
    return obtener_curso(id)


def eliminar_curso(id):
    ## Decisión: no se borra un curso que todavía tiene alumnas.
    ## Si se borrara en cascada, desaparecerían inscripciones sin aviso.
    with conectar() as conexion:
        existe = conexion.execute("SELECT id FROM cursos WHERE id = ?", (id,)).fetchone()
        if existe is None:
            return "no_existe"

        cantidad = conexion.execute(
            "SELECT COUNT(*) AS total FROM alumnas WHERE curso_id = ?",
            (id,),
        ).fetchone()["total"]
        if cantidad > 0:
            return "tiene_alumnas"

        conexion.execute("DELETE FROM cursos WHERE id = ?", (id,))
        return "ok"


def existe_curso(id):
    with conectar() as conexion:
        fila = conexion.execute("SELECT id FROM cursos WHERE id = ?", (id,)).fetchone()
        return fila is not None


def listar_alumnas(curso_id=None, busqueda=None):
    with conectar() as conexion:
        sql = """
            SELECT alumnas.id, alumnas.nombre, alumnas.edad, alumnas.posicion,
                   alumnas.curso_id, cursos.nombre AS curso_nombre
            FROM alumnas
            JOIN cursos ON cursos.id = alumnas.curso_id
        """
        condiciones = []
        valores = []
        if curso_id is not None:
            condiciones.append("alumnas.curso_id = ?")
            valores.append(curso_id)
        if busqueda:
            condiciones.append("(alumnas.nombre LIKE ? OR alumnas.posicion LIKE ?)")
            comodin = f"%{busqueda}%"
            valores.extend([comodin, comodin])
        if condiciones:
            sql += " WHERE " + " AND ".join(condiciones)
        sql += " ORDER BY alumnas.nombre"
        filas = conexion.execute(sql, valores).fetchall()
        return [_alumna(fila) for fila in filas]


def obtener_alumna(id):
    with conectar() as conexion:
        fila = conexion.execute(
            """
            SELECT alumnas.id, alumnas.nombre, alumnas.edad, alumnas.posicion,
                   alumnas.curso_id, cursos.nombre AS curso_nombre
            FROM alumnas
            JOIN cursos ON cursos.id = alumnas.curso_id
            WHERE alumnas.id = ?
            """,
            (id,),
        ).fetchone()
        if fila is None:
            return None
        return _alumna(fila)


def crear_alumna(datos):
    with conectar() as conexion:
        cursor = conexion.execute(
            "INSERT INTO alumnas (nombre, edad, posicion, curso_id) VALUES (?, ?, ?, ?)",
            (datos["nombre"], datos["edad"], datos["posicion"], datos["curso_id"]),
        )
        nuevo_id = cursor.lastrowid
    return obtener_alumna(nuevo_id)


def actualizar_alumna(id, datos):
    with conectar() as conexion:
        resultado = conexion.execute(
            """
            UPDATE alumnas
            SET nombre = ?, edad = ?, posicion = ?, curso_id = ?
            WHERE id = ?
            """,
            (datos["nombre"], datos["edad"], datos["posicion"], datos["curso_id"], id),
        )
        if resultado.rowcount == 0:
            return None
    return obtener_alumna(id)


def eliminar_alumna(id):
    with conectar() as conexion:
        resultado = conexion.execute("DELETE FROM alumnas WHERE id = ?", (id,))
        return resultado.rowcount > 0


def contexto_para_chat():
    ## Texto plano con los datos reales, para que el modelo responda sobre la academia.
    cursos = listar_cursos()
    alumnas = listar_alumnas()
    lineas = ["Cursos de la academia:"]
    for curso in cursos:
        lineas.append(
            f"- id {curso['id']}: {curso['nombre']} | nivel {curso['nivel']} | "
            f"{curso['dias']} | cupo {curso['cupo']}"
        )
    lineas.append("Alumnas inscriptas:")
    if not alumnas:
        lineas.append("- No hay alumnas cargadas.")
    for alumna in alumnas:
        lineas.append(
            f"- {alumna['nombre']}, {alumna['edad']} años, {alumna['posicion']}, "
            f"curso: {alumna['curso_nombre']}"
        )
    return "\n".join(lineas)
