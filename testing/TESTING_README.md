# Clínica — Backend (Turnos Médicos)

## 1. Prerrequisitos

- Node.js v18 o superior
- MySQL o MariaDB corriendo localmente
- Cliente de base de datos (DBeaver, MySQL Workbench, o consola)

## 2. Clonar e instalar

```bash
git clone https://github.com/Yuima98/SdG-Turnos-Medicos-Canello-DiPasquale
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

Es autocontenida: trae sus propios valores por defecto (`base_url`, DNIs, `seed_password`, etc.) como variables de colección, y los tokens de login se guardan ahí mismo (`token`, `token_admin`, `token_medico`, `token_operador`).

Para correr todo de una, usar el **Runner** de Postman sobre la colección completa. El orden ya viene resuelto en la propia colección.

La colección incluye las carpetas de Semana 3 (**Turnos**, **Historial clínico** y **Notificaciones**), que se apoyan en la agenda `id=2` del seed (médico `id=3`, sede `id=1`, fecha `2025-10-20`, 15:00 a 20:00hs) y corren después de "Agenda médica". Casos destacados para el entregable:

- `Turno - Alta (paciente) horario no disponible -> 409`: turno rechazado por horario fuera de agenda.
- `Turno - Cancelación (paciente, turno propio)`: cancela un turno y dispara la notificación correspondiente (verificable en la carpeta **Notificaciones**).
- `Historial - Alta (médico, turno atendido)`: registra el historial clínico de un turno recién marcado como atendido, quedando ambos asociados por `id_turno`.

## 8. Reiniciar los datos antes de repetir el testing

Cada corrida de la colección crea datos nuevos (paciente registrado, sede/especialidad/cobertura/agenda dados de alta, etc.). Para repetir el testing desde cero sin arrastrar esos datos, correr `reset_test_data.sql` (incluido en el repo) contra la base **antes de cada corrida** del Runner:

- **DBeaver:** abrir `reset_test_data.sql`, seleccionar todo y ejecutar con **Execute SQL Script** (`Alt+X`) — no con `Ctrl+Enter`, que solo corre una sentencia y tira error de sintaxis al toparse con el `;` del script completo.
- **Consola:**
  ```bash
  mysql -u root -p clinica_bdd < reset_test_data.sql
  ```

El script vacía todas las tablas y vuelve a cargar la seed data con los mismos IDs del dump original (incluyendo `admin`/`medico`/`operador` ya con la password `Password123!` habilitada, sin necesidad de correr el `UPDATE` del paso 5 de nuevo). Como los AUTO_INCREMENT quedan en el mismo punto de partida en cada reseteo, los IDs que genera Postman durante el testing (paciente, sede, especialidad, cobertura, agenda) también se repiten igual corrida tras corrida.