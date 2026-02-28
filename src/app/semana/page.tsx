'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DAYS_ES, DAY_EMOJIS, MONTHS_ES } from '@/utils/constants'

export default function SemanaPage() {
    const supabase = createClient()
    const [weekOffset, setWeekOffset] = useState(0)
    const [priority, setPriority] = useState('')
    const [happyMoment, setHappyMoment] = useState('')
    const [daysData, setDaysData] = useState<Record<number, string[]>>({})
    const [checkedData, setCheckedData] = useState<Record<string, boolean>>({})

    const getMonday = (offset: number) => {
        const now = new Date()
        const day = now.getDay() || 7
        const monday = new Date(now)
        monday.setDate(now.getDate() - day + 1 + offset * 7)
        monday.setHours(0, 0, 0, 0)
        return monday
    }

    const monday = getMonday(weekOffset)
    const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`

    useEffect(() => {
        async function loadWeek() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('weekly_tasks').select('*').eq('user_id', user.id).eq('week_start_date', weekKey).single()
            if (data) {
                setPriority(data.priority || '')
                setHappyMoment(data.happy_moment || '')
                setDaysData(data.days_data || {})
                setCheckedData(data.checked_data || {})
            } else {
                setPriority('')
                setHappyMoment('')
                setDaysData({})
                setCheckedData({})
            }
        }
        loadWeek()
    }, [weekOffset, weekKey])

    const saveToDb = async (upd: any) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const payload = {
            user_id: user.id, week_start_date: weekKey,
            priority, happy_moment: happyMoment,
            days_data: daysData, checked_data: checkedData,
            ...upd
        }
        await supabase.from('weekly_tasks').upsert(payload, { onConflict: 'user_id,week_start_date' })
    }

    const handlePriority = (val: string) => { setPriority(val); saveToDb({ priority: val }) }
    const handleHappy = (val: string) => { setHappyMoment(val); saveToDb({ happy_moment: val }) }

    const addHomework = (dayIdx: number) => {
        const text = prompt('¿Qué deber tienes? ✏️')
        if (!text || !text.trim()) return
        const newDays = { ...daysData, [dayIdx]: [...(daysData[dayIdx] || []), text.trim()] }
        setDaysData(newDays)
        saveToDb({ days_data: newDays })
    }

    const toggleCheck = (dayIdx: number, hwIdx: number, val: boolean) => {
        const k = `${dayIdx}-${hwIdx}`
        const newChecked = { ...checkedData, [k]: val }
        setCheckedData(newChecked)
        saveToDb({ checked_data: newChecked })
    }

    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">📝 Mi Semana</h1>

            <div className="week-nav">
                <button className="cal-nav-btn" onClick={() => setWeekOffset(weekOffset - 1)}>‹</button>
                <span className="week-label">
                    {monday.getDate()} {MONTHS_ES[monday.getMonth()]} — {friday.getDate()} {MONTHS_ES[friday.getMonth()]}
                </span>
                <button className="cal-nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>›</button>
            </div>

            <div className="week-top-cards">
                <div className="top-card card-pink">
                    <div className="top-card-header">🎯 Prioridades de la semana</div>
                    <textarea className="top-card-textarea" placeholder="¿Qué es lo importante? ✨" value={priority} onChange={e => handlePriority(e.target.value)} />
                </div>
                <div className="top-card card-mint">
                    <div className="top-card-header">😊 Mi momento feliz</div>
                    <textarea className="top-card-textarea" placeholder="¿Qué me hizo feliz esta semana? 🌈" value={happyMoment} onChange={e => handleHappy(e.target.value)} />
                </div>
            </div>

            <div className="week-days-grid">
                {[0, 1, 2, 3, 4].map(i => {
                    const dayDate = new Date(monday)
                    dayDate.setDate(monday.getDate() + i)
                    const items = daysData[i] || []

                    return (
                        <div key={i} className="week-day-card">
                            <div className="week-day-header">
                                <span className="week-day-emoji">{DAY_EMOJIS[i]}</span>
                                <div>
                                    <div className="week-day-name">{DAYS_ES[i]}</div>
                                    <div className="week-day-date">{dayDate.getDate()} de {MONTHS_ES[dayDate.getMonth()]}</div>
                                </div>
                            </div>

                            <div className="homework-list">
                                {items.map((hw, idx) => {
                                    const chk = !!checkedData[`${i}-${idx}`]
                                    return (
                                        <div key={idx} className="homework-item">
                                            <input type="checkbox" className="homework-checkbox" checked={chk} onChange={e => toggleCheck(i, idx, e.target.checked)} />
                                            <label className={`homework-text ${chk ? 'done' : ''}`}>{hw}</label>
                                        </div>
                                    )
                                })}
                            </div>
                            <button className="add-homework-btn mt-2" onClick={() => addHomework(i)}>+ Añadir deber</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
