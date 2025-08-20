class HIRYSRunning {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.loadingStatus = document.getElementById('loadingStatus');
        this.comboMultiplier = document.getElementById('comboMultiplier');
        this.comboValue = document.getElementById('comboValue');
        this.milestoneCelebration = document.getElementById('milestoneCelebration');
        this.celebrationText = document.getElementById('celebrationText');
        
        // New DOM elements for viral features
        this.highScoreElement = document.getElementById('highScore');
        this.screenshotButton = document.getElementById('screenshotButton');
        this.shareButton = document.getElementById('shareButton');
        this.challengeButton = document.getElementById('challengeButton');
        this.shareModal = document.getElementById('shareModal');
        this.shareText = document.getElementById('shareText');
        this.copyButton = document.getElementById('copyButton');
        this.closeShareButton = document.getElementById('closeShareButton');
        this.challengeOverlay = document.getElementById('challengeOverlay');
        this.challengeScore = document.getElementById('challengeScore');
        this.acceptChallengeButton = document.getElementById('acceptChallengeButton');
        this.declineChallengeButton = document.getElementById('declineChallengeButton');
        this.newRecordCelebration = document.getElementById('newRecordCelebration');
        this.confettiContainer = document.getElementById('confettiContainer');
        this.achievementUnlocked = document.getElementById('achievementUnlocked');
        this.achievementTitle = document.getElementById('achievementTitle');
        this.achievementDesc = document.getElementById('achievementDesc');
        this.scoreComparison = document.getElementById('scoreComparison');
        this.comparisonText = document.getElementById('comparisonText');
        
        // Game state
        this.gameState = 'loading'; // loading, menu, playing, gameOver
        this.score = 0;
        this.gameSpeed = 5;
        this.baseSpeed = 5;
        
        // Progressive difficulty system (Google Dino style)
        this.gameTimer = 0; // Track game time in seconds
        this.obstacleSpawnTime = 3000; // Start with 3 seconds between obstacles (more aggressive)
        this.minSpawnTime = 1200; // Minimum 1.2 seconds between obstacles (more aggressive)
        this.lastObstacleSpawn = 0; // Track last obstacle spawn time
        
        // Streak and scoring system
        this.perfectStreak = 0;
        this.lastObstacleAvoided = 0;
        this.survivalTimer = 0;
        
        // Combo system
        this.comboCount = 0;
        this.comboMultiplierValue = 1;
        this.lastObstacleAvoided = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo
        
        // Progressive milestone system
        this.milestones = [
            { points: 500, message: 'Data Explorer! 🚀', sound: 600 },
            { points: 1000, message: 'Chain Runner! ⚡', sound: 700 },
            { points: 2500, message: 'Datachain Master! 💎', sound: 800 },
            { points: 5000, message: 'Irys Legend! 👑', sound: 900 },
            { points: 10000, message: 'Programmable Data God! 🌟', sound: 1000 }
        ];
        this.achievedMilestones = new Set();
        
        // Achievement system
        this.achievements = [
            { id: 'dataExplorer', name: 'Data Explorer', desc: 'Reach 1000 points', threshold: 1000, icon: '🔍' },
            { id: 'chainRunner', name: 'Chain Runner', desc: 'Reach 5000 points', threshold: 5000, icon: '🏃‍♂️' },
            { id: 'datachainMaster', name: 'Datachain Master', desc: 'Reach 10000 points', threshold: 10000, icon: '👑' }
        ];
        this.achievedAchievements = new Set();
        
        // Power-ups system
        this.powerups = {
            speedBoost: { active: false, duration: 5000, timer: 0, multiplier: 1.5 },
            receiptShield: { active: false, duration: 0, timer: 0, uses: 1 },
            dataMultiplier: { active: false, duration: 10000, timer: 0, multiplier: 2 }
        };
        
        // High score system
        this.highScore = parseInt(localStorage.getItem('hirysHighScore')) || 0;
        this.highScoreElement.textContent = this.highScore;
        
        // Challenge mode
        this.challengeMode = false;
        this.challengeTarget = 0;
        
        // Check for challenge URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const challengeScore = urlParams.get('challenge');
        if (challengeScore) {
            this.challengeMode = true;
            this.challengeTarget = parseInt(challengeScore);
            this.challengeScore.textContent = challengeScore;
            this.challengeOverlay.style.display = 'flex';
        }
        
        // Screen shake and effects
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        
        // Ghost runner (previous best run)
        this.ghostRunner = { x: 100, y: this.groundY, width: 84, height: 84, opacity: 0.3 };
        
        // Parallax background layers
        this.backgroundLayers = [];
        
        // Camera system
        this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
        
        // Canvas dimensions
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.groundY = this.canvasHeight - 100;
        
        // Player with dual movement system
        this.player = {
            x: 100,
            y: this.groundY,
            width: 84, // Increased from 60 (40% larger)
            height: 84, // Increased from 60 (40% larger)
            velocityY: 0,
            isJumping: false,
            isDucking: false,
            jumpPower: -15,
            gravity: 0.8,
            groundY: this.groundY,
            normalHeight: 84, // Increased from 60 (40% larger)
            duckHeight: 53, // Increased from 38 (40% larger)
            coyoteTime: 0,
            jumpBuffer: 0,
            animationFrame: 0,
            runningCycle: 0
        };
        
        // Game objects
        this.obstacles = [];
        this.particles = [];
        this.trailParticles = [];
        this.dataReceipts = [];
        this.powerupItems = []; // New: for power-up items
        this.backgroundBlocks = [];
        // Simplified Google Dino-style obstacle system
        this.obstacleTypes = [
            // LOW OBSTACLES (require JUMP) - positioned at 70% of character height
            { name: 'Data Cactus', type: 'ground', color: '#ef4444', width: 30, height: 59, chance: 0.6, y: this.groundY - 59 },
            { name: 'Receipt Block', type: 'ground', color: '#f97316', width: 40, height: 59, chance: 0.4, y: this.groundY - 59 },
            
            // HIGH OBSTACLES (require DUCK) - positioned at 60% character height from top
            { name: 'Data Bird', type: 'flying', color: '#6B46C1', width: 50, height: 34, chance: 0.5, y: this.groundY - 118 },
            { name: 'Drone', type: 'flying', color: '#3B82F6', width: 45, height: 34, chance: 0.5, y: this.groundY - 118 }
        ];
        
        // Power-up types
        this.powerupTypes = [
            { name: 'Speed Boost', type: 'speedBoost', color: '#6B46C1', width: 25, height: 25, chance: 0.008, icon: '⚡' },
            { name: 'Receipt Shield', type: 'receiptShield', color: '#3B82F6', width: 25, height: 25, chance: 0.006, icon: '🛡️' },
            { name: 'Data Multiplier', type: 'dataMultiplier', color: '#10B981', width: 25, height: 25, chance: 0.005, icon: '💎' }
        ];
        
        // Background
        this.backgroundOffset = 0;
        this.backgroundSpeed = 2;
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Sound effects (using Web Audio API)
        this.audioContext = null;
        this.setupAudio();
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        // Speed tier tracking
        this.speedTiersShown = {
            500: false,
            1000: false,
            2000: false,
            5000: false
        };
        
        // Initialize
        this.init();
    }
    
    async init() {
        await this.showLoadingScreen();
        this.generateBackgroundBlocks();
        this.gameState = 'menu';
        this.loadingScreen.style.display = 'none';
        this.gameLoop();
    }
    
    async showLoadingScreen() {
        const loadingSteps = [
            { progress: 30, status: 'Initializing game engine...' },
            { progress: 60, status: 'Loading Irys Datachain...' },
            { progress: 100, status: 'Ready to run!' }
        ];
        
        const loadingTips = [
            'JUMP over ground obstacles, DUCK under flying obstacles!',
            'First 60 seconds are easy - perfect for learning!',
            'Build streaks for bonus points!',
            'Challenge your friends to beat your score!'
        ];
        
        for (let i = 0; i < loadingSteps.length; i++) {
            const step = loadingSteps[i];
            this.loadingProgress.style.width = step.progress + '%';
            this.loadingStatus.textContent = step.status;
            
            // Update tip every step
            if (loadingTips[i]) {
                const tipElement = document.getElementById('loadingTips');
                if (tipElement) {
                    tipElement.querySelector('.tip-text').textContent = loadingTips[i];
                }
            }
            
            await this.delay(600); // Faster loading
        }
        
        await this.delay(300); // Shorter final delay
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupEventListeners() {
        // Keyboard events for dual movement system
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (this.gameState === 'playing') {
                if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
                    e.preventDefault();
                    this.jump();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyX') {
                    e.preventDefault();
                    this.duck();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            // Auto-return from ducking
            if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyX') {
                if (this.gameState === 'playing') {
                    this.standUp();
                }
            }
        });
        
        // Mouse/Touch events for dual movement
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.jump();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchY = touch.clientY - rect.top;
            
            // Swipe down to duck
            if (touchY > this.canvasHeight * 0.7 && this.gameState === 'playing') {
                this.duck();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.standUp();
            }
        });
        
        // Button events
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        this.restartButton.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Viral feature buttons
        this.screenshotButton.addEventListener('click', () => {
            this.takeScreenshot();
        });
        
        this.shareButton.addEventListener('click', () => {
            this.showShareModal();
        });
        
        this.challengeButton.addEventListener('click', () => {
            this.generateChallenge();
        });
        
        this.copyButton.addEventListener('click', () => {
            this.copyShareText();
        });
        
        this.closeShareButton.addEventListener('click', () => {
            this.hideShareModal();
        });
        
        this.acceptChallengeButton.addEventListener('click', () => {
            this.acceptChallenge();
        });
        
        this.declineChallengeButton.addEventListener('click', () => {
            this.declineChallenge();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    startGame() {
        this.gameState = 'playing';
        this.gameOverlay.style.display = 'none';
        this.score = 0;
        this.gameSpeed = this.baseSpeed;
        this.obstacles = [];
        this.particles = [];
        this.trailParticles = [];
        this.dataReceipts = [];
        this.powerupItems = [];
        this.player.y = this.groundY;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.player.isDucking = false;
        this.player.height = this.player.normalHeight;
        this.player.coyoteTime = 0;
        this.player.jumpBuffer = 0;
        this.player.animationFrame = 0;
        this.player.runningCycle = 0;
        this.comboCount = 0;
        this.comboMultiplierValue = 1;
        this.achievedMilestones.clear();
        this.achievedAchievements.clear();
        this.perfectStreak = 0;
        this.survivalTimer = 0;
        this.gameTimer = 0;
        this.obstacleSpawnTime = 3000; // Start with 3 seconds between obstacles (more aggressive)
        this.lastObstacleSpawn = 0;
        
        // Reset powerups
        for (const type in this.powerups) {
            this.powerups[type].active = false;
            this.powerups[type].timer = 0;
            this.powerups[type].uses = type === 'receiptShield' ? 1 : 0;
            this.hidePowerupDisplay(type);
        }
        
        // Reset screen shake
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        
        // Reset speed tier tracking for new game
        this.speedTiersShown = {
            500: false,
            1000: false,
            2000: false,
            5000: false
        };
        
        this.updateScore();
        this.updateCombo();
        
        // Resume audio context if needed
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'flex';
        
        // Update high score and show comparison
        this.updateHighScore();
        this.showScoreComparison();
        
        // Play game over sound
        this.playSound(200, 0.5, 'sawtooth');
        
        // Trigger datachain animation
        setTimeout(() => {
            this.triggerDatachainAnimation();
        }, 1000);
    }
    
    showScoreComparison() {
        if (this.score > this.highScore) {
            this.comparisonText.textContent = 'New Personal Best! 🎉';
            this.scoreComparison.style.display = 'block';
        } else if (this.score === this.highScore) {
            this.comparisonText.textContent = 'Tied Personal Best! 🎯';
            this.scoreComparison.style.display = 'block';
        } else {
            this.comparisonText.textContent = `Best: ${this.highScore} points`;
            this.scoreComparison.style.display = 'block';
        }
    }
    
    triggerDatachainAnimation() {
        const datachainAnimation = document.getElementById('datachainAnimation');
        datachainAnimation.style.animation = 'datachainFloat 0.5s ease-in-out 3';
    }
    
    jump() {
        // Coyote time: allow jumping for 0.1s after leaving ground
        if (!this.player.isJumping && (this.player.y >= this.player.groundY - 5 || this.player.coyoteTime > 0)) {
            this.player.velocityY = this.player.jumpPower;
            this.player.isJumping = true;
            this.player.coyoteTime = 0;
            this.playSound(400, 0.2, 'square');
            
            // Add screen shake
            this.addScreenShake(1, 100);
            
            // Add jump particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 3 + 2,
                    life: 30,
                    color: '#10B981'
                });
            }
        } else if (this.player.isJumping) {
            // Jump buffering: accept input 0.1s early
            this.player.jumpBuffer = 100;
        }
    }
    
    duck() {
        if (!this.player.isDucking && !this.player.isJumping) {
            this.player.isDucking = true;
            this.player.height = this.player.duckHeight;
            this.player.y = this.player.groundY - this.player.duckHeight;
            this.playSound(300, 0.15, 'triangle');
            
            // Add duck particles
            for (let i = 0; i < 6; i++) {
                this.particles.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height,
                    vx: (Math.random() - 0.5) * 3,
                    vy: Math.random() * 2 + 1,
                    life: 25,
                    color: '#3B82F6'
                });
            }
        }
    }
    
    standUp() {
        if (this.player.isDucking) {
            this.player.isDucking = false;
            this.player.height = this.player.normalHeight;
            this.player.y = this.player.groundY - this.player.normalHeight;
        }
    }
    
    updatePlayer(deltaTime) {
        // Apply gravity
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y >= this.player.groundY) {
            this.player.y = this.player.groundY;
            this.player.velocityY = 0;
            this.player.isJumping = false;
            this.player.coyoteTime = 100; // 0.1s coyote time
        }
        
        // Ceiling collision
        if (this.player.y <= 0) {
            this.player.y = 0;
            this.player.velocityY = 0;
        }
        
        // Update coyote time
        if (this.player.coyoteTime > 0) {
            this.player.coyoteTime -= deltaTime * 16.67;
        }
        
        // Update jump buffer
        if (this.player.jumpBuffer > 0) {
            this.player.jumpBuffer -= deltaTime * 16.67;
            if (this.player.jumpBuffer <= 0 && !this.player.isJumping) {
                this.jump(); // Execute buffered jump
            }
        }
        
        // Update animation frames
        this.player.animationFrame += deltaTime * 0.1;
        this.player.runningCycle = Math.sin(this.player.animationFrame) * 2;
        
        // Add trail particles
        if (this.gameState === 'playing') {
            this.trailParticles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                life: 20,
                color: this.getRandomIrysColor()
            });
        }
    }
    
    getRandomIrysColor() {
        const colors = ['#6B46C1', '#3B82F6', '#10B981'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    generateObstacle() {
        const now = Date.now();
        
        // Check if enough time has passed since last obstacle
        if (now - this.lastObstacleSpawn < this.obstacleSpawnTime) {
            return;
        }
        
        // Select random obstacle type
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        
        const obstacle = {
            x: this.canvasWidth,
            y: type.y,
            width: type.width,
            height: type.height,
            color: type.color,
            name: type.name,
            type: type.type,
            speed: this.gameSpeed
        };
        
        this.obstacles.push(obstacle);
        this.lastObstacleSpawn = now;
    }
    
    generateDataReceipt() {
        if (Math.random() < 0.01) {
            const receipt = {
                x: this.canvasWidth,
                y: this.groundY - 80 + Math.random() * 60,
                width: 20,
                height: 20,
                color: this.getRandomIrysColor(),
                speed: this.gameSpeed
            };
            this.dataReceipts.push(receipt);
        }
    }
    
    generatePowerup() {
        for (const powerupType of this.powerupTypes) {
            if (Math.random() < powerupType.chance && this.powerupItems.length < 2) {
                const powerup = {
                    x: this.canvasWidth,
                    y: this.groundY - 60 + Math.random() * 40,
                    width: powerupType.width,
                    height: powerupType.height,
                    color: powerupType.color,
                    name: powerupType.name,
                    type: powerupType.type,
                    icon: powerupType.icon,
                    speed: this.gameSpeed
                };
                this.powerupItems.push(powerup);
                break; // Only generate one powerup at a time
            }
        }
    }
    
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= obstacle.speed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10 * this.comboMultiplierValue;
                this.comboCount++;
                this.updateCombo();
                this.updateScore();
                this.checkMilestones();
            }
        }
    }
    
    updateDataReceipts(deltaTime) {
        for (let i = this.dataReceipts.length - 1; i >= 0; i--) {
            const receipt = this.dataReceipts[i];
            receipt.x -= receipt.speed;
            
            // Remove off-screen receipts
            if (receipt.x + receipt.width < 0) {
                this.dataReceipts.splice(i, 1);
            }
        }
    }
    
    updatePowerups(deltaTime) {
        for (let i = this.powerupItems.length - 1; i >= 0; i--) {
            const powerup = this.powerupItems[i];
            powerup.x -= powerup.speed;
            
            // Remove off-screen powerups
            if (powerup.x + powerup.width < 0) {
                this.powerupItems.splice(i, 1);
            }
        }
        
        // Update active powerup timers
        this.updatePowerupTimers(deltaTime);
    }
    
    updatePowerupTimers(deltaTime) {
        const now = Date.now();
        
        // Speed Boost
        if (this.powerups.speedBoost.active) {
            this.powerups.speedBoost.timer -= deltaTime * 16.67; // Convert to milliseconds
            if (this.powerups.speedBoost.timer <= 0) {
                this.deactivatePowerup('speedBoost');
            } else {
                this.updatePowerupDisplay('speedBoost', Math.ceil(this.powerups.speedBoost.timer / 1000));
            }
        }
        
        // Data Multiplier
        if (this.powerups.dataMultiplier.active) {
            this.powerups.dataMultiplier.timer -= deltaTime * 16.67;
            if (this.powerups.dataMultiplier.timer <= 0) {
                this.deactivatePowerup('dataMultiplier');
            } else {
                this.updatePowerupDisplay('dataMultiplier', Math.ceil(this.powerups.dataMultiplier.timer / 1000));
            }
        }
    }
    
    updateCombo() {
        const now = Date.now();
        
        if (now - this.lastObstacleAvoided > this.comboTimeout) {
            this.comboCount = 0;
            this.comboMultiplierValue = 1;
        }
        
        this.lastObstacleAvoided = now;
        
        // Calculate combo multiplier
        if (this.comboCount >= 10) {
            this.comboMultiplierValue = 5;
        } else if (this.comboCount >= 5) {
            this.comboMultiplierValue = 3;
        } else if (this.comboCount >= 2) {
            this.comboMultiplierValue = 2;
        } else {
            this.comboMultiplierValue = 1;
        }
        
        // Show/hide combo display
        if (this.comboMultiplierValue > 1) {
            this.comboMultiplier.style.display = 'flex';
            this.comboValue.textContent = this.comboMultiplierValue;
        } else {
            this.comboMultiplier.style.display = 'none';
        }
    }
    
    checkMilestones() {
        for (const milestone of this.milestones) {
            if (this.score >= milestone.points && !this.achievedMilestones.has(milestone.points)) {
                this.achievedMilestones.add(milestone.points);
                this.triggerMilestoneCelebration(milestone);
                break;
            }
        }
    }
    
    triggerMilestoneCelebration(milestone) {
        // Create small, non-intrusive milestone popup
        this.createMilestonePopup(milestone.message, 'milestone');
        
        // Play milestone-specific sound
        this.playSound(milestone.sound, 0.3, 'sine');
        
        // Add screen edge glow effect
        this.addScreenEdgeGlow();
    }
    
    createMilestonePopup(text, type = 'milestone') {
        // Create small popup (300px × 80px) positioned above gameplay
        const popup = document.createElement('div');
        popup.className = `game-popup ${type}-popup`;
        popup.style.cssText = `
            position: absolute;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 80px;
            background: ${type === 'milestone' ? 
                'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(34, 197, 94, 0.9))' : 
                'linear-gradient(135deg, rgba(107, 70, 193, 0.9), rgba(59, 130, 246, 0.9))'};
            color: white;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
            z-index: 50;
            opacity: 0;
            transform: translateX(-50%) translateY(-100px);
            transition: all 0.3s ease-out;
            pointer-events: none;
        `;
        
        popup.textContent = text;
        document.querySelector('.game-container').appendChild(popup);
        
        // Animate in
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);
        
        // Animate out after 2 seconds
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(-50%) translateY(-50px)';
            setTimeout(() => popup.remove(), 300);
        }, 2000);
    }
    
    addScreenEdgeGlow() {
        // Brief screen edge glow effect for milestones
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.top = '0';
        glow.style.left = '0';
        glow.style.width = '100%';
        glow.style.height = '100%';
        glow.style.background = 'radial-gradient(circle at center, transparent 60%, rgba(107, 70, 193, 0.3) 100%)';
        glow.style.pointerEvents = 'none';
        glow.style.zIndex = '5';
        glow.style.animation = 'glowPulse 1s ease-out forwards';
        
        document.querySelector('.game-container').appendChild(glow);
        
        setTimeout(() => glow.remove(), 1000);
    }
    
    checkCollisions() {
        // Check obstacle collisions with tight hitbox (85% of visual size)
        const hitboxWidth = this.player.width * 0.85;
        const hitboxHeight = this.player.height * 0.85;
        const hitboxX = this.player.x + (this.player.width - hitboxWidth) / 2;
        const hitboxY = this.player.y + (this.player.height - hitboxHeight) / 2;
        
        for (const obstacle of this.obstacles) {
            if (hitboxX < obstacle.x + obstacle.width &&
                hitboxX + hitboxWidth > obstacle.x &&
                hitboxY < obstacle.y + obstacle.height &&
                hitboxY + hitboxHeight > obstacle.y) {
                
                // Check if shield is active
                if (this.powerups.receiptShield.active && this.powerups.receiptShield.uses > 0) {
                    this.powerups.receiptShield.uses--;
                    this.deactivatePowerup('receiptShield');
                    this.addScreenShake(2, 100);
                    this.playSound(400, 0.3, 'sine');
                    
                    // Add shield break particles
                    for (let j = 0; j < 8; j++) {
                        this.particles.push({
                            x: this.player.x + this.player.width / 2,
                            y: this.player.y + this.player.height / 2,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            life: 50,
                            color: '#3B82F6'
                        });
                    }
                    return;
                }
                
                // COLLISION DETECTED - Add impact effects
                this.addCollisionEffects(obstacle);
                this.gameOver();
                return;
            }
            
            // Check for near-miss celebrations
            this.checkNearMiss(obstacle);
        }
        
        // Check data receipt collisions
        for (let i = this.dataReceipts.length - 1; i >= 0; i--) {
            const receipt = this.dataReceipts[i];
            if (hitboxX < receipt.x + receipt.width &&
                hitboxX + hitboxWidth > receipt.x &&
                hitboxY < receipt.y + receipt.height &&
                hitboxY + hitboxHeight > receipt.y) {
                
                this.dataReceipts.splice(i, 1);
                this.score += 50 * this.comboMultiplierValue;
                this.playSound(800, 0.2, 'triangle');
                
                // Add collection particles
                for (let j = 0; j < 6; j++) {
                    this.particles.push({
                        x: receipt.x + receipt.width / 2,
                        y: receipt.y + receipt.height / 2,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 40,
                        color: receipt.color
                    });
                }
                
                this.updateScore();
                this.checkMilestones();
            }
        }
        
        // Check powerup collisions
        for (let i = this.powerupItems.length - 1; i >= 0; i--) {
            const powerup = this.powerupItems[i];
            if (hitboxX < powerup.x + powerup.width &&
                hitboxX + hitboxWidth > powerup.x &&
                hitboxY < powerup.y + powerup.height &&
                hitboxY + hitboxHeight > powerup.y) {
                
                this.powerupItems.splice(i, 1);
                this.activatePowerup(powerup.type);
                
                // Add powerup collection particles
                for (let j = 0; j < 10; j++) {
                    this.particles.push({
                        x: powerup.x + powerup.width / 2,
                        y: powerup.y + powerup.height / 2,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 60,
                        color: powerup.color
                    });
                }
            }
        }
    }
    
    addCollisionEffects(obstacle) {
        // Add impact particle burst on collision
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 60,
                color: '#ef4444'
            });
        }
        
        // Add screen flash/shake on collision
        this.addScreenShake(4, 200);
        
        // Brief screen flash effect
        this.addScreenFlash();
        
        // Play collision sound
        this.playSound(150, 0.6, 'sawtooth');
    }
    
    addScreenFlash() {
        // Brief screen flash effect for collision
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.background = 'rgba(255, 255, 255, 0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '100';
        flash.style.animation = 'flashEffect 0.2s ease-out forwards';
        
        document.querySelector('.game-container').appendChild(flash);
        
        setTimeout(() => flash.remove(), 200);
    }
    
    checkNearMiss(obstacle) {
        // Check if player narrowly avoided an obstacle
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - obstacleCenterX, 2) + 
            Math.pow(playerCenterY - obstacleCenterY, 2)
        );
        
        // Near miss threshold
        const nearMissThreshold = 30;
        
        if (distance < nearMissThreshold && obstacle.x < this.player.x) {
            // Player successfully avoided obstacle
            this.perfectStreak++;
            this.score += 10; // Obstacle avoidance bonus
            
            // Perfect streak bonus
            if (this.perfectStreak >= 5) {
                this.score += 5;
                this.showNearMissCelebration();
            }
            
            // Add avoidance particles
            for (let j = 0; j < 6; j++) {
                this.particles.push({
                    x: obstacle.x + obstacle.width / 2,
                    y: obstacle.y + obstacle.height / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 40,
                    color: '#10B981'
                });
            }
            
            this.updateScore();
        }
    }
    
    showNearMissCelebration() {
        // Create small, non-intrusive near miss popup
        this.createMilestonePopup('CLOSE CALL! +5', 'nearmiss');
    }
    
    updateParticles(deltaTime) {
        // Update jump particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.life--;
            
            if (particle.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
    }
    
    generateBackgroundBlocks() {
        this.backgroundBlocks = [];
        for (let i = 0; i < 20; i++) {
            this.backgroundBlocks.push({
                x: Math.random() * this.canvasWidth * 2,
                y: Math.random() * this.canvasHeight,
                size: Math.random() * 20 + 10,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    updateBackground(deltaTime) {
        this.backgroundOffset += this.backgroundSpeed * deltaTime;
        if (this.backgroundOffset > this.canvasWidth) {
            this.backgroundOffset = 0;
        }
        
        // Update background blocks
        for (const block of this.backgroundBlocks) {
            block.x -= block.speed;
            if (block.x + block.size < 0) {
                block.x = this.canvasWidth + block.size;
                block.y = Math.random() * this.canvasHeight;
            }
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // AGGRESSIVE SPEED INCREASES: Every 500 points (only show once per tier)
        if (this.score >= 500 && this.score < 1000 && !this.speedTiersShown[500]) {
            // 500-999: Moderate speed increase
            this.gameSpeed = this.baseSpeed * 1.5;
            // Show speed increase indicator only once
            this.showSpeedIndicator('SPEED UP!', '#10B981');
            this.speedTiersShown[500] = true;
        } else if (this.score >= 1000 && this.score < 2000 && !this.speedTiersShown[1000]) {
            // 1000-1999: Fast speed
            this.gameSpeed = this.baseSpeed * 2.0;
            // Show speed increase indicator only once
            this.showSpeedIndicator('FASTER!', '#3B82F6');
            this.speedTiersShown[1000] = true;
        } else if (this.score >= 2000 && this.score < 5000 && !this.speedTiersShown[2000]) {
            // 2000-4999: Very fast speed
            this.gameSpeed = this.baseSpeed * 2.8;
            // Show speed increase indicator only once
            this.showSpeedIndicator('VERY FAST!', '#6B46C1');
            this.speedTiersShown[2000] = true;
        } else if (this.score >= 5000 && !this.speedTiersShown[5000]) {
            // 5000+: SUPER FAST SPEED
            this.gameSpeed = this.baseSpeed * 4.0;
            // Show speed increase indicator only once
            this.showSpeedIndicator('SUPER FAST!', '#ef4444');
            this.speedTiersShown[5000] = true;
        }
        
        // Update obstacle, receipt, and powerup speeds
        for (const obstacle of this.obstacles) {
            obstacle.speed = this.gameSpeed;
        }
        for (const receipt of this.dataReceipts) {
            receipt.speed = this.gameSpeed;
        }
        for (const powerup of this.powerupItems) {
            powerup.speed = this.gameSpeed;
        }
        
        // Survival points: 1 point per 0.1 seconds
        this.survivalTimer += 16.67; // Assuming 60fps
        if (this.survivalTimer >= 100) {
            this.score += 1;
            this.survivalTimer = 0;
        }
        
        // Progressive difficulty: decrease spawn time based on game time
        this.gameTimer += 16.67; // Track game time
        if (this.gameTimer >= 60000) { // After 60 seconds
            // Gradually decrease spawn time from 3s to 1.2s (more aggressive)
            const timeProgress = Math.min((this.gameTimer - 60000) / 120000, 1); // 2 minutes to reach minimum
            this.obstacleSpawnTime = 3000 - (timeProgress * 1800); // 3000ms to 1200ms
        }
        
        // Check achievements
        this.checkAchievements();
    }
    
    drawPlayer() {
        this.ctx.save();
        
        // Apply rotation for jump animation
        if (this.player.isJumping) {
            const rotationAngle = (this.player.velocityY / this.player.jumpPower) * 0.3;
            this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
            this.ctx.rotate(rotationAngle);
            this.ctx.translate(-(this.player.x + this.player.width / 2), -(this.player.y + this.player.height / 2));
        }
        
        // Player glow effect
        this.ctx.shadowColor = '#6B46C1';
        this.ctx.shadowBlur = 20;
        
        // Player body with running animation
        const yOffset = this.player.runningCycle;
        const playerY = this.player.y + yOffset;
        
        // Draw the cute geometric mascot (rounded blob-like shape)
        this.ctx.fillStyle = '#e5e7eb'; // Light grey/off-white body
        this.ctx.beginPath();
        
        // Main rounded body (blob-like shape)
        const centerX = this.player.x + this.player.width / 2;
        const centerY = playerY + this.player.height / 2;
        const bodyRadius = this.player.width / 2;
        
        // Create rounded blob shape
        this.ctx.arc(centerX, centerY, bodyRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add subtle Irys gradient overlay
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bodyRadius);
        gradient.addColorStop(0, 'rgba(107, 70, 193, 0.1)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw the two pointed protrusions at the top (like ears/horns)
        this.ctx.fillStyle = '#6B46C1';
        this.ctx.beginPath();
        
        // Left horn/ear
        this.ctx.moveTo(centerX - 15, centerY - bodyRadius + 5);
        this.ctx.lineTo(centerX - 25, centerY - bodyRadius - 15);
        this.ctx.lineTo(centerX - 15, centerY - bodyRadius - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Right horn/ear
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 15, centerY - bodyRadius + 5);
        this.ctx.lineTo(centerX + 25, centerY - bodyRadius - 15);
        this.ctx.lineTo(centerX + 15, centerY - bodyRadius - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes with different positions for ducking
        this.ctx.fillStyle = '#000000'; // Black eyes
        if (this.player.isDucking) {
            // Ducking eyes - smaller and lower
            this.ctx.beginPath();
            this.ctx.arc(centerX - 15, centerY - 5, 8, 0, Math.PI * 2);
            this.ctx.arc(centerX + 15, centerY - 5, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye highlights (light blue/turquoise)
            this.ctx.fillStyle = '#06b6d4';
            this.ctx.beginPath();
            this.ctx.arc(centerX - 15, centerY - 7, 4, 0, Math.PI * 2);
            this.ctx.arc(centerX + 15, centerY - 7, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // White sparkles in eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(centerX - 18, centerY - 10, 3, 3);
            this.ctx.fillRect(centerX + 12, centerY - 10, 3, 3);
            this.ctx.fillRect(centerX - 16, centerY - 6, 2, 2);
            this.ctx.fillRect(centerX + 14, centerY - 6, 2, 2);
            
        } else {
            // Normal eyes - large and prominent
            this.ctx.beginPath();
            this.ctx.arc(centerX - 18, centerY - 8, 12, 0, Math.PI * 2);
            this.ctx.arc(centerX + 18, centerY - 8, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye highlights (light blue/turquoise)
            this.ctx.fillStyle = '#06b6d4';
            this.ctx.beginPath();
            this.ctx.arc(centerX - 18, centerY - 12, 6, 0, Math.PI * 2);
            this.ctx.arc(centerX + 18, centerY - 12, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // White sparkles in eyes (four-pointed stars)
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(centerX - 22, centerY - 16, 4, 4);
            this.ctx.fillRect(centerX + 14, centerY - 16, 4, 4);
            this.ctx.fillRect(centerX - 20, centerY - 10, 3, 3);
            this.ctx.fillRect(centerX + 16, centerY - 10, 3, 3);
        }
        
        // Eyebrows (thin arched lines)
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (this.player.isDucking) {
            // Ducking eyebrows - lower and flatter
            this.ctx.arc(centerX - 15, centerY - 15, 8, 0, Math.PI, false);
            this.ctx.arc(centerX + 15, centerY - 15, 8, 0, Math.PI, false);
        } else {
            // Normal eyebrows - raised and arched
            this.ctx.arc(centerX - 18, centerY - 20, 10, 0, Math.PI, false);
            this.ctx.arc(centerX + 18, centerY - 20, 10, 0, Math.PI, false);
        }
        this.ctx.stroke();
        
        // Bottom edge (slightly wavy feet/nubs)
        this.ctx.fillStyle = '#6B46C1';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 12, centerY + bodyRadius - 8, 6, 0, Math.PI * 2);
        this.ctx.arc(centerX + 12, centerY + bodyRadius - 8, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add motion blur effect at high speeds
        if (this.gameSpeed > this.baseSpeed * 2) {
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = 'rgba(107, 70, 193, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(centerX + 20, centerY, bodyRadius * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    drawHexagon(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            // Obstacle glow effect
            this.ctx.shadowColor = obstacle.color;
            this.ctx.shadowBlur = 15;
            
            // Main obstacle
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle details based on type
            if (obstacle.type === 'ground') {
                // Ground obstacles (cacti, blocks)
                this.ctx.fillStyle = '#dc2626';
                this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
                
                // Add shadow indicator
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(obstacle.x, obstacle.y + obstacle.height, obstacle.width, 5);
                
            } else if (obstacle.type === 'flying') {
                // Flying obstacles (birds, drones)
                this.ctx.fillStyle = '#8b5cf6';
                this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
                
                // Add wing details
                this.ctx.fillStyle = '#3B82F6';
                this.ctx.fillRect(obstacle.x - 5, obstacle.y + 5, 8, 8);
                this.ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y + 5, 8, 8);
            }
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawDataReceipts() {
        for (const receipt of this.dataReceipts) {
            // Receipt glow effect
            this.ctx.shadowColor = receipt.color;
            this.ctx.shadowBlur = 20;
            
            // Draw as diamond shape
            this.ctx.fillStyle = receipt.color;
            this.ctx.beginPath();
            this.ctx.moveTo(receipt.x + receipt.width / 2, receipt.y);
            this.ctx.lineTo(receipt.x + receipt.width, receipt.y + receipt.height / 2);
            this.ctx.lineTo(receipt.x + receipt.width / 2, receipt.y + receipt.height);
            this.ctx.lineTo(receipt.x, receipt.y + receipt.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawPowerups() {
        for (const powerup of this.powerupItems) {
            // Powerup glow effect
            this.ctx.shadowColor = powerup.color;
            this.ctx.shadowBlur = 25;
            
            // Draw powerup as glowing orb
            this.ctx.fillStyle = powerup.color;
            this.ctx.beginPath();
            this.ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw icon
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(powerup.icon, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
            
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawGhostRunner() {
        if (this.highScore > 0) {
            this.ctx.globalAlpha = this.ghostRunner.opacity;
            this.ctx.fillStyle = '#6B46C1';
            this.ctx.fillRect(this.ghostRunner.x, this.ghostRunner.y, this.ghostRunner.width, this.ghostRunner.height);
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawParticles() {
        // Draw jump particles
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
        }
        
        // Draw trail particles
        for (const particle of this.trailParticles) {
            this.ctx.globalAlpha = particle.life / 20;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawBackground() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Background blocks (datachain effect)
        this.ctx.fillStyle = '#6B46C1';
        for (const block of this.backgroundBlocks) {
            this.ctx.globalAlpha = block.opacity;
            this.ctx.fillRect(block.x, block.y, block.size, block.size);
        }
        this.ctx.globalAlpha = 1;
        
        // Ground
        this.ctx.fillStyle = '#3B82F6';
        this.ctx.fillRect(0, this.groundY, this.canvasWidth, this.canvasHeight - this.groundY);
        
        // Ground glow
        this.ctx.shadowColor = '#3B82F6';
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(0, this.groundY, this.canvasWidth, 5);
        this.ctx.shadowBlur = 0;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Draw background
        this.drawBackground();
        
        // Draw particles
        this.drawParticles();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw data receipts
        this.drawDataReceipts();
        
        // Draw powerups
        this.drawPowerups();
        
        // Draw player
        this.drawPlayer();
        
        // Draw ghost runner
        this.drawGhostRunner();
        
        this.ctx.restore();
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update game objects
        this.updatePlayer(deltaTime);
        this.updateObstacles(deltaTime);
        this.updateDataReceipts(deltaTime);
        this.updatePowerups(deltaTime);
        this.updateParticles(deltaTime);
        this.updateBackground(deltaTime);
        this.updateScreenShake(deltaTime);
        
        // Generate new obstacles, receipts, and powerups
        this.generateObstacle();
        this.generateDataReceipt();
        this.generatePowerup();
        
        // Check collisions
        this.checkCollisions();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    handleResize() {
        // Handle responsive canvas sizing if needed
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        if (containerWidth < 1200) {
            const scale = containerWidth / 1200;
            this.canvas.style.width = `${containerWidth * 0.95}px`;
            this.canvas.style.height = `${600 * scale}px`;
        } else {
            this.canvas.style.width = '1200px';
            this.canvas.style.height = '600px';
        }
    }
    
    // Power-up methods
    activatePowerup(type) {
        const powerup = this.powerups[type];
        if (powerup) {
            powerup.active = true;
            powerup.timer = powerup.duration;
            
            // Apply powerup effects
            switch (type) {
                case 'speedBoost':
                    this.gameSpeed *= powerup.multiplier;
                    this.updatePowerupDisplay(type, Math.ceil(powerup.timer / 1000));
                    this.playSound(800, 0.2, 'sine');
                    break;
                case 'receiptShield':
                    this.updatePowerupDisplay(type);
                    this.playSound(600, 0.3, 'triangle');
                    break;
                case 'dataMultiplier':
                    this.updatePowerupDisplay(type, Math.ceil(powerup.timer / 1000));
                    this.playSound(1000, 0.2, 'sine');
                    break;
            }
            
            // Add screen shake
            this.addScreenShake(3, 200);
        }
    }
    
    deactivatePowerup(type) {
        const powerup = this.powerups[type];
        if (powerup) {
            powerup.active = false;
            powerup.timer = 0;
            
            // Remove powerup effects and restore normal speed based on current score
            switch (type) {
                case 'speedBoost':
                    // Restore speed based on current score using new aggressive system
                    if (this.score >= 500 && this.score < 1000) {
                        this.gameSpeed = this.baseSpeed * 1.5;
                    } else if (this.score >= 1000 && this.score < 2000) {
                        this.gameSpeed = this.baseSpeed * 2.0;
                    } else if (this.score >= 2000 && this.score < 5000) {
                        this.gameSpeed = this.baseSpeed * 2.8;
                    } else if (this.score >= 5000) {
                        this.gameSpeed = this.baseSpeed * 4.0;
                    } else {
                        this.gameSpeed = this.baseSpeed;
                    }
                    break;
            }
            
            // Hide powerup display
            this.hidePowerupDisplay(type);
        }
    }
    
    updatePowerupDisplay(type, timer = null) {
        const powerupElement = document.getElementById(type === 'speedBoost' ? 'speedBoost' : 
                                                   type === 'receiptShield' ? 'receiptShield' : 'dataMultiplier');
        if (powerupElement) {
            powerupElement.style.display = 'flex';
            
            if (timer !== null) {
                const timerElement = powerupElement.querySelector('.powerup-timer');
                if (timerElement) {
                    timerElement.textContent = `${timer}s`;
                }
            }
        }
    }
    
    hidePowerupDisplay(type) {
        const powerupElement = document.getElementById(type === 'speedBoost' ? 'speedBoost' : 
                                                   type === 'receiptShield' ? 'receiptShield' : 'dataMultiplier');
        if (powerupElement) {
            powerupElement.style.display = 'none';
        }
    }
    
    // Screen shake and effects
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime * 16.67;
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }
    
    // Viral features
    takeScreenshot() {
        // Create a canvas with the current game state
        const screenshotCanvas = document.createElement('canvas');
        const screenshotCtx = screenshotCanvas.getContext('2d');
        screenshotCanvas.width = this.canvasWidth;
        screenshotCanvas.height = this.canvasHeight;
        
        // Draw the game state
        this.draw();
        
        // Add score overlay
        screenshotCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        screenshotCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        screenshotCtx.fillStyle = '#ffffff';
        screenshotCtx.font = '48px Orbitron';
        screenshotCtx.textAlign = 'center';
        screenshotCtx.fillText(`Score: ${this.score}`, this.canvasWidth / 2, this.canvasHeight / 2 - 50);
        screenshotCtx.fillText('Powered by Irys', this.canvasWidth / 2, this.canvasHeight / 2 + 50);
        
        // Convert to blob and download
        screenshotCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hirys-running-score-${this.score}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    
    showShareModal() {
        this.shareText.textContent = `I just scored ${this.score} in HIRYS RUNNING! 🚀 The future of programmable data is here. Try it: [link] #IrysDatachain`;
        this.shareModal.style.display = 'flex';
    }
    
    hideShareModal() {
        this.shareModal.style.display = 'none';
    }
    
    copyShareText() {
        navigator.clipboard.writeText(this.shareText.textContent).then(() => {
            this.copyButton.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copyButton.textContent = '📋 Copy Text';
            }, 2000);
        });
    }
    
    generateChallenge() {
        const challengeScore = Math.floor(this.score * 1.2); // 20% higher than current score
        this.challengeScore.textContent = challengeScore;
        this.challengeOverlay.style.display = 'flex';
    }
    
    acceptChallenge() {
        this.challengeMode = true;
        this.challengeTarget = parseInt(this.challengeScore.textContent);
        this.challengeOverlay.style.display = 'none';
        this.startGame();
    }
    
    declineChallenge() {
        this.challengeOverlay.style.display = 'none';
    }
    
    // Achievement system
    checkAchievements() {
        for (const achievement of this.achievements) {
            if (this.score >= achievement.threshold && !this.achievedAchievements.has(achievement.id)) {
                this.achievedAchievements.add(achievement.id);
                this.showAchievement(achievement);
                break;
            }
        }
    }
    
    showAchievement(achievement) {
        // Create small, non-intrusive achievement popup
        this.createMilestonePopup(`${achievement.icon} ${achievement.name}`, 'achievement');
        
        // Play achievement sound
        this.playSound(800, 0.4, 'sine');
    }
    
    // High score management
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('hirysHighScore', this.highScore.toString());
            this.highScoreElement.textContent = this.highScore;
            
            // Show new record celebration
            this.showNewRecordCelebration();
        }
    }
    
    showNewRecordCelebration() {
        // Create small, non-intrusive high score popup
        this.createMilestonePopup(`🏆 NEW RECORD: ${this.score.toLocaleString()}`, 'highscore');
        
        // Create confetti effect
        this.createConfetti();
    }
    
    createConfetti() {
        const confettiCount = 50;
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = this.getRandomIrysColor();
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            this.confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    showSpeedIndicator(message, color) {
        const speedIndicator = document.getElementById('speedIndicator');
        if (speedIndicator) {
            speedIndicator.textContent = message;
            speedIndicator.style.color = color;
            speedIndicator.style.display = 'block';
            setTimeout(() => {
                speedIndicator.style.display = 'none';
            }, 2000); // Hide after 2 seconds
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new HIRYSRunning();
});
