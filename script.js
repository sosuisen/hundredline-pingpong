const TONE_C = 261.63, TONE_G = 392.00, TONE_B = 493.88;
const playTone = (freq) => {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = freq;
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
};

const audioStart = new Audio('sounds/start.mp3');
const audioWall = new Audio('sounds/tone_e.mp3');
const audioWallHigh = new Audio('sounds/tone_g.mp3');
const audioRacket = new Audio('sounds/tone_c.mp3');

const c = document.getElementById('c'), ctx = c.getContext('2d');
const ballInitialProps = { x: 50, y: 50, radius: 8, dx: 3, dy: 3 };
const speedUp = 0.5;
let ball;
const racket = { x: 175, y: 470, width: 50, height: 10 };
let color = '#fff';
let gameStarted = false, startTime = 0, lastSpeedUp = 0, speedDownTime = 0;
const changeColor = () => '#' + Array.from({ length: 3 }, () => '789abcdef'[Math.random() * 9 | 0]).join('');
const randomSpeed = () => Math.random() * 0.6 - 0.3;
const clearBg = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = color;
};
const showText = (text, x, y) => {
    clearBg();
    ctx.font = '30px Arial';
    ctx.fillText(text, x, y);
};
const gameOver = () => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    clearBg();
    ctx.font = '30px Arial';
    ctx.fillText('RESULTS', 120, 180);    
    ctx.fillText(elapsed + 's', 160, 250);
    ctx.fillText('CLICK TO RESTART', 50, 320);
    gameStarted = false;
};
document.onmousemove = e => racket.x = Math.max(0, Math.min(c.width - racket.width, e.clientX - c.getBoundingClientRect().left - racket.width / 2));
const draw = () => {
    if (!gameStarted) return;
    clearBg();
    const leftWidth = racket.width * 0.40;
    const centerWidth = racket.width * 0.2;
    const rightWidth = racket.width * 0.40;
    ctx.fillRect(racket.x, racket.y, leftWidth, racket.height);
    ctx.fillStyle = '#f0f';
    ctx.fillRect(racket.x + leftWidth, racket.y, centerWidth, racket.height);
    ctx.fillStyle = color;
    ctx.fillRect(racket.x + leftWidth + centerWidth, racket.y, rightWidth, racket.height);
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    if (currentTime > lastSpeedUp) {
        lastSpeedUp = currentTime;
        ball.dx = ball.dx > 0 ? ball.dx + speedUp : ball.dx - speedUp;
        ball.dy = ball.dy > 0 ? ball.dy + speedUp : ball.dy - speedUp;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    ctx.font = '20px Arial';
    ctx.fillText(elapsed + 's', c.width / 2 - 20, 30);
    if (speedDownTime > 0 && Date.now() - speedDownTime < 1000) {
        ctx.font = '24px Arial';
        ctx.fillText('SPEED DOWN', c.width / 2 - 85, c.height / 2);
    }
    if (ball.x <= ball.radius || ball.x >= c.width - ball.radius) {
        ball.dx = -ball.dx + randomSpeed();
        ball.dy += randomSpeed();
        color = changeColor();
        // playTone(TONE_G);
        audioWall.play();
    }
    if (ball.y <= ball.radius) {
        ball.dy = -ball.dy + randomSpeed();
        ball.dx += randomSpeed();
        color = changeColor();
        // playTone(TONE_B);
        audioWallHigh.play();
    }
    if (ball.y >= racket.y - ball.radius && ball.y <= racket.y + racket.height && ball.x >= racket.x && ball.x <= racket.x + racket.width) {
        const centerStart = racket.x + racket.width * 0.40;
        const centerEnd = racket.x + racket.width * 0.60;
        const hitCenter = ball.x >= centerStart && ball.x <= centerEnd;

        if (hitCenter) {
            ball.dy = -ballInitialProps.dy;
            ball.dx = ball.dx > 0 ? -Math.abs(ballInitialProps.dx) : Math.abs(ballInitialProps.dx);
            speedDownTime = Date.now();
            audioStart.play();
        } else {
            ball.dy = -ball.dy + randomSpeed();
            ball.dx += randomSpeed();
            audioRacket.play();
        }
        color = changeColor();
        // playTone(TONE_C);

    }
    if (ball.y >= c.height) return gameOver();
    requestAnimationFrame(draw);
}
const start = () => {
    gameStarted = true;
    lastSpeedUp = 0;
    ball = { ...ballInitialProps };
    startTime = Date.now();
    // playTone(TONE_C);
    audioStart.play();
    draw();
};
showText('CLICK TO START', 80, 250);
c.onclick = () => !gameStarted && start();