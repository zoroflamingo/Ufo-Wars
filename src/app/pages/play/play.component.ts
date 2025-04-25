import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';

interface UfoElement extends HTMLElement {
  direction: number;
  speed: number;
  src: string;
  alt: string;
}

@Component({
  selector: 'app-play',
  standalone: true,
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {  
  @ViewChild('btnStart', { static: true }) startButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('imgUFOGame', { static: true }) ufoTemplate!: ElementRef<HTMLImageElement>;
  @ViewChild('imgMisGame', { static: true }) missile!: ElementRef<HTMLImageElement>;
  @ViewChild('ufoContainer', { static: true }) ufoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('explosion', { static: true }) explosion!: ElementRef<HTMLImageElement>;

  isGameActive = false;
  isMissileActive = false;
  ufoPositionX = 0;
  misPositionY = 0;
  misPositionX = window.innerWidth / 2;
  isMovingRight = false;
  isMovingLeft = false;
  misSpeed = 2;
  timer: any;
  seconds = 60;
  score = 0;
  ufos: UfoElement[] = [];
  ufosCount = 1;
  titleHeight = 0;
  zoneHeight = 0;
  
  constructor(
    @Inject(Renderer2) private readonly renderer: Renderer2,
    private readonly preferencesService: PreferencesService
  ) {}
  
  ngOnInit(): void {
    this.loadPreferences();
    this.titleHeight = document.getElementById('header')!.offsetHeight;
    this.zoneHeight = window.innerHeight - this.titleHeight;
    this.renderer.listen(document, 'keydown', (event: KeyboardEvent) => this.handleKeyDown(event));
    this.renderer.listen(document, 'keyup', (event: KeyboardEvent) => this.handleKeyUp(event));
  }

  loadPreferences(): void {
    const { gameTimer, ufoCount } = this.preferencesService.getPreferences();
    this.seconds = gameTimer;
    this.ufosCount = ufoCount;
  }
  startGame(): void {
    this.ufoContainer.nativeElement.innerHTML = ''; // Clear existing UFOs
    this.renderer.setStyle(this.missile.nativeElement, 'display', 'block');
    this.seconds = parseInt(localStorage.getItem('gameTimer') ?? '60', 10);
    this.misPositionY = 0;
    this.misPositionX = window.innerWidth / 2;
    this.updateMissilePosition();
    this.score = 0;
    this.createOrReplaceUfo(this.ufosCount);
    this.startButton.nativeElement.disabled = true;
    this.isGameActive = true;
    this.seconds = parseInt(localStorage.getItem('gameTimer') ?? '60', 10); // Set timer from preferences
    this.timer = setInterval(() => this.updateTimer(), 1000);
    this.moveUfo();
    this.smoothMoveMissile();
    this.moveMissile();  
  }

  stopGame(): void {
    this.startButton.nativeElement.disabled = false;
    this.isGameActive = false;
    this.ufoPositionX = 0;
    clearInterval(this.timer);
    this.finalScore();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.isMissileActive && this.startButton.nativeElement.disabled) {
      this.isMissileActive = true;
      this.moveMissile();
    } else if (event.code === 'ArrowRight') {
      this.isMovingRight = true;
    } else if (event.code === 'ArrowLeft') {
      this.isMovingLeft = true;
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (event.code === 'ArrowRight') {
      this.isMovingRight = false;
    } else if (event.code === 'ArrowLeft') {
      this.isMovingLeft = false;
    }
  }

 moveUfo(): void {
    if (this.isGameActive) {
      this.ufos.forEach((ufo) => {
        const currentLeft = parseFloat(ufo.style.left || '0');
        const newLeft = currentLeft + (ufo.direction * 2);
        ufo.style.left = `${newLeft}px`;

        if (newLeft > window.innerWidth) {
          ufo.style.left = `-${ufo.offsetWidth}px`;
        } else if (newLeft < -ufo.offsetWidth) {
          ufo.style.left = `${window.innerWidth}px`;
        }
      });

      requestAnimationFrame(() => this.moveUfo());
    }
  }
  
  smoothMoveMissile(): void {
    if (!this.isMissileActive && this.isGameActive) {
      // Move missile horizontally based on arrow keys
      if (this.isMovingRight) {
        this.misPositionX += 5;  // Move right
      }
      if (this.isMovingLeft) {
        this.misPositionX -= 5;  // Move left
      }

      // Constrain missile within screen bounds
      this.misPositionX = Math.max(0, Math.min(this.misPositionX, window.innerWidth - this.missile.nativeElement.offsetWidth));

      // Update missile position horizontally and vertically
      this.updateMissilePosition();

      // Handle missile vertical movement and collision detection
      if (this.detectCollision()) {
        this.isMissileActive = false;
        this.updateScore("increase");
      } else if (this.misPositionY < -this.zoneHeight) {
        this.misPositionY = 0;
        this.isMissileActive = false;
        this.updateScore("decrease");
      }
    }
    requestAnimationFrame(() => this.smoothMoveMissile());
  }

  moveMissile(): void {
    if (this.isMissileActive) {
      this.misPositionY -= this.misSpeed;
      this.updateMissilePosition();

      if (this.detectCollision()) {
        this.isMissileActive = false;
        this.updateScore("increase");
      } else if (this.misPositionY < -this.zoneHeight) {
        this.misPositionY = 0;
        this.isMissileActive = false;
        this.updateScore("decrease");
      } else {
        requestAnimationFrame(() => this.moveMissile());
      }
    }
  }

  updateMissilePosition(): void {
    this.renderer.setStyle(
      this.missile.nativeElement,
      'transform',
      `translate(${this.misPositionX}px, ${this.misPositionY}px)`
    );
  }

  detectCollision(): boolean {
    const missileRect = this.missile.nativeElement.getBoundingClientRect();
    for (const ufo of this.ufos) {
      const ufoRect = ufo.getBoundingClientRect();

      if (
        missileRect.left < ufoRect.right &&
        missileRect.right > ufoRect.left &&
        missileRect.top < ufoRect.bottom &&
        missileRect.bottom > ufoRect.top
      ) {
        this.triggerExplosion(ufo);
        this.replaceHitUfo(ufo);
        this.missile.nativeElement.style.display = "none";
        return true;
      }
    }
    return false;
  }

  triggerExplosion(collidedUfo: any): void {
    const ufoRect = collidedUfo.getBoundingClientRect();
    this.renderer.setStyle(this.explosion.nativeElement, 'left', `${(ufoRect.left + ufoRect.right) / 2}px`);
    this.renderer.setStyle(this.explosion.nativeElement, 'top', `${(ufoRect.top + ufoRect.bottom) / 2}px`);
    this.renderer.setStyle(this.explosion.nativeElement, 'display', 'block');

    setTimeout(() => {
      this.renderer.setStyle(this.explosion.nativeElement, 'display', 'none');
      this.resetMissile();
    }, 500);
  }

  replaceHitUfo(hitUfo: any): void {
    hitUfo.remove();
    this.createOrReplaceUfo(1);  // Replace with one UFO after a hit
  }

  createOrReplaceUfo(count: number): void {
    const ufoHeight = 50;
    const maxTop = window.innerHeight - ufoHeight * 3;
    const minTop = this.titleHeight + ufoHeight;
    for (let i = 0; i < count; i++) {
      const clonedUfo = document.createElement('img') as unknown as UfoElement;
      clonedUfo.src = 'assets/ufo.png';
      clonedUfo.alt = 'UFO';
      clonedUfo.classList.add('imgUFO');
      this.renderer.setStyle(clonedUfo, 'position', 'absolute');
      this.renderer.setStyle(clonedUfo, 'left', `${Math.random() * window.innerWidth}px`);
      this.renderer.setStyle(clonedUfo, 'top', `${minTop + Math.random() * (maxTop - minTop)}px`);
      clonedUfo.id = `ufo-${Date.now()}-${i}`;
      clonedUfo.direction = Math.random() < 0.5 ? 1 : -1;
      clonedUfo.speed = Math.random() * 3 + 1;

      this.renderer.appendChild(this.ufoContainer.nativeElement, clonedUfo);
      this.ufos.push(clonedUfo);
    }
  }

  updateScore(action: string): void {
    if (action === "increase") {
      this.score += 100;
    } else if (action === "decrease") {
      this.score -= 25;
    }
  }

  updateTimer(): void {
    if (this.isGameActive && this.seconds > 0) {
      this.seconds--;
    } else if (this.seconds === 0) {
      this.stopGame();
    }
  }

  finalScore(): void {
    const savedTimer = parseInt(localStorage.getItem('gameTimer') ?? '60', 10);
    const savedUfoCount = parseInt(localStorage.getItem('ufoCount') ?? '1', 10);

    if (savedTimer === 120) {
      this.score /= 2;
    } else if (savedTimer === 180) {
      this.score /= 3;
    }
    this.score -= 50 * (savedUfoCount - 1);

    this.offerRecordScore(this.score, savedUfoCount, savedTimer);
  }

  resetMissile(): void {
    this.misPositionY = 0;
    this.updateMissilePosition();
    this.isMissileActive = false;
    this.missile.nativeElement.style.display = 'block';
  }

  offerRecordScore(score: number, ufos: number, disposedTime: number): void {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      const record = confirm('Do you want to record your score?');
      if (record) {
        this.recordScore({ punctuation: score, ufos, disposedTime }, authToken);
      }
    } else {
      alert('You need to be logged in to record your score.');
    }
  }

async recordScore(data: { punctuation: number; ufos: number; disposedTime: number }, token: string): Promise<void> {
    try {
      const response = await fetch('http://wd.etsisi.upm.es:10000/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(data),
      });
      console.log(token);
      if (response.ok) {
        const newToken = response.headers.get('Authorization');
        if (newToken) {
        localStorage.setItem('authToken', newToken);
        }
        alert('Score recorded successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to record score:', errorText);
        alert('Error recording score: ' + errorText);
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('An error occurred while recording the score.');
    }
  }
}

