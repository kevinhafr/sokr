```markdown
# Rocket Footy - Animations & Assets

## Vue d'ensemble

Le système d'animations et de gestion des assets de Rocket Footy suit une approche flat design inspirée du style minimaliste de Martin Panchaud ("La couleur des choses"). L'objectif est de créer une expérience fluide et épurée, optimisée pour tous les devices (support 10+ ans).

## 1. Architecture des Animations

### 1.1 Stack technologique
```typescript
// config/animation.config.ts
export const animationConfig = {
  engine: 'react-native-reanimated',
  targetFPS: 60,
  defaultDuration: 300,
  defaultEasing: 'easeInOutCubic',
  reducedMotion: {
    enabled: true,
    duration: 150
  }
};
```

### 1.2 Types d'animations principales

#### Animations du plateau de jeu
```typescript
// animations/board/BoardAnimations.ts
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat
} from 'react-native-reanimated';

export const BoardAnimations = {
  // Surbrillance des positions disponibles
  highlightEligibleSlots: {
    scale: withRepeat(
      withSequence(
        withSpring(1.05),
        withSpring(1)
      ),
      -1,
      true
    ),
    opacity: withRepeat(
      withSequence(
        withSpring(1),
        withSpring(0.6)
      ),
      -1,
      true
    ),
    borderWidth: 2,
    borderColor: '#FFD700'
  },

  // Animation de placement de carte
  cardPlacement: {
    initial: { scale: 0, rotation: -180 },
    animate: {
      scale: withSpring(1, {
        damping: 12,
        stiffness: 100
      }),
      rotation: withSpring(0)
    },
    duration: 600
  },

  // Déplacement de la balle
  ballMovement: {
    duration: 800,
    path: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};
```

#### Animations des cartes joueurs
```typescript
// animations/cards/CardAnimations.ts
export const CardAnimations = {
  // Sélection de carte
  selection: {
    scale: withSpring(1.1),
    elevation: 8,
    shadowOpacity: 0.3
  },

  // Retournement de carte
  flip: {
    rotateY: withSpring(180, {
      damping: 15,
      stiffness: 100
    }),
    duration: 500
  },

  // Effet de brillance (carte rare)
  shimmer: {
    translateX: withRepeat(
      withSequence(
        withTiming(-100, { duration: 0 }),
        withTiming(100, { duration: 1000 })
      ),
      -1,
      false
    )
  }
};
```

#### Animations des dés
```typescript
// animations/dice/DiceAnimations.ts
export const DiceAnimations = {
  // Lancer de dé
  roll: {
    duration: 1200,
    rotations: 5,
    bounceEffect: {
      damping: 10,
      stiffness: 100,
      mass: 0.8
    }
  },

  // Révélation du résultat
  reveal: {
    scale: withSequence(
      withSpring(1.3),
      withSpring(1)
    ),
    opacity: withTiming(1, { duration: 300 })
  }
};
```

### 1.3 Transitions d'écrans
```typescript
// animations/transitions/ScreenTransitions.ts
export const ScreenTransitions = {
  // Transition fluide entre écrans
  smooth: {
    from: { opacity: 0, translateX: 20 },
    animate: {
      opacity: withTiming(1, { duration: 400 }),
      translateX: withSpring(0)
    },
    exit: {
      opacity: withTiming(0, { duration: 300 }),
      translateX: withTiming(-20)
    }
  },

  // Modal apparition
  modal: {
    backdrop: {
      opacity: withTiming(0.5, { duration: 300 })
    },
    content: {
      translateY: withSpring(0, {
        damping: 20,
        stiffness: 300
      })
    }
  }
};
```

### 1.4 Animations de célébration
```typescript
// animations/celebration/GoalAnimations.ts
export const GoalAnimations = {
  // Animation de but
  goalScored: {
    particles: {
      count: 30,
      colors: ['#FFD700', '#FFA500', '#FF6347'],
      duration: 2000,
      spread: 360
    },
    scoreCounter: {
      scale: withSequence(
        withSpring(2),
        withSpring(1.5),
        withSpring(1)
      )
    },
    soundEffect: 'goal_celebration.mp3'
  },

  // Animation de victoire
  victory: {
    trophy: {
      translateY: withSpring(-100),
      rotate: withRepeat(
        withSequence(
          withTiming(10, { duration: 200 }),
          withTiming(-10, { duration: 200 })
        ),
        3,
        true
      )
    },
    confetti: {
      count: 100,
      duration: 5000
    }
  }
};
```

## 2. Système d'Assets

### 2.1 Structure des dossiers
```
assets/
├── animations/
│   ├── lottie/             # Animations Lottie
│   └── sprites/            # Sprite sheets
├── audio/
│   ├── music/             # Musiques de fond
│   ├── sfx/               # Effets sonores
│   └── voice/             # Voix (si applicable)
├── cards/
│   ├── players/           # Cartes joueurs pré-rendues
│   │   ├── common/
│   │   ├── limited/
│   │   ├── rare/
│   │   ├── super-rare/
│   │   └── unique/
│   └── bonus/             # Cartes bonus
├── icons/
│   ├── ui/                # Icônes interface
│   ├── positions/         # Icônes positions
│   └── stats/             # Icônes statistiques
├── images/
│   ├── board/             # Assets du plateau
│   ├── backgrounds/       # Arrière-plans
│   └── ui/                # Éléments d'interface
└── fonts/                 # Polices personnalisées
```

### 2.2 Nomenclature des fichiers
```typescript
// config/assets.naming.ts
export const assetNaming = {
  cards: '{rarity}_{player_name}_{size}.png',
  icons: 'ic_{category}_{name}_{size}.svg',
  animations: 'anim_{type}_{name}.json',
  sounds: 'sfx_{category}_{name}.mp3'
};

// Exemples:
// common_messi_large.png
// ic_ui_settings_24.svg
// anim_goal_celebration.json
// sfx_game_whistle.mp3
```

### 2.3 Gestion des résolutions
```typescript
// utils/assets/AssetManager.ts
export class AssetManager {
  static getImageAsset(name: string): any {
    const { width } = Dimensions.get('window');

    // Sélection automatique de la résolution
    if (width >= 768) return require(`@assets/images/${name}@3x.png`);
    if (width >= 375) return require(`@assets/images/${name}@2x.png`);
    return require(`@assets/images/${name}.png`);
  }

  static getCardAsset(rarity: string, playerId: string): string {
    // Les cartes sont pré-rendues et stockées sur CDN
    return `${CDN_URL}/cards/${rarity}/${playerId}.webp`;
  }
}
```

### 2.4 Style Martin Panchaud
```typescript
// theme/martinPanchaudStyle.ts
export const martinPanchaudTheme = {
  colors: {
    // Palette inspirée de "La couleur des choses"
    primary: '#E85D75',      // Rouge/Rose signature
    secondary: '#6ECEDA',    // Bleu ciel
    tertiary: '#FFD93D',     // Jaune vif
    background: '#F5F5F5',   // Gris très clair
    surface: '#FFFFFF',
    text: '#2C3E50',
    accent: '#95E1D3'
  },

  typography: {
    // Polices flat et modernes
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      bold: 'Inter-Bold'
    },
    sizes: {
      small: 12,
      body: 16,
      title: 24,
      large: 32
    }
  },

  shapes: {
    // Formes géométriques simples
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
      circular: 999
    },
    strokeWidth: 2
  },

  shadows: {
    // Ombres minimales
    none: {},
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    }
  }
};
```

### 2.5 Optimisation des assets

#### Compression d'images
```typescript
// scripts/optimizeAssets.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

