// Verbessert: IIFE (Immediately Invoked Function Expression) zur Kapselung des Codes
(function() {
    'use strict';

    // --- Highscore-Schlüssel ---
    const HIGHSCORE_KEY = 'flappyLovebirdHighScore';

    document.addEventListener('DOMContentLoaded', function () {

        // ... [Globale Variablen] ...
        
        let flappyActive = false;
        let animationFrameId = null;
        let lastTime = 0; 

        let ibanCopied = false;
        let purposeCopied = false;
        
        // NEU: Highscore-Variable, geladen aus localStorage
        let highScore = parseInt(localStorage.getItem(HIGHSCORE_KEY) || 0, 10);
        // NEU: Array zum Speichern der aktiven Konfetti-Partikel
        let confetti = [];
        // NEU: Letzter Punkt, bei dem Konfetti ausgelöst wurde
        let lastConfettiScore = 0; 

        const title = document.getElementById('wedding-title');
        const flappyWrapper = document.getElementById('flappy-wrapper');
        const canvas = document.getElementById('flappy-canvas');
        const ctx = canvas.getContext('2d');
        const flappyScore = document.getElementById('flappy-score');
        const flappyMessage = document.getElementById('flappy-message'); 
        const restartBtn = document.getElementById('flappy-restart');
        
        const GRAVITY_PER_SECOND = 800; 
        const LIFT_PER_SECOND = -450;  
        const PIPE_SPEED_PER_SECOND = 150; 
        const GAP_SIZE = 170; 
        
        const width = canvas.width;
        const height = canvas.height;
        const MIN_OBSTACLE_HEIGHT = 100;
        const MAX_OBSTACLE_HEIGHT = height - MIN_OBSTACLE_HEIGHT - GAP_SIZE; 


        // Game-State
        let bird = { x: 80, y: height / 2, w: 34, h: 24, vel: 0, gravity: GRAVITY_PER_SECOND, lift: LIFT_PER_SECOND };
        let obstacle = { x: width, w: 60, hTop: height / 2, swing: 0 }; 
        let score = 0;
        let gameOver = false;
        let started = false;

        const HEART_SPREAD_X = 80;
        const HEART_SPREAD_Y = 120;
        
        // Initialer Score-Text (zeigt Highscore an)
        updateScoreDisplay(); 

        /* ============================================================
         * 0) 🎊 Konfetti-Logik
         * ============================================================ */

        // Hilfsfunktion für zufällige Farbe (Pastell-Hochzeitsfarben)
        function getRandomColor() {
            const colors = ["#FFB6C1", "#ADD8E6", "#90EE90", "#F08080", "#FFDAB9", "#F0E68C"]; // Light Pink, Light Blue, Light Green, Coral, Peach, Light Yellow
            return colors[Math.floor(Math.random() * colors.length)];
        }

        // Konfetti-Partikel Klasse
        class Confetti {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 6 + 2;
                this.color = getRandomColor();
                // Zufällige Startgeschwindigkeit für einen "Explosions"-Effekt
                this.velX = Math.random() * 600 - 300; 
                this.velY = Math.random() * -600 - 100; 
                this.lifetime = 1.5; // Konfetti lebt 1.5 Sekunden
            }

            update(dt) {
                // Konfetti verlangsamt sich in X-Richtung, fällt in Y-Richtung
                this.velX *= (1 - 0.5 * dt); // Leichter Luftwiderstand
                this.velY += GRAVITY_PER_SECOND * dt * 0.5; // Schwerkraft
                this.x += this.velX * dt;
                this.y += this.velY * dt;
                this.lifetime -= dt;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        function createConfettiBurst(x, y) {
            const numParticles = 40;
            for (let i = 0; i < numParticles; i++) {
                confetti.push(new Confetti(x, y));
            }
        }
        
        function updateConfetti(safeDeltaTime) {
            // Partikel aktualisieren und tote Partikel entfernen
            confetti = confetti.filter(p => {
                p.update(safeDeltaTime);
                p.draw();
                return p.lifetime > 0;
            });
        }
        
        /* ============================================================
         * 1) ❤️ Herz-Klick-Animation (unverändert)
         * ============================================================ */
        document.body.addEventListener('click', function (e) {
            if (flappyActive) return;

            for (let i = 0; i < 15; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                const startOffsetX = Math.random() * 10 - 5;
                const startOffsetY = Math.random() * 10 - 5;
                heart.style.left = e.clientX + startOffsetX + 'px';
                heart.style.top = e.clientY + startOffsetY + 'px';
                
                const offsetX = Math.random() * HEART_SPREAD_X * 2 - HEART_SPREAD_X;
                const offsetY = -(Math.random() * HEART_SPREAD_Y + 50);
                
                heart.style.setProperty('--x', offsetX + 'px');
                heart.style.setProperty('--y', offsetY + 'px');
                
                document.body.appendChild(heart);
                heart.addEventListener('animationend', () => heart.remove());
            }
        });

        /* ============================================================
         * 2) ✏️ Copy-to-Clipboard & Easter Egg Check (unverändert)
         * ============================================================ */
        function copyText(btn) {
            const target = document.getElementById(btn.dataset.copyTarget);
            const feedback = btn.closest('.payment-box').querySelector('.copy-feedback');
            
            navigator.clipboard.writeText(target.textContent.trim())
                .then(() => {
                    feedback.style.display = 'inline';
                    setTimeout(() => feedback.style.display = 'none', 1000);

                    if (btn.dataset.copyTarget === 'iban') {
                        ibanCopied = true;
                    } else if (btn.dataset.copyTarget === 'purpose') {
                        purposeCopied = true;
                    }
                    checkForEasterEgg();

                })
                .catch(err => {
                    console.error('Kopieren fehlgeschlagen: ', err);
                    feedback.textContent = 'Fehler beim Kopieren!';
                    feedback.style.background = '#D85A6A';
                    feedback.style.display = 'inline';
                    setTimeout(() => {
                        feedback.style.display = 'none';
                        feedback.textContent = 'Kopiert!'; 
                        feedback.style.background = '#A7D3F3'; 
                    }, 2000);
                });
        }

        const copyBtns = document.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => copyText(btn));
        });


        /* ============================================================
         * 3) Flappy Lovebird Easter Egg: Trigger-Logik über Kopieren (unverändert)
         * ============================================================ */
        function checkForEasterEgg() {
            if (ibanCopied && purposeCopied && !flappyActive) {
                setTimeout(startFlappyLovebird, 500); 
            }
        }
        
        /* ============================================================
         * 4) Score & Highscore Anzeige
         * ============================================================ */
        function updateScoreDisplay() {
            // Anzeige von aktuellem Score und Highscore
            flappyScore.innerHTML = `Punkte: ${score} | Highscore: ${highScore}`;
        }


        /* ============================================================
         * 5) Flappy Lovebird Game
         * ============================================================ */
        function startFlappyLovebird() {
            if (flappyActive) return;

            flappyActive = true;
            flappyWrapper.style.display = 'flex';
            
            canvas.removeEventListener('click', flap);
            canvas.removeEventListener('touchstart', flap);
            canvas.addEventListener('click', flap);
            canvas.addEventListener('touchstart', flap);
            restartBtn.removeEventListener('click', resetGame);
            restartBtn.addEventListener('click', resetGame);
            
            lastTime = performance.now(); 

            resetGame();
        }
        
        function closeFlappyLovebird() {
            if (!flappyActive && !gameOver) return;
            
            flappyActive = false;
            gameOver = true; 
            flappyWrapper.style.display = 'none';
            flappyMessage.style.display = 'none'; 
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            resetGame(); 
        }

        flappyWrapper.addEventListener('click', function(e) {
            if (e.target === flappyWrapper) {
                closeFlappyLovebird();
                ibanCopied = false;
                purposeCopied = false;
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && flappyActive) {
                closeFlappyLovebird();
                ibanCopied = false;
                purposeCopied = false;
            }
        });


        function generateRandomHeight() {
             return Math.floor(Math.random() * (MAX_OBSTACLE_HEIGHT - MIN_OBSTACLE_HEIGHT + 1)) + MIN_OBSTACLE_HEIGHT;
        }

        function resetGame() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Highscore laden, falls ein neuer Spielstart erfolgt
            highScore = parseInt(localStorage.getItem(HIGHSCORE_KEY) || 0, 10);
            
            bird.y = height / 2;
            bird.vel = 0;
            obstacle.x = width;
            obstacle.swing = 0;
            obstacle.hTop = generateRandomHeight(); 
            score = 0;
            lastConfettiScore = 0; // Setze den Konfetti-Zähler zurück
            gameOver = false;
            started = false;
            confetti = []; // Lösche altes Konfetti
            
            updateScoreDisplay(); // Initialen Score anzeigen
            flappyMessage.textContent = 'Tippe oder klicke zum Start!';
            flappyMessage.style.display = 'block'; 
            
            if(flappyWrapper.style.display === 'flex') {
                 flappyActive = true;
                 lastTime = performance.now(); 
                 update(lastTime); 
            }
        }

        function flap() {
            if (!started) {
                started = true;
                flappyMessage.style.display = 'none'; 
            }
            if (!gameOver) bird.vel = bird.lift;
        }

        // --- Zeichnen Funktionen (unverändert) ---
        function drawBird() {
            // Flügel-Offset bleibt visuell und von Date.now() abhängig
            const wingOffset = Math.sin(Date.now() / 100) * 8;
            const cx = bird.x + bird.w / 2;
            const cy = bird.y + bird.h / 2;
            
            // 1. Körper (Koralle/Orange-Töne)
            ctx.fillStyle = "#FF7F50"; // Coral
            ctx.beginPath();
            ctx.ellipse(cx, cy, bird.w/2, bird.h/2, 0, 0, Math.PI*2);
            ctx.fill();

            // 2. Schnabel (Goldgelb)
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.moveTo(cx + bird.w/2 - 5, cy);
            ctx.lineTo(cx + bird.w/2 + 5, cy - 3);
            ctx.lineTo(cx + bird.w/2 + 5, cy + 3);
            ctx.closePath();
            ctx.fill();
            
            // 3. Auge
            ctx.fillStyle = "#000";
            ctx.fillRect(cx + 8, cy - 3, 2, 2);

            // 4. Flügel (helles Koralle, tropische Herzform)
            ctx.fillStyle = "#FFA07A"; // Light Salmon
            ctx.beginPath();
            ctx.moveTo(cx - 5, cy); 
            ctx.bezierCurveTo(cx - 15, cy - 10 - wingOffset, cx - 15, cy + 10 - wingOffset, cx - 5, cy);
            ctx.fill();

            // 5. Braut-Akzent: Kleine Hibiskusblüte auf dem Kopf (Pink)
            ctx.fillStyle = "#FF69B4";
            ctx.beginPath();
            ctx.arc(cx - 3, cy - bird.h/2 + 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FFD700"; // Gelber Stempel
            ctx.arc(cx - 3, cy - bird.h/2 + 2, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawObstacle() {
            obstacle.swing = Math.sin(Date.now() / 200) * 5;
            const x = obstacle.x;
            const w = obstacle.w;
            const hTop = obstacle.hTop + obstacle.swing;
            const hBottomStart = obstacle.hTop + GAP_SIZE + obstacle.swing;
            const hBottom = height - hBottomStart;
            
            // Oberes Hindernis
            ctx.fillStyle = "#8B4513"; 
            ctx.fillRect(x, 0, w, hTop);
            ctx.fillStyle = "#3CB371"; 
            ctx.fillRect(x, hTop - 10, w, 10);
            ctx.fillStyle = "#FF69B4";
            ctx.beginPath();
            ctx.arc(x + 5, hTop - 5, 4, 0, Math.PI * 2);
            ctx.arc(x + w / 2, hTop - 8, 5, 0, Math.PI * 2);
            ctx.arc(x + w - 5, hTop - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Unteres Hindernis
            ctx.fillStyle = "#F5DEB3"; 
            ctx.fillRect(x, hBottomStart, w, hBottom);
            const giftHeight = 30;
            const giftY1 = hBottomStart + hBottom - giftHeight;
            const giftY2 = giftY1 - giftHeight;
            ctx.fillStyle = "#40E0D0"; 
            ctx.fillRect(x + 5, giftY1, w - 10, giftHeight);
            ctx.fillStyle = "#FA8072"; 
            ctx.fillRect(x + 10, giftY2, w - 20, giftHeight);
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(x + w / 2 - 2, giftY2, 4, 25);
            ctx.fillRect(x + w / 2 - 20, giftY2 + 5, 40, 4);

        }

        function checkCollision() {
            if (bird.y < 0 || bird.y + bird.h > height) return true;

            if (
                bird.x < obstacle.x + obstacle.w && 
                bird.x + bird.w > obstacle.x
            ) {
                const hTop = obstacle.hTop + obstacle.swing;
                const hBottomStart = hTop + GAP_SIZE;

                if (
                    bird.y < hTop ||                 
                    bird.y + bird.h > hBottomStart   
                ) return true;
            }
            return false;
        }

        // update Funktion verwendet Delta Time für stabile Physik
        function update(time) {
            
            const deltaTime = (time - lastTime) / 1000; 
            const safeDeltaTime = Math.min(deltaTime, 0.1); 
            lastTime = time;
            
            ctx.clearRect(0, 0, width, height); 
            
            // Konfetti zuerst updaten und zeichnen, damit es unter den Spielelementen liegt
            updateConfetti(safeDeltaTime);

            if (started && !gameOver) {
                
                bird.vel += bird.gravity * safeDeltaTime; 
                bird.y += bird.vel * safeDeltaTime; 

                obstacle.x -= PIPE_SPEED_PER_SECOND * safeDeltaTime;
                
                if (obstacle.x + obstacle.w < 0) {
                    obstacle.x = width;
                    score++;
                    updateScoreDisplay(); // Score-Anzeige aktualisieren
                    
                    // NEU: Konfetti-Check bei jedem 5. Punkt
                    if (score % 5 === 0 && score > lastConfettiScore) {
                        createConfettiBurst(width / 2, height / 2); // Konfetti in der Mitte auslösen
                        lastConfettiScore = score;
                    }
                    
                    obstacle.hTop = generateRandomHeight(); 
                }

                if (checkCollision()) {
                    gameOver = true;
                    flappyMessage.textContent = "Game Over!";
                    flappyMessage.style.display = 'block'; 
                    flappyActive = false;
                    
                    // NEU: Highscore speichern
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem(HIGHSCORE_KEY, highScore);
                        flappyMessage.textContent = `Neuer Highscore! ${score} Punkte!`;
                    }
                    updateScoreDisplay(); 
                    
                    cancelAnimationFrame(animationFrameId); 
                    return; 
                }
            }
            
            drawObstacle();
            drawBird();
            
            // Konfetti über allen Spielelementen zeichnen, falls gewünscht
            // Hier bleibt es darunter (gezeichnet am Anfang von updateConfetti)

            animationFrameId = requestAnimationFrame(update); 
        }
    });

})();