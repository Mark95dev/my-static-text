// Verbessert: IIFE (Immediately Invoked Function Expression) zur Kapselung des Codes
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // ... [Globale Variablen] ...
        
        let flappyActive = false;
        let pressTimer = null;
        let animationFrameId = null;

        const title = document.getElementById('wedding-title');
        const flappyWrapper = document.getElementById('flappy-wrapper');
        const canvas = document.getElementById('flappy-canvas');
        const ctx = canvas.getContext('2d');
        const flappyScore = document.getElementById('flappy-score');
        const flappyMessage = document.getElementById('flappy-message'); 
        const restartBtn = document.getElementById('flappy-restart');

        // Game-Konstanten
<<<<<<< HEAD
        const GRAVITY = 0.6;
        const LIFT = -12;
=======
        const GRAVITY = 0;
        const LIFT = -10;
>>>>>>> a1567fbe4038b0adf4a911da81b98df1d3df1edb
        // ANPASSUNG: Reduzierung der Geschwindigkeit von 3 auf 2.5 für besseres mobiles Spielgefühl
        const PIPE_SPEED = 2.5; 
        const GAP_SIZE = 170; 
        
        const width = canvas.width;
        const height = canvas.height;
        const MIN_OBSTACLE_HEIGHT = 100;
        const MAX_OBSTACLE_HEIGHT = height - MIN_OBSTACLE_HEIGHT - GAP_SIZE; 


        // Game-State
        let bird = { x: 80, y: height / 2, w: 34, h: 24, vel: 0, gravity: GRAVITY, lift: LIFT };
        let obstacle = { x: width, w: 60, hTop: height / 2, swing: 0 }; 
        let score = 0;
        let gameOver = false;
        let started = false;

        const HEART_SPREAD_X = 80;
        const HEART_SPREAD_Y = 120;


        /* ============================================================
         * 1) ❤️ Herz-Klick-Animation
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
         * 2) ✏️ Copy-to-Clipboard mit Fehlerbehandlung
         * ============================================================ */
        const copyBtns = document.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.copyTarget);
                const feedback = btn.closest('.payment-box').querySelector('.copy-feedback');
                
                navigator.clipboard.writeText(target.textContent.trim())
                    .then(() => {
                        feedback.style.display = 'inline';
                        setTimeout(() => feedback.style.display = 'none', 1000);
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
            });
        });

        /* ============================================================
         * 3) Flappy Lovebird Easter Egg nach 2 Sekunden Halten
         * ============================================================ */
        function startPressTimer() { 
            if (pressTimer === null) {
                pressTimer = setTimeout(startFlappyLovebird, 2000); 
            }
        }

        function clearPressTimer() { 
            if (pressTimer !== null) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        }

        title.addEventListener('mousedown', startPressTimer);
        title.addEventListener('touchstart', startPressTimer);
        title.addEventListener('mouseup', clearPressTimer);
        title.addEventListener('mouseleave', clearPressTimer);
        title.addEventListener('touchend', clearPressTimer);
        title.addEventListener('touchcancel', clearPressTimer);


        /* ============================================================
         * 4) Flappy Lovebird Game mit "Summer Vibes"
         * ============================================================ */
        function startFlappyLovebird() {
            if (flappyActive) return;
            clearPressTimer(); 

            flappyActive = true;
            flappyWrapper.style.display = 'flex';
            flappyScore.textContent = 'Punkte: 0';
            
            canvas.removeEventListener('click', flap);
            canvas.removeEventListener('touchstart', flap);
            canvas.addEventListener('click', flap);
            canvas.addEventListener('touchstart', flap);
            restartBtn.removeEventListener('click', resetGame);
            restartBtn.addEventListener('click', resetGame);

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
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && flappyActive) {
                closeFlappyLovebird();
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
            
            bird.y = height / 2;
            bird.vel = 0;
            obstacle.x = width;
            obstacle.swing = 0;
            obstacle.hTop = generateRandomHeight(); 
            score = 0;
            gameOver = false;
            started = false;
            
            flappyScore.textContent = 'Punkte: 0';
            flappyMessage.textContent = 'Tippe oder klicke zum Start!';
            flappyMessage.style.display = 'block'; 
            
            if(flappyWrapper.style.display === 'flex') {
                 flappyActive = true;
                 update(); 
            }
        }

        function flap() {
            if (!started) {
                started = true;
                flappyMessage.style.display = 'none'; 
            }
            if (!gameOver) bird.vel = bird.lift;
        }

        function drawBird() {
            // Summer Lovebird (Koralle/Gold/Grün)
            
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
            
            // --- Oberes Hindernis (Umgekehrter Blumenbogen) ---
            const hTop = obstacle.hTop + obstacle.swing;
            
            // Bogen-Struktur (dunkles Holz)
            ctx.fillStyle = "#8B4513"; // Saddle Brown
            ctx.fillRect(x, 0, w, hTop);
            
            // Tropische Girlande oben (Grün/Rot/Pink)
            ctx.fillStyle = "#3CB371"; // Medium Sea Green (Blätter)
            ctx.fillRect(x, hTop - 10, w, 10);
            
            // Blumen-Akzente (Pink/Rot)
            ctx.fillStyle = "#FF69B4";
            ctx.beginPath();
            ctx.arc(x + 5, hTop - 5, 4, 0, Math.PI * 2);
            ctx.arc(x + w / 2, hTop - 8, 5, 0, Math.PI * 2);
            ctx.arc(x + w - 5, hTop - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            
            // --- Unteres Hindernis (Geschenke und Sand) ---
            const hBottomStart = obstacle.hTop + GAP_SIZE + obstacle.swing;
            const hBottom = height - hBottomStart;
            
            // Sand-Basis (helles Beige)
            ctx.fillStyle = "#F5DEB3"; // Wheat
            ctx.fillRect(x, hBottomStart, w, hBottom);

            // Geschenke (Türkis/Lachs) - stapeln
            const giftHeight = 30;
            const giftY1 = hBottomStart + hBottom - giftHeight;
            const giftY2 = giftY1 - giftHeight;

            ctx.fillStyle = "#40E0D0"; // Turquoise
            ctx.fillRect(x + 5, giftY1, w - 10, giftHeight);
            
            ctx.fillStyle = "#FA8072"; // Salmon
            ctx.fillRect(x + 10, giftY2, w - 20, giftHeight);
            
            // Goldene Schleifen
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(x + w / 2 - 2, giftY2, 4, 25);
            ctx.fillRect(x + w / 2 - 20, giftY2 + 5, 40, 4);

        }


        function checkCollision() {
            // Kollision mit Boden oder Decke
            if (bird.y < 0 || bird.y + bird.h > height) return true;

            // Kollision mit Hindernis
            if (
                bird.x < obstacle.x + obstacle.w && 
                bird.x + bird.w > obstacle.x
            ) {
                const hTop = obstacle.hTop + obstacle.swing;
                const hBottomStart = hTop + GAP_SIZE;

                // Kollision mit Oberteil ODER Unterteil
                if (
                    bird.y < hTop ||                 
                    bird.y + bird.h > hBottomStart   
                ) return true;
            }

            return false;
        }

        function update() {
            ctx.clearRect(0, 0, width, height); 

            if (started && !gameOver) {
                bird.vel += bird.gravity;
                bird.y += bird.vel;

                obstacle.x -= PIPE_SPEED;
                if (obstacle.x + obstacle.w < 0) {
                    obstacle.x = width;
                    score++;
                    flappyScore.textContent = `Punkte: ${score}`;
                    
                    obstacle.hTop = generateRandomHeight(); 
                }

                if (checkCollision()) {
                    gameOver = true;
                    flappyMessage.textContent = "Game Over!";
                    flappyMessage.style.display = 'block'; 
                    flappyActive = false;
                    
                    cancelAnimationFrame(animationFrameId); 
                    return; 
                }
            }
            
            drawObstacle();
            drawBird();

            animationFrameId = requestAnimationFrame(update); 
        }
    });

})();
