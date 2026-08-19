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

> **Nota:** las contraseñas que trae el dump (`usuario.password`) son hashes de ejemplo (`$2b$10$hashdeejemplo...`), no corresponden a ninguna contraseña real — no se puede loguear con esos usuarios tal cual vienen. Ver el paso 5 para habilitarlos.

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

## 5. Habilitar los usuarios semilla

El script provisto trae usuarios de ejemplo con contraseñas placeholder (`$2b$10$hashdeejemploN`), que no sirven para loguearse. Antes de correr la colección hay que actualizarles la contraseña a los tres roles administrativos que usa (por DNI):

```sql
UPDATE usuario SET password = '$2b$10$XslK5zKRxAI04qv5hUmfXeoUsOmB49oHcTpwlr5mAcMkSNMvaQMr.' WHERE dni IN ('18222333', '20111222', '15200548');
```

Con eso, `admin` (DNI `18222333`), `medico` (DNI `20111222`) y `operador` (DNI `15200548`) quedan logueables con la contraseña `Password123!`.

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

Importar la colección incluida en el repo:

- `SdG-Turnos-Medicos_postman_collection.json`

Es autocontenida: trae sus propios valores por defecto (`base_url`, DNIs, `seed_password`, etc.) como variables de colección, y los tokens de login se guardan ahí mismo (`token_admin`, `token_medico`, `token_operador`).

Correr primero las requests de **"Auth - Login por rol (Semana 2)"** (usan los usuarios habilitados en el paso 5). Para correr todo de una, usar el **Runner** de Postman sobre la colección completa, respetando el orden en que aparecen las carpetas (Auth primero).