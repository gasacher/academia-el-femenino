## Academia El Femenino.
## API REST: cursos (1) y alumnas inscriptas (N).
##
## Instalar: pip install -r requirements.txt
## Levantar: python app.py

import json
import os
import urllib.error
import urllib.request

from flask import Flask, jsonify, request
from flask_cors import CORS

import database

app = Flask(__name__)
## El cliente Angular corre en otro puerto. Sin CORS el navegador bloquea los pedidos.
CORS(app)

database.crear_tablas()


def cargar_env():
    ## La clave de la IA vive acá, en un archivo que no se sube al repositorio.
    ruta = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(ruta):
        return
    with open(ruta, encoding="utf-8") as archivo:
        for linea in archivo:
            linea = linea.strip()
            if linea == "" or linea.startswith("#") or "=" not in linea:
                continue
            clave, valor = linea.split("=", 1)
            os.environ.setdefault(clave.strip(), valor.strip().strip('"').strip("'"))


cargar_env()


def error(mensaje, codigo):
    return jsonify({"error": mensaje}), codigo


def leer_json():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return None
    return datos


def texto_obligatorio(datos, campo):
    valor = datos.get(campo)
    if not isinstance(valor, str):
        return None
    valor = valor.strip()
    if valor == "":
        return None
    return valor


def entero_obligatorio(datos, campo):
    valor = datos.get(campo)
    if isinstance(valor, bool) or not isinstance(valor, int):
        return None
    return valor


def validar_curso(datos):
    if datos is None:
        return None, "El cuerpo tiene que ser un JSON."

    nombre = texto_obligatorio(datos, "nombre")
    nivel = texto_obligatorio(datos, "nivel")
    dias = texto_obligatorio(datos, "dias")
    cupo = entero_obligatorio(datos, "cupo")

    if nombre is None:
        return None, "El nombre es obligatorio."
    if nivel is None:
        return None, "El nivel es obligatorio."
    if dias is None:
        return None, "Los días y el horario son obligatorios."
    if cupo is None or cupo < 1:
        return None, "El cupo tiene que ser un número entero mayor a 0."

    return {"nombre": nombre, "nivel": nivel, "dias": dias, "cupo": cupo}, None


def validar_alumna(datos):
    if datos is None:
        return None, "El cuerpo tiene que ser un JSON."

    nombre = texto_obligatorio(datos, "nombre")
    posicion = texto_obligatorio(datos, "posicion")
    edad = entero_obligatorio(datos, "edad")
    curso_id = entero_obligatorio(datos, "curso_id")

    if nombre is None:
        return None, "El nombre es obligatorio."
    if posicion is None:
        return None, "La posición es obligatoria."
    if edad is None or edad < 6 or edad > 99:
        return None, "La edad tiene que ser un número entero entre 6 y 99."
    if curso_id is None:
        return None, "Hay que indicar el curso."
    if not database.existe_curso(curso_id):
        return None, "El curso indicado no existe."

    return {
        "nombre": nombre,
        "edad": edad,
        "posicion": posicion,
        "curso_id": curso_id,
    }, None


@app.get("/")
def inicio():
    return jsonify({
        "app": "Academia El Femenino",
        "rutas": [
            "GET /cursos",
            "GET /cursos/<id>",
            "POST /cursos",
            "PUT /cursos/<id>",
            "DELETE /cursos/<id>",
            "GET /alumnas",
            "GET /alumnas?curso=<id>",
            "GET /alumnas?q=<texto>",
            "GET /alumnas/<id>",
            "POST /alumnas",
            "PUT /alumnas/<id>",
            "DELETE /alumnas/<id>",
            "POST /chat",
        ],
    })


@app.get("/cursos")
def listar_cursos():
    busqueda = request.args.get("q", "").strip()
    cursos = database.listar_cursos(busqueda or None)
    return jsonify(cursos)


@app.get("/cursos/<int:id>")
def ver_curso(id):
    curso = database.obtener_curso(id)
    if curso is None:
        return error("No existe ese curso.", 404)
    return jsonify(curso)


@app.post("/cursos")
def crear_curso():
    datos, mensaje = validar_curso(leer_json())
    if mensaje:
        return error(mensaje, 400)
    curso = database.crear_curso(datos)
    return jsonify(curso), 201


