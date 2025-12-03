document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------
   * Herz-Klick-Animation
   * ----------------------------- */
  document.body.addEventListener('click', function (e) {
    const spreadX = 80, spreadY = 120;

    for (let i = 0; i < 15; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';

      const startOffsetX = Math.random() * 10 - 5;
      const startOffsetY = Math.random() * 10 - 5;

      heart.style.left = e.clientX + startOffsetX + 'px';
      heart.style.top = e.clientY + startOffsetY + 'px';
      heart.style.opacity = 0;

      document.body.appendChild(heart);

      requestAnimationFrame(() => {
        const offsetX = Math.random() * spreadX * 2 - spreadX;
        const offsetY = -(Math.random() * spreadY + 50);

        heart.style.setProperty('--x', offsetX + 'px');
        heart.style.setProperty('--y', offsetY + 'px');
        heart.style.opacity = 1;

        const duration = 1000 + Math.random() * 1000;
        heart.style.animationDuration = duration + 'ms';

        setTimeout(() => heart.remove(), duration);
      });
    }
  });


  /* -----------------------------
   * Begrüßung + Verwendungszweck
   * ----------------------------- */
  let userName = localStorage.getItem('weddingName');

  if (!userName) {
    userName = prompt('Wie ist dein Name? Keine Angst, die Daten werden nicht gespeichert. 😜', '');
    if (userName) localStorage.setItem('weddingName', userName);
  }

  if (userName) {
    document.getElementById('purpose').textContent = 'Hochzeit – Zimmerreservierung ' + userName;
  }


  /* -----------------------------
   * Countdown
   * ----------------------------- */
  const countdownEl = document.getElementById('countdown');
  const reservationDate = new Date('2026-07-19');

  function updateCountdown() {
    const now = new Date();
    const diff = Math.ceil((reservationDate - now) / (1000 * 60 * 60 * 24));
    countdownEl.textContent = `Noch ${diff} Tage bis zur Hochzeit!`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000 * 60 * 60);


  /* -----------------------------
   * Copy-to-Clipboard
   * ----------------------------- */
  const copyBtns = document.querySelectorAll('.copy-btn');
  const feedback = document.querySelector('.copy-feedback');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copyTarget);

      navigator.clipboard.writeText(target.textContent.trim()).then(() => {
        feedback.style.display = 'inline';
        setTimeout(() => feedback.style.display = 'none', 1000);
      });
    });
  });

});
