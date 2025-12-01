/* script.js */
document.addEventListener('DOMContentLoaded', function() {
	document.body.addEventListener('click', function(e) {
		const spreadX = 80;
		const spreadY = 120;
		for (let i = 0; i < 15; i++) {
		const heart = document.createElement('div');
		heart.className = 'heart';
		const offsetX = Math.random() * spreadX*2 - spreadX;
		const offsetY = - (Math.random() * spreadY + 50); // nach oben
		heart.style.left = e.clientX + 'px';
		heart.style.top = e.clientY + 'px';
		heart.style.setProperty('--x', offsetX + 'px');
		heart.style.setProperty('--y', offsetY + 'px');
		heart.style.animationDuration = 1 + Math.random() * 1 + 's';
		heart.style.backgroundColor = ['#ff6b81','#ffb3c1','#ff7b9c','#ff4d6d'][Math.floor(Math.random()*4)];
		document.body.appendChild(heart);
		setTimeout(() => heart.remove(), 2000);
		}
	});
});
