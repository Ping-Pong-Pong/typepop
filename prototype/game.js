/* TypePop Pals — Phaser prototype
 * One-room idle companion demo. ENFP blob "Pip" idles, wanders, naps and chats.
 * v5 blob pose set: idle / blink / happy / walk / nap.
 * Tap Pip, use the feeling check-in, watch the ambient behavior scheduler.
 */
(function () {
  'use strict';

  var W = 480, H = 800;
  var FLOOR_Y = 640;

  var ONE_LINERS = [
    'I have seventeen plans today and I\'m doing ALL of them!',
    'Wait, that cloud looks like a dragon. Anyway—',
    'New idea!! Okay hear me out—',
    'I reorganized my sock drawer into a theme park.',
    'Let\'s learn the trumpet. TODAY.',
    'I made friends with the dust bunnies. Great listeners.',
    'Nap? Never heard of her.',
    'Plot twist: the floor is lava. GO GO GO!',
    'I waved at a stranger and now we\'re best friends.',
    'What if we threw a party… for no reason?!'
  ];

  var CHECKIN_REACT = {
    happy: ['YESSS! Your energy is contagious! Let\'s bottle it!', 'I KNEW today was going to be amazing!'],
    chill: ['Chill is just excitement taking a snack break. Respect.', 'Cozy mode: engaged. I\'ll match your vibe.'],
    tired: ['Emergency fun protocol ACTIVATED. Confetti incoming!', 'Rest up, I\'ll keep the party warm for you.'],
    grumpy: ['Boo to grumpy! Prescribing one (1) dance break.', 'Okay okay… want me to just sit with you? I\'m good at that too.']
  };

  var MOODS = [
    { icon: '😄', key: 'happy', label: 'Happy' },
    { icon: '😌', key: 'chill', label: 'Chill' },
    { icon: '😴', key: 'tired', label: 'Tired' },
    { icon: '😤', key: 'grumpy', label: 'Grumpy' }
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min, max) { return min + Math.random() * (max - min); }

  // v5 blob pose set. Poses share the same 1600px canvas framing, so the body
  // stays at a consistent scale across swaps. 'happy' is cropped to drop the
  // ground pot; 'nap' is the wide curled-up puddle, displayed wider than tall.
  var POSES = {
    idle:  { key: 'pip-idle',  w: 215, h: 215 },
    blink: { key: 'pip-blink', w: 215, h: 215 },
    happy: { key: 'pip-happy', w: 215, h: 175 },
    walk:  { key: 'pip-walk',  w: 215, h: 215 },
    nap:   { key: 'pip-nap',   w: 240, h: 194 }
  };

  var RoomScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function RoomScene() { Phaser.Scene.call(this, { key: 'room' }); },

    preload: function () {
      this.load.image('pip-idle', 'assets/blobs/pip-idle.webp');
      this.load.image('pip-blink', 'assets/blobs/pip-blink.webp');
      this.load.image('pip-happy', 'assets/blobs/pip-happy.webp');
      this.load.image('pip-walk', 'assets/blobs/pip-walk.webp');
      this.load.image('pip-nap', 'assets/blobs/pip-nap.webp');
    },

    // Swap Pip's pose texture; re-captures the base scale so squash
    // tweens always work relative to the current pose's display size.
    setPose: function (name) {
      var p = POSES[name];
      this.pip.setTexture(p.key).setDisplaySize(p.w, p.h);
      this.poseSX = this.pip.scaleX;
      this.poseSY = this.pip.scaleY;
      this.curPose = name;
    },

    create: function () {
      this.busy = false;
      this.bond = 0;
      this.night = isNight();

      this.drawRoom();
      this.drawFurniture();
      this.makeSparkTexture();

      // Pip the blob (v5)
      this.pip = this.add.image(W / 2, FLOOR_Y - 90, 'pip-idle')
        .setDepth(10)
        .setInteractive({ useHandCursor: true });
      this.setPose('idle');
      this.baseY = this.pip.y;
      this.pip.on('pointerdown', this.onTapPip, this);
      this.idleBob();
      this.scheduleBlink();

      this.drawHUD();
      this.drawCheckin();
      this.applyDayNight();

      // ambient behavior scheduler
      this.scheduleNext(2500);
      this.updateClock();
      this.time.addEvent({ delay: 60000, loop: true, callback: this.updateClock, callbackScope: this });
    },

    /* ---------- room ---------- */
    drawRoom: function () {
      var g = this.add.graphics();
      g.fillStyle(0xFFF3E4, 1).fillRect(0, 0, W, FLOOR_Y);          // wall
      g.fillStyle(0xE8C39A, 1).fillRect(0, FLOOR_Y, W, H - FLOOR_Y); // floor
      g.fillStyle(0xD9A86C, 1).fillRect(0, FLOOR_Y, W, 10);          // baseboard
      // rug
      g.fillStyle(0xFFD93D, 1).fillEllipse(W / 2, FLOOR_Y + 62, 300, 84);
      g.fillStyle(0xFF6B6B, 1).fillEllipse(W / 2, FLOOR_Y + 62, 240, 62);
      // window
      var sky = this.night ? 0x2B3A67 : 0xAEE3F5;
      g.fillStyle(0x8A5A3B, 1).fillRoundedRect(300, 90, 140, 150, 10);
      g.fillStyle(sky, 1).fillRoundedRect(310, 100, 120, 130, 6);
      g.lineStyle(6, 0x8A5A3B, 1);
      g.lineBetween(370, 100, 370, 230); g.lineBetween(310, 165, 430, 165);
      this.windowSky = g;
      if (this.night) {
        g.fillStyle(0xFFF6C9, 1);
        [[330, 130], [390, 150], [360, 200]].forEach(function (p) { g.fillCircle(p[0], p[1], 4); });
      } else {
        g.fillStyle(0xFFF6C9, 1).fillCircle(400, 130, 16);
      }
    },

    drawFurniture: function () {
      var g = this.add.graphics();
      // couch (left)
      g.fillStyle(0x7C5CFF, 1).fillRoundedRect(36, FLOOR_Y - 110, 130, 110, 18);
      g.fillStyle(0x6547E0, 1).fillRoundedRect(36, FLOOR_Y - 130, 130, 44, 16);
      g.fillStyle(0xFFD93D, 1).fillRoundedRect(52, FLOOR_Y - 96, 44, 44, 10);
      this.couchX = 101;
      // plant (right)
      g.fillStyle(0xC46A4A, 1).fillTriangle(400, FLOOR_Y, 448, FLOOR_Y, 424, FLOOR_Y - 44);
      g.fillStyle(0x4ADE80, 1);
      g.fillEllipse(424, FLOOR_Y - 80, 26, 70);
      g.fillEllipse(404, FLOOR_Y - 66, 22, 52);
      g.fillEllipse(444, FLOOR_Y - 66, 22, 52);
      this.plantX = 424;
      // shelf with books
      g.fillStyle(0x8A5A3B, 1).fillRect(40, 300, 120, 12);
      var cols = [0xFF6B6B, 0x4ADE80, 0x7C5CFF, 0xFFD93D];
      for (var i = 0; i < 4; i++) {
        g.fillStyle(cols[i], 1).fillRect(48 + i * 26, 268, 20, 32);
      }
    },

    makeSparkTexture: function () {
      var g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xFFD93D, 1).fillCircle(8, 8, 7);
      g.fillStyle(0xFFFFFF, 1).fillCircle(6, 6, 3);
      g.generateTexture('spark', 16, 16);
      g.destroy();
      this.sparks = this.add.particles(0, 0, 'spark', {
        speed: { min: 60, max: 180 },
        lifespan: 700,
        scale: { start: 1, end: 0 },
        emitting: false
      }).setDepth(30);
    },

    /* ---------- ambient behavior scheduler ---------- */
    scheduleNext: function (delay) {
      var self = this;
      this.time.delayedCall(delay == null ? rand(4000, 8000) : delay, function () {
        if (!self.busy) self.doBehavior();
        self.scheduleNext();
      });
    },

    doBehavior: function () {
      // ENFP weights: bouncy & social, rarely naps
      var roll = Math.random();
      if (this.night && roll < 0.45) return this.behaviorSleep();
      if (roll < 0.30) return this.behaviorTalk();
      if (roll < 0.50) return this.behaviorWander();
      if (roll < 0.65) return this.behaviorVisit('couch');
      if (roll < 0.78) return this.behaviorVisit('plant');
      if (roll < 0.88) return this.behaviorSpin();
      return this.behaviorNap();
    },

    behaviorTalk: function () {
      this.showBubble(pick(ONE_LINERS), 2600);
    },

    // Squash-and-stretch wobble while walking — blob-style locomotion.
    startWalkWobble: function () {
      this.setPose('walk');
      this.walkWobble = this.tweens.add({
        targets: this.pip,
        scaleY: this.poseSY * 1.06, scaleX: this.poseSX * 0.95,
        duration: 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    },

    stopWalkWobble: function () {
      if (this.walkWobble) { this.walkWobble.stop(); this.walkWobble = null; }
      this.setPose('idle');
    },

    behaviorWander: function () {
      var self = this;
      this.busy = true;
      var targetX = rand(90, W - 90);
      this.startWalkWobble();
      this.tweens.add({
        targets: this.pip, x: targetX, duration: 1100, ease: 'Sine.easeInOut',
        onComplete: function () {
          self.stopWalkWobble();
          self.hop(1);
          self.busy = false;
        }
      });
    },

    behaviorVisit: function (spot) {
      var self = this;
      this.busy = true;
      var tx = spot === 'couch' ? this.couchX + 90 : this.plantX - 80;
      var label = spot === 'couch' ? 'Couch: claimed. Obviously.' : 'Sniffing the plant. For science.';
      this.startWalkWobble();
      this.tweens.add({
        targets: this.pip, x: tx, duration: 1300, ease: 'Sine.easeInOut',
        onComplete: function () {
          self.stopWalkWobble();
          self.showBubble(label, 2200);
          self.hop(2);
          self.time.delayedCall(1200, function () { self.busy = false; });
        }
      });
    },

    behaviorSpin: function () {
      var self = this;
      this.busy = true;
      this.showBubble('WHEEE!', 1400);
      this.tweens.add({
        targets: this.pip, angle: 360, duration: 700, ease: 'Cubic.easeOut',
        onComplete: function () { self.pip.angle = 0; self.busy = false; }
      });
      this.sparks.explode(10, this.pip.x, this.pip.y - 60);
    },

    behaviorNap: function () {
      var self = this;
      this.busy = true;
      this.showBubble('Just… five more minutes…', 2000);
      // melt into the nap pose (wide curled-up puddle), then breathe
      this.setPose('nap');
      this.tweens.add({
        targets: this.pip, scaleY: this.poseSY * 0.94, duration: 500, ease: 'Sine.easeOut',
        onComplete: function () {
          self.napBreath = self.tweens.add({
            targets: self.pip, scaleY: self.poseSY * 0.985,
            duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
        }
      });
      var zzz = [];
      for (var i = 0; i < 3; i++) {
        (function (k) {
          self.time.delayedCall(k * 900, function () {
            var t = self.add.text(self.pip.x + 60, self.pip.y - 170, 'z',
              { fontSize: (18 + k * 8) + 'px', color: '#8A7FB8', fontStyle: 'bold' }).setDepth(20);
            zzz.push(t);
            self.tweens.add({
              targets: t, y: t.y - 60, alpha: 0, duration: 1400,
              onComplete: function () { t.destroy(); }
            });
          });
        })(i);
      }
      this.time.delayedCall(3600, function () {
        // wake up: pop back to idle with a little stretch
        if (self.napBreath) { self.napBreath.stop(); self.napBreath = null; }
        self.setPose('idle');
        self.tweens.add({
          targets: self.pip, scaleY: self.poseSY * 1.08,
          duration: 200, yoyo: true, ease: 'Sine.easeOut'
        });
        self.hop(1);
        self.busy = false;
      });
    },

    behaviorSleep: function () { this.behaviorNap(); },

    /* ---------- interaction ---------- */
    idleBob: function () {
      this.tweens.add({
        targets: this.pip, y: this.baseY - 12, duration: 1100,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    },

    // Periodic blink while idling — swaps to the blink frame for ~150ms.
    // Skipped whenever Pip is busy or not in the idle pose.
    scheduleBlink: function () {
      var self = this;
      this.time.delayedCall(rand(2600, 5200), function () {
        if (!self.busy && self.curPose === 'idle') {
          self.setPose('blink');
          self.time.delayedCall(150, function () {
            if (!self.busy && self.curPose === 'blink') self.setPose('idle');
          });
        }
        self.scheduleBlink();
      });
    },

    hop: function (times) {
      var self = this;
      var i = 0;
      (function next() {
        if (i++ >= times) return;
        self.tweens.add({
          targets: self.pip, y: self.baseY - 70, duration: 220, yoyo: true,
          ease: 'Quad.easeOut', onComplete: next
        });
      })();
    },

    onTapPip: function () {
      if (this.busy) return;
      var self = this;
      this.bond += 1;
      this.updateBond();
      this.setPose('happy');
      this.hop(1);
      this.sparks.explode(12, this.pip.x, this.pip.y - 80);
      this.showBubble(pick(ONE_LINERS), 2400);
      // back to idle once the hop lands (guarded: a behavior may have started)
      this.time.delayedCall(600, function () {
        if (!self.busy && self.curPose === 'happy') self.setPose('idle');
      });
      if (this.bond === 5) {
        this.time.delayedCall(2600, function () {
          self.showBubble('Pip likes you! Bond level up! 💛', 2600);
        });
      }
    },

    showBubble: function (text, ms) {
      var self = this;
      if (this.bubble) this.bubble.destroy();
      if (this.bubbleTimer) this.time.removeEvent(this.bubbleTimer);
      var pad = 14, maxW = 250;
      var t = this.add.text(0, 0, text, {
        fontSize: '17px', color: '#2B2B3A',
        wordWrap: { width: maxW - pad * 2 }, align: 'center',
        fontFamily: 'Poppins, sans-serif'
      });
      var bw = Math.min(maxW, t.width + pad * 2);
      var bh = t.height + pad * 2;
      var bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.97).fillRoundedRect(-bw / 2, -bh - 18, bw, bh, 14);
      bg.lineStyle(2, 0xF0E6D8, 1).strokeRoundedRect(-bw / 2, -bh - 18, bw, bh, 14);
      bg.fillTriangle(-10, -18, 10, -18, 0, -4); // tail
      t.setOrigin(0.5, 0).setPosition(0, -bh - 18 + pad);
      this.bubble = this.add.container(this.pip.x, this.pip.y - 190, [bg, t]).setDepth(25);
      this.bubble.setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: this.bubble, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
      this.bubbleTimer = this.time.delayedCall(ms || 2400, function () {
        if (!self.bubble) return;
        self.tweens.add({
          targets: self.bubble, alpha: 0, y: '-=14', duration: 300,
          onComplete: function () { if (self.bubble) { self.bubble.destroy(); self.bubble = null; } }
        });
      });
    },

    /* ---------- HUD & check-in ---------- */
    drawHUD: function () {
      var self = this;
      this.add.text(16, 14, '🎭 TypePop Pals', { fontSize: '20px', fontStyle: 'bold', color: '#2B2B3A', fontFamily: 'Poppins, sans-serif' });
      this.bondText = this.add.text(16, 44, '', { fontSize: '16px', color: '#6B6B80', fontFamily: 'Poppins, sans-serif' });
      this.updateBond();
      this.clockText = this.add.text(W - 16, 14, '', { fontSize: '20px' }).setOrigin(1, 0);
      // Nap test button (for trying the sleep pose on demand)
      var napBtn = this.add.text(W - 16, 46, '😴 nap', {
        fontSize: '15px', color: '#6B6B80', fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#FFF8F0', padding: { x: 10, y: 6 }
      }).setOrigin(1, 0).setDepth(6).setInteractive({ useHandCursor: true });
      napBtn.on('pointerdown', function () { if (!self.busy) self.behaviorNap(); });
      napBtn.on('pointerover', function () { napBtn.setColor('#2B2B3A'); });
      napBtn.on('pointerout', function () { napBtn.setColor('#6B6B80'); });
    },

    updateBond: function () {
      var hearts = this.bond >= 5 ? '💛💛💛' : (this.bond >= 2 ? '💛💛🤍' : '💛🤍🤍');
      this.bondText.setText(hearts + '  Pip · ENFP');
    },

    updateClock: function () {
      this.night = isNight();
      this.clockText.setText(this.night ? '🌙' : '☀️');
      this.applyDayNight();
    },

    applyDayNight: function () {
      if (this.shade) this.shade.destroy();
      if (this.night) {
        this.shade = this.add.rectangle(0, 0, W, H, 0x1B2340, 0.28).setOrigin(0, 0).setDepth(40);
      }
    },

    drawCheckin: function () {
      var self = this;
      var y = H - 96;
      this.add.rectangle(0, H - 130, W, 130, 0xffffff, 0.92).setOrigin(0, 0).setDepth(5);
      this.add.text(W / 2, H - 112, 'How are you feeling?', {
        fontSize: '16px', fontStyle: 'bold', color: '#2B2B3A', fontFamily: 'Poppins, sans-serif'
      }).setOrigin(0.5, 0).setDepth(6);
      MOODS.forEach(function (m, i) {
        var x = 70 + i * 115;
        var bg = self.add.circle(x, y, 34, 0xFFF8F0).setStrokeStyle(2, 0xF0E6D8).setDepth(6)
          .setInteractive({ useHandCursor: true });
        var em = self.add.text(x, y, m.icon, { fontSize: '30px' }).setOrigin(0.5).setDepth(7);
        var lb = self.add.text(x, y + 38, m.label, { fontSize: '12px', color: '#6B6B80', fontFamily: 'Poppins, sans-serif' }).setOrigin(0.5, 0).setDepth(7);
        bg.on('pointerdown', function () { self.onCheckin(m.key); });
        bg.on('pointerover', function () { bg.setFillStyle(0xF6F2FF); });
        bg.on('pointerout', function () { bg.setFillStyle(0xFFF8F0); });
      });
    },

    onCheckin: function (moodKey) {
      if (this.busy) return;
      var self = this;
      this.bond += 1;
      this.updateBond();
      this.setPose('happy');
      this.hop(2);
      this.sparks.explode(14, this.pip.x, this.pip.y - 80);
      this.showBubble(pick(CHECKIN_REACT[moodKey]), 2800);
      this.time.delayedCall(1100, function () {
        if (!self.busy && self.curPose === 'happy') self.setPose('idle');
      });
    }
  });

  function isNight() {
    var h = new Date().getHours();
    return h < 6 || h >= 19;
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#FFF8F0',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [RoomScene]
  });
})();
