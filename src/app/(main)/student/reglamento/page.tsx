const REGLAS_GENERALES = [
  {
    n: '1',
    text: 'La fecha de ingreso es la que corresponde a la matrícula, que deberá ser abonada al momento de la inscripción por única vez.',
  },
  {
    n: '2',
    text: 'Las cuotas deberán abonarse todos los meses sin excepción. Opción A: del 1 al 10 de cada mes. Opción B: del 10 al 20 (con costo diferente).',
  },
  {
    n: '3',
    text: 'El alumno que se encuentre atrasado en el pago de la cuota no podrá asistir a clases hasta regularizar su situación.',
  },
  {
    n: '4',
    text: 'Los días feriados no se dictarán clases. De coincidir 2 feriados en un mismo mes se recuperará solo 1 clase en fecha a coordinar, siempre que en dicho mes no se puedan cursar al menos 3 clases en el horario establecido.',
  },
  {
    n: '5',
    text: 'Si el profesor no puede concurrir, se garantizará un reemplazo o se cancelará la clase — en cuyo caso se recuperará.',
  },
  {
    n: '6',
    text: 'En caso de saber con anticipación la ausencia de más de 2 clases (viajes, estudio u otras situaciones), el alumno deberá abonar la cuota de igual manera para garantizar su lugar en el multiespacio.',
  },
  {
    n: '7',
    text: 'Durante el año se realizan 2 o más muestras/galas. La participación es voluntaria e implica vender la totalidad de las entradas asignadas para cubrir gastos del evento.',
  },
  {
    n: '8',
    text: 'Se ha implementado un sistema de timbre cronometrado para garantizar el aprovechamiento máximo del tiempo de clase.',
  },
  {
    n: '9',
    text: 'Los alumnos de canto individual tienen derecho a una única recuperación mensual NO ACUMULABLE. Debe realizarse dentro del mismo mes en que se perdió la clase, en disciplinas de canto grupal con horario y profesor a coordinar previamente. Se requiere aviso con 24 hs de anticipación.',
  },
  {
    n: '10',
    text: 'La tolerancia máxima de espera del profesor, si el alumno no avisa su ausencia, es de 15 minutos. Pasado ese tiempo la clase se da por perdida.',
  },
]

const MODALIDADES = [
  {
    titulo: 'Canto Individual / Piano Ind. / Guitarra Ind.',
    puntos: [
      '4 clases mensuales de 50 minutos.',
      'Tolerancia de espera del profesor: 15 min sin aviso → clase perdida.',
      '1 recuperación mensual NO ACUMULABLE (dentro del mismo mes, en clase grupal, con 24 hs de aviso).',
      'Si el alumno avisa ausencia de más de 2 clases → abona cuota igual, recupera UNA clase.',
    ],
  },
  {
    titulo: 'Canto Grupal / Canto Kids·Teens / Canto con Pistas',
    puntos: [
      '4 clases mensuales. Duración variable según cantidad de asistentes:',
      '1-2 alumnos → 50 min · 3 alumnos → 60 min · 4 o más → 1 h 30 min.',
      'Las clases NO se recuperan salvo ausencia del profesor.',
      'Versatilidad: solos, duetos, tríos, cuartetos o grupos, con consentimiento de todos.',
    ],
  },
  {
    titulo: 'Canto Grupal con Músicos (hasta 8 alumnos)',
    puntos: [
      '4 clases mensuales. Duración variable según asistentes:',
      '1-2 alumnos → 60 min · 3 alumnos → 90 min · 4 o más → 2 hs (con intervalo de 10 min a los 50 min).',
      'Las clases NO se recuperan salvo ausencia del profesor.',
    ],
  },
  {
    titulo: 'Canto Dúo',
    puntos: [
      '4 clases mensuales de 60 minutos.',
      'Flexible: pueden trabajar juntos un mismo tema o cada uno el suyo.',
      'Si el alumno avisa ausencia de más de 2 clases → abona cuota igual, recupera UNA clase.',
      '1 recuperación mensual NO ACUMULABLE en clases grupales, con 24 hs de aviso.',
    ],
  },
  {
    titulo: 'Teatro Musical Infantil (5-10 años) / Teens (11-16 años)',
    puntos: [
      '4 clases mensuales de 2 hs con intervalo de 10 min a los 50 min.',
      'Disciplina integral: canto + baile + actuación.',
      'Las clases NO se recuperan salvo ausencia del profesor.',
    ],
  },
  {
    titulo: 'Experiencia Piano / Replay Fusion / Unplugged Replay',
    puntos: [
      '4 clases mensuales de 2 hs.',
      'Modalidad grupal con músicos en vivo.',
      'Las clases NO se recuperan salvo ausencia del profesor.',
    ],
  },
]

export default function ReglamentoPage() {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', padding: '16px 20px 90px' }}>

      {/* Glow */}
      <div
        className="fixed inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(255,45,120,0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Título */}
        <div style={{ paddingTop: 8 }}>
          <span style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 20, fontWeight: 700 }}>
            Reglamento
          </span>
          <p style={{ color: '#52525B', fontFamily: 'Manrope, sans-serif', fontSize: 12, marginTop: 4 }}>
            Replay Multiespacio Artístico
          </p>
        </div>

        {/* Reglas generales */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ color: '#FF2D78', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em' }}>
            REGLAMENTO GENERAL — TODOS LOS CURSOS
          </span>

          {REGLAS_GENERALES.map((r) => (
            <div
              key={r.n}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: '#18181B', border: '1px solid #27272A', borderRadius: 14,
                padding: '12px 14px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22, height: 22, borderRadius: 11,
                  background: 'rgba(255,45,120,0.15)', color: '#FF2D78',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 11, fontWeight: 700,
                }}
              >
                {r.n}
              </span>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'Manrope, sans-serif', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {r.text}
              </p>
            </div>
          ))}
        </section>

        {/* Modalidades */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ color: '#FF2D78', fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em' }}>
            REGLAMENTO POR MODALIDAD
          </span>

          {MODALIDADES.map((m) => (
            <div
              key={m.titulo}
              style={{
                background: '#18181B', border: '1px solid #27272A', borderRadius: 16,
                padding: '14px 16px',
              }}
            >
              <p style={{ color: '#fff', fontFamily: 'var(--font-space-grotesk, sans-serif)', fontSize: 13, fontWeight: 700, margin: '0 0 10px' }}>
                {m.titulo}
              </p>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {m.puntos.map((p, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.60)', fontFamily: 'Manrope, sans-serif', fontSize: 12, lineHeight: 1.55 }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Nota autorización */}
        <div
          style={{
            background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.18)', borderRadius: 14,
            padding: '12px 14px',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Manrope, sans-serif', fontSize: 11, lineHeight: 1.6, margin: 0 }}>
            Al inscribirte, autorizás a Replay Multiespacio Artístico a captar, grabar, fotografiar y difundir tu imagen, sonidos y voces en el marco de las actividades del espacio, salvo indicación expresa en contrario.
          </p>
        </div>

      </div>
    </div>
  )
}