async function optimizeImages() {
  await imagemin(['assets/images/*.{jpg,png}'], {
    destination: 'assets/images/optimized',
    plugins: [
      imageminWebp({ quality: 85 }),
      imageminMozjpeg({ quality: 85 }),
      imageminPngquant({ quality: [0.65, 0.9] })
    ]
  });
}
```

#### Préchargement des assets critiques
```typescript
// hooks/useAssetPreloader.ts
export function useAssetPreloader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      // Images critiques
      const imageAssets = [
        require('@assets/images/board/field.png'),
        require('@assets/images/ui/ball.png'),
        require('@assets/icons/positions/goalkeeper.svg')
      ];

      // Sons critiques
      const soundAssets = [
        require('@assets/audio/sfx/whistle.mp3'),
        require('@assets/audio/sfx/goal.mp3'),
        require('@assets/audio/sfx/dice_roll.mp3')
      ];

      // Fonts
      await Font.loadAsync({
        'Inter-Regular': require('@assets/fonts/Inter-Regular.ttf'),
        'Inter-Bold': require('@assets/fonts/Inter-Bold.ttf')
      });

      await Promise.all([
        ...imageAssets.map(asset => Asset.fromModule(asset).downloadAsync()),
        ...soundAssets.map(asset => Audio.Sound.createAsync(asset))
      ]);

      setIsLoaded(true);
    };

    loadAssets();
  }, []);

  return isLoaded;
}
```

### 2.6 Système de cache
```typescript
// services/AssetCacheService.ts
export class AssetCacheService {
  private static cache = new Map<string, any>();
  private static maxCacheSize = 50 * 1024 * 1024; // 50MB
  private static currentSize = 0;

