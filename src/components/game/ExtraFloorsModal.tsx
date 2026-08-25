import { memo, useMemo, useState } from 'react'
import type { Player } from '@/lib/game/types'
import { extraFloorBiomes, extraFloorsOfBiome, baseIdOfBiome } from '@/lib/game/extraPortals'

interface Props {
  isOpen: boolean
  onClose: () => void
  player: Player
  currentMapId: string
  onMapChange: (mapId: string) => void
}

const BIOME_LABEL: Record<string, string> = {
  city: '🏰 Cidade',
  forest: '🌲 Floresta',
  dungeon: '🏚 Masmorra',
  catacombs: '⚰ Catacumbas',
  desert: '🏜 Deserto',
  swamp: '🌿 Pântano',
  tundra: '❄ Tundra',
  volcano: '🌋 Vulcão',
  abyss: '🌌 Abismo',
  deepforest: '🌳 Floresta Profunda',
  arena: '⚔ Arena',
  meadow: '🌼 Pradaria',
  coast: '🏝 Costa',
  crystal: '💎 Caverna de Cristal',
  haunted: '👻 Ruínas Assombradas',
  sky: '☁ Reino Celeste',
  mountain: '🏔 Montanha Nevada',
  ruins: '🏛 Ruínas Antigas',
}

const MECH_LABEL: Record<string, string> = {
  darkness: 'Escuridão', fog: 'Neblina', lava_pools: 'Poças de lava', ice_slip: 'Gelo escorregadio',
  wind_push: 'Ventos', gravity_low: 'Gravidade baixa', gravity_high: 'Gravidade alta', maze: 'Labirinto',
  arena_waves: 'Ondas em arena', mirror: 'Espelho', no_mana: 'Sem mana', no_heal: 'Cura reduzida',
  double_xp: 'XP dobrado', elite_only: 'Só elites', swarm: 'Horda', boss_rush: 'Boss rush',
  time_attack: 'Contra o tempo', puzzle_keys: 'Chaves', cursed_drops: 'Drops maldito',
  reverse_controls: 'Controles invertidos', silence: 'Silêncio', glass_cannon: 'Um golpe',
  poison_floor: 'Chão venenoso', rising_water: 'Inundação', collapsing: 'Chão colapsando',
}

function ExtraFloorsModal({ isOpen, onClose, player, currentMapId, onMapChange }: Props) {
  const [query, setQuery] = useState('')
  const [onlyUnlocked, setOnlyUnlocked] = useState(false)

  const biomes = useMemo(() => extraFloorBiomes(), [])
  const total = useMemo(
    () => biomes.reduce((acc, b) => acc + extraFloorsOfBiome(b).length, 0),
    [biomes],
  )

  if (!isOpen) return null

  const q = query.trim().toLowerCase()

  return (
    <div className="rcy-overlay rcy-pixel" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rcy-modal rcy-modal--xl">
        <div className="rcy-modal__header">
          <span className="rcy-modal__title">🌀 ANDARES EXTRAS</span>
          <span className="rcy-modal__subtitle">Nv {player.level} · {total} andares</span>
          <div className="rcy-modal__actions">
            <button className="rcy-btn rcy-btn--icon rcy-btn--close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
        </div>

        <div className="rcy-modal__body">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar andar ou bioma…"
              aria-label="Buscar andar"
              className="rcy-input"
              style={{ flex: '1 1 160px', minWidth: 120 }}
            />
            <button
              className={`rcy-btn ${onlyUnlocked ? 'rcy-btn--active' : ''}`}
              onClick={() => setOnlyUnlocked(v => !v)}
              style={{ padding: '4px 8px' }}
            >
              {onlyUnlocked ? '✓ ' : ''}Só liberados
            </button>
          </div>

          {biomes.map(biome => {
            const label = BIOME_LABEL[biome] ?? biome
            let floors = extraFloorsOfBiome(biome)
            if (q) floors = floors.filter(f => f.name.toLowerCase().includes(q) || label.toLowerCase().includes(q))
            if (onlyUnlocked) floors = floors.filter(f => player.level >= f.levelMin)
            if (floors.length === 0) return null
            const baseId = baseIdOfBiome(biome)
            return (
              <div key={biome} style={{ marginBottom: 14 }}>
                <div className="rcy-section-label" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{label}</span>
                  {baseId && (
                    <button
                      className="rcy-btn"
                      style={{ padding: '1px 6px', fontSize: 9 }}
                      onClick={() => onMapChange(baseId)}
                      title="Ir para a entrada do bioma (portal físico no mapa)"
                    >
                      ⤓ Entrada
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 5 }}>
                  {floors.map(f => {
                    const locked = player.level < f.levelMin
                    const active = currentMapId === f.id
                    return (
                      <button
                        key={f.id}
                        disabled={locked}
                        onClick={() => { if (!locked) { onMapChange(f.id); onClose() } }}
                        title={`${f.name} — ${f.notes} (Nv ${f.levelMin}-${f.levelMax})`}
                        className={`rcy-frame ${active ? 'rcy-btn--active' : ''}`}
                        style={{
                          textAlign: 'left',
                          padding: 5,
                          opacity: locked ? 0.45 : 1,
                          cursor: locked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          fontSize: 9,
                        }}
                      >
                        <span style={{ color: 'var(--rcy-gold)' }}>
                          {locked ? '🔒 ' : active ? '✓ ' : '🌀 '}A{f.index} · {f.name}
                        </span>
                        <span style={{ color: 'var(--rcy-text)' }}>{MECH_LABEL[f.mechanic] ?? f.mechanic}</span>
                        <span style={{ color: locked ? 'var(--rcy-red)' : 'var(--rcy-green)' }}>
                          Nv {f.levelMin}–{f.levelMax}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="rcy-modal__footer" style={{ textAlign: 'left' }}>
          <span>
            Cada andar extra tem 2 portais no chão (voltar / descer), sempre em terreno andável e alcançável a pé.
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(ExtraFloorsModal)
