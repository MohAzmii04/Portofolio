export class HUD {
    constructor() {
        this.scoreElement = document.getElementById('hud-score');
        this.distanceElement = document.getElementById('hud-distance');
        this.progressElement = document.getElementById('hud-progress-bar');
        this.speedElement = document.getElementById('hud-speed');

        this.score = 0;
        this.distance = 0;
        this.targetDistance = 600;
        this.speedKmH = 115;
    }

    update(delta, isPlaying) {
        if (!isPlaying) return;

        // Advance distance and score
        this.distance += delta * 28;
        this.score = Math.floor(this.distance * 12);

        // Speed micro-fluctuation for realism
        this.speedKmH = 118 + Math.sin(Date.now() * 0.005) * 4;

        if (this.scoreElement) {
            this.scoreElement.innerText = this.score.toLocaleString();
        }

        if (this.distanceElement) {
            const currentDist = Math.min(Math.floor(this.distance), this.targetDistance);
            this.distanceElement.innerText = `${currentDist}m / ${this.targetDistance}m`;
        }

        if (this.progressElement) {
            const pct = Math.min(100, (this.distance / this.targetDistance) * 100);
            this.progressElement.style.width = `${pct}%`;
        }

        if (this.speedElement) {
            this.speedElement.innerText = `${Math.floor(this.speedKmH)} km/h`;
        }
    }

    reset() {
        this.score = 0;
        this.distance = 0;
        if (this.scoreElement) this.scoreElement.innerText = '0';
        if (this.distanceElement) this.distanceElement.innerText = `0m / ${this.targetDistance}m`;
        if (this.progressElement) this.progressElement.style.width = '0%';
        if (this.speedElement) this.speedElement.innerText = '120 km/h';
    }

    getDistance() {
        return this.distance;
    }
}