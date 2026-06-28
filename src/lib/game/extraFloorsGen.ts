// Etapa 2 — Gerador procedural dos andares extras declarados em extraFloors.ts.
//
// Estratégia: reaproveitamos os geradores de mapa existentes (cada bioma já tem
// o seu) e, por cima do mapa base, aplicamos transformações ligadas à mecânica
// daquele andar (mais inimigos, todos elites, boss rush, glass cannon, etc.).
// Mecânicas puramente "de gameplay" (darkness, no_mana, time_attack, etc.)
// ficam como metadados em `map.mechanic` para o engine reagir quando quiser.

import { EXTRA_FLOOR_BY_ID, type ExtraFloorDef } from './extraFloors'
import type { GameMap, Monster } from './types'

// Para cada bioma "extra", qual é o id base que delega ao gerador real.
const BIOME_BASE: Record<string, string> = {
  city: 'city',
  forest: 'forest',
  dungeon: 'dungeon',
  desert: 'desert',
  swamp: 'swamp',
  tundra: 'tundra',
  volcano: 'volcano',
  abyss: 'abyss',
  deepforest: 'deepforest',
  arena: 'arena',
  meadow: 'meadow',
  coast: 'coast',
  crystal: 'crystal1',
  haunted: 'haunted1',
  sky: 'sky1',
  mountain: 'mountain1',
  ruins: 'ruins1',
  catacombs: 'catacombs1',
}

const BIOME_PRETTY: Record<string, string> = {
  city: 'Cidade',
  forest: 'Floresta',
  dungeon: 'Masmorra',
  desert: 'Deserto',
  swamp: 'Pântano',
  tundra: 'Tundra',
  volcano: 'Vulcão',
  abyss: 'Abismo',
  deepforest: 'Floresta Profunda',
  arena: 'Arena',
  meadow: 'Pradaria',
  coast: 'Costa',
  crystal: 'Caverna de Cristal',
  haunted: 'Ruínas Assombradas',
  sky: 'Reino Celeste',
  mountain: 'Montanha Nevada',
  ruins: 'Ruínas Antigas',
  catacombs: 'Catacumbas',
}

function cloneMonster(m: Monster): Monster {
  // Shallow clone é suficiente — Monster é majoritariamente primitivos + uns objetos
  // que o engine recria por instância (ai, statusEffects). Não queremos compartilhar
  // referência de HP/posição entre o duplicado e o original.
  const c: any = { ...m }
  if ((m as any).statusEffects) c.statusEffects = []
  return c as Monster
}

function bumpId(m: Monster, suffix: string): Monster {
  const c: any = m
  if (typeof c.id === 'string') c.id = `${c.id}__${suffix}`
  return c
}

function applyMechanicToMonsters(monsters: Monster[], def: ExtraFloorDef): Monster[] {
  const out: Monster[] = monsters.map(cloneMonster)

  // Escala mínimo de nível pelo levelMin do andar.
  for (const m of out) {
    const cur = (m as any).level
    if (typeof cur === 'number' && cur < def.levelMin) {
      ;(m as any).level = def.levelMin
    }
  }

  switch (def.mechanic) {
    case 'swarm': {
      const extras: Monster[] = []
      out.forEach((m, i) => {
        if (i % 2 === 0) {
          const dup = cloneMonster(m)
          ;(dup as any).x = ((dup as any).x ?? 0) + 24
          ;(dup as any).y = ((dup as any).y ?? 0) + 24
          extras.push(bumpId(dup, `swarm${i}`))
        }
      })
      out.push(...extras)
      break
    }
    case 'elite_only': {
      for (const m of out) (m as any).eliteTier = 'elite'
      break
    }
    case 'mirror': {
      for (const m of out) {
        ;(m as any).eliteTier = (m as any).eliteTier ?? 'elite'
      }
      break
    }
    case 'boss_rush': {
      if (out.length > 0) (out[out.length - 1] as any).eliteTier = 'boss'
      if (out.length > 2) (out[Math.floor(out.length / 2)] as any).eliteTier = 'elite'
      if (out.length > 4) (out[Math.floor(out.length / 4)] as any).eliteTier = 'elite'
      break
    }
    case 'glass_cannon': {
      for (const m of out) {
        ;(m as any).maxHp = 1
        ;(m as any).hp = 1
      }
      break
    }
    case 'arena_waves': {
      // Concentra os inimigos em volta de cada spawn na arena (visual).
      // Sem reposicionar profundamente — o engine real fará a lógica de ondas
      // quando ler map.mechanic === 'arena_waves'.
      break
    }
    default:
      // Mecânicas puramente de gameplay ficam em metadado (map.mechanic).
      break
  }

  return out
}

export function generateExtraFloorMap(
  id: string,
  baseGen: (baseId: string) => GameMap,
): GameMap | null {
  const def = EXTRA_FLOOR_BY_ID[id]
  if (!def) return null
  const baseId = BIOME_BASE[def.biome]
  if (!baseId) return null

  const base = baseGen(baseId)

  // Clonagem rasa do mapa — tiles podem ser compartilhados (read-only no engine),
  // mas monstros precisam ser próprios deste andar.
  const map: any = {
    id: def.id,
    name: `${BIOME_PRETTY[def.biome] ?? def.biome} — Extra ${def.index}: ${def.name}`,
    width: base.width,
    height: base.height,
    tiles: base.tiles,
    spawnPoints: base.spawnPoints,
    ambience: base.ambience,
    musicTheme: base.musicTheme,
    minLevel: def.levelMin,
    monsters: applyMechanicToMonsters(base.monsters, def),
    // Metadados consumidos pelo engine quando suportar mecânicas extras.
    mechanic: def.mechanic,
    extraIndex: def.index,
    extraBiome: def.biome,
    extraNotes: def.notes,
  }

  return map as GameMap
}

/** Lista de ids gerados pela Etapa 2 — útil para portais/UI. */
export function listExtraFloorIds(): string[] {
  return Object.keys(EXTRA_FLOOR_BY_ID)
}