'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { launchConfetti } from '@/utils/confetti'

type Note = { id: string; subject: string; date: string; note_type: string; description: string }

export default function NotasPage() {
    const supabase = createClient()
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState({ subject: '', date: '', note_type: 'examen', description: '' })

    useEffect(() => {
        async function loadNotes() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('date', { ascending: true })
            if (data) setNotes(data)
        }
        loadNotes()
    }, [supabase])

    const handleAddNote = async () => {
        if (!newNote.subject || !newNote.date) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase.from('notes').insert({
            user_id: user.id,
            subject: newNote.subject,
            date: newNote.date,
            note_type: newNote.note_type,
            description: newNote.description
        }).select().single()

        if (data) {
            setNotes([...notes, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
            setNewNote({ subject: '', date: '', note_type: 'examen', description: '' })
            launchConfetti()
        }
    }

    const handleDelete = async (id: string) => {
        await supabase.from('notes').delete().eq('id', id)
        setNotes(notes.filter(n => n.id !== id))
    }

    const typeMap: Record<string, string> = {
        examen: '📝 Examen', trabajo: '📦 Entrega', proyecto: '🔬 Proyecto', otro: '📌 Otro'
    }

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">📌 Mis Notas y Entregas</h1>
            <p className="section-subtitle">Controla tus exámenes y trabajos con código de colores 🌈</p>

            <div className="add-note-form card-pink">
                <h2 className="form-section-title">➕ Añadir nueva nota</h2>
                <div className="add-note-grid">
                    <div className="field-group">
                        <label>Asignatura</label>
                        <input type="text" className="form-input" placeholder="Ej: Matemáticas"
                            value={newNote.subject} onChange={e => setNewNote({ ...newNote, subject: e.target.value })} />
                    </div>
                    <div className="field-group">
                        <label>Fecha</label>
                        <input type="date" className="form-input"
                            value={newNote.date} onChange={e => setNewNote({ ...newNote, date: e.target.value })} />
                    </div>
                    <div className="field-group">
                        <label>Tipo</label>
                        <select className="form-select" value={newNote.note_type} onChange={e => setNewNote({ ...newNote, note_type: e.target.value })}>
                            <option value="examen">📝 Examen</option>
                            <option value="trabajo">📦 Entrega de trabajo</option>
                            <option value="proyecto">🔬 Proyecto</option>
                            <option value="otro">📌 Otro</option>
                        </select>
                    </div>
                    <div className="field-group">
                        <label>Descripción</label>
                        <input type="text" className="form-input" placeholder="¿De qué trata?"
                            value={newNote.description} onChange={e => setNewNote({ ...newNote, description: e.target.value })} />
                    </div>
                </div>
                <button className="btn-add-note mt-2" onClick={handleAddNote}>✨ Añadir nota</button>
            </div>

            <div className="notes-list">
                {notes.map(note => (
                    <div key={note.id} className={`note-card ${note.note_type}`}>
                        <span className="note-type-badge">{typeMap[note.note_type] || note.note_type}</span>
                        <div className="note-subject">{note.subject}</div>
                        <div className="note-date">📅 {new Date(note.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        {note.description && <div className="note-desc">{note.description}</div>}
                        <button className="note-delete-btn" onClick={() => handleDelete(note.id)}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
