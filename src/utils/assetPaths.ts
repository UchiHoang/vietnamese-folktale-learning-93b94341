/**
 * Asset Path Management Utility
 * 
 * Provides centralized asset path resolution for game assets organized by grade.
 * This makes it easy to add new grades and games without path conflicts.
 * 
 * Directory Structure:
 * public/assets/
 * ├── common/                 # Shared assets across all grades
 * │   ├── icons/
 * │   └── backgrounds/
 * └── grades/
 *     ├── preschool/
 *     ├── grade1/
 *     ├── grade2/
 *     │   └── trangquynh/    # Game-specific folder
 *     │       ├── characters/
 *     │       ├── icons/
 *     │       └── backgrounds/
 *     ├── grade3/
 *     ├── grade4/
 *     └── grade5/
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
  
  constructor(config: GameAssetConfig) {
    this.basePath = getGameBasePath(config.grade, config.gameId);
  }
  
  /**
   * Get character sprite path
   * @param characterId - e.g., "trang", "teacher", "villager"
   * @param state - e.g., "idle", "cheer", "portrait"
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
   * Get any custom asset path
   * @param relativePath - relative path from game folder
   */
  custom(relativePath: string): string {
    return `${this.basePath}/${relativePath}`;
  }
}

/**
 * Common assets shared across all grades
 */
export const commonAssets = {
  icon: (iconName: string): string => `${COMMON_BASE}/icons/icon_${iconName}.png`,
  background: (bgName: string): string => `${COMMON_BASE}/backgrounds/bg_${bgName}.png`,
};

/**
 * Pre-configured asset managers for each game
 */
export const gameAssets = {
  // Grade 2 - Trạng Quỳnh
  trangquynh: new GameAssets({ grade: 'grade2', gameId: 'trangquynh' }),
  
  // Future games can be added here:
  // grade1Math: new GameAssets({ grade: 'grade1', gameId: 'math-adventure' }),
  // preschoolCounting: new GameAssets({ grade: 'preschool', gameId: 'counting-fun' }),
};

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
  // Future characters can be added:
  // teacher: { idle: gameAssets.trangquynh.character('teacher', 'idle') },
  // villager: { idle: gameAssets.trangquynh.character('villager', 'idle') },
};

/**
 * Helper to resolve legacy asset paths to new structure
 * This helps during migration from old paths
 */
export const resolveLegacyAssetPath = (legacyPath: string): string => {
  // Already using new structure
  if (legacyPath.startsWith('/assets/grades/') || legacyPath.startsWith('/assets/common/')) {
    return legacyPath;
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
