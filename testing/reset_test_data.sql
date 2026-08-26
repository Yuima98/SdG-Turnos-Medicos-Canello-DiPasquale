-- reset_test_data.sql
-- Reinicia clinica_bdd al estado inicial (seed data + passwords habilitadas)
-- para poder repetir el testing de Postman desde cero.
--
-- Uso en DBeaver: seleccionar todo el archivo y ejecutar con "Execute SQL Script" (Alt+X),
-- NO con "Execute SQL Statement" (Ctrl+Enter) — el script tiene varias sentencias separadas por ";".

-- 1) Vaciar todas las tablas (se apagan los checks de FK para poder truncar en cualquier orden)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE notificacion;
TRUNCATE log_auditoria;
TRUNCATE historial_clinico;
TRUNCATE turno;
TRUNCATE agenda;
TRUNCATE medico_especialidad;
TRUNCATE usuario;
TRUNCATE cobertura;
TRUNCATE especialidad;
TRUNCATE sede;
SET FOREIGN_KEY_CHECKS = 1;

-- 2) Re-sembrar los datos base (mismos IDs que clinica_bdd.sql, así los AUTO_INCREMENT
--    quedan iguales en cada corrida y las requests que dependen de esos IDs no se rompen)
INSERT INTO `sede` (`id`, `nombre`, `direccion`, `telefono`) VALUES
(1, 'Sede Centro', 'San Martín 123', '3424000001'),
(2, 'Sede Norte', 'Av. Rivadavia 456', '3424000002');

INSERT INTO `cobertura` (`id`, `nombre`) VALUES
(1, 'Jerarquicos');

INSERT INTO `especialidad` (`id`, `descripcion`) VALUES
(1, 'Traumatologia');

-- admin, medico y operador ya quedan con la password real (Password123!) cargada:
-- no hace falta correr el UPDATE aparte como en la carga inicial del dump.
INSERT INTO `usuario` (`id`, `apellido`, `nombre`, `fecha_nacimiento`, `password`, `rol`, `email`, `telefono`, `dni`, `id_sede`, `id_cobertura`) VALUES
(1, 'Perez', 'Juan', '1995-12-30', '$2b$10$XslK5zKRxAI04qv5hUmfXeoUsOmB49oHcTpwlr5mAcMkSNMvaQMr.', 'operador', 'jperez@gmail.com', '3424568897', '15200548', 1, NULL),
(2, 'Friggeri', 'Franco', '1998-03-14', '$2b$10$hashdeejemplo2', 'paciente', 'asdas@gaasds.com', '342545555', '36000960', NULL, 1),
(3, 'Lopez', 'Ana', '1980-05-10', '$2b$10$XslK5zKRxAI04qv5hUmfXeoUsOmB49oHcTpwlr5mAcMkSNMvaQMr.', 'medico', 'alopez@clinica.com', '3424111222', '20111222', 1, NULL),
(4, 'Gomez', 'Marcos', '1975-08-01', '$2b$10$XslK5zKRxAI04qv5hUmfXeoUsOmB49oHcTpwlr5mAcMkSNMvaQMr.', 'admin', 'mgomez@clinica.com', '3424222333', '18222333', NULL, NULL);

INSERT INTO `medico_especialidad` (`id`, `id_medico`, `id_especialidad`) VALUES
(1, 3, 1);

INSERT INTO `agenda` (`id`, `hora_entrada`, `hora_salida`, `fecha`, `id_medico`, `id_especialidad`, `id_sede`) VALUES
(2, '15:00', '20:00', '2025-10-20', 3, 1, 1);

INSERT INTO `turno` (`id`, `nota`, `id_agenda`, `fecha`, `hora`, `id_paciente`, `id_cobertura`, `estado`) VALUES
(2, 'Control de estudio', 2, '2025-10-27', '15:30', 2, 1, 'atendido');

INSERT INTO `historial_clinico` (`id`, `id_turno`, `id_medico`, `id_paciente`, `diagnostico`, `tratamiento`, `observaciones`, `fecha_registro`) VALUES
(1, 2, 3, 2, 'Esguince de tobillo grado I', 'Reposo y antiinflamatorios', 'Control en 15 dias', '2025-10-27 16:00:00');

INSERT INTO `log_auditoria` (`id`, `id_usuario`, `accion`, `entidad`, `id_entidad`, `detalle`, `fecha`) VALUES
(1, 4, 'ALTA', 'usuario', 2, 'Alta de paciente Friggeri Franco', '2025-10-01 10:00:00');

INSERT INTO `notificacion` (`id`, `id_usuario`, `tipo`, `mensaje`, `leida`, `fecha`) VALUES
(1, 2, 'turno_confirmado', 'Tu turno del 27/10/2025 a las 15:30 fue confirmado.', 1, '2025-10-01 09:00:00'),
(2, 3, 'turno_atendido', 'Registraste el turno de Franco Friggeri como atendido.', 0, '2025-10-27 16:00:00');