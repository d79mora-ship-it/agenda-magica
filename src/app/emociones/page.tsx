'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MONTHS_ES, MOOD_CONFIG } from '@/utils/constants'
import { launchConfetti } from '@/utils/confetti'

export default function EmocionesPage() {
    const supabase = createClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [moods, setMoods] = useState<Record<string, string>>({})
    const [selectedMood, setSelectedMood] = useState<string | null>(null)

    useEffect(() => {
        async function loadMoods() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('moods').select('*').eq('user_id', user.id)
            if (data) {
                const loaded: Record<string, string> = {}
                data.forEach((row: { date: string, mood: string }) => { loaded[row.date] = row.mood })
                setMoods(loaded)
            }
        }
        loadMoods()
    }, [supabase])

    const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() }
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const changeMonth = (offset: number) => {
        const next = new Date(currentDate)
        next.setMonth(next.getMonth() + offset)
        setCurrentDate(next)
    }

    const handleDayClick = async (d: number) => {
        if (!selectedMood) return
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

        const newMoods = { ...moods }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (moods[dateStr] === selectedMood) {
            delete newMoods[dateStr]
            setMoods(newMoods)
            await supabase.from('moods').delete().eq('user_id', user.id).eq('date', dateStr)
        } else {
            newMoods[dateStr] = selectedMood
            setMoods(newMoods)
            await supabase.from('moods').upsert({ user_id: user.id, date: dateStr, mood: selectedMood }, { onConflict: 'user_id,date' })
            launchConfetti()
        }
    }

    const stats = Object.entries(moods).reduce((acc, [dateStr, mood]) => {
        const [y, m] = dateStr.split('-').map(Number)
        if (y === year && m - 1 === month) acc[mood] = (acc[mood] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">💛 Mi Espacio Emocional</h1>
            <p className="section-subtitle">¿Cómo te has sentido este mes? Toca cada día para colorearlo 🎨</p>

            <div className="mood-month-nav">
                <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                <span className="mood-month-label">{MONTHS_ES[month]} {year}</span>
                <button className="cal-nav-btn" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className="mood-legend">
                {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                    <button
                        key={key}
                        className={`mood-legend-btn ${selectedMood === key ? 'selected' : ''}`}
                        style={{ '--mc': cfg.color } as React.CSSProperties}
                        onClick={() => setSelectedMood(key)}
                    >
                        {cfg.emoji} {cfg.label}
                    </button>
                ))}
            </div>
            <p className="hint-text">
                {selectedMood ? `${MOOD_CONFIG[selectedMood as keyof typeof MOOD_CONFIG].emoji} Seleccionada: "${MOOD_CONFIG[selectedMood as keyof typeof MOOD_CONFIG].label}". Ahora toca los días 👆` : 'Selecciona un estado de ánimo y luego toca los días 👆'}
            </p>

            <div className="mood-grid">
                {Array.from({ length: startDow }).map((_, i) => <div key={`empty-${i}`} className="mood-day empty"></div>)}
                {Array.from({ length: lastDay.getDate() }).map((_, i) => {
                    const d = i + 1
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const moodKey = moods[dateStr]
                    const cfg = moodKey ? MOOD_CONFIG[moodKey as keyof typeof MOOD_CONFIG] : null

                    return (
                        <div key={d} className="mood-day" style={cfg ? { background: cfg.color } : {}} onClick={() => handleDayClick(d)}>
                            {cfg && <span className="mood-emoji">{cfg.emoji}</span>}
                            <span>{d}</span>
                        </div>
                    )
                })}
            </div>

            <div className="mood-stats">
                {Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, count]) => {
                    const cfg = MOOD_CONFIG[k as keyof typeof MOOD_CONFIG]
                    return (
                        <div key={k} className="mood-stat-pill" style={{ background: cfg.color + '55' }}>
                            {cfg.emoji} {cfg.label}: {count} días
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
