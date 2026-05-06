/**
 * Service: generateDrills — función pura determinística por seed (name+week+weaknesses).
 * Lookup sobre banco de ejercicios, sin orquestación ni trace.
 */
import { mulberry32, seedFromString } from './deterministic'

export type Weakness = 'shot' | 'pass' | 'def' | 'phy' | 'pace' | 'dribble' | 'mental'

export interface DrillsInput {
  name: string
  weaknesses: Weakness[]
  weekIsoDate?: string
}

export interface Drill {
  title: string
  area: Weakness
  durationMin: number
  intensity: 'low' | 'mid' | 'high'
  description: string
  equipment: string[]
}

export interface DrillsResult {
  drills: Drill[]
  totalMinutes: number
  intensityMix: Record<'low' | 'mid' | 'high', number>
}

const BANK: Record<Weakness, Omit<Drill, 'area'>[]> = {
  shot: [
    { title: '1v1 con portero', durationMin: 30, intensity: 'high', description: '10 series de 5 remates desde distintos ángulos.', equipment: ['Portería', 'Arquero'] },
    { title: 'Volea técnica',   durationMin: 20, intensity: 'mid',  description: 'Pase aéreo + control + volea. 3x10.', equipment: ['Cono', 'Pared'] },
    { title: 'Tiro libre curvo', durationMin: 25, intensity: 'mid', description: 'Barrera de conos a 9m. 30 remates.', equipment: ['Conos', 'Balones'] },
  ],
  pass: [
    { title: 'Rondo 5v2',         durationMin: 30, intensity: 'mid',  description: 'Círculo de 8m, 2 minutos rotando.', equipment: ['Conos'] },
    { title: 'Pase largo de cambio', durationMin: 20, intensity: 'mid', description: 'Pares con 40m de separación, alternancia de pie.', equipment: ['Balones'] },
    { title: 'Pared + llegada',   durationMin: 25, intensity: 'high', description: 'Triángulo con remate al arco. 4 series.', equipment: ['Compañero', 'Arco'] },
  ],
  def: [
    { title: 'Marca reactiva 1v1', durationMin: 25, intensity: 'high', description: 'Atacante libre en 15x15m. Defender sin falta.', equipment: ['Conos'] },
    { title: 'Coberturas 3v3',     durationMin: 30, intensity: 'high', description: 'Rotaciones defensivas en pequeño campo.', equipment: ['Pecheras', 'Porterías chicas'] },
    { title: 'Anticipación visual', durationMin: 15, intensity: 'mid', description: 'Robo sobre pase telegrafiado.', equipment: ['Compañero'] },
  ],
  phy: [
    { title: 'Intervalos 4x400m', durationMin: 30, intensity: 'high', description: '80% máximo, 2 min recuperación.', equipment: ['Cronómetro'] },
    { title: 'Core rutina',       durationMin: 15, intensity: 'mid',  description: 'Plancha + russian twist + bird-dog.', equipment: ['Mat'] },
    { title: 'Plyo saltos',       durationMin: 20, intensity: 'mid',  description: 'Cajón 40cm, saltos laterales. 6x10.', equipment: ['Cajón'] },
  ],
  pace: [
    { title: 'Sprints 10x30m',   durationMin: 25, intensity: 'high', description: 'Arranque desde pausa, vuelta trotando.', equipment: ['Conos'] },
    { title: 'Cambios de ritmo', durationMin: 20, intensity: 'high', description: 'Trotar/sprintar cada 15m con balón.', equipment: ['Balón', 'Conos'] },
    { title: 'Aceleración',      durationMin: 15, intensity: 'high', description: '6x15m contra resistencia de banda elástica.', equipment: ['Banda elástica'] },
  ],
  dribble: [
    { title: 'Conducción figura 8', durationMin: 20, intensity: 'mid',  description: 'Entre 2 conos separados 5m, ambos pies.', equipment: ['Conos', 'Balón'] },
    { title: 'Regate 1v1',         durationMin: 25, intensity: 'high', description: 'Espacio 10x10m, 30s por turno.', equipment: ['Compañero'] },
    { title: 'Pie débil control',  durationMin: 15, intensity: 'low',  description: '100 toques solo con pie no dominante.', equipment: ['Balón'] },
  ],
  mental: [
    { title: 'Visualización pre-partido', durationMin: 10, intensity: 'low', description: '5 min respirar + 5 min imaginar 3 jugadas.', equipment: [] },
    { title: 'Diario de decisiones',      durationMin: 10, intensity: 'low', description: 'Escribí 3 buenas decisiones del último partido.', equipment: ['Cuaderno'] },
    { title: 'Rutina pre-tiro',           durationMin: 10, intensity: 'low', description: 'Secuencia fija: respirar + visualizar + ejecutar.', equipment: [] },
  ],
}

export function generateDrills(input: DrillsInput): DrillsResult {
  const week = input.weekIsoDate ?? new Date().toISOString().slice(0, 10)
  const seed = seedFromString(`${input.name}-${week}-${input.weaknesses.join(',')}`)
  const rng = mulberry32(seed)

  const drills: Drill[] = []
  const areas: Weakness[] = input.weaknesses.length ? input.weaknesses : ['phy', 'pace']

  for (let day = 0; day < 5; day++) {
    const area = areas[day % areas.length]
    const pool = BANK[area]
    const pick = pool[Math.floor(rng() * pool.length)]
    drills.push({ ...pick, area })
  }

  const totalMinutes = drills.reduce((a, d) => a + d.durationMin, 0)
  const intensityMix: Record<'low' | 'mid' | 'high', number> = { low: 0, mid: 0, high: 0 }
  drills.forEach(d => { intensityMix[d.intensity]++ })

  return { drills, totalMinutes, intensityMix }
}
