# Clínica — Backend (Turnos Médicos)

## 1. Prerrequisitos

- Node.js v18 o superior
- MySQL o MariaDB corriendo localmente
- Cliente de base de datos (DBeaver, MySQL Workbench, o consola)

## 2. Clonar e instalar

```bash
git clone <url-del-repo>
cd SdG-Turnos-Medicos-Canello-DiPasquale
git checkout entrega-backend-2
npm install
```

## 3. Base de datos

Crear la base:

```sql
CREATE DATABASE clinica_bdd;
```

Importar el script provisto:

```bash
mysql -u root -p clinica_bdd < clinica_bdd.sql
```

> **Nota:** las contraseñas que trae el dump (`usuario.password`) son hashes de ejemplo (`$2b$10$hashdeejemplo...`), no corresponden a ninguna contraseña real — no se puede loguear con esos usuarios tal cual vienen. Ver el paso 5 para crear un usuario admin de prueba.

## 4. Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes claves:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<tu password de root>
DB_NAME=clinica_bdd
JWT_SECRET=<un string random>
PORT=3000
```

Para generar un `JWT_SECRET` random:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Crear un usuario admin de prueba

El endpoint de registro público (`POST /auth/registro`) asigna automáticamente el rol `paciente`, así que un usuario `admin` se carga directo en la base. Contraseña de prueba: `admin1234`.

```sql
INSERT INTO usuario (nombre, apellido, dni, email, password, fecha_nacimiento, telefono, rol)
VALUES ('Admin', 'Sistema', '99999999', 'admin@test.com', '$2b$10$OjUrPKoKnAZ9.jS3QuGQIuq6ABdGJTqcVyFC2IxzJQupGJoJZg7Fm', '1990-01-01', '3424000000', 'admin');
```

## 6. Levantar el servidor

```bash
npm run dev
```

Confirmar que arrancó correctamente:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{"codigo":200,"estado":"ok","datos":null}
```

## 7. Probar con Postman

Importar los dos archivos incluidos en el repo:

- `Clinica-Backend.postman_collection.json`
- `Clinica-Local.postman_environment.json`

Seleccionar el environment **"Clinica - Local"** como activo (arriba a la derecha en Postman).

Correr primero la request **Login Admin** (usa el usuario creado en el paso 5) — guarda el token automáticamente en la variable de entorno `token`, que usan todas las demás requests protegidas.

Para correr todo de una, usar el **Runner** de Postman sobre la colección completa, respetando el orden en que aparecen las carpetas (Auth primero).
