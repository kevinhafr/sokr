# Rocket Footy 🚀⚽

Un jeu de football stratégique en temps réel construit avec React Native et Supabase.

## 🎮 État actuel du jeu

Le jeu a maintenant une structure de base jouable avec :

### ✅ Fonctionnalités implémentées
- **Authentification** : Login/Register avec Supabase
- **Navigation** : Structure complète avec React Navigation
- **Écrans principaux** :
  - LoginScreen & RegisterScreen
  - HomeScreen avec matchmaking
  - GameScreen avec plateau de jeu
  - DeckScreen pour gérer son équipe
  - ShopScreen pour acheter des packs
  - ProfileScreen avec statistiques
- **Composants de jeu** :
  - GameBoard avec zones
  - PlayerCard avec rarités
  - Timer avec avertissements
  - DiceRoller animé
  - ActionButtons
  - Scoreboard
- **Backend** :
  - Base de données Supabase configurée
  - Edge Functions pour la logique de jeu
  - Machine d'état FSM
  - Synchronisation temps réel

### ⚠️ Configuration requise pour jouer

1. **Démarrer Supabase localement** (automatique avec la CLI)
   ```bash
   npx supabase start
   ```
   Les clés sont automatiquement configurées dans `.env`

2. **Variables d'environnement**
   - Le fichier `.env` est déjà configuré avec les clés locales
   - Pour la production, remplacez par vos vraies clés Supabase

### 🚀 Comment lancer le jeu

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# Pour iOS
npm run ios

# Pour Android
npm run android

# Pour Web
npm run web
```

### 🎯 Ce qui manque pour une version complète

1. **Assets visuels**
   - Images des cartes joueurs
   - Icônes et illustrations
   - Sons et musiques

2. **Fonctionnalités gameplay**
   - Système de deck builder complet
   - Matchmaking fonctionnel
   - Chat en jeu
   - Système de récompenses
   - Tournois

3. **Polish**
   - Animations avancées
   - Tutoriel pour nouveaux joueurs
   - Optimisation des performances
   - Tests et débogage

### 📱 Architecture

```
src/
├── components/     # Composants UI réutilisables
├── screens/        # Écrans de l'application
├── navigation/     # Configuration React Navigation
├── contexts/       # Contexts React (Auth, Game, etc.)
├── hooks/          # Hooks personnalisés
├── services/       # Services API et Supabase
├── fsm/           # Machine d'état du jeu
├── types/         # Types TypeScript
└── utils/         # Fonctions utilitaires
```

### 🛠️ Technologies utilisées

- **Frontend** : React Native, Expo
- **Backend** : Supabase (PostgreSQL, Edge Functions)
- **État** : XState (FSM), React Context
- **Navigation** : React Navigation
- **Animations** : React Native Reanimated
- **Types** : TypeScript

### 🤝 Contribution

Le jeu est en développement actif. Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### 📄 License

Ce projet est sous license MIT.

---

**Note** : Pour une version pleinement jouable, vous devez configurer Supabase avec vos propres clés et déployer les Edge Functions.