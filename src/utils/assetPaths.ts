/**
 * Asset Paths Manager
 * Quản lý đường dẫn assets theo cấu trúc mới
 * @see README_assets.md
 */

// ============================================
// BASE PATHS
// ============================================

const ASSETS_BASE = '/assets';
const GRADES_BASE = `${ASSETS_BASE}/grades`;
const COMMON_BASE = `${ASSETS_BASE}/common`;

// ============================================
// GRADE & GAME TYPES
// ============================================

type Grade = 'preschool' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5';
type AssetType = 'characters' | 'icons' | 'questions' | 'backgrounds';

// ============================================
// GAME ASSETS CLASS
// ============================================

export class GameAssets {
  private basePath: string;

  constructor(config: { grade: Grade; gameId: string }) {
    this.basePath = `${GRADES_BASE}/${config.grade}/${config.gameId}`;
  }

  /**
   * Lấy đường dẫn character với state
   * @example character('trang', 'idle') → /assets/grades/grade2/trangquynh/characters/trang_idle.png
   */
  character(name: string, state: string): string {
    return `${this.basePath}/characters/${name}_${state}.png`;
  }

  /**
   * Lấy đường dẫn icon
   * @example icon('apple') → /assets/grades/grade2/trangquynh/icons/icon_apple.png
   */
  icon(name: string): string {
    return `${this.basePath}/icons/icon_${name}.png`;
  }

  /**
   * Lấy đường dẫn question image
   * @example question('cloud_blue') → /assets/grades/preschool/counting-animals/questions/cloud_blue.png
   */
  question(name: string): string {
    return `${this.basePath}/questions/${name}.png`;
  }

  /**
   * Lấy đường dẫn background
   * @example background('village') → /assets/grades/grade2/trangquynh/backgrounds/bg_village.png
   */
  background(name: string): string {
    return `${this.basePath}/backgrounds/bg_${name}.png`;
  }

  /**
   * Lấy custom path
   */
  custom(type: AssetType, filename: string): string {
    return `${this.basePath}/${type}/${filename}`;
  }
}

// ============================================
// GAME INSTANCES
// ============================================

export const preschoolGames = {
  countingAnimals: new GameAssets({ grade: 'preschool', gameId: 'counting-animals' }),
};

export const grade1Games = {
  numberAdventure: new GameAssets({ grade: 'grade1', gameId: 'number-adventure' }),
};

export const grade2Games = {
  trangquynh: new GameAssets({ grade: 'grade2', gameId: 'trangquynh' }),
};

export const grade3Games = {
  fractionQuest: new GameAssets({ grade: 'grade3', gameId: 'fraction-quest' }),
};

export const grade4Games = {
  geometryWorld: new GameAssets({ grade: 'grade4', gameId: 'geometry-world' }),
};

export const grade5Games = {
  mathChampion: new GameAssets({ grade: 'grade5', gameId: 'math-champion' }),
};

// ============================================
// COMMON ASSETS
// ============================================

export const commonAssets = {
  icon: (name: string) => `${COMMON_BASE}/icons/icon_${name}.png`,
  question: (name: string) => `${COMMON_BASE}/questions/${name}.png`,
  background: (name: string) => `${COMMON_BASE}/backgrounds/bg_${name}.png`,
};

// ============================================
// PRESCHOOL CHARACTERS
// ============================================

export const preschoolCharacters = {
  cuoi: {
    idle: preschoolGames.countingAnimals.character('cuoi', 'idle'),
    idle1: preschoolGames.countingAnimals.character('cuoi', 'idle1'),
    thinking: preschoolGames.countingAnimals.character('cuoi', 'thinking'),
    happy: preschoolGames.countingAnimals.character('cuoi', 'happy'),
    pointing: preschoolGames.countingAnimals.character('cuoi', 'pointing'),
  },
  chihang: {
    idle: preschoolGames.countingAnimals.character('chihang', 'idle'),
  },
  bird: {
    idle: preschoolGames.countingAnimals.character('bird', 'idle'),
  },
};

// ============================================
// GRADE 1 CHARACTERS
// ============================================

export const grade1Characters = {
  zodiac: {
    rat: grade1Games.numberAdventure.custom('characters', 'zodiac_rat.png'),
    ox: grade1Games.numberAdventure.custom('characters', 'zodiac_ox.png'),
    tiger: grade1Games.numberAdventure.custom('characters', 'zodiac_tiger.png'),
  },
  tiger: {
    idle: grade1Games.numberAdventure.character('tiger', 'idle'),
  },
  buffalo: {
    golden: grade1Games.numberAdventure.custom('characters', 'buffalo_golden.png'),
  },
};

// ============================================
// GRADE 2 - TRANG QUYNH
// ============================================

export const grade2TrangQuynhCharacters = {
  trang: {
    idle: grade2Games.trangquynh.character('trang', 'idle'),
    cheer: grade2Games.trangquynh.character('trang', 'cheer'),
    portrait: grade2Games.trangquynh.character('trang', 'portrait'),
  },
};

