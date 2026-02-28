'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SUBJECTS, TIME_SLOTS } from '@/utils/constants'

export default function HorarioPage() {
    const supabase = createClient()
    const [schedule, setSchedule] = useState<Record<string, number>>({})
    const [selectedSubject, setSelectedSubject] = useState(0)

    useEffect(() => {
        async function loadSchedule() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('schedule').select('*').eq('user_id', user.id)
            if (data) {
                const loaded: Record<string, number> = {}
                data.forEach((row: { time_slot_index: number; day_index: number; subject_index: number }) => {
                    loaded[`${row.time_slot_index}-${row.day_index}`] = row.subject_index
                })
                setSchedule(loaded)
            }
        }
        loadSchedule()
    }, [supabase])

    const handleCellClick = async (timeIdx: number, dayIdx: number) => {
        const key = `${timeIdx}-${dayIdx}`
        const newSchedule = { ...schedule, [key]: selectedSubject }
        setSchedule(newSchedule)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Upsert the schedule entry
        await supabase.from('schedule').upsert({
            user_id: user.id,
            day_index: dayIdx,
            time_slot_index: timeIdx,
            subject_index: selectedSubject
        }, { onConflict: 'user_id,day_index,time_slot_index' })
    }

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">📚 Mi Horario Semanal</h1>

            <div className="schedule-grid-wrapper">
                <table className="schedule-table" aria-label="Horario de clase">
                    <thead>
                        <tr>
                            <th className="time-header">⏰</th>
                            <th className="day-header">🌸 Lun</th>
                            <th className="day-header">☁️ Mar</th>
                            <th className="day-header">🌈 Mié</th>
                            <th className="day-header">⭐ Jue</th>
                            <th className="day-header">🎉 Vie</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map((time, rowIdx) => (
                            <tr key={time}>
                                <td className="time-cell">{time}</td>
                                {[0, 1, 2, 3, 4].map((colIdx) => {
                                    const subIdx = schedule[`${rowIdx}-${colIdx}`] ?? 10
                                    const sub = SUBJECTS[subIdx]
                                    return (
                                        <td
                                            key={colIdx}
                                            className="schedule-cell"
                                            style={{ background: sub.bg, borderColor: sub.color }}
                                            onClick={() => handleCellClick(rowIdx, colIdx)}
                                        >
                                            {sub.emoji} {sub.name}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="subject-legend">
                <h3 className="legend-title">📚 Asignaturas</h3>
                <div className="subject-pills">
                    {SUBJECTS.map((sub, i) => (
                        <button
                            key={i}
                            className={`subject-pill ${selectedSubject === i ? 'selected' : ''}`}
                            style={{ background: sub.bg, borderColor: sub.color, color: '#3D2C5A' }}
                            onClick={() => setSelectedSubject(i)}
                        >
                            {sub.emoji} {sub.name}
                        </button>
                    ))}
                </div>
            </div>
            <p className="hint-text">💡 Haz clic en cualquier celda para cambiar la asignatura</p>
        </div>
    )
}
