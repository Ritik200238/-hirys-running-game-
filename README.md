# 🚀 HIRYS RUNNING - Powered by Irys Datachain

A retro-futuristic 2D endless runner game featuring the Irys brand aesthetic with Google Dino-style gameplay mechanics.

## 🎮 **Game Features**

### **Core Gameplay**
- **Dual Movement System**: JUMP over ground obstacles, DUCK under flying obstacles
- **Progressive Difficulty**: Starts easy (4s spawn intervals) and gradually increases to challenging (1.5s spawn intervals)
- **Smooth Controls**: Spacebar, Arrow Keys, or Click/Tap to control
- **60fps Performance**: Optimized for smooth gameplay on all devices

### **Obstacle Types**
- **Ground Obstacles**: Data Cactus, Receipt Blocks (require JUMP)
- **Flying Obstacles**: Data Birds, Drones (require DUCK)

### **Scoring System**
- **Survival Points**: 1 point per 0.1 seconds
- **Obstacle Avoidance**: +10 points per obstacle cleared
- **Perfect Streaks**: Bonus points for consecutive successful avoidances
- **Collectibles**: Data Receipts worth 25 points each

### **Progressive Difficulty**
- **First 60 seconds**: Obstacles spawn every 3-4 seconds (learning phase)
- **After 60 seconds**: Gradually decreases to 1.5-2 seconds (challenge phase)
- **Speed Scaling**: +2% every 250 points with maximum 300% cap

## 🚀 **Deployment to Vercel**

### **Prerequisites**
- [Vercel CLI](https://vercel.com/cli) installed
- [Node.js](https://nodejs.org/) 14.0.0 or higher
- [Git](https://git-scm.com/) for version control

### **Quick Deploy**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `hirys-running`
   - Directory: `./` (current directory)
   - Override settings: `N`

### **Custom Domain Setup**

1. **Deploy with custom domain**
   ```bash
   vercel --prod
   ```

2. **Add custom domain in Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to Settings → Domains
   - Add: `hirys-running.vercel.app`

3. **Configure DNS (if using custom domain)**
   - Add CNAME record pointing to `cname.vercel-dns.com`

### **Environment Variables**

No environment variables required for this static game.

## 🛠 **Local Development**

### **Install Dependencies**
```bash
npm install
```

### **Start Development Server**
```bash
npm run dev
# or
npm start
```

### **Build for Production**
```bash
npm run build
```

## 📱 **Mobile Optimization**

- **Progressive Web App (PWA)** support
- **Touch Controls**: Tap to jump, swipe down to duck
- **Responsive Design**: Optimized for all screen sizes
- **60fps Performance**: Smooth gameplay on mobile devices

## 🎨 **Technical Stack**

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Graphics**: HTML5 Canvas with 2D rendering
- **Audio**: Web Audio API for procedural sound effects
- **PWA**: Service Worker for offline functionality
- **Deployment**: Vercel for optimal performance

## 🌟 **Performance Features**

- **Optimized Rendering**: Efficient canvas operations
- **Smart Obstacle Spawning**: Fair spacing for reaction time
- **Memory Management**: Proper cleanup of game objects
- **Mobile Optimization**: Touch-friendly controls and responsive design

## 🔧 **Customization**

### **Game Balance**
- Adjust `obstacleSpawnTime` in `game.js` for different difficulty
- Modify `speedIncrease` for faster/slower progression
- Change `maxSpeedMultiplier` for maximum difficulty cap

### **Visual Style**
- Update colors in `style.css` for different themes
- Modify obstacle designs in `drawObstacles()` method
- Adjust particle effects and animations

## 📊 **Analytics & Monitoring**

The game includes built-in performance monitoring:
- FPS counter (60fps target)
- Score tracking with local storage
- High score persistence
- Game session analytics

## 🚀 **Deployment Checklist**

- [x] ✅ Game optimized for 60fps performance
- [x] ✅ Mobile responsive design
- [x] ✅ PWA capabilities implemented
- [x] ✅ Vercel configuration ready
- [x] ✅ Build scripts configured
- [x] ✅ Social sharing meta tags
- [x] ✅ Progressive difficulty balanced
- [x] ✅ Clean, addictive gameplay

## 🎯 **Success Metrics**

- **Target FPS**: 60fps on all devices
- **Mobile Performance**: Smooth gameplay on mobile
- **Player Retention**: Easy to reach 1000 points with practice
- **Viral Potential**: Shareable high scores and achievements

## 📞 **Support**

For issues or questions:
- Create an issue in the GitHub repository
- Contact the HIRYS Team
- Check the [Vercel documentation](https://vercel.com/docs)

---

**Made with ❤️ for the Irys Ecosystem**

*Experience the future of programmable data through addictive gameplay!*
