import { useState, useMemo } from 'react'
import type { CharacterClass, Player } from '@/lib/game/types'
import { CLASS_ABILITIES, getAbilityDef } from '@/lib/game/abilities'

interface Props {
  isOpen: boolean
  onClose: () => void
  player: Player
  onSwitch: (cls: CharacterClass) => void
}

// 24 classes with theme color + ASCII pixel art glyph
const CLASSES: { id: CharacterClass; label: string; icon: string; color: string; tagline: string; role: string }[] = [
  { id: 'knight',      label: 'Cavaleiro',   icon: '⚔', color: '#d8b048', tagline: 'Tanque guerreiro de elite.',          role: 'Tanque' },
  { id: 'archer',      label: 'Arqueiro',    icon: '🏹', color: '#60c040', tagline: 'Precisão letal à distância.',         role: 'Atirador' },
  { id: 'mage',        label: 'Mago',        icon: '✦', color: '#60c0ff', tagline: 'Magia elemental devastadora.',         role: 'Conjurador' },
  { id: 'necromancer', label: 'Necromante',  icon: '☠', color: '#a020e0', tagline: 'Mestre dos mortos.',                    role: 'Conjurador' },
  { id: 'paladin',     label: 'Paladino',    icon: '✚', color: '#f0d878', tagline: 'Luz sagrada e proteção divina.',        role: 'Tanque/Suporte' },
  { id: 'berserker',   label: 'Berserker',   icon: '🪓', color: '#c83030', tagline: 'Fúria descontrolada na batalha.',      role: 'Atacante' },
  { id: 'assassin',    label: 'Assassino',   icon: '🗡', color: '#a0a0c0', tagline: 'Ataques silenciosos e críticos.',      role: 'Atacante' },
  { id: 'druid',       label: 'Druida',      icon: '🌿', color: '#3aa84a', tagline: 'Comunhão com a natureza.',             role: 'Híbrido' },
  { id: 'monk',        label: 'Monge',       icon: '✊', color: '#ffd070', tagline: 'Disciplina e técnicas marciais.',      role: 'Atacante' },
  { id: 'samurai',     label: 'Samurai',     icon: '🗡', color: '#e0c060', tagline: 'Honra forjada em aço.',                 role: 'Atacante' },
  { id: 'summoner',    label: 'Invocador',   icon: '✦', color: '#80c0ff', tagline: 'Comanda exércitos arcanos.',            role: 'Conjurador' },
  { id: 'alchemist',   label: 'Alquimista',  icon: '⚗', color: '#a8e060', tagline: 'Poções, bombas e reações.',             role: 'Conjurador' },
  { id: 'chronomancer',label: 'Cronomante',  icon: '⌛', color: '#80c0ff', tagline: 'Distorce o tempo a seu favor.',         role: 'Conjurador' },
  { id: 'beastmaster', label: 'Domador',     icon: '🐾', color: '#a08040', tagline: 'Liderança sobre feras selvagens.',     role: 'Híbrido' },
  { id: 'ninja',       label: 'Ninja',       icon: '🥷', color: '#3a3a4e', tagline: 'Sombras, kunais e clones.',             role: 'Atacante' },
  { id: 'pyromancer',  label: 'Piromante',   icon: '🔥', color: '#ff5520', tagline: 'Chamas inextinguíveis.',                role: 'Conjurador' },
  { id: 'cryomancer',  label: 'Criomante',   icon: '❄', color: '#80d4ff', tagline: 'Gelo absoluto que congela almas.',      role: 'Conjurador' },
  { id: 'stormcaller', label: 'Tempestuoso', icon: '⚡', color: '#a060ff', tagline: 'Senhor dos raios e trovões.',           role: 'Conjurador' },
  { id: 'geomancer',   label: 'Geomante',    icon: '⛰', color: '#a07040', tagline: 'Manipula a própria terra.',             role: 'Conjurador' },
  { id: 'bard',        label: 'Bardo',       icon: '🎵', color: '#e060c0', tagline: 'Canções inspiradoras e mortais.',       role: 'Suporte' },
  { id: 'gunner',      label: 'Pistoleiro',  icon: '🔫', color: '#808080', tagline: 'Velocidade, pólvora e precisão.',       role: 'Atirador' },
  { id: 'templar',     label: 'Templário',   icon: '🛡', color: '#fff0a0', tagline: 'Defensor das ordens sagradas.',         role: 'Tanque' },
  { id: 'warlock',     label: 'Bruxo',       icon: '☠', color: '#601890', tagline: 'Pactos sombrios e drenagem de alma.',   role: 'Conjurador' },
  { id: 'valkyrie',    label: 'Valquíria',   icon: '👼', color: '#ffe070', tagline: 'Guerreira alada dos céus.',             role: 'Atacante' },
]

