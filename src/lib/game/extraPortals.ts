// Etapa 3 — Portais físicos para os andares extras.
//
// Regras de ouro:
//  - Portal SEMPRE em tile andável e alcançável a pé a partir do spawn (BFS).
//  - Área 3x3 em volta do portal é limpa com um tile andável do próprio mapa,
//    então ele nunca fica "entre paredes".
//  - O destino de cada portal é resolvido por coordenada (`map._extraPortals`),
//    não por tipo de tile — assim não conflita com os portais já existentes.

import { EXTRA_FLOORS, EXTRA_CATACOMB_FLOORS, EXTRA_FLOOR_BY_ID } from './extraFloors'
import { BIOME_BASE } from './extraFloorsGen'
import type { GameMap, Tile } from './types'

export interface ExtraPortalLink {
  x: number
  y: number
  target: string
  label: string
  kind: 'up' | 'down'
}

const ALL_EXTRA = [...EXTRA_FLOORS, ...EXTRA_CATACOMB_FLOORS]

/** biome -> andares extras ordenados por index */
const FLOORS_BY_BIOME: Record<string, typeof ALL_EXTRA> = (() => {
  const out: Record<string, typeof ALL_EXTRA> = {}
  for (const f of ALL_EXTRA) (out[f.biome] ??= []).push(f)
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.index - b.index)
  return out
})()

/** id base do bioma -> nome do bioma (para saber onde nasce a entrada) */
const BASE_ID_TO_BIOME: Record<string, string> = (() => {
  const out: Record<string, string> = {}
  for (const [biome, baseId] of Object.entries(BIOME_BASE)) {
    if (FLOORS_BY_BIOME[biome]) out[baseId] = biome
  }
  return out
})()

export function extraFloorsOfBiome(biome: string) {
  return FLOORS_BY_BIOME[biome] ?? []
}

export function extraFloorBiomes(): string[] {
  return Object.keys(FLOORS_BY_BIOME)
}

export function baseIdOfBiome(biome: string): string | undefined {
  return BIOME_BASE[biome]
}

// ─── util de tiles ───────────────────────────────────────────────────────────

function tileAt(map: GameMap, x: number, y: number): Tile | undefined {
  return (map.tiles as any)[y]?.[x]
}

/** BFS a partir do spawn, coletando tiles andáveis alcançáveis (limitado). */
function reachableTiles(map: GameMap, sx: number, sy: number, limit = 24000) {
  const seen = new Set<number>()
  const order: { x: number; y: number; d: number }[] = []
  const W = map.width
  const key = (x: number, y: number) => y * W + x
  const start = tileAt(map, sx, sy)
  if (!start?.walkable) return order
  const queue: { x: number; y: number; d: number }[] = [{ x: sx, y: sy, d: 0 }]
  seen.add(key(sx, sy))
  while (queue.length > 0 && order.length < limit) {
    const cur = queue.shift()!
    order.push(cur)
    const around = [
      { x: cur.x + 1, y: cur.y },
      { x: cur.x - 1, y: cur.y },
      { x: cur.x, y: cur.y + 1 },
      { x: cur.x, y: cur.y - 1 },
    ]
    for (const n of around) {
      if (n.x < 0 || n.y < 0 || n.x >= map.width || n.y >= map.height) continue
      const k = key(n.x, n.y)
      if (seen.has(k)) continue
      const t = tileAt(map, n.x, n.y)
      if (!t?.walkable) continue
      seen.add(k)
      queue.push({ x: n.x, y: n.y, d: cur.d + 1 })
    }
  }
  return order
}

/** Garante que as linhas modificadas não sejam compartilhadas com o mapa base. */
function ensureOwnRow(map: GameMap, y: number) {
  const rows = map.tiles as any[]
  rows[y] = [...rows[y]]
}