@app.put("/cursos/<int:id>")
def editar_curso(id):
    if database.obtener_curso(id) is None:
        return error("No existe ese curso.", 404)
    datos, mensaje = validar_curso(leer_json())
    if mensaje:
        return error(mensaje, 400)
    curso = database.actualizar_curso(id, datos)
    return jsonify(curso)


@app.delete("/cursos/<int:id>")
def borrar_curso(id):
    resultado = database.eliminar_curso(id)
    if resultado == "no_existe":
        return error("No existe ese curso.", 404)
    if resultado == "tiene_alumnas":
        return error(
            "No se puede borrar el curso porque tiene alumnas inscriptas. "
            "Primero hay que borrarlas o cambiarlas de curso.",
            400,
        )
    return jsonify({"ok": True})


@app.get("/alumnas")
def listar_alumnas():
    busqueda = request.args.get("q", "").strip()
    curso = request.args.get("curso", "").strip()
    curso_id = None
    if curso != "":
        if not curso.isdigit():
            return error("El filtro curso tiene que ser un id numérico.", 400)
        curso_id = int(curso)
    alumnas = database.listar_alumnas(curso_id, busqueda or None)
    return jsonify(alumnas)


@app.get("/alumnas/<int:id>")
def ver_alumna(id):
    alumna = database.obtener_alumna(id)
    if alumna is None:
        return error("No existe esa alumna.", 404)
    return jsonify(alumna)


@app.post("/alumnas")
def crear_alumna():
    datos, mensaje = validar_alumna(leer_json())
    if mensaje:
        return error(mensaje, 400)
    alumna = database.crear_alumna(datos)
    return jsonify(alumna), 201


@app.put("/alumnas/<int:id>")
def editar_alumna(id):
    if database.obtener_alumna(id) is None:
        return error("No existe esa alumna.", 404)
    datos, mensaje = validar_alumna(leer_json())
    if mensaje:
        return error(mensaje, 400)
    alumna = database.actualizar_alumna(id, datos)
    return jsonify(alumna)


@app.delete("/alumnas/<int:id>")
def borrar_alumna(id):
    if not database.eliminar_alumna(id):
        return error("No existe esa alumna.", 404)
    return jsonify({"ok": True})


def preguntar_al_modelo(mensaje, contexto):
    clave = os.environ.get("GEMINI_API_KEY", "").strip()
    if clave == "":
        return None, "Falta GEMINI_API_KEY en el archivo backend/.env."

    modelo = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()
    instruccion = (
        "Sos el asistente de la academia de fútbol femenino El Femenino. "
        "Respondé en español, breve y claro. "
        "Usá solamente los datos de la academia que te paso. "
        "Si la pregunta no se puede responder con esos datos, decilo. "
        "No inventes alumnas, cursos ni horarios.\n\n"
        f"{contexto}"
    )
    cuerpo = {
        "system_instruction": {"parts": [{"text": instruccion}]},
        "contents": [{"role": "user", "parts": [{"text": mensaje}]}],
    }
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{modelo}:generateContent?key={clave}"
    )
    pedido = urllib.request.Request(
        url,
        data=json.dumps(cuerpo).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(pedido, timeout=30) as respuesta:
            payload = json.loads(respuesta.read().decode("utf-8"))
    except urllib.error.HTTPError as excepcion:
        detalle = excepcion.read().decode("utf-8", errors="replace")
        return None, f"El servicio de IA respondió {excepcion.code}. {detalle[:300]}"
    except urllib.error.URLError:
        return None, "No se pudo conectar con el servicio de IA."

    try:
        texto = payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        return None, "El servicio de IA no devolvió una respuesta usable."
    return texto.strip(), None


@app.post("/chat")
def chat():
    datos = leer_json()
    if datos is None:
        return error("El cuerpo tiene que ser un JSON.", 400)
    mensaje = texto_obligatorio(datos, "mensaje")
    if mensaje is None:
        return error("El mensaje es obligatorio.", 400)

    ## Angular le habla a Flask. Flask arma el contexto con la base y le habla al modelo.
    respuesta, mensaje_error = preguntar_al_modelo(mensaje, database.contexto_para_chat())
    if mensaje_error:
        codigo = 503 if "GEMINI_API_KEY" in mensaje_error else 502
        return error(mensaje_error, codigo)
    return jsonify({"respuesta": respuesta})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
