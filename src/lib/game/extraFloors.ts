/**
 * Etapa 1 — Registry de andares extras (somente dados / tipos).
 *
 * Este arquivo NÃO mexe na geração ainda. Ele só declara, de forma central
 * e tipada, quais andares novos cada bioma (e as catacumbas/masmorra) vão
 * receber, com a mecânica única de cada um. A Etapa 2 vai consumir este
 * registry no `data.ts` para realmente plugar geradores por andar.
 *
 * Convenção do ID de andar extra: `<biomeBaseId>_x<n>` (x = "extra"),
 * por exemplo `desert_x1`..`desert_x5`, `catacombs_x1`..`catacombs_x10`,
 * `dungeon_x1`..`dungeon_x5`. Isso evita colidir com IDs já existentes
 * (ex.: `crystal1..crystal10`, `catacombs1..catacombs2`).
 */

export type FloorMechanic =
  | 'darkness'           // visão reduzida
  | 'fog'                // neblina densa
  | 'lava_pools'         // dano ao pisar
  | 'ice_slip'           // movimento deslizante
  | 'wind_push'          // empurrões periódicos
  | 'gravity_low'        // pulos longos / knockback maior
  | 'gravity_high'       // movimento lento
  | 'maze'               // labirinto denso
  | 'arena_waves'        // ondas em arena fechada
  | 'mirror'             // inimigos copiam stats do jogador
  | 'no_mana'            // regen de mana zerado
  | 'no_heal'            // poções com -50% efeito
  | 'double_xp'          // andar de risco/recompensa
  | 'elite_only'         // só elites
  | 'swarm'              // muitos inimigos fracos
  | 'boss_rush'          // sequência de mini-bosses
  | 'time_attack'        // saída fecha após X segundos
  | 'puzzle_keys'        // precisa achar chaves
  | 'cursed_drops'       // drops melhores mas com debuff
  | 'reverse_controls'   // controles invertidos
  | 'silence'            // sem habilidades, só ataque básico
  | 'glass_cannon'       // todos morrem em 1 hit (jogador inclusive)
  | 'poison_floor'       // veneno persistente
  | 'rising_water'       // andar inunda com o tempo
  | 'collapsing'         // o chão desaparece

export interface ExtraFloorDef {
  id: string              // id usado em generateMap()
  biome: string           // bioma base (mesmo gerador, com variações)
  index: number           // 1..N dentro do grupo extra
  name: string            // nome humano (PT-BR)
  mechanic: FloorMechanic
  levelMin: number
  levelMax: number
  notes: string           // descrição curta do "layout/organização"
}

