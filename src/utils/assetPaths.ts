/**
 * Asset Path Management Utility
 * 
 * Provides centralized asset path resolution for game assets organized by grade.
 * This makes it easy to add new grades and games without path conflicts.
 * 
 * Directory Structure:
 * public/assets/
 * ├── common/                 # Shared assets across all grades
 * │   ├── icons/              # Common icons (badge, trophy, star, etc.)
 * │   ├── backgrounds/        # Common backgrounds
 * │   └── ui/                 # UI elements (buttons, frames, etc.)
 * └── grades/
 *     ├── preschool/
 *     │   └── counting-animals/
 *     ├── grade1/
 *     │   └── number-adventure/
 *     ├── grade2/
 *     │   └── trangquynh/
 *     ├── grade3/
 *     │   └── fraction-quest/
 *     ├── grade4/
 *     │   └── geometry-world/
 *     └── grade5/
 *         └── math-champion/
 */

export type GradeLevel = 'preschool' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5';

export interface GameAssetConfig {
  grade: GradeLevel;
  gameId: string;
}

// Base paths
const ASSETS_BASE = '/assets';
const GRADES_BASE = `${ASSETS_BASE}/grades`;
const COMMON_BASE = `${ASSETS_BASE}/common`;

/**
 * Grade display names in Vietnamese
 */
export const gradeDisplayNames: Record<GradeLevel, string> = {
  preschool: 'Mầm non',
  grade1: 'Lớp 1',
  grade2: 'Lớp 2',
  grade3: 'Lớp 3',
  grade4: 'Lớp 4',
  grade5: 'Lớp 5',
};

/**
 * Get the base path for a specific grade
 */
export const getGradeBasePath = (grade: GradeLevel): string => {
  return `${GRADES_BASE}/${grade}`;
};

/**
 * Get the base path for a specific game within a grade
 */
export const getGameBasePath = (grade: GradeLevel, gameId: string): string => {
  return `${GRADES_BASE}/${grade}/${gameId}`;
};

/**
 * Asset path builder for game assets
 */
export class GameAssets {
  private basePath: string;
  public readonly grade: GradeLevel;
  public readonly gameId: string;
  
  constructor(config: GameAssetConfig) {
    this.grade = config.grade;
    this.gameId = config.gameId;
    this.basePath = getGameBasePath(config.grade, config.gameId);
  }
  
  /**
   * Get character sprite path
   * @param characterId - e.g., "trang", "teacher", "villager"
   * @param state - e.g., "idle", "cheer", "portrait", "happy", "sad"
   */
  character(characterId: string, state: string = 'idle'): string {
    return `${this.basePath}/characters/${characterId}_${state}.png`;
  }
  
  /**
   * Get level/node icon path
   * @param iconName - e.g., "apple", "bridge", "clock"
   */
  icon(iconName: string): string {
    return `${this.basePath}/icons/icon_${iconName}.png`;
  }
  
  /**
   * Get background image path
   * @param bgName - e.g., "village", "market", "palace"
   */
  background(bgName: string): string {
    return `${this.basePath}/backgrounds/bg_${bgName}.png`;
  }
  
  /**
   * Get question image path (for counting, matching games, etc.)
   * @param imageName - e.g., "counting-apple", "shapes", "numbers"
   */
  question(imageName: string): string {
    return `${this.basePath}/questions/${imageName}.png`;
  }
  
  /**
   * Get any custom asset path
   * @param relativePath - relative path from game folder
   */
  custom(relativePath: string): string {
    return `${this.basePath}/${relativePath}`;
  }
  
  /**
   * Get base path for this game
   */
  getBasePath(): string {
    return this.basePath;
  }
}

/**
 * Common assets shared across all grades
 */
export const commonAssets = {
  icon: (iconName: string): string => `${COMMON_BASE}/icons/icon_${iconName}.png`,
  background: (bgName: string): string => `${COMMON_BASE}/backgrounds/bg_${bgName}.png`,
  ui: (elementName: string): string => `${COMMON_BASE}/ui/${elementName}.png`,
  question: (imageName: string): string => `${COMMON_BASE}/questions/${imageName}.png`,
};

