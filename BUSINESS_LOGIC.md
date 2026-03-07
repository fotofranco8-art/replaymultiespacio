# BUSINESS_LOGIC.md - Replay OS Finale

> Generado por SaaS Factory | Fecha: 2026-03-06

---

## 1. Problema de Negocio

**Dolor:** Los centros de entrenamiento, estudios de danza, boxes de CrossFit y multiespacios sufren "Caos Administrativo" en tres vectores críticos:

1. **Infierno del Agendamiento Manual** — Excel o papel para programar semanas. Cambiar un profesor, proyectar feriados o garantizar las 4 clases mensuales es trabajo manual propenso a errores.
2. **Fuga de Asistencia y Pagos** — Sin visibilidad en tiempo real: alumnos con deudas asisten sin control, recuperaciones no rastreadas, recargo por transferencia olvidado.
3. **Desconexion entre Roles** — Admin, profesor y alumno coordinan por WhatsApp. El admin no tiene cierre de caja claro, el profesor no sabe cuantos alumnos esperar, el alumno no sabe sus clases disponibles.

**Costo actual (centro de 150 alumnos):**

| Concepto | Impacto Mensual |
|----------|----------------|
| Perdida por deuda/vencidos (10% facturacion) | $450 USD |
| Recargos de transferencia no cobrados | $120 USD |
| Costo de tiempo (12h/semana x $10/h) | $400 USD |
| **TOTAL PERDIDA ESTIMADA** | **$970 USD/mes** |

- 8-12 horas semanales perdidas en tareas administrativas de bajo valor
- 15-20% de la base de alumnos con deudas o fichas desactualizadas
- 5-8 alumnos "fantasma" por cada 150

---

## 2. Solucion

**Propuesta de valor:** Un sistema operativo inteligente que automatiza la operacion total y blinda la rentabilidad para centros de entrenamiento y multiespacios.

**Flujo A: El Cerebro (Configuracion del Mes)**
1. Admin configura la Plantilla semanal (disciplina / horario / profesor / aula)
2. Con un click, el sistema proyecta masivamente todos los registros de clases del mes en la BD
3. El sistema cruza con la tabla de feriados cargados manualmente; si detecta uno, omite esa clase y agrega un "Balance de Recuperacion" automatico al alumno
4. El sistema inscribe automaticamente a los alumnos de esa disciplina en todas las instancias generadas

**Flujo B: Control de Acceso (Check-In)**
1. Kiosco (/reception) muestra un token QR dinamico en pantalla
2. El alumno abre su portal desde el movil y escanea el QR del kiosco
3. El sistema valida en milisegundos: clase activa ahora + alumno activo + balance disponible o pago al dia
4. Resultado en vivo: verde (registra check-in) o rojo (motivo claro del bloqueo)
5. El profesor ve su roster actualizarse en tiempo real con cada check-in

**Flujo C: La Caja Fuerte (Cobros)**
1. Admin registra pago del alumno eligiendo metodo: Efectivo o Transferencia
2. Si es Transferencia, el sistema aplica automaticamente +10% de recargo
3. Se actualiza el balance del alumno y se habilita su carnet QR
4. El admin ve el dashboard de cierre: Total Efectivo vs Total Transferencia para arqueo instantaneo

---

## 3. Usuarios y Portales

| Portal | Rol | Acceso |
|--------|-----|--------|
| `/admin` | Dueno + Recepcionista | Total: caja, pagos (+10% recargo), alta de alumnos, agenda mensual, arqueo diario |
| `/teacher` | Instructor | Academico: roster de su clase en tiempo real, marcar asistencias. Sin acceso a ingresos ni datos de otros alumnos |
| `/student` | Alumno | Auto-gestion: QR personal, clases de recuperacion disponibles, estado de mensualidades |
| `/reception` | Kiosco fijo (sin login) | Solo proyecta el token QR dinamico para que los alumnos escaneen al llegar |

---

## 4. Arquitectura de Datos

**Input:**
- Plantilla semanal (disciplina, horario, profesor, aula)
- Feriados manuales con fecha de compensacion definida por el admin
- Alta de alumno (nombre, disciplina, plan de cuotas)
- Pago discriminado (monto, metodo: efectivo/transferencia)
- Escaneo QR: alumno escanea kiosco al llegar

**Output:**
- Agenda mensual proyectada (visible por profesores y alumnos)
- Carnet digital / QR personal por alumno
- Token QR dinamico en kiosco de recepcion
- Roster en tiempo real durante la clase (para el profesor)
- Arqueo de caja diario: efectivo vs transferencia
- Historial de pagos y balance de clases por alumno
- Email de invitacion al alumno (unica notificacion del sistema)