  static async getCachedAsset(key: string, loader: () => Promise<any>) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const asset = await loader();
    this.addToCache(key, asset);
    return asset;
  }

  private static addToCache(key: string, asset: any) {
    const size = this.estimateSize(asset);

    // Éviction LRU si nécessaire
    while (this.currentSize + size > this.maxCacheSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      this.removeFromCache(firstKey);
    }

    this.cache.set(key, asset);
    this.currentSize += size;
  }

  private static removeFromCache(key: string) {
    const asset = this.cache.get(key);
    if (asset) {
      this.currentSize -= this.estimateSize(asset);
      this.cache.delete(key);
    }
  }

  private static estimateSize(asset: any): number {
    // Estimation simplifiée
    return JSON.stringify(asset).length * 2; // 2 bytes per char
  }
}
```

## 3. Performance et Optimisation

### 3.1 Monitoring des performances
```typescript
// utils/performance/AnimationMonitor.ts
export class AnimationMonitor {
  private static frameDropThreshold = 2; // frames
  private static targetFPS = 60;

  static measureAnimation(animationName: string, animation: () => void) {
    const startTime = performance.now();
    let frameCount = 0;
    let droppedFrames = 0;

    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const expectedFrames = Math.floor(elapsed / (1000 / this.targetFPS));

      if (frameCount < expectedFrames - this.frameDropThreshold) {
        droppedFrames++;
      }

      if (elapsed < 1000) {
        requestAnimationFrame(measureFrame);
      } else {
        this.reportMetrics(animationName, frameCount, droppedFrames);
      }
    };

    animation();
    requestAnimationFrame(measureFrame);
  }

  private static reportMetrics(name: string, frames: number, dropped: number) {
    const fps = frames;
    const dropRate = (dropped / frames) * 100;

    console.log(`Animation: ${name}`);
    console.log(`FPS: ${fps}, Dropped: ${dropped} (${dropRate.toFixed(2)}%)`);

    // Envoyer à l'analytics si nécessaire
    if (dropRate > 5) {
      Analytics.track('animation_performance_issue', {
        animation: name,
        fps,
        dropRate
      });
    }
  }
}
```

### 3.2 Optimisations spécifiques
```typescript
// components/optimized/OptimizedImage.tsx
import FastImage from 'react-native-fast-image';