// ============================================================================
// PRESCHOOL (Mầm non) - Theme: Cute animals, basic counting
// ============================================================================
export const preschoolGames = {
  countingAnimals: new GameAssets({ grade: 'preschool', gameId: 'counting-animals' }),
  // Future games:
  // colorMatch: new GameAssets({ grade: 'preschool', gameId: 'color-match' }),
  // shapeFun: new GameAssets({ grade: 'preschool', gameId: 'shape-fun' }),
};

// ============================================================================
// GRADE 1 (Lớp 1) - Theme: Adventure, basic math operations
// ============================================================================
export const grade1Games = {
  numberAdventure: new GameAssets({ grade: 'grade1', gameId: 'number-adventure' }),
  // Future games:
  // countingFun: new GameAssets({ grade: 'grade1', gameId: 'counting-fun' }),
  // additionQuest: new GameAssets({ grade: 'grade1', gameId: 'addition-quest' }),
};

// ============================================================================
// GRADE 2 (Lớp 2) - Theme: Vietnamese folklore, intermediate math
// ============================================================================
export const grade2Games = {
  trangquynh: new GameAssets({ grade: 'grade2', gameId: 'trangquynh' }),
  // Future games:
  // thachSanh: new GameAssets({ grade: 'grade2', gameId: 'thach-sanh' }),
  // soiVaCuu: new GameAssets({ grade: 'grade2', gameId: 'soi-va-cuu' }),
};

// ============================================================================
// GRADE 3 (Lớp 3) - Theme: Science exploration, fractions
// ============================================================================
export const grade3Games = {
  fractionQuest: new GameAssets({ grade: 'grade3', gameId: 'fraction-quest' }),
  // Future games:
  // timeTravel: new GameAssets({ grade: 'grade3', gameId: 'time-travel' }),
  // measureMaster: new GameAssets({ grade: 'grade3', gameId: 'measure-master' }),
};

// ============================================================================
// GRADE 4 (Lớp 4) - Theme: Geometry and space
// ============================================================================
export const grade4Games = {
  geometryWorld: new GameAssets({ grade: 'grade4', gameId: 'geometry-world' }),
  // Future games:
  // angleAdventure: new GameAssets({ grade: 'grade4', gameId: 'angle-adventure' }),
  // perimeterQuest: new GameAssets({ grade: 'grade4', gameId: 'perimeter-quest' }),
};

// ============================================================================
// GRADE 5 (Lớp 5) - Theme: Championship, advanced math
// ============================================================================
export const grade5Games = {
  mathChampion: new GameAssets({ grade: 'grade5', gameId: 'math-champion' }),
  // Future games:
  // algebraIntro: new GameAssets({ grade: 'grade5', gameId: 'algebra-intro' }),
  // percentMaster: new GameAssets({ grade: 'grade5', gameId: 'percent-master' }),
};

/**
 * All games organized by grade - unified access point
 */
export const gameAssets = {
  // Preschool
  ...preschoolGames,
  
  // Grade 1
  ...grade1Games,
  
  // Grade 2
  ...grade2Games,
  
  // Grade 3
  ...grade3Games,
  
  // Grade 4
  ...grade4Games,
  
  // Grade 5
  ...grade5Games,
};

/**
 * Get all games for a specific grade
 */
export const getGamesByGrade = (grade: GradeLevel): GameAssets[] => {
  const gradeGameMap: Record<GradeLevel, Record<string, GameAssets>> = {
    preschool: preschoolGames,
    grade1: grade1Games,
    grade2: grade2Games,
    grade3: grade3Games,
    grade4: grade4Games,
    grade5: grade5Games,
  };
  
  return Object.values(gradeGameMap[grade]);
};

// ============================================================================
// TRẠNG QUỲNH (Grade 2) - Specific configurations
// ============================================================================

/**
 * Level icon mapping for Trạng Quỳnh game
 * Maps node order to icon names
 */
