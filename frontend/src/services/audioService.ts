export class AlarmSoundGenerator {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  playGentleChime(volume: number = 0.5): void {
    const ctx = this.getContext()
    const now = ctx.currentTime
    const frequencies = [523.25, 659.25, 783.99]
    const noteDuration = 0.4
    const noteGap = 0.15

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i]
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq!, now)

      const startTime = now + i * (noteDuration + noteGap)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + noteDuration)
    }
  }

  playBreakAlarm(volume: number = 0.5): void {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playGentleChime(volume), i * 2000)
    }
  }

  playBreakComplete(volume: number = 0.5): void {
    const ctx = this.getContext()
    const now = ctx.currentTime
    const frequencies = [783.99, 659.25, 523.25]
    const noteDuration = 0.3

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i]
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq!, now)

      const startTime = now + i * noteDuration
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + noteDuration)
    }
  }

  async resume(): Promise<void> {
    const ctx = this.getContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  }
}

export const alarmSound = new AlarmSoundGenerator()