/**
 * Abre um espaço 3x3 andável e cravar o portal no centro.
 * `fill` é um tile andável copiado do próprio mapa (mantém o visual do bioma).
 */
function stampPortal(map: GameMap, x: number, y: number, fill: Tile) {
  for (let dy = -1; dy <= 1; dy++) {
    const ty = y + dy
    if (ty < 0 || ty >= map.height) continue
    ensureOwnRow(map, ty)
    for (let dx = -1; dx <= 1; dx++) {
      const tx = x + dx
      if (tx < 0 || tx >= map.width) continue
      const cur = tileAt(map, tx, ty)
      if (!cur?.walkable) (map.tiles as any)[ty][tx] = { ...fill }
    }
  }
  ensureOwnRow(map, y)
  ;(map.tiles as any)[y][x] = { type: 'portal', walkable: true, transparent: true } as Tile
}

// ─── API principal ───────────────────────────────────────────────────────────

/**
 * Cria os portais dos andares extras no mapa recebido:
 *  - Mapas base de bioma ganham uma ENTRADA para `<biome>_x1`.
 *  - Andares extras ganham portal de VOLTA (andar anterior/base) e, quando
 *    existir, portal de DESCIDA para o próximo andar extra.
 */
export function attachExtraPortals(map: GameMap): GameMap {
  if (!map || (map as any)._extraPortals) return map
  const id = map.id
  const def = EXTRA_FLOOR_BY_ID[id]
  const baseBiome = BASE_ID_TO_BIOME[id]
  if (!def && !baseBiome) return map

  const wanted: { target: string; label: string; kind: 'up' | 'down' }[] = []

  if (def) {
    const floors = FLOORS_BY_BIOME[def.biome] ?? []
    const prev = floors.find(f => f.index === def.index - 1)
    const next = floors.find(f => f.index === def.index + 1)
    wanted.push({
      target: prev ? prev.id : (BIOME_BASE[def.biome] ?? 'city'),
      label: prev ? `Voltar: ${prev.name}` : 'Voltar ao bioma',
      kind: 'up',
    })
    if (next) wanted.push({ target: next.id, label: `Descer: ${next.name}`, kind: 'down' })
  } else if (baseBiome) {
    const first = FLOORS_BY_BIOME[baseBiome]?.[0]
    if (first) wanted.push({ target: first.id, label: `Andares extras: ${first.name}`, kind: 'down' })
  }

  if (wanted.length === 0) return map

  const spawn = map.spawnPoints?.[0] ?? { x: 96, y: 96 }
  const sx = Math.floor(spawn.x / 32)
  const sy = Math.floor(spawn.y / 32)
  const reach = reachableTiles(map, sx, sy)
  if (reach.length < 20) return map

  // tile andável do bioma para preencher o espaço em volta do portal
  const fill = tileAt(map, reach[0].x, reach[0].y)!

  const links: ExtraPortalLink[] = []
  const placed: { x: number; y: number }[] = [{ x: sx, y: sy }]
  const farEnough = (c: { x: number; y: number }) =>
    placed.every(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) >= 6)

  // "up" perto do spawn, "down" mais longe (mas ainda alcançável)
  const pickAt = (fraction: number) => {
    const idealIdx = Math.min(reach.length - 1, Math.max(4, Math.floor(reach.length * fraction)))
    for (let off = 0; off < reach.length; off++) {
      for (const i of [idealIdx + off, idealIdx - off]) {
        if (i < 4 || i >= reach.length) continue
        const c = reach[i]
        if (farEnough(c)) return c
      }
    }
    return reach[idealIdx]
  }

  for (const w of wanted) {
    const spot = pickAt(w.kind === 'up' ? 0.03 : 0.75)
    placed.push(spot)
    stampPortal(map, spot.x, spot.y, fill)
    links.push({ x: spot.x, y: spot.y, target: w.target, label: w.label, kind: w.kind })
  }

  ;(map as any)._extraPortals = links
  return map
}
