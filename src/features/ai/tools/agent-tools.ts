import { tool } from 'ai'
import { z } from 'zod'
import { getStudents, toggleStudentStatus, inviteStudent } from '@/features/students/services/students.actions'
import { getInstructors, toggleInstructorStatus, inviteInstructor } from '@/features/instructors/services/instructors.actions'
import { getRooms, createRoom } from '@/features/rooms/services/rooms.actions'
import {
  getCashRegisterSummary,
  getTodayPayments,
  getActiveStudents,
  registerPayment,
} from '@/features/payments/services/payments.actions'
import {
  getDisciplines,
  createDiscipline,
  getCalendarClasses,
  getHolidays,
  addHoliday,
  removeHoliday,
  cancelClass,
  projectMonth,
  getMonthlyRevenue,
  getTeacherAlerts,
} from '@/features/scheduling/services/scheduling.actions'

export const agentTools = {
  // --- LECTURA ---
  get_students: tool({
    description: 'Obtiene la lista de todos los alumnos del centro con sus membresías.',
    inputSchema: z.object({}),
    execute: async () => {
      const students = await getStudents()
      return students.map((s) => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        is_active: s.is_active,
      }))
    },
  }),

  get_payments_summary: tool({
    description: 'Obtiene el resumen de caja del día (totales en efectivo, transferencia y total general).',
    inputSchema: z.object({}),
    execute: async () => getCashRegisterSummary(),
  }),

  get_today_payments: tool({
    description: 'Obtiene los pagos registrados hoy con detalle de cada transacción.',
    inputSchema: z.object({}),
    execute: async () => getTodayPayments(),
  }),

  get_active_students: tool({
    description: 'Obtiene la lista de alumnos activos (útil para seleccionar a quién registrarle un pago).',
    inputSchema: z.object({}),
    execute: async () => getActiveStudents(),
  }),

  get_calendar_classes: tool({
    description: 'Obtiene las clases del calendario para un mes específico.',
    inputSchema: z.object({
      year: z.number().describe('Año (ej: 2026)'),
      month: z.number().min(1).max(12).describe('Mes (1-12)'),
    }),
    execute: async ({ year, month }) => {
      const classes = await getCalendarClasses(year, month)
      return classes.map((c) => ({
        id: c.id,
        scheduled_date: c.scheduled_date,
        start_time: c.start_time,
        end_time: c.end_time,
        is_cancelled: c.is_cancelled,
        discipline: (c.disciplines as unknown as { name: string })?.name,
        instructor: (c.profiles as unknown as { full_name: string })?.full_name,
      }))
    },
  }),

  get_disciplines: tool({
    description: 'Obtiene la lista de disciplinas/actividades del centro.',
    inputSchema: z.object({}),
    execute: async () => getDisciplines(),
  }),

  get_instructors: tool({
    description: 'Obtiene la lista de profesores/instructores del centro.',
    inputSchema: z.object({}),
    execute: async () => getInstructors(),
  }),

  get_rooms: tool({
    description: 'Obtiene la lista de salas/espacios del centro.',
    inputSchema: z.object({}),
    execute: async () => getRooms(),
  }),

  get_holidays: tool({
    description: 'Obtiene la lista de feriados registrados.',
    inputSchema: z.object({}),
    execute: async () => getHolidays(),
  }),

  get_teacher_alerts: tool({
    description: 'Obtiene las clases de hoy sin asistentes registrados (alertas de profesores).',
    inputSchema: z.object({}),
    execute: async () => getTeacherAlerts(),
  }),

  get_monthly_revenue: tool({
    description: 'Obtiene el total de ingresos del mes actual.',
    inputSchema: z.object({}),
    execute: async () => {
      const total = await getMonthlyRevenue()
      return { monthly_revenue: total }
    },
  }),

  // --- ESCRITURA (requieren confirmación previa del admin) ---
  register_payment: tool({
    description: 'Registra un pago de un alumno. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      student_id: z.string().uuid().describe('ID del alumno'),
      amount: z.number().positive().describe('Monto base del pago'),
      method: z.enum(['cash', 'transfer']).describe('Método de pago: cash o transfer'),
      notes: z.string().optional().describe('Notas opcionales'),
    }),
    execute: async ({ student_id, amount, method, notes }) => {
      await registerPayment({ payment_type: 'student', student_id, amount, method, notes })
      return { success: true, message: `Pago de $${amount} registrado correctamente.` }
    },
  }),

  cancel_class: tool({
    description: 'Cancela una clase del calendario. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      class_id: z.string().uuid().describe('ID de la clase a cancelar'),
    }),
    execute: async ({ class_id }) => {
      await cancelClass(class_id)
      return { success: true, message: 'Clase cancelada correctamente.' }
    },
  }),

  add_holiday: tool({
    description: 'Agrega un feriado y cancela las clases de ese día. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      date: z.string().describe('Fecha del feriado en formato YYYY-MM-DD'),
      name: z.string().describe('Nombre o descripción del feriado'),
    }),
    execute: async ({ date, name }) => {
      await addHoliday(date, name)
      return { success: true, message: `Feriado "${name}" agregado para ${date}.` }
    },
  }),

  remove_holiday: tool({
    description: 'Elimina un feriado registrado. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      holiday_id: z.string().uuid().describe('ID del feriado a eliminar'),
    }),
    execute: async ({ holiday_id }) => {
      await removeHoliday(holiday_id)
      return { success: true, message: 'Feriado eliminado correctamente.' }
    },
  }),

  project_month: tool({
    description: 'Proyecta las clases de un mes según los templates semanales. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      year: z.number().describe('Año a proyectar'),
      month: z.number().min(1).max(12).describe('Mes a proyectar (1-12)'),
    }),
    execute: async ({ year, month }) => {
      await projectMonth(year, month)
      return { success: true, message: `Mes ${month}/${year} proyectado correctamente.` }
    },
  }),

  invite_student: tool({
    description: 'Invita un nuevo alumno al sistema. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      full_name: z.string().describe('Nombre completo del alumno'),
      email: z.string().email().describe('Email del alumno'),
      phone: z.string().optional().describe('Teléfono opcional'),
    }),
    execute: async ({ full_name, email, phone }) => {
      await inviteStudent({ full_name, email, phone, discipline_ids: [] })
      return { success: true, message: `Invitación enviada a ${email}.` }
    },
  }),

  invite_instructor: tool({
    description: 'Invita un nuevo instructor/profesor al sistema. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      full_name: z.string().describe('Nombre completo del instructor'),
      email: z.string().email().describe('Email del instructor'),
      phone: z.string().optional().describe('Teléfono opcional'),
    }),
    execute: async ({ full_name, email, phone }) => {
      await inviteInstructor({ full_name, email, phone })
      return { success: true, message: `Invitación enviada a ${email}.` }
    },
  }),

  toggle_student: tool({
    description: 'Activa o desactiva un alumno. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      student_id: z.string().uuid().describe('ID del alumno'),
      is_active: z.boolean().describe('true para activar, false para desactivar'),
    }),
    execute: async ({ student_id, is_active }) => {
      await toggleStudentStatus(student_id, is_active)
      return { success: true, message: `Alumno ${is_active ? 'activado' : 'desactivado'}.` }
    },
  }),

  toggle_instructor: tool({
    description: 'Activa o desactiva un instructor. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      instructor_id: z.string().uuid().describe('ID del instructor'),
      is_active: z.boolean().describe('true para activar, false para desactivar'),
    }),
    execute: async ({ instructor_id, is_active }) => {
      await toggleInstructorStatus(instructor_id, is_active)
      return { success: true, message: `Instructor ${is_active ? 'activado' : 'desactivado'}.` }
    },
  }),

  create_discipline: tool({
    description: 'Crea una nueva disciplina/actividad. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      name: z.string().describe('Nombre de la disciplina'),
      color: z.string().describe('Color en formato hex (ej: #7C3AED)'),
    }),
    execute: async ({ name, color }) => {
      await createDiscipline({ name, color })
      return { success: true, message: `Disciplina "${name}" creada.` }
    },
  }),

  create_room: tool({
    description: 'Crea una nueva sala/espacio. SIEMPRE pedí confirmación antes de ejecutar.',
    inputSchema: z.object({
      name: z.string().describe('Nombre de la sala'),
      capacity: z.number().int().positive().describe('Capacidad máxima'),
      description: z.string().optional().describe('Descripción opcional'),
    }),
    execute: async ({ name, capacity, description }) => {
      await createRoom({ name, capacity, description })
      return { success: true, message: `Sala "${name}" creada.` }
    },
  }),
}