export const OptimizedImage: React.FC<{
  source: string;
  style?: any;
  placeholder?: string;
}> = ({ source, style, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View style={style}>
      {!isLoaded && placeholder && (
        <Image
          source={{ uri: placeholder }}
          style={[style, styles.placeholder]}
          blurRadius={10}
        />
      )}
      <FastImage
        style={style}
        source={{
          uri: source,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable
        }}
        resizeMode={FastImage.resizeMode.contain}
        onLoadEnd={() => setIsLoaded(true)}
      />
    </View>
  );
};
```

### 3.3 Lazy loading des animations lourdes
```typescript
// hooks/useLazyAnimation.ts
export function useLazyAnimation(animationPath: string) {
  const [animation, setAnimation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnimation = useCallback(async () => {
    if (animation || isLoading) return;

    setIsLoading(true);
    try {
      const module = await import(`@animations/${animationPath}`);
      setAnimation(module.default);
    } catch (error) {
      console.error('Failed to load animation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [animationPath, animation, isLoading]);

  return { animation, loadAnimation, isLoading };
}
```

## 4. Internationalisation

### 4.1 Gestion des assets localisés
```typescript
// i18n/AssetLocalization.ts
export class AssetLocalization {
  static getLocalizedAsset(assetName: string, locale: string = 'fr'): string {
    const localizedPath = `@assets/localized/${locale}/${assetName}`;
    const defaultPath = `@assets/localized/fr/${assetName}`;

    try {
      // Vérifier si l'asset localisé existe
      require(localizedPath);
      return localizedPath;
    } catch {
      // Fallback sur la version française
      return defaultPath;
    }
  }

  static getLocalizedCard(cardId: string, locale: string = 'fr'): string {
    // Les textes des cartes sont gérés côté serveur
    return `${CDN_URL}/cards/${locale}/${cardId}.webp`;
  }
}
```

### 4.2 Textes dynamiques
```typescript
// components/cards/LocalizedCard.tsx
export const LocalizedCard: React.FC<{
  cardData: any;
  locale: string;
}> = ({ cardData, locale }) => {
  const localizedTexts = useTranslation('cards');

  return (
    <View style={styles.card}>
      <Image source={{ uri: cardData.imageUrl }} style={styles.cardImage} />
      <View style={styles.overlay}>
        <Text style={styles.cardName}>{localizedTexts[cardData.id].name}</Text>
        <Text style={styles.cardDescription}>
          {localizedTexts[cardData.id].description}
        </Text>
      </View>
    </View>
  );
};
```

## 5. Architecture Silicon Valley

### 5.1 Structure modulaire
```typescript
// architecture/AssetModule.ts
export interface AssetModule {
  name: string;
  version: string;
  dependencies: string[];
  assets: AssetManifest;
  load: () => Promise<void>;
  unload: () => void;
}

export class AssetModuleLoader {
  private static modules = new Map<string, AssetModule>();

  static async loadModule(moduleName: string) {
    if (this.modules.has(moduleName)) {
      return this.modules.get(moduleName);
    }

    const module = await import(`@modules/${moduleName}`);
    await module.load();
    this.modules.set(moduleName, module);

    return module;
  }

  static async unloadModule(moduleName: string) {
    const module = this.modules.get(moduleName);
    if (module) {
      await module.unload();
      this.modules.delete(moduleName);
    }
  }
}
```

### 5.2 Asset Pipeline
```typescript
// build/AssetPipeline.ts
export class AssetPipeline {
  static async processAssets() {
    const steps = [
      this.validateAssets,
      this.optimizeImages,
      this.generateManifest,
      this.uploadToCDN,
      this.updateDatabase
    ];

    for (const step of steps) {
      await step();
    }
  }

  private static async validateAssets() {
    // Vérifier la conformité des assets
    const validator = new AssetValidator();
    const results = await validator.validateAll('./assets');

    if (!results.isValid) {
      throw new Error(`Asset validation failed: ${results.errors.join(', ')}`);
    }
  }

  private static async optimizeImages() {
    // Optimisation automatique des images
    await exec('npm run optimize:images');
  }

  private static async generateManifest() {
    // Générer le manifeste des assets
    const manifest = {
      version: process.env.BUILD_VERSION,
      timestamp: Date.now(),
      assets: await this.scanAssets('./assets')
    };

    await fs.writeFile('./assets/manifest.json', JSON.stringify(manifest, null, 2));
  }

  private static async uploadToCDN() {
    // Upload vers le CDN
    const cdnUploader = new CDNUploader();
    await cdnUploader.upload('./assets', process.env.CDN_BUCKET);
  }

  private static async updateDatabase() {
    // Mettre à jour les références en base de données
    const { data, error } = await supabase
      .from('asset_versions')
      .insert({
        version: process.env.BUILD_VERSION,
        manifest_url: `${CDN_URL}/manifest.json`,
        created_at: new Date()
      });

    if (error) throw error;
  }
}
```

## 6. Configuration et exemples

### 6.1 Configuration globale
```typescript
// config/assets.config.ts
export const assetsConfig = {
  cdn: {
    baseUrl: process.env.CDN_URL || 'https://cdn.rocketfooty.com',
    fallbackUrl: 'https://backup-cdn.rocketfooty.com',
    maxRetries: 3,
    timeout: 10000
  },

  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 jours
    strategy: 'lru'
  },

  optimization: {
    images: {
      quality: 85,
      formats: ['webp', 'jpg'],
      sizes: {
        thumbnail: 150,
        small: 300,
        medium: 600,
        large: 1200
      }
    },

    animations: {
      maxDuration: 3000,
      defaultFPS: 60,
      reducedMotionFPS: 30
    }
  },

  preload: {
    critical: [
      'board/field',
      'ui/ball',
      'icons/positions/*',
      'audio/sfx/whistle'
    ],

    secondary: [
      'cards/common/*',
      'animations/dice/*',
      'audio/sfx/*'
    ]
  }
};
```

### 6.2 Exemple d'utilisation complète
```typescript
// screens/GameScreen.tsx
import { useAssetPreloader } from '@/hooks/useAssetPreloader';
import { BoardAnimations } from '@/animations/board/BoardAnimations';
import { AssetManager } from '@/utils/assets/AssetManager';

export const GameScreen = () => {
  const isAssetsLoaded = useAssetPreloader();
  const [boardState, setBoardState] = useState(null);

  const handleCardPlacement = async (cardId: string, position: string) => {
    // Animation de surbrillance
    const highlightAnim = BoardAnimations.highlightEligibleSlots;

    // Animation de placement
    Animated.sequence([
      highlightAnim,
      BoardAnimations.cardPlacement.animate
    ]).start(() => {
      // Mettre à jour l'état
      setBoardState({
        ...boardState,
        [position]: cardId
      });
    });

    // Jouer le son
    await SoundManager.play('card_place');
  };

  if (!isAssetsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Board
        backgroundImage={AssetManager.getImageAsset('board/field')}
        state={boardState}
        onCardPlace={handleCardPlacement}
      />
    </View>
  );
};
```

## 7. Scripts et outils

### 7.1 Script d'optimisation
```json
// package.json
{
  "scripts": {
    "assets:optimize": "node scripts/optimizeAssets.js",
    "assets:validate": "node scripts/validateAssets.js",
    "assets:deploy": "node scripts/deployAssets.js",
    "assets:manifest": "node scripts/generateManifest.js",
    "assets:clean": "rm -rf assets/cache assets/temp"
  }
}
```

### 7.2 Script de validation
```javascript
// scripts/validateAssets.js
const fs = require('fs');
const path = require('path');

const REQUIRED_ASSETS = {
  'cards/players': ['common', 'limited', 'rare', 'super-rare', 'unique'],
  'animations': ['dice_roll', 'card_flip', 'goal_celebration'],
  'audio/sfx': ['whistle', 'goal', 'card_place'],
  'icons/positions': ['goalkeeper', 'defender', 'midfielder', 'attacker']
};

async function validateAssets() {
  const errors = [];

  for (const [dir, required] of Object.entries(REQUIRED_ASSETS)) {
    const fullPath = path.join('./assets', dir);

    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing directory: ${dir}`);
      continue;
    }

    for (const asset of required) {
      const assetPath = path.join(fullPath, asset);
      if (!fs.existsSync(assetPath) && !fs.existsSync(`${assetPath}.png`)) {
        errors.push(`Missing asset: ${dir}/${asset}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('Asset validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✅ All assets validated successfully');
}

validateAssets();
```

## 8. Bonnes pratiques

### 8.1 Checklist d'intégration d'assets
- [ ] Respecter la nomenclature définie
- [ ] Optimiser avant commit (WebP, compression)
- [ ] Fournir toutes les résolutions requises (@1x, @2x, @3x)
- [ ] Tester sur device low-end
- [ ] Vérifier les performances (60 FPS)
- [ ] Implémenter le lazy loading si > 500KB
- [ ] Ajouter au manifeste de préchargement si critique
- [ ] Documenter les animations complexes

### 8.2 Guidelines de design Martin Panchaud
- Utiliser des formes géométriques simples
- Privilégier les aplats de couleur
- Éviter les dégradés complexes
- Limiter les ombres portées
- Animations fluides mais subtiles
- Typographie claire et lisible
- Hiérarchie visuelle forte
- Espaces blancs généreux

### 8.3 Performance tips
- Utiliser `react-native-fast-image` pour les images
- Implémenter le recycling pour les listes
- Batch les animations simultanées
- Utiliser `InteractionManager` pour les tâches lourdes
- Profiler régulièrement avec Flipper
- Monitorer la mémoire avec Xcode/Android Studio
- Optimiser les re-renders avec `React.memo`
- Utiliser `useCallback` et `useMemo` judicieusement

## 9. Troubleshooting

### 9.1 Problèmes courants

**Animation saccadée**
```typescript
// Solution: Utiliser le native driver
Animated.timing(animValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true // Important!
}).start();
```

**Images floues**
```typescript
// Solution: Vérifier la résolution
const image = AssetManager.getImageAsset('logo'); // Sélectionne automatiquement @2x ou @3x
```

**Mémoire excessive**
```typescript
// Solution: Implémenter le garbage collection
componentWillUnmount() {
  AssetCacheService.clearUnusedAssets();
  this.animations?.forEach(anim => anim.stop());
}
```

### 9.2 Debug tools
```typescript
// utils/debug/AssetDebugger.ts
export class AssetDebugger {
  static enableDebugMode() {
    if (__DEV__) {
      // Afficher les stats de cache
      setInterval(() => {
        console.log('Cache stats:', AssetCacheService.getStats());
      }, 5000);

      // Monitorer les animations
      AnimationMonitor.enable();

      // Logger les erreurs d'assets
      Image.getSize = new Proxy(Image.getSize, {
        apply: (target, thisArg, args) => {
          console.log('Loading image:', args[0]);
          return target.apply(thisArg, args);
        }
      });
    }
  }
}
```

## 10. Roadmap

### Version 1.0 (Current)
- [x] Animations de base (plateau, cartes, dés)
- [x] Assets statiques optimisés
- [x] Système de cache simple
- [x] Support multi-résolution

### Version 2.0 (Q2 2025)
- [ ] Animations Lottie avancées
- [ ] Streaming d'assets depuis CDN
- [ ] Compression AVIF
- [ ] Thèmes personnalisables

### Version 3.0 (Q4 2025)
- [ ] Animations 3D (Three.js)
- [ ] Asset bundles dynamiques
- [ ] Machine learning pour la compression
- [ ] Editor d'animations in-app

---

## Conclusion

Le système d'animations et d'assets de Rocket Footy combine performance, esthétique et maintenabilité. En suivant le style flat design de Martin Panchaud et en optimisant chaque aspect, nous créons une expérience fluide sur tous les devices, garantissant une longévité de 10+ ans pour l'application.
```
