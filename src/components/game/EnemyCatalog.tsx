import { useState, useMemo } from 'react'
import { EXTENDED_MONSTERS, WORLD_BOSSES, getExtendedDef } from '@/lib/game/extendedMonsters'

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ff6020', ice: '#40c0ff', lightning: '#ffff60', poison: '#80c040',
  shadow: '#8040a0', holy: '#ffd040', arcane: '#a060ff', nature: '#40c060',
  physical: '#a0a0a0',
}

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥', ice: '❄', lightning: '⚡', poison: '☠',
  shadow: '🌑', holy: '✨', arcane: '🔮', nature: '🌿', physical: '⚔',
}

const BEHAVIOR_LABELS: Record<string, string> = {
  swarmer: 'Enxame', charger: 'Investida', tank: 'Tanque', kiter: 'Mantém distância',
  turret: 'Torreta', phaser: 'Fase', healer: 'Curandeiro', berserk: 'Berserker',
}

interface Props {
  onClose: () => void
}

export default function EnemyCatalog({ onClose }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const allMonsters = useMemo(() => {
    const list = [...EXTENDED_MONSTERS, ...WORLD_BOSSES]
    return list.filter((m: any) => {
      if (filter !== 'all' && m.element !== filter) return false
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [filter, search])

  const elements = ['fire', 'ice', 'lightning', 'poison', 'shadow', 'holy', 'arcane', 'nature', 'physical']
  const selectedDef = selected ? getExtendedDef(selected) : null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 80, background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg overflow-hidden"
        style={{
          width: 'min(820px, 96vw)',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #0a0a12 0%, #12101a 100%)',
          border: '2px solid #3050a0',
          boxShadow: '0 0 50px rgba(48,80,160,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(48,80,160,0.2) 0%, rgba(48,80,160,0.05) 100%)',
          borderBottom: '1px solid rgba(48,80,160,0.3)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#6090ff', textShadow: '0 0 10px rgba(96,144,255,0.4)', margin: 0 }}>
              📖 Catálogo de Inimigos
            </h2>
            <p style={{ fontSize: 12, color: '#6080a0', margin: '2px 0 0 0' }}>
              {EXTENDED_MONSTERS.length + WORLD_BOSSES.length} inimigos catalogados
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,60,60,0.2)', border: '1px solid rgba(255,60,60,0.4)',
              color: '#ff6060', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 13,
            }}
          >✕</button>
        </div>

        {/* Filters */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(48,80,160,0.15)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar inimigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 150, padding: '6px 10px', borderRadius: 5,
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(48,80,160,0.3)',
              color: '#c0d0e0', fontSize: 13, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={filterBtn(filter === 'all', '#6090ff')}
            >Todos</button>
            {elements.map(el => (
              <button
                key={el}
                onClick={() => setFilter(el)}
                style={filterBtn(filter === el, ELEMENT_COLORS[el])}
              >
                {ELEMENT_ICONS[el]} {el}
              </button>
            ))}
          </div>
        </div>

        {/* Grid + Detail */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, alignContent: 'start' }}>
            {allMonsters.map((m: any) => {
              const elColor = ELEMENT_COLORS[m.element] ?? '#a0a0a0'
              const isBoss = (WORLD_BOSSES as any[]).some(b => b.id === m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: 10, borderRadius: 8, cursor: 'pointer',
                    background: selected === m.id ? `${elColor}20` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${selected === m.id ? elColor : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Monster silhouette preview */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 6,
                    background: `radial-gradient(circle at 50% 40%, ${m.palette.primary}40 0%, ${m.palette.secondary}30 60%, transparent 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: 24, height: 28, borderRadius: '40% 40% 30% 30%',
                      background: `linear-gradient(180deg, ${m.palette.primary} 0%, ${m.palette.secondary} 100%)`,
                      boxShadow: `0 0 8px ${m.palette.accent}40`,
                    }} />
                    <div style={{
                      position: 'absolute', top: 14, width: 4, height: 4, borderRadius: '50%',
                      background: m.palette.eye, boxShadow: `0 0 4px ${m.palette.eye}`,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#c0d0e0', textAlign: 'center', lineHeight: 1.2 }}>
                    {m.name}
                  </span>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <span style={{ fontSize: 10 }}>{ELEMENT_ICONS[m.element]}</span>
                    {isBoss && <span style={{ fontSize: 9, color: '#ffd700', fontWeight: 700 }}>BOSS</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          {selectedDef && (
            <div style={{
              width: 260, borderLeft: '1px solid rgba(48,80,160,0.2)',
              padding: 16, overflowY: 'auto',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: ELEMENT_COLORS[(selectedDef as any).element] ?? '#c0d0e0', margin: '0 0 8px 0' }}>
                {(selectedDef as any).name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <DetailRow label="Elemento" value={`${ELEMENT_ICONS[(selectedDef as any).element]} ${(selectedDef as any).element}`} color={ELEMENT_COLORS[(selectedDef as any).element]} />
                <DetailRow label="Comportamento" value={BEHAVIOR_LABELS[(selectedDef as any).behavior] ?? (selectedDef as any).behavior} />
                <DetailRow label="Vida base" value={`${(selectedDef as any).baseHp}`} color="#ff6060" />
                <DetailRow label="Ataque" value={`${(selectedDef as any).baseAtk}`} color="#ff8040" />
                <DetailRow label="Defesa" value={`${(selectedDef as any).baseDef}`} color="#60a0ff" />
                <DetailRow label="Velocidade" value={`${(selectedDef as any).speed}`} color="#40c060" />
                <DetailRow label="Alcance aggro" value={`${(selectedDef as any).aggroRange}`} />
                {(selectedDef as any).isRanged && <DetailRow label="Ataque" value="À distância" color="#a060ff" />}
                {(selectedDef as any).scale && <DetailRow label="Escala" value={`${(selectedDef as any).scale}x`} />}
                <div>
                  <span style={{ color: '#8090a0' }}>Biomas: </span>
                  <span style={{ color: '#c0d0e0' }}>{(selectedDef as any).biomes.join(', ')}</span>
                </div>
                {(selectedDef as any).resistances && Object.keys((selectedDef as any).resistances).length > 0 && (
                  <div>
                    <span style={{ color: '#8090a0' }}>Resistências: </span>
                    {Object.entries((selectedDef as any).resistances).map(([k, v]: any) => (
                      <span key={k} style={{ color: ELEMENT_COLORS[k], marginRight: 6 }}>{ELEMENT_ICONS[k]} {Math.round(v * 100)}%</span>
                    ))}
                  </div>
                )}
                {(selectedDef as any).weaknesses && Object.keys((selectedDef as any).weaknesses).length > 0 && (
                  <div>
                    <span style={{ color: '#8090a0' }}>Fraquezas: </span>
                    {Object.entries((selectedDef as any).weaknesses).map(([k, v]: any) => (
                      <span key={k} style={{ color: ELEMENT_COLORS[k], marginRight: 6 }}>{ELEMENT_ICONS[k]} {Math.round(v * 100)}%</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function filterBtn(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
    background: active ? `${color}25` : 'rgba(0,0,0,0.3)',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    color: active ? color : '#8090a0', whiteSpace: 'nowrap',
  } as React.CSSProperties
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#8090a0' }}>{label}:</span>
      <span style={{ color: color ?? '#c0d0e0', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
