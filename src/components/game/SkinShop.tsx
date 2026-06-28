import { useState } from 'react'
import type { Player, CharacterClass } from '@/lib/game/types'
import { SKIN_NAMES, SKIN_COUNT } from '@/lib/game/sprites'

const LEGENDARY_SKIN_INDEX = 5
const LEGENDARY_COST = 100

const CLASS_INFO: Record<CharacterClass, { color: string; icon: string }> = {
  knight:       { color: '#4a90d9', icon: '⚔' },
  paladin:      { color: '#f0c040', icon: '✦' },
  berserker:    { color: '#d94040', icon: '🪓' },
  samurai:      { color: '#d96040', icon: '🗡' },
  monk:         { color: '#d9a040', icon: '✊' },
  archer:       { color: '#40a060', icon: '🏹' },
  assassin:     { color: '#604080', icon: '🔪' },
  mage:         { color: '#6080d9', icon: '🔮' },
  druid:        { color: '#40c060', icon: '🌿' },
  necromancer:  { color: '#8040a0', icon: '💀' },
  summoner:     { color: '#a060d9', icon: '✨' },
  alchemist:    { color: '#40c0a0', icon: '⚗' },
  ninja:        { color: '#404060', icon: '🥷' },
  pyromancer:   { color: '#ff6020', icon: '🔥' },
  cryomancer:   { color: '#40c0ff', icon: '❄' },
  stormcaller:  { color: '#a0a0ff', icon: '⚡' },
  geomancer:    { color: '#a08040', icon: '⛰' },
  bard:         { color: '#d960a0', icon: '🎵' },
  gunner:       { color: '#806040', icon: '🔫' },
  templar:      { color: '#ffd040', icon: '🛡' },
  warlock:      { color: '#600080', icon: '👁' },
  valkyrie:     { color: '#ffc040', icon: '🪽' },
  chronomancer: { color: '#a040ff', icon: '⏳' },
  beastmaster:  { color: '#80a040', icon: '🐺' },
}

interface Props {
  player: Player
  onClose: () => void
  onBuySkin: (skin: number) => void
  onEquipSkin: (skin: number) => void
}