/** Helper interno para gerar 5 andares extras padronizados por bioma. */
function five(biome: string, baseLevel: number, names: string[], mechs: FloorMechanic[], notes: string[]): ExtraFloorDef[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${biome}_x${i + 1}`,
    biome,
    index: i + 1,
    name: names[i],
    mechanic: mechs[i],
    levelMin: baseLevel + i * 4,
    levelMax: baseLevel + i * 4 + 6,
    notes: notes[i],
  }))
}

/**
 * 5 andares extras por bioma — TODOS os biomas listados no dispatcher de
 * `data.ts`. Os IDs `<biome>_x1..x5` ficam reservados para a Etapa 2.
 */
export const EXTRA_FLOORS: ExtraFloorDef[] = [
  // ── Cidade ──────────────────────────────────────────────────────────
  ...five('city', 1,
    ['Esgotos','Cripta Sob a Praça','Mercado Negro','Catacumbas Cívicas','Forja Subterrânea'],
    ['darkness','fog','swarm','maze','arena_waves'],
    [
      'Túneis estreitos sob a cidade, visão reduzida.',
      'Neblina cobrindo lápides e estátuas.',
      'Vendedores hostis em corredores apertados, muitos inimigos.',
      'Labirinto de cofres antigos com tesouros.',
      'Câmara circular com ondas de inimigos.',
    ]),
  // ── Floresta ────────────────────────────────────────────────────────
  ...five('forest', 3,
    ['Bosque das Sombras','Clareira Encantada','Trilha Espiral','Toca do Lobisomem','Coração da Floresta'],
    ['darkness','double_xp','maze','elite_only','boss_rush'],
    [
      'Árvores densas bloqueiam a luz.',
      'XP dobrado mas inimigos mais fortes.',
      'Trilhas em espiral que se cruzam.',
      'Só inimigos elites, espaços abertos.',
      'Mini-bosses em sequência até o boss real.',
    ]),
  // ── Masmorra (DUNGEON) — +5 andares ─────────────────────────────────
  ...five('dungeon', 5,
    ['Cripta dos Esquecidos','Salão dos Espelhos','Câmara do Carcereiro','Catacumba Inferior','Trono do Lich'],
    ['darkness','mirror','puzzle_keys','swarm','boss_rush'],
    [
      'Corredores em ruína, tochas apagadas.',
      'Inimigos copiam stats do jogador.',
      'Achar 3 chaves para abrir o portão.',
      'Hordas de esqueletos e ghouls.',
      'Sequência de 3 mini-bosses culminando no Lich.',
    ]),
  // ── Deserto ─────────────────────────────────────────────────────────
  ...five('desert', 4,
    ['Dunas Móveis','Oásis Envenenado','Tumba de Areia','Tempestade Eterna','Pirâmide do Faraó'],
    ['wind_push','poison_floor','maze','wind_push','boss_rush'],
    [
      'Vento empurra o jogador a cada poucos segundos.',
      'Veneno persistente, mas drops melhores.',
      'Labirinto de hieróglifos sob a areia.',
      'Tempestade contínua reduz visão e empurra.',
      'Sala do trono com Faraó-Lich.',
    ]),
  // ── Pântano ─────────────────────────────────────────────────────────
  ...five('swamp', 4,
    ['Brejo Tóxico','Floresta Afogada','Trilha do Hidra','Vila Submersa','Coração do Pântano'],
    ['poison_floor','rising_water','elite_only','rising_water','boss_rush'],
    [
      'Toda a água envenena.',
      'Água sobe e bloqueia caminhos.',
      'Hidras elite em arenas pequenas.',
      'Vila inundando enquanto você explora.',
      'Boss serpente colossal.',
    ]),
  // ── Tundra ──────────────────────────────────────────────────────────
  ...five('tundra', 6,
    ['Geleira Quebradiça','Cavernas de Cristal','Floresta Congelada','Pico Tempestuoso','Trono de Gelo'],
    ['ice_slip','darkness','swarm','wind_push','boss_rush'],
    [
      'Chão escorregadio em todo lugar.',
      'Cavernas escuras com gemas brilhantes.',
      'Hordas de lobos congelados.',
      'Vento empurra, neve reduz visão.',
      'Rainha do Gelo no trono final.',
    ]),
  // ── Vulcão ──────────────────────────────────────────────────────────
  ...five('volcano', 10,
    ['Encosta de Lava','Forjas em Ruína','Câmara Magmática','Rio de Fogo','Coração do Vulcão'],
    ['lava_pools','arena_waves','no_heal','lava_pools','boss_rush'],
    [
      'Poças de lava por todo o andar.',
      'Ondas de demônios em arena fechada.',
      'Cura reduzida pelo calor extremo.',
      'Rios de magma como obstáculo.',
      'Senhor do Magma como boss final.',
    ]),
  // ── Abismo ──────────────────────────────────────────────────────────
  ...five('abyss', 18,
    ['Borda do Vazio','Espelho de Almas','Vácuo Sussurrante','Olho do Abismo','Trono do Vazio'],
    ['gravity_low','mirror','silence','darkness','boss_rush'],
    [
      'Gravidade baixa, knockbacks maiores.',
      'Reflexos do jogador atacam.',
      'Habilidades silenciadas, só ataque básico.',
      'Visão extremamente reduzida.',
      'Avatar do Vazio.',
    ]),
  // ── Deep Forest ─────────────────────────────────────────────────────
  ...five('deepforest', 14,
    ['Raízes Antigas','Cogumelos Gigantes','Vale dos Treants','Toca do Druida Negro','Árvore Mãe'],
    ['maze','poison_floor','elite_only','no_mana','boss_rush'],
    [
      'Raízes formam um labirinto natural.',
      'Esporos venenosos por toda parte.',
      'Apenas Treants elite.',
      'Mana não regenera nesse andar.',
      'A própria Árvore Mãe como boss.',
    ]),
  // ── Arena (PvE waves) ───────────────────────────────────────────────
  ...five('arena', 10,
    ['Anfiteatro de Bronze','Anfiteatro de Prata','Anfiteatro de Ouro','Coliseu Imperial','Arena dos Campeões'],
    ['arena_waves','arena_waves','arena_waves','boss_rush','glass_cannon'],
    [
      '5 ondas de inimigos.',
      '7 ondas, mais elites.',
      '10 ondas, drops dourados.',
      'Mini-bosses entre cada onda.',
      'Modo glass cannon: 1 hit mata.',
    ]),
  // ── Caverna de Cristal ──────────────────────────────────────────────
  ...five('crystal', 12,
    ['Veio Esquecido','Galeria Refrativa','Catedral de Prismas','Núcleo de Geodos','Coração de Diamante'],
    ['darkness','mirror','no_mana','elite_only','boss_rush'],
    [
      'Cristais apagados, visão curta.',
      'Cristais refletem ataques (espelho).',
      'Cristais drenam mana do jogador.',
      'Só inimigos cristalinos elite.',
      'Golem-Diamante como boss.',
    ]),
  // ── Ruínas Assombradas ──────────────────────────────────────────────
  ...five('haunted', 16,
    ['Capela Profanada','Biblioteca Maldita','Galeria de Retratos','Cripta Real','Trono do Rei Morto'],
    ['silence','cursed_drops','mirror','swarm','boss_rush'],
    [
      'Magia silenciada por solo consagrado invertido.',
      'Drops melhores mas aplicam debuffs.',
      'Retratos invocam cópias do jogador.',
      'Hordas de fantasmas.',
      'Rei Morto e sua corte.',
    ]),
  // ── Sky Realm ───────────────────────────────────────────────────────
  ...five('sky', 22,
    ['Plataformas Flutuantes','Corredor dos Ventos','Templo das Nuvens','Olho da Tempestade','Trono Celestial'],
    ['gravity_low','wind_push','time_attack','wind_push','boss_rush'],
    [
      'Saltos longos entre plataformas.',
      'Vento contínuo empurra para o vazio.',
      'Saída fecha após 3 minutos.',
      'Tempestade circular ao redor da arena.',
      'Serafim Tempestade como boss.',
    ]),
  // ── Meadow ──────────────────────────────────────────────────────────
  ...five('meadow', 2,
    ['Campos Floridos','Colina dos Coelhos','Bosque Solar','Lago Espelhado','Santuário Verdejante'],
    ['double_xp','swarm','double_xp','mirror','boss_rush'],
    [
      'XP dobrado, andar tranquilo de farm.',
      'Hordas de animais pequenos.',
      'Buff de regen, mais XP.',
      'Reflexos do jogador no lago.',
      'Espírito do Campo como boss.',
    ]),
  // ── Coast ───────────────────────────────────────────────────────────
  ...five('coast', 3,
    ['Praia das Conchas','Cavernas da Maré','Recife Profundo','Tempestade Costeira','Trono do Tritão'],
    ['rising_water','darkness','poison_floor','wind_push','boss_rush'],
    [
      'Maré sobe periodicamente.',
      'Cavernas escuras à beira-mar.',
      'Águas-vivas venenosas.',
      'Vento e chuva reduzem visão.',
      'Rei Tritão como boss.',
    ]),
  // ── Snowy Mountain ──────────────────────────────────────────────────
  ...five('mountain', 8,
    ['Trilha Gelada','Caverna do Yeti','Pico Tempestuoso','Geleira Suspensa','Cume Eterno'],
    ['ice_slip','elite_only','wind_push','collapsing','boss_rush'],
    [
      'Chão totalmente escorregadio.',
      'Yetis elite em arenas de gelo.',
      'Vento constante empurra para os lados.',
      'Plataformas de gelo desabam.',
      'Drake da Neve como boss.',
    ]),
  // ── Ancient Ruins ───────────────────────────────────────────────────
  ...five('ruins', 9,
    ['Pórtico Quebrado','Galeria dos Ídolos','Câmara dos Selos','Sala dos Engenhos','Sanctum do Construtor'],
    ['puzzle_keys','mirror','silence','collapsing','boss_rush'],
    [
      '3 chaves espalhadas pelos escombros.',
      'Estátuas refletem o jogador.',
      'Magia selada nessa câmara.',
      'Engrenagens fazem o chão colapsar.',
      'Construtor-Golem como boss.',
    ]),
]

/**
 * Catacumbas — +10 andares extras (`catacombs_x1`..`catacombs_x10`).
 * Cada andar com mecânica distinta. A Etapa 2 vai chamar
 * `generateCatacombsMap(N, mechanic)` a partir desse registry.
 */
export const EXTRA_CATACOMB_FLOORS: ExtraFloorDef[] = [
  { id: 'catacombs_x1',  biome: 'catacombs', index: 1,  name: 'Ossário Raso',         mechanic: 'darkness',         levelMin: 8,  levelMax: 14, notes: 'Tochas apagadas, visão curta.' },
  { id: 'catacombs_x2',  biome: 'catacombs', index: 2,  name: 'Galeria dos Crânios',  mechanic: 'swarm',            levelMin: 12, levelMax: 18, notes: 'Hordas de esqueletos.' },
  { id: 'catacombs_x3',  biome: 'catacombs', index: 3,  name: 'Câmara dos Selos',     mechanic: 'puzzle_keys',      levelMin: 16, levelMax: 22, notes: 'Encontre 3 selos para descer.' },
  { id: 'catacombs_x4',  biome: 'catacombs', index: 4,  name: 'Capela Profanada',     mechanic: 'silence',          levelMin: 20, levelMax: 26, notes: 'Habilidades bloqueadas.' },
  { id: 'catacombs_x5',  biome: 'catacombs', index: 5,  name: 'Cripta do Carcereiro', mechanic: 'no_heal',          levelMin: 24, levelMax: 30, notes: 'Cura com -50%.' },
  { id: 'catacombs_x6',  biome: 'catacombs', index: 6,  name: 'Salão dos Espelhos',   mechanic: 'mirror',           levelMin: 28, levelMax: 34, notes: 'Reflexos atacam o jogador.' },
  { id: 'catacombs_x7',  biome: 'catacombs', index: 7,  name: 'Câmara Inundada',      mechanic: 'rising_water',     levelMin: 32, levelMax: 38, notes: 'Água sobe gradualmente.' },
  { id: 'catacombs_x8',  biome: 'catacombs', index: 8,  name: 'Catacumba Maldita',    mechanic: 'cursed_drops',     levelMin: 36, levelMax: 42, notes: 'Drops top com debuff.' },
  { id: 'catacombs_x9',  biome: 'catacombs', index: 9,  name: 'Antessala do Lich',    mechanic: 'elite_only',       levelMin: 40, levelMax: 46, notes: 'Só elites guardam o portão.' },
  { id: 'catacombs_x10', biome: 'catacombs', index: 10, name: 'Trono do Lich',        mechanic: 'boss_rush',        levelMin: 44, levelMax: 52, notes: 'Sequência de 3 bosses culminando no Lich.' },
]

/** Mapa rápido por id, útil pra Etapa 2 (lookup no dispatcher). */
export const EXTRA_FLOOR_BY_ID: Record<string, ExtraFloorDef> = Object.fromEntries(
  [...EXTRA_FLOORS, ...EXTRA_CATACOMB_FLOORS].map(f => [f.id, f]),
)

/** Lista de biomas cobertos por +5 andares extras (espelha o dispatcher de data.ts). */
export const EXTRA_FLOOR_BIOMES = [
  'city','forest','dungeon','desert','swamp','tundra','volcano','abyss',
  'deepforest','arena','crystal','haunted','sky','meadow','coast',
  'mountain','ruins',
] as const

export type ExtraFloorBiome = typeof EXTRA_FLOOR_BIOMES[number]