export const trangQuynhLevelIcons: Record<number, string> = {
  1: 'apple',      // Làng Thi Nhỏ - cộng táo cam
  2: 'bridge',     // Thử Thách Trên Cầu
  3: 'bunch',      // Giúp Bà Hàng Xóm - buồng cau
  4: 'clock',      // Giờ Học Cuối Cùng - đồng hồ
  5: 'calendar',   // Lịch Trình May Mắn
  6: 'ruler',      // Thước Đo Ao Sen
  7: 'road',       // Đường Đê Khúc Khuỷu
  8: 'sack',       // Gạo Trắng, Nước Trong
  9: 'market',     // Chợ Phiên Kinh Kỳ
  10: 'candy',     // Chia Kẹo Cho Trẻ
  11: 'money',     // Tiền Thưởng Của Làng
  12: 'rice',      // Kiểm Kê Kho Thóc
  13: 'scroll',    // So Sánh Bổng Lộc
  14: 'brick',     // Xây Dựng Thành Quách
  15: 'crown',     // Đối Đáp Trước Rồng Vàng
};

/**
 * Get icon path for a Trạng Quỳnh level
 */
export const getTrangQuynhLevelIcon = (nodeOrder: number): string => {
  const iconName = trangQuynhLevelIcons[nodeOrder] || 'puzzle';
  return gameAssets.trangquynh.icon(iconName);
};

/**
 * Character sprites for Trạng Quỳnh
 */
export const trangQuynhCharacters = {
  trang: {
    idle: gameAssets.trangquynh.character('trang', 'idle'),
    cheer: gameAssets.trangquynh.character('trang', 'cheer'),
    portrait: gameAssets.trangquynh.character('trang', 'portrait'),
  },
  // Future characters:
  // teacher: { idle: gameAssets.trangquynh.character('teacher', 'idle') },
  // villager: { idle: gameAssets.trangquynh.character('villager', 'idle') },
  // king: { idle: gameAssets.trangquynh.character('king', 'idle') },
};

// ============================================================================
// SAMPLE CHARACTER CONFIGS FOR OTHER GRADES (Templates)
// ============================================================================

/**
 * Sample characters for Preschool - Counting Animals
 */
export const preschoolCountingCharacters = {
  bunny: {
    idle: preschoolGames.countingAnimals.character('bunny', 'idle'),
    happy: preschoolGames.countingAnimals.character('bunny', 'happy'),
  },
  bear: {
    idle: preschoolGames.countingAnimals.character('bear', 'idle'),
    wave: preschoolGames.countingAnimals.character('bear', 'wave'),
  },
};

/**
 * Sample characters for Grade 1 - Number Adventure
 */
export const grade1AdventureCharacters = {
  hero: {
    idle: grade1Games.numberAdventure.character('hero', 'idle'),
    run: grade1Games.numberAdventure.character('hero', 'run'),
    celebrate: grade1Games.numberAdventure.character('hero', 'celebrate'),
  },
  guide: {
    idle: grade1Games.numberAdventure.character('guide', 'idle'),
    point: grade1Games.numberAdventure.character('guide', 'point'),
  },
};

/**
 * Sample characters for Grade 3 - Fraction Quest
 */
export const grade3FractionCharacters = {
  scientist: {
    idle: grade3Games.fractionQuest.character('scientist', 'idle'),
    explain: grade3Games.fractionQuest.character('scientist', 'explain'),
  },
  robot: {
    idle: grade3Games.fractionQuest.character('robot', 'idle'),
    calculate: grade3Games.fractionQuest.character('robot', 'calculate'),
  },
};

/**
 * Sample characters for Grade 4 - Geometry World
 */
export const grade4GeometryCharacters = {
  architect: {
    idle: grade4Games.geometryWorld.character('architect', 'idle'),
    draw: grade4Games.geometryWorld.character('architect', 'draw'),
  },
  helper: {
    idle: grade4Games.geometryWorld.character('helper', 'idle'),
  },
};

/**
 * Sample characters for Grade 5 - Math Champion
 */
export const grade5ChampionCharacters = {
  champion: {
    idle: grade5Games.mathChampion.character('champion', 'idle'),
    victory: grade5Games.mathChampion.character('champion', 'victory'),
    think: grade5Games.mathChampion.character('champion', 'think'),
  },
  mentor: {
    idle: grade5Games.mathChampion.character('mentor', 'idle'),
    proud: grade5Games.mathChampion.character('mentor', 'proud'),
  },
};

// ============================================================================
// LEGACY PATH RESOLUTION (Migration support)
// ============================================================================

/**
 * Helper to resolve legacy asset paths to new structure
 * This helps during migration from old paths
 */