export const grade2TrangQuynhIcons = {
  apple: grade2Games.trangquynh.icon('apple'),
  bridge: grade2Games.trangquynh.icon('bridge'),
  bunch: grade2Games.trangquynh.icon('bunch'),
  clock: grade2Games.trangquynh.icon('clock'),
  money: grade2Games.trangquynh.icon('money'),
  puzzle: grade2Games.trangquynh.icon('puzzle'),
  badge: grade2Games.trangquynh.icon('badge'),
  ticket: grade2Games.trangquynh.icon('ticket'),
};

// ============================================
// GRADE 3 - SON TINH THUY TINH
// ============================================

export const grade3Characters = {
  sontinh: {
    idle: grade3Games.fractionQuest.character('sontinh', 'idle'),
  },
  thuytinh: {
    idle: grade3Games.fractionQuest.character('thuytinh', 'idle'),
  },
  vuahung: {
    idle: grade3Games.fractionQuest.character('vuahung', 'idle'),
  },
  bacdau: {
    idle: grade3Games.fractionQuest.character('bacdau', 'idle'),
  },
  namtao: {
    idle: grade3Games.fractionQuest.character('namtao', 'idle'),
  },
};

// ============================================
// GRADE 5 - TRANG NGUYEN
// ============================================

// ============================================
// GRADE 4 CHARACTERS - Geometry World
// ============================================
// TODO: Thêm characters khi có assets
// Xem: public/assets/grades/grade4/geometry-world/README.md

export const grade4Characters = {
  // Placeholder - chờ thiết kế
  hero: {
    idle: grade4Games.geometryWorld.character('hero', 'idle'),
    happy: grade4Games.geometryWorld.character('hero', 'happy'),
    thinking: grade4Games.geometryWorld.character('hero', 'thinking'),
  },
  teacher: {
    geometry: grade4Games.geometryWorld.custom('characters', 'teacher_geometry.png'),
  },
  guide: {
    square: grade4Games.geometryWorld.custom('characters', 'guide_square.png'),
    circle: grade4Games.geometryWorld.custom('characters', 'guide_circle.png'),
  },
};

// ============================================
// GRADE 5 CHARACTERS - Math Champion
// ============================================

export const grade5Characters = {
  trangnguyen: {
    idle: grade5Games.mathChampion.character('trangnguyen', 'idle'),
  },
  soldier: {
    engineer: grade5Games.mathChampion.custom('characters', 'soldier_engineer.png'),
    support: grade5Games.mathChampion.custom('characters', 'soldier_support.png'),
  },
  captain: {
    ship: grade5Games.mathChampion.custom('characters', 'captain_ship.png'),
  },
  general: {
    army: grade5Games.mathChampion.custom('characters', 'general_army.png'),
  },
};

// ============================================
// LEGACY PATH RESOLVER
// ============================================

/**
 * Chuyển đổi đường dẫn cũ sang đường dẫn mới
 * @deprecated Chỉ dùng cho migration, sẽ xóa sau khi hoàn thành refactor
 */
export function resolveLegacyAssetPath(oldPath: string): string {
  // Map các đường dẫn cũ sang mới
  const legacyMap: Record<string, string> = {
    // Preschool
    'assets/user/chucuoi.png': preschoolCharacters.cuoi.idle,
    'assets/user/cuoi1.png': preschoolCharacters.cuoi.idle1,
    'assets/user/cuoi2.png': preschoolCharacters.cuoi.thinking,
    'assets/user/cuoi3.png': preschoolCharacters.cuoi.happy,
    'assets/user/cuoi4.png': preschoolCharacters.cuoi.pointing,
    'assets/user/chihang.png': preschoolCharacters.chihang.idle,
    'assets/user/chimse.png': preschoolCharacters.bird.idle,
    
    // Grade 2 - Trang Quynh
    'assets/user/trang_idle.png': grade2TrangQuynhCharacters.trang.idle,
    'assets/user/trang_cheer.png': grade2TrangQuynhCharacters.trang.cheer,
    'assets/user/trang_portrait.png': grade2TrangQuynhCharacters.trang.portrait,
    
    // Icons
    'assets/user/icon_apple.png': grade2TrangQuynhIcons.apple,
    'assets/user/icon_badge.png': grade2TrangQuynhIcons.badge,
    'assets/user/icon_bridge.png': grade2TrangQuynhIcons.bridge,
  };

  return legacyMap[oldPath] || oldPath;
}

// ============================================
// EXPORTS
// ============================================

export default {
  preschoolGames,
  grade1Games,
  grade2Games,
  grade3Games,
  grade4Games,
  grade5Games,
  commonAssets,
  preschoolCharacters,
  grade1Characters,
  grade2TrangQuynhCharacters,
  grade2TrangQuynhIcons,
  grade3Characters,
  grade4Characters,
  grade5Characters,
  resolveLegacyAssetPath,
};
