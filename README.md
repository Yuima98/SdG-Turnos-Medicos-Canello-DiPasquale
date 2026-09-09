Un consultorio médico que hoy gestiona su agenda de forma manual (las
secretarías cargan los turnos y los imprimen antes de la jornada) decide
digitalizar su operación mediante una aplicación web. La clínica está creciendo y
necesita una solución que acompañe ese crecimiento.
El sistema deberá dar soporte a la operación diaria de la clínica: la gestión de sus
usuarios, de la agenda médica y de los turnos de los pacientes. El alcance
concreto de cada parte lo van a ir conociendo a medida que avance el proyecto.
# Sistema de Gestión de Turnos Médicos — Backend

Un consultorio médico que hoy gestiona su agenda de forma manual (las
secretarías cargan los turnos y los imprimen antes de la jornada) decide
digitalizar su operación mediante una aplicación web. La clínica está creciendo y
necesita una solución que acompañe ese crecimiento.
El sistema deberá dar soporte a la operación diaria de la clínica: la gestión de sus
usuarios, de la agenda médica y de los turnos de los pacientes.

## Stack

- Node.js + Express 5
- MySQL / MariaDB (`mysql2`)
- Autenticación con JWT (`jsonwebtoken`) + hash de contraseñas con `bcrypt`
- Testing manual con Postman (colección incluida en `testing/`)

## Requerimientos

- Node.js v18 o superior
- MySQL o MariaDB corriendo localmente
- Un cliente de base de datos (DBeaver, MySQL Workbench o consola) para cargar el schema

## Ejecución

```bash
git clone https://github.com/Yuima98/SdG-Turnos-Medicos-Canello-DiPasquale
cd SdG-Turnos-Medicos-Canello-DiPasquale
npm install
```

Crear la base y cargar el schema + datos semilla:

```sql
CREATE DATABASE clinica_bdd;
```

```bash
mysql -u root -p clinica_bdd < clinica_bdd.sql
```

Crear un archivo `.env` en la raíz (ver `.env.example`):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<tu password de root>
DB_NAME=clinica_bdd
JWT_SECRET=<un string random>
PORT=3000
```

Levantar el servidor:

```bash
npm run dev
```

Verificar que arrancó:

```bash
curl http://localhost:3000/health
```

> Guía completa —habilitar los usuarios semilla, importar y correr la colección
> de Postman, resetear los datos entre corridas de testing— en
> [`testing/TESTING_README.md`](testing/TESTING_README.md).

## Estructura del proyecto

```
src/
  controllers/   lógica de cada endpoint
  routes/        definición de rutas por entidad
  middlewares/   verificarToken, verificarRol, auditoría automática
  utils/         helpers (horarios, auditoría)
  database/      conexión al pool de MySQL
testing/         colección de Postman, script de reseteo de datos y guía de testing
clinica_bdd.sql  schema completo + datos semilla
```

## Avances

- **Sprint 1** — Setup del proyecto, conexión a MySQL, registro/login de usuarios con JWT, middlewares de autenticación y rol (`verificarToken`, `verificarRol`), formato de respuesta uniforme.
- **Sprint 2** — CRUD completo de sedes, especialidades, coberturas y agenda médica, protegido por rol.
- **Sprint 3** — Alta, cancelación y atención de turnos (con validación de disponibilidad y superposición de agenda), historial clínico asociado y notificaciones internas por evento.
- **Sprint 4** — Auditoría automática de altas/bajas/modificaciones sobre usuarios/sedes/especialidades/coberturas, reportes y estadísticas para el rol admin, y documentación completa de la API en Postman.

## Desarrolladores

- Agustina Di Pasquale ([@Yuima98](https://github.com/Yuima98))
- Manuel Canello