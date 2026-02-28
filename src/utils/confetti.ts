export function launchConfetti() {
    import('canvas-confetti').then((confetti) => {
        confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF9FC3', '#7AE0C4', '#C3A8F0', '#FFE066', '#89D4F5']
        })
    })
}
