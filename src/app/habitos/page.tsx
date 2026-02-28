'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { launchConfetti } from '@/utils/confetti'

export default function HabitosPage() {
    const supabase = createClient()
    const [habits, setHabits] = useState<{ reading: boolean[], water: boolean[], sleep: boolean[] }>({
        reading: new Array(31).fill(false),
        water: new Array(31).fill(false),
        sleep: new Array(31).fill(false)
    })

    const currentMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    useEffect(() => {
        async function loadHabits() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('habits').select('*')
                .eq('user_id', user.id).eq('month_date', currentMonthDate)

            if (data && data.length > 0) {
                const loaded = {
                    reading: new Array(31).fill(false),
                    water: new Array(31).fill(false),
                    sleep: new Array(31).fill(false)
                }
                data.forEach((row: { habit_type: string; days_completed: boolean[] }) => {
                    if (row.habit_type in loaded) {
                        loaded[row.habit_type as keyof typeof loaded] = row.days_completed
                    }
                })
                setHabits(loaded)
            } else {
                // Init empty
                await supabase.from('habits').insert([
                    { user_id: user.id, habit_type: 'reading', month_date: currentMonthDate, days_completed: new Array(31).fill(false) },
                    { user_id: user.id, habit_type: 'water', month_date: currentMonthDate, days_completed: new Array(31).fill(false) },
                    { user_id: user.id, habit_type: 'sleep', month_date: currentMonthDate, days_completed: new Array(31).fill(false) }
                ])
            }
        }
        loadHabits()
    }, [supabase, currentMonthDate])

    const toggleHabit = async (type: 'reading' | 'water' | 'sleep', dayIndex: number) => {
        const newArr = [...habits[type]]
        newArr[dayIndex] = !newArr[dayIndex]

        setHabits(prev => ({ ...prev, [type]: newArr }))
        if (newArr[dayIndex]) launchConfetti()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('habits').update({ days_completed: newArr })
            .eq('user_id', user.id).eq('habit_type', type).eq('month_date', currentMonthDate)
    }

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">🌱 Mis Hábitos</h1>
            <p className="section-subtitle">¡Pequeños hábitos, grandes logros! Colorea cada día que lo consigas 🌟</p>

            {([
                { type: 'reading', title: 'Lectura diaria', desc: 'Lee al menos 15 minutos cada día', icon: '📖', color: '#FFD166', bg: 'card-peach' },
                { type: 'water', title: 'Hidratación', desc: 'Bebe mucha agua al día', icon: '💧', color: '#7AE0C4', bg: 'card-mint' },
                { type: 'sleep', title: 'Horas de sueño', desc: 'Duerme 9-10 horas cada noche', icon: '🌙', color: '#C3A8F0', bg: 'card-lavender' },
            ] as const).map(h => {
                const currentArr = habits[h.type]
                const count = currentArr.filter(Boolean).length
                return (
                    <div key={h.type} className={`habit-card ${h.bg}`}>
                        <div className="habit-card-header">
                            <span className="habit-icon">{h.icon}</span>
                            <div>
                                <h2 className="habit-title">{h.title}</h2>
                                <p className="habit-desc">{h.desc}</p>
                            </div>
                            <div className="habit-target-badge">🎯 31 días</div>
                        </div>
                        <div className="habit-dots">
                            {currentArr.map((isDone, idx) => (
                                <div
                                    key={idx}
                                    className={`habit-dot ${isDone ? 'filled' : ''}`}
                                    onClick={() => toggleHabit(h.type, idx)}
                                ></div>
                            ))}
                        </div>
                        <div className="habit-counter"><span>{count}</span> / 31 días ✅</div>
                    </div>
                )
            })}
        </div>
    )
}