export const resolveLegacyAssetPath = (legacyPath: string): string => {
  // Already using new structure
  if (legacyPath.startsWith('/assets/grades/') || legacyPath.startsWith('/assets/common/')) {
    return legacyPath;
  }
  
  // Handle old src/assets/game paths (question images)
  if (legacyPath.includes('src/assets/game/') || legacyPath.includes('/src/assets/game/')) {
    const filename = legacyPath.split('/').pop()?.replace('.png', '') || '';
    
    // Counting images go to preschool
    if (filename.startsWith('counting-')) {
      return preschoolGames.countingAnimals.question(filename);
    }
    
    // Common question images (shapes, numbers, measurement)
    return commonAssets.question(filename);
  }
  
  // Handle old paths like "assets/user/trang_idle.png"
  if (legacyPath.startsWith('assets/user/')) {
    const filename = legacyPath.replace('assets/user/', '');
    
    // Character sprites
    if (filename.startsWith('trang_')) {
      const state = filename.replace('trang_', '').replace('.png', '');
      return gameAssets.trangquynh.character('trang', state);
    }
    
    // Icons
    if (filename.startsWith('icon_')) {
      const iconName = filename.replace('icon_', '').replace('.png', '');
      return gameAssets.trangquynh.icon(iconName);
    }
    
    // Backgrounds
    if (filename.startsWith('bg_')) {
      const bgName = filename.replace('bg_', '').replace('.png', '');
      return gameAssets.trangquynh.background(bgName);
    }
  }
  
  // Return original path if not matching legacy patterns
  return legacyPath.startsWith('/') ? legacyPath : `/${legacyPath}`;
};

/**
 * Badge icons mapping
 */
export const getBadgeIconPath = (badgeId: string): string => {
  const badgeIcons: Record<string, string> = {
    'addition-master': commonAssets.icon('badge'),
    'subtraction-master': commonAssets.icon('badge'),
    'measurement-master': gameAssets.trangquynh.icon('ruler'),
    'time-master': gameAssets.trangquynh.icon('clock'),
    'money-master': gameAssets.trangquynh.icon('money'),
    'grade2-master': commonAssets.icon('trophy'),
  };
  
  return badgeIcons[badgeId] || commonAssets.icon('badge');
};

// ============================================================================
// FACTORY FUNCTIONS FOR CREATING NEW GAMES
// ============================================================================

/**
 * Create a new game asset manager
 * Use this when adding a new game to any grade
 * 
 * @example
 * const newGame = createGameAssets('grade3', 'multiplication-master');
 * const heroSprite = newGame.character('hero', 'idle');
 */
export const createGameAssets = (grade: GradeLevel, gameId: string): GameAssets => {
  return new GameAssets({ grade, gameId });
};

/**
 * Generate folder structure documentation for a new game
 */
export const getGameFolderStructure = (grade: GradeLevel, gameId: string): string => {
  return `
public/assets/grades/${grade}/${gameId}/
├── characters/
│   ├── {character}_idle.png
│   ├── {character}_happy.png
│   └── {character}_portrait.png
├── icons/
│   ├── icon_{level1}.png
│   ├── icon_{level2}.png
│   └── ...
├── questions/
│   ├── counting-{item}.png
│   ├── {question-type}.png
│   └── ...
└── backgrounds/
    ├── bg_{scene1}.png
    ├── bg_{scene2}.png
    └── ...
  `.trim();
};

// ============================================================================
// QUESTION IMAGE HELPERS
// ============================================================================

/**
 * Get question image path - handles both game-specific and common images
 * @param imagePath - Legacy path or image name
 * @param grade - Optional grade for game-specific images
 * @param gameId - Optional game ID for game-specific images
 */
export const getQuestionImage = (imagePath: string, grade?: GradeLevel, gameId?: string): string => {
  // If already a new path, return as is
  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }
  
  // If legacy path, resolve it
  if (imagePath.includes('src/assets/game/')) {
    return resolveLegacyAssetPath(imagePath);
  }
  
  // If just an image name, build the path
  if (!imagePath.includes('/')) {
    const imgName = imagePath.replace('.png', '');
    
    // If grade and game specified, use game-specific path
    if (grade && gameId) {
      const game = createGameAssets(grade, gameId);
      return game.question(imgName);
    }
    
    // Otherwise use common
    return commonAssets.question(imgName);
  }
  
  return imagePath;
};