// Procedural 32x32 pixel art icon per class — drawn via CSS box-shadows
function PixelIcon({ color, icon }: { color: string; color2?: string; icon: string }) {
  return (
    <div
      style={{
        width: 64, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color}22 0%, #00000088 100%)`,
        border: `2px solid ${color}aa`,
        boxShadow: `inset 0 0 12px ${color}33, 0 0 8px ${color}44`,
        imageRendering: 'pixelated',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* pixel grid backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 7px, ${color}11 7px 8px), repeating-linear-gradient(90deg, transparent 0 7px, ${color}11 7px 8px)`,
      }} />
      <span style={{ fontSize: 30, color, textShadow: `0 0 6px ${color}, 2px 2px 0 #000`, zIndex: 1 }}>{icon}</span>
    </div>
  )
}

export default function ClassesModal({ isOpen, onClose, player, onSwitch }: Props) {
  const [selectedId, setSelectedId] = useState<CharacterClass | null>(player.class)

  const selected = useMemo(() => CLASSES.find(c => c.id === selectedId) ?? CLASSES.find(c => c.id === player.class)!, [selectedId, player.class])
  const abilityIds = CLASS_ABILITIES[selected.id] || []
  const prog = player.classProgress[selected.id]
  const lvl = prog?.level ?? 1
  const xp = prog?.xp ?? 0
  const isCurrent = selected.id === player.class

  if (!isOpen) return null

  return (
    <div
      className="rcy-pixel"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6), rgba(0,0,0,0.92) 80%)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'rcy-fade-in 140ms ease-out',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rcy-frame"
        style={{
          width: 'min(960px, 96vw)', maxHeight: '90vh', padding: 12,
          display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12,
          background: 'rgba(8,10,18,0.98)',
          border: '2px solid #2a4a8a',
          boxShadow: '0 0 40px rgba(60,120,255,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Left: grid of classes */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: 800, color: '#dfe6ff', letterSpacing: 1 }}>CLASSES</div>
            <button onClick={onClose} className="rcy-btn" style={{ padding: '2px 8px' }}>✕</button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
            overflowY: 'auto', padding: 4, minHeight: 0,
            background: 'rgba(0,0,0,0.4)', border: '1px solid #1a2a4a',
          }}>
            {CLASSES.map(c => {
              const cp = player.classProgress[c.id]
              const l = cp?.level ?? 1
              const sel = c.id === selected.id
              const cur = c.id === player.class
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  title={`${c.label} · Nv ${l}`}
                  className="rcy-slot"
                  style={{
                    width: 68, height: 68, padding: 0, position: 'relative',
                    border: `2px solid ${sel ? c.color : '#1a2a4a'}`,
                    background: sel ? `${c.color}22` : 'rgba(0,0,0,0.5)',
                    boxShadow: sel ? `0 0 10px ${c.color}88, inset 0 0 8px ${c.color}33` : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <PixelIcon color={c.color} icon={c.icon} />
                  <div style={{
                    position: 'absolute', bottom: -1, left: -1, right: -1,
                    fontSize: 8, color: '#bfd0e8', background: 'rgba(0,0,0,0.85)',
                    textAlign: 'center', padding: '1px 0', fontFamily: 'monospace',
                  }}>{c.label.slice(0, 9)}</div>
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    background: cur ? '#22c55e' : '#1a2a4a',
                    color: cur ? '#000' : '#bfd0e8',
                    fontSize: 8, padding: '1px 4px', fontFamily: 'monospace',
                    border: '1px solid #000', fontWeight: 800,
                  }}>{cur ? '✓' : l}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: details */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', borderBottom: `2px solid ${selected.color}55`, paddingBottom: 8 }}>
            <PixelIcon color={selected.color} icon={selected.icon} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: selected.color, letterSpacing: 1, textShadow: '2px 2px 0 #000' }}>
                {selected.label.toUpperCase()}
              </div>
              <div style={{ color: '#bfd0e8', fontSize: 12, marginTop: 2 }}>{selected.tagline}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: '#8a9ab0', fontFamily: 'monospace' }}>
                <span>FUNÇÃO: <b style={{ color: '#dfe6ff' }}>{selected.role}</b></span>
                <span>NÍVEL: <b style={{ color: '#dfe6ff' }}>{lvl}</b></span>
                <span>XP: <b style={{ color: '#dfe6ff' }}>{xp}</b></span>
              </div>
            </div>
            <button
              disabled={isCurrent}
              onClick={() => { onSwitch(selected.id); onClose() }}
              className="rcy-btn"
              style={{
                padding: '8px 14px', fontWeight: 800, fontSize: 12,
                borderColor: isCurrent ? '#3a4a6a' : selected.color,
                color: isCurrent ? '#5a6a8a' : selected.color,
                cursor: isCurrent ? 'not-allowed' : 'pointer',
                boxShadow: isCurrent ? 'none' : `0 0 8px ${selected.color}66`,
              }}
            >
              {isCurrent ? 'CLASSE ATIVA' : 'ESCOLHER ▶'}
            </button>
          </div>

          <div style={{ marginTop: 8, color: '#dfe6ff', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            HABILIDADES ({abilityIds.length})
          </div>
          <div style={{
            marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6,
            overflowY: 'auto', paddingRight: 4, minHeight: 0,
          }}>
            {abilityIds.map((aid, idx) => {
              const def = getAbilityDef(aid)
              if (!def) return null
              const locked = player.level < def.unlockLevel
              return (
                <div
                  key={aid}
                  style={{
                    border: `1px solid ${def.color}66`,
                    background: 'rgba(0,0,0,0.55)',
                    padding: 6, display: 'flex', gap: 6, alignItems: 'flex-start',
                    opacity: locked ? 0.55 : 1, position: 'relative',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, flex: '0 0 36px',
                    background: `${def.color}22`, border: `1px solid ${def.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: def.color, fontWeight: 900, fontFamily: 'monospace',
                    boxShadow: `inset 0 0 6px ${def.color}44`,
                  }}>{def.icon}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                      <span style={{ color: def.color, fontWeight: 700, fontSize: 12 }}>
                        {def.name}
                      </span>
                      <span style={{ color: '#8a9ab0', fontSize: 9, fontFamily: 'monospace' }}>
                        [{idx + 1}]
                      </span>
                    </div>
                    <div style={{ color: '#bfd0e8', fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>
                      {def.description}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 9, color: '#8a9ab0', fontFamily: 'monospace' }}>
                      <span>💧{def.manaCost}</span>
                      <span>⏱{(def.cooldown / 60).toFixed(1)}s</span>
                      {def.damageMultiplier > 0 && <span>⚔×{def.damageMultiplier.toFixed(1)}</span>}
                      <span style={{ color: locked ? '#ff6060' : '#60a060' }}>Nv {def.unlockLevel}</span>
                    </div>
                  </div>
                  {locked && (
                    <div style={{ position: 'absolute', top: 2, right: 2, fontSize: 10 }}>🔒</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