**Storage — Tablas Supabase sugeridas:**

| Tabla | Descripcion |
|-------|-------------|
| `profiles` | Usuarios del sistema con rol (admin, teacher, student) |
| `centers` | Centro de entrenamiento (multi-tenant futuro) |
| `disciplines` | Disciplinas ofrecidas (danza, crossfit, etc.) |
| `class_templates` | Plantillas semanales (dia, horario, profesor, aula, disciplina) |
| `classes` | Instancias reales de clase generadas por proyeccion masiva |
| `class_enrollments` | Inscripcion de alumno a una clase especifica |
| `attendance` | Registro de check-in por clase + alumno |
| `holidays` | Feriados cargados manualmente con fecha de compensacion |
| `memberships` | Plan/cuota de cada alumno (activo, vencido) |
| `payments` | Pagos registrados (monto, metodo, recargo aplicado, fecha) |
| `recovery_balance` | Balance de clases de recuperacion acumulado por alumno |
| `qr_tokens` | QR estatico del kiosco por centro (permanente, no rota) |

---

## 5. KPIs de Exito (V1)

| KPI | Baseline | Meta |
|-----|----------|------|
| Tiempo de proyeccion de agenda mensual | 3 horas manual | < 5 minutos con un click |
| Alumnos con deuda que hacen check-in exitoso | ~15-20% de la base | 0 (bloqueo QR total) |
| Tiempo de cierre de caja diario | Manual / sin metodo | < 2 minutos con dashboard |

---

## 6. Especificacion Tecnica

### Features a Implementar (Feature-First)

```
src/features/
├── auth/              # Autenticacion Email/Password (Supabase) + invitacion por rol
├── scheduling/        # Plantillas + Proyeccion Masiva + Feriados + Compensaciones
├── students/          # Alta, perfil, balance de clases, estado de membresia
├── payments/          # Registro de pagos, logica de recargo transferencia +10%, arqueo
├── check-in/          # Token QR dinamico (kiosco) + escaneo alumno + validacion
├── attendance/        # Roster en tiempo real para profesor + historial
└── dashboard/         # Cierre de caja diario (admin) + vista de agenda (todos)
```

### Stack Confirmado

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui
- **Backend:** Supabase (Auth + Database + Storage + Realtime para roster en vivo)
- **Validacion:** Zod
- **Estado:** Zustand (sesion de roles + estado de kiosco)
- **QR:** `qrcode` (generacion) + `html5-qrcode` o camara nativa (escaneo desde movil)
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Consideraciones Tecnicas Criticas

1. **Realtime Roster:** Supabase Realtime Subscriptions en la tabla `attendance` — el profesor ve check-ins al instante sin polling.
2. **Token QR Kiosco:** El kiosco muestra un QR estatico y permanente (no rota). El alumno lo escanea y el sistema valida en el backend. La logica anti-fraude vive en la validacion server-side (clase activa + balance + estado), no en el token.
3. **Proyeccion Masiva:** Una sola transaccion SQL que genera N registros en `classes` + N registros en `class_enrollments`. Usar `supabase.rpc()` para atomicidad.
4. **Logica de Feriados:** Al proyectar el mes, cruzar fechas generadas con la tabla `holidays`. Por cada colision: no generar la clase + incrementar `recovery_balance` de todos los alumnos inscriptos en esa disciplina.
5. **RLS por Rol:** Cada tabla tiene politicas que limitan lo que cada rol puede leer/escribir. El alumno solo ve SUS datos. El profesor solo ve SU roster.
6. **Recargo Transferencia:** Campo booleano `transfer_surcharge` en `payments`. Al activarlo, el monto se multiplica x 1.10 antes de guardar. El arqueo de caja muestra totales pre y post recargo.

### Proximos Pasos

1. [ ] Setup proyecto base Next.js 16 + Supabase
2. [ ] Configurar Supabase: tablas + RLS por rol
3. [ ] Implementar Auth con roles (admin / teacher / student / reception)
4. [ ] Feature: `students` — alta y perfil de alumno
5. [ ] Feature: `scheduling` — plantillas + proyeccion masiva + feriados
6. [ ] Feature: `payments` — caja con logica de recargo
7. [ ] Feature: `check-in` — kiosco QR + escaneo + validacion
8. [ ] Feature: `attendance` — roster en tiempo real (Supabase Realtime)
9. [ ] Feature: `dashboard` — arqueo de caja + vistas por rol
10. [ ] Testing E2E con Playwright
11. [ ] Deploy Vercel

---

*"Primero entiende el negocio. Despues escribe codigo."*
*Generado por SaaS Factory V3 — Auto-Blindaje activo.*
