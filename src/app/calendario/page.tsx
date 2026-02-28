'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MONTHS_ES } from '@/utils/constants'
import { launchConfetti } from '@/utils/confetti'

type CalEvent = { id?: string; type: string; note: string }

export default function CalendarioPage() {
    const supabase = createClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<Record<string, CalEvent>>({})
    const [modalOpen, setModalOpen] = useState(false)
    const [activeDate, setActiveDate] = useState('')
    const [activeEventType, setActiveEventType] = useState('')
    const [activeEventNote, setActiveEventNote] = useState('')

    useEffect(() => {
        async function loadEvents() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('events').select('*').eq('user_id', user.id)
            if (data) {
                const loaded: Record<string, CalEvent> = {}
                data.forEach((row: any) => {
                    loaded[row.date] = { id: row.id, type: row.event_type, note: row.note }
                })
                setEvents(loaded)
            }
        }
        loadEvents()
    }, [])

    const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() }
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const changeMonth = (offset: number) => {
        const next = new Date(currentDate)
        next.setMonth(next.getMonth() + offset)
        setCurrentDate(next)
    }

    const openModal = (dateStr: string) => {
        setActiveDate(dateStr)
        const existing = events[dateStr]
        setActiveEventType(existing?.type || '')
        setActiveEventNote(existing?.note || '')
        setModalOpen(true)
    }

    const handleSaveEvent = async () => {
        if (!activeEventType) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const existing = events[activeDate]
        if (existing?.id) {
            await supabase.from('events').update({
                event_type: activeEventType, note: activeEventNote
            }).eq('id', existing.id)
            setEvents({ ...events, [activeDate]: { id: existing.id, type: activeEventType, note: activeEventNote } })
        } else {
            const { data } = await supabase.from('events').insert({
                user_id: user.id, date: activeDate, event_type: activeEventType, note: activeEventNote
            }).select().single()
            if (data) {
                setEvents({ ...events, [activeDate]: { id: data.id, type: activeEventType, note: activeEventNote } })
            }
        }
        setModalOpen(false)
        launchConfetti()
    }

    const handleDeleteEvent = async () => {
        const existing = events[activeDate]
        if (existing?.id) {
            await supabase.from('events').delete().eq('id', existing.id)
            const newEvs = { ...events }
            delete newEvs[activeDate]
            setEvents(newEvs)
        }
        setModalOpen(false)
    }

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">📅 Mi Calendario Escolar</h1>

            <div className="cal-controls">
                <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                <div className="cal-month-display">
                    <span className="cal-month-name">{MONTHS_ES[month]}</span>
                    <span className="cal-year">{year}</span>
                </div>
                <button className="cal-nav-btn" onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className="calendar-grid-wrapper">
                <div className="cal-weekdays">
                    <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div>
                    <div className="weekend">Sáb</div><div className="weekend">Dom</div>
                </div>
                <div className="cal-days">
                    {Array.from({ length: startDow }).map((_, i) => (
                        <div key={`empty-${i}`} className="cal-day other-month"></div>
                    ))}
                    {Array.from({ length: lastDay.getDate() }).map((_, i) => {
                        const d = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                        const ev = events[dateStr]
                        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString()
                        const isWeekend = new Date(year, month, d).getDay() === 0 || new Date(year, month, d).getDay() === 6
                        return (
                            <div key={d}
                                className={`cal-day ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''} ${ev ? `ev-${ev.type} has-event` : ''}`}
                                onClick={() => openModal(dateStr)}>
                                <span>{d}</span>
                                {ev && (
                                    <>
                                        <span className="day-dot" style={{ background: { examen: '#FFD166', trabajo: '#06D6A0', evento: '#A882FF', festivo: '#FF9FC3' }[ev.type] }}></span>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.note}</span>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {modalOpen && (
                <div className="event-modal flex">
                    <div className="event-modal-inner">
                        <h3>📅 {activeDate}</h3>
                        <div className="event-types">
                            {['examen', 'trabajo', 'evento', 'festivo'].map(t => (
                                <button key={t} className={`ev-type-btn ev-${t} ${activeEventType === t ? 'selected' : ''}`}
                                    onClick={() => setActiveEventType(t)}>
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <input type="text" className="form-input" placeholder="Nota..."
                            value={activeEventNote} onChange={e => setActiveEventNote(e.target.value)} />
                        <div className="modal-btns">
                            <button className="btn-save" onClick={handleSaveEvent}>💾 Guardar</button>
                            <button className="btn-cancel" onClick={() => setModalOpen(false)}>✖ Cancelar</button>
                            {events[activeDate] && <button className="btn-delete" onClick={handleDeleteEvent}>🗑️</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
