# Academia El Femenino

Trabajo integrador de **Aplicaciones Híbridas** y **Clientes Web Mobile**.

Una academia de fútbol femenino. Un curso tiene muchas alumnas y cada alumna pertenece a un solo curso. La API está en Flask y el cliente en Angular.

## Cómo levantarlo

En una terminal, el backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

En otra terminal, el frontend:

```bash
cd frontend
npm install
npm start
```

La API queda en `http://127.0.0.1:5000` y la app en `http://localhost:4200`.

## Chat

La clave no va en Angular ni en el repositorio. Se lee de `backend/.env`.

1. Crear una clave gratis en [Google AI Studio](https://aistudio.google.com/apikey).
2. Copiar `backend/.env.example` a `backend/.env`.
3. Pegar la clave en `GEMINI_API_KEY`.
4. Reiniciar `python app.py`.

Angular le manda la pregunta a `POST /chat`. Flask arma un texto con los cursos y las alumnas de SQLite y se lo pasa a Gemini. Si no hay clave, el CRUD sigue funcionando y el chat muestra el error.

## Rutas de la API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/cursos` | Lista los cursos. Acepta `?q=` para buscar por nombre o nivel. |
| GET | `/cursos/<id>` | Un curso, con sus alumnas. 404 si no existe. |
| POST | `/cursos` | Crea un curso. 201, o 400 si faltan datos. |
| PUT | `/cursos/<id>` | Edita un curso. 404 si no existe, 400 si los datos no sirven. |
| DELETE | `/cursos/<id>` | Borra un curso. 400 si todavía tiene alumnas. |
| GET | `/alumnas` | Lista las alumnas. `?curso=<id>` filtra por curso y `?q=` busca por nombre o posición. |
| GET | `/alumnas/<id>` | Una alumna. 404 si no existe. |
| POST | `/alumnas` | Crea una alumna. 400 si el curso no existe o los datos no sirven. |
| PUT | `/alumnas/<id>` | Edita una alumna. |
| DELETE | `/alumnas/<id>` | Borra una alumna. |
| POST | `/chat` | `{ "mensaje": "..." }`. Responde con los datos de la academia. |

Los cuerpos van en JSON. Ejemplo de curso: `nombre`, `nivel`, `dias`, `cupo`. Ejemplo de alumna: `nombre`, `edad`, `posicion`, `curso_id`.

## Decisiones

- **Rubro:** academia, uno de los de la consigna. Cursos (1) y alumnas inscriptas (N). No es un turnero.
- **Borrado:** no se borra un curso que tiene alumnas. Borrar en cascada haría desaparecer inscripciones sin avisar. Primero hay que borrar a las alumnas o cambiarlas de curso. Por eso `DELETE /cursos/<id>` responde 400.
- **Chat:** Gemini, porque tiene un plan gratuito. La clave vive en el backend. El modelo solo recibe los datos que hay en la base, para que no invente cursos ni alumnas.
- **Cliente:** los componentes no usan `HttpClient`. Los pedidos pasan por `CursosService`, `AlumnasService` y `ChatService`.

## En qué se usó IA

Usé IA para armar la estructura del proyecto, la API y las pantallas. Las decisiones (el rubro, no borrar un curso con alumnas y dejar la clave de Gemini en Flask) las puedo explicar, igual que el código de `backend/` y `frontend/src/app/`.
