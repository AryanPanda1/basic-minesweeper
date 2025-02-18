class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        this.volume = parseFloat(localStorage.getItem('volume')) || 0.5;
    }

    initializeContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.setVolume(this.volume);
        }
    }

    play(soundName) {
        if (this.isMuted) return;
        
        // Initialize context on first user interaction
        this.initializeContext();
        console.log(`Playing sound: ${soundName}`); // Debugging log
        
        switch (soundName) {
            case 'click':
                this.playClick();
                break;
            case 'flag':
                this.playFlag();
                break;
            case 'unflag':
                this.playUnflag();
                break;
            case 'explosion':
                this.playExplosion();
                break;
            case 'win':
                this.playWin();
                break;
        }
    }

    playClick() {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
    }

    playFlag() {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(600, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
    }

    playUnflag() {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
    }

    playExplosion() {
        const noise = this.context.createBufferSource();
        const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.5, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const gain = this.context.createGain();
        noise.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        
        noise.start();
        noise.stop(this.context.currentTime + 0.5);
    }

    playWin() {
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.frequency.setValueAtTime(freq, this.context.currentTime + i * 0.1);
            
            gain.gain.setValueAtTime(0.3, this.context.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + i * 0.1 + 0.1);
            
            oscillator.start(this.context.currentTime + i * 0.1);
            oscillator.stop(this.context.currentTime + i * 0.1 + 0.1);
        });
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime);
        }
        localStorage.setItem('volume', this.volume.toString());
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('isMuted', this.isMuted.toString());
        return this.isMuted;
    }
}