export default function SkinShop({ player, onClose, onBuySkin, onEquipSkin }: Props) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(player.class)
  const [error, setError] = useState('')

  const ownedLegendary = (player as any)._ownedLegendarySkins as string[] | undefined
  const isOwned = (cls: CharacterClass) => ownedLegendary?.includes(cls) ?? false
  const isEquipped = player.skin === LEGENDARY_SKIN_INDEX && player.class === selectedClass

  const handleBuy = () => {
    if (selectedClass === 'necromancer') {
      onBuySkin(LEGENDARY_SKIN_INDEX)
      return
    }
    const gems = player.gems ?? 0
    if (gems < LEGENDARY_COST) {
      setError(`Gemas insuficientes! Você tem ${gems}, precisa de ${LEGENDARY_COST}.`)
      return
    }
    setError('')
    onBuySkin(LEGENDARY_SKIN_INDEX)
  }

  const handleEquip = () => {
    onEquipSkin(LEGENDARY_SKIN_INDEX)
  }

  const classes = Object.keys(CLASS_INFO) as CharacterClass[]
  const info = CLASS_INFO[selectedClass]
  const skinName = SKIN_NAMES[selectedClass]?.[LEGENDARY_SKIN_INDEX] ?? 'Skin Lendária'
  const owned = isOwned(selectedClass)
  const free = selectedClass === 'necromancer'

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ zIndex: 80, background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg overflow-hidden"
        style={{
          width: 'min(680px, 95vw)',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #0c0a14 0%, #14101e 100%)',
          border: '2px solid #ffd700',
          boxShadow: '0 0 60px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,215,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
            borderBottom: '1px solid rgba(255,215,0,0.3)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.5)', margin: 0 }}>
              Loja de Skins Lendárias
            </h2>
            <p style={{ fontSize: 12, color: '#a09060', margin: '2px 0 0 0' }}>
              Skins lendárias com efeitos exclusivos e animações
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 6,
              background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
            }}>
              <span style={{ fontSize: 16 }}>💎</span>
              <span style={{ color: '#ffd700', fontWeight: 700, fontSize: 15 }}>{player.gems ?? 0}</span>
              <span style={{ color: '#a09060', fontSize: 11 }}>gemas</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,60,60,0.2)', border: '1px solid rgba(255,60,60,0.4)',
                color: '#ff6060', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 13,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Class selector */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,215,0,0.15)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {classes.map((cls) => {
              const ci = CLASS_INFO[cls]
              const sel = cls === selectedClass
              const own = isOwned(cls)
              return (
                <button
                  key={cls}
                  onClick={() => { setSelectedClass(cls); setError('') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                    background: sel ? `${ci.color}30` : 'rgba(0,0,0,0.4)',
                    border: `1px solid ${sel ? ci.color : 'rgba(255,255,255,0.1)'}`,
                    color: sel ? ci.color : '#808090',
                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  }}
                >
                  <span>{ci.icon}</span>
                  <span style={{ textTransform: 'capitalize' }}>{cls}</span>
                  {own && <span style={{ color: '#ffd700', fontSize: 9 }}>★</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Skin preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              position: 'relative',
              width: 160, height: 160, borderRadius: 12,
              background: `radial-gradient(circle at 50% 50%, ${info.color}20 0%, transparent 70%)`,
              border: `2px solid ${info.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{
              fontSize: 72,
              filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))',
              animation: 'legendaryFloat 2s ease-in-out infinite',
            }}>
              {info.icon}
            </div>
            {/* Sparkle particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 3, height: 3, borderRadius: '50%',
                  background: '#ffd700',
                  opacity: 0.6,
                  animation: `legendarySparkle ${1.5 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  left: `${20 + (i * 8) % 60}%`,
                  top: `${15 + (i * 13) % 70}%`,
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffd700', textShadow: '0 0 8px rgba(255,215,0,0.4)', margin: 0 }}>
              {skinName}
            </h3>
            <p style={{ fontSize: 12, color: '#a09060', marginTop: 4 }}>
              Classe: <span style={{ color: info.color, textTransform: 'capitalize', fontWeight: 600 }}>{selectedClass}</span>
            </p>
          </div>

          <div style={{
            padding: '10px 16px', borderRadius: 8,
            background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)',
            fontSize: 12, color: '#c0b080', textAlign: 'center', maxWidth: 400,
          }}>
            Skin lendária com coroa dourada, ombreiras ornamentais, aura brilhante e partículas de efeito.
            Mantém a identidade da classe com um visual único e majestoso.
          </div>

          {error && (
            <div style={{ color: '#ff6060', fontSize: 13, fontWeight: 600 }}>{error}</div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!owned ? (
              <button
                onClick={handleBuy}
                style={{
                  padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
                  background: free
                    ? 'linear-gradient(180deg, #40c060 0%, #208040 100%)'
                    : 'linear-gradient(180deg, #ffd700 0%, #c0a020 100%)',
                  border: 'none', color: free ? '#fff' : '#1a1010',
                  fontSize: 15, fontWeight: 700,
                  boxShadow: free ? '0 0 20px rgba(64,192,96,0.4)' : '0 0 20px rgba(255,215,0,0.4)',
                }}
              >
                {free ? 'REIVINDICAR GRÁTIS' : `COMPRAR — 💎 ${LEGENDARY_COST}`}
              </button>
            ) : isEquipped ? (
              <div style={{
                padding: '10px 28px', borderRadius: 8,
                background: 'rgba(64,192,96,0.2)', border: '1px solid rgba(64,192,96,0.4)',
                color: '#40c060', fontSize: 15, fontWeight: 700,
              }}>
                ✓ EQUIPADA
              </div>
            ) : (
              <button
                onClick={handleEquip}
                style={{
                  padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
                  background: 'linear-gradient(180deg, #40a0d9 0%, #2060a0 100%)',
                  border: 'none', color: '#fff',
                  fontSize: 15, fontWeight: 700,
                  boxShadow: '0 0 20px rgba(64,160,217,0.4)',
                }}
              >
                EQUIPAR
              </button>
            )}
          </div>

          {/* Info */}
          <div style={{ fontSize: 11, color: '#605040', textAlign: 'center', marginTop: 4 }}>
            Ganhe 1 gema por monstro derrotado. A skin lendária do Necromante é grátis!
          </div>
        </div>
      </div>

      <style>{`
        @keyframes legendaryFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes legendarySparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
