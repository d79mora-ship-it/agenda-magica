'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { launchConfetti } from '@/utils/confetti'

type Book = { id: string, title: string, author: string, rating: number }
type Goal = { id: string, text: string, done: boolean }
type Word = { id: string, text: string, color_idx: number }

export default function ExtrasPage() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<'libros' | 'objetivos' | 'positivas' | 'doodle'>('libros')

    const [books, setBooks] = useState<Book[]>([])
    const [newBook, setNewBook] = useState({ title: '', author: '', rating: 5 })

    const [goals, setGoals] = useState<Goal[]>([])
    const [newGoal, setNewGoal] = useState('')

    const [words, setWords] = useState<Word[]>([])
    const [newWord, setNewWord] = useState('')

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const resB = await supabase.from('books').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
            if (resB.data) setBooks(resB.data)

            const resG = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
            if (resG.data) setGoals(resG.data)

            const resW = await supabase.from('words').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
            if (resW.data) setWords(resW.data)
        }
        loadData()
    }, [])

    // Books Actions
    const addBook = async () => {
        if (!newBook.title) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('books').insert({ user_id: user.id, ...newBook }).select().single()
        if (data) { setBooks([...books, data]); setNewBook({ title: '', author: '', rating: 5 }); launchConfetti() }
    }
    const delBook = async (id: string) => {
        await supabase.from('books').delete().eq('id', id)
        setBooks(books.filter(b => b.id !== id))
    }

    // Goals Actions
    const addGoal = async () => {
        if (!newGoal) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('goals').insert({ user_id: user.id, text: newGoal }).select().single()
        if (data) { setGoals([...goals, data]); setNewGoal(''); launchConfetti() }
    }
    const toggleGoal = async (id: string, done: boolean) => {
        setGoals(goals.map(g => g.id === id ? { ...g, done } : g))
        await supabase.from('goals').update({ done }).eq('id', id)
        if (done) launchConfetti()
    }
    const delGoal = async (id: string) => {
        await supabase.from('goals').delete().eq('id', id)
        setGoals(goals.filter(g => g.id !== id))
    }

    // Words Actions
    const addWord = async () => {
        if (!newWord) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const color_idx = Math.floor(Math.random() * 8)
        const { data } = await supabase.from('words').insert({ user_id: user.id, text: newWord, color_idx }).select().single()
        if (data) { setWords([...words, data]); setNewWord(''); launchConfetti() }
    }
    const delWord = async (id: string) => {
        await supabase.from('words').delete().eq('id', id)
        setWords(words.filter(w => w.id !== id))
    }

    // Doodle Canvas Setup
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawing = useRef(false)
    const [brushColor, setBrushColor] = useState('#3D2C5A')
    const [brushSize, setBrushSize] = useState(4)
    const DOODLE_COLORS = ['#3D2C5A', '#FF9FC3', '#A882FF', '#7AE0C4', '#FFBC8B', '#FFE066', '#89D4F5', '#FF6B6B', '#06D6A0', '#FFFFFF']

    useEffect(() => {
        if (activeTab === 'doodle' && canvasRef.current) {
            const cvs = canvasRef.current
            cvs.width = cvs.offsetWidth
            cvs.height = cvs.offsetHeight
            const ctx = cvs.getContext('2d')
            if (ctx) {
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, cvs.width, cvs.height)
            }
        }
    }, [activeTab])

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing.current = true
        draw(e)
    }
    const stopDraw = () => {
        isDrawing.current = false
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) ctx.beginPath()
    }
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !canvasRef.current) return
        const cvs = canvasRef.current
        const ctx = cvs.getContext('2d')
        if (!ctx) return
        const rect = cvs.getBoundingClientRect()
        let x = 0, y = 0
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = (e as React.MouseEvent).clientX - rect.left
            y = (e as React.MouseEvent).clientY - rect.top
        }
        ctx.lineWidth = brushSize
        ctx.strokeStyle = brushColor
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const WORD_COLORS = [
        'linear-gradient(135deg, #FF9FC3, #FFD6E8)', 'linear-gradient(135deg, #7AE0C4, #C8F5EC)', 'linear-gradient(135deg, #C3A8F0, #EDE0FF)',
        'linear-gradient(135deg, #FFBC8B, #FFE8D0)', 'linear-gradient(135deg, #89D4F5, #DDF4FF)',
        'linear-gradient(135deg,#FFD166,#FFBC8B)', 'linear-gradient(135deg,#A882FF,#FF9FC3)', 'linear-gradient(135deg,#7AE0C4,#89D4F5)',
    ]

    return (
        <div className="page-wrapper">
            <h1 className="page-heading">🎨 Mis Extras Favoritos</h1>

            <div className="extras-tabs">
                <button className={`extras-tab ${activeTab === 'libros' ? 'active' : ''}`} onClick={() => setActiveTab('libros')}>📚 Libros leídos</button>
                <button className={`extras-tab ${activeTab === 'objetivos' ? 'active' : ''}`} onClick={() => setActiveTab('objetivos')}>🎯 Objetivos</button>
                <button className={`extras-tab ${activeTab === 'positivas' ? 'active' : ''}`} onClick={() => setActiveTab('positivas')}>💬 Palabras positivas</button>
                <button className={`extras-tab ${activeTab === 'doodle' ? 'active' : ''}`} onClick={() => setActiveTab('doodle')}>✏️ Zona Doodle</button>
            </div>

            {activeTab === 'libros' && (
                <div className="extras-panel active">
                    <h2 className="section-title">📚 Mis libros leídos</h2>
                    <div className="book-add-row">
                        <input type="text" className="form-input" placeholder="Título..." value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
                        <input type="text" className="form-input" placeholder="Autor..." value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} />
                        <select className="form-select" value={newBook.rating} onChange={e => setNewBook({ ...newBook, rating: parseInt(e.target.value) })}>
                            <option value="5">⭐⭐⭐⭐⭐ Genial</option>
                            <option value="4">⭐⭐⭐⭐ Muy bien</option>
                            <option value="3">⭐⭐⭐ Bien</option>
                            <option value="2">⭐⭐ Regular</option>
                            <option value="1">⭐ Meh</option>
                        </select>
                        <button className="btn-add-note" onClick={addBook}>+ Añadir</button>
                    </div>
                    <div className="books-list">
                        {books.map(b => (
                            <div key={b.id} className="book-card">
                                <span className="book-emoji">📖</span>
                                <div className="book-info">
                                    <div className="book-title">{b.title}</div>
                                    <div className="book-author">{b.author}</div>
                                    <div className="book-rating">{'⭐'.repeat(b.rating)}</div>
                                </div>
                                <button className="book-del-btn" onClick={() => delBook(b.id)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'objetivos' && (
                <div className="extras-panel active">
                    <h2 className="section-title">🎯 Mis Objetivos del Mes</h2>
                    <div className="goal-add-row">
                        <input type="text" className="form-input" placeholder="Escribe un objetivo…" value={newGoal} onChange={e => setNewGoal(e.target.value)} />
                        <button className="btn-add-note" onClick={addGoal}>+ Añadir</button>
                    </div>
                    <div className="goals-list">
                        {goals.map(g => (
                            <div key={g.id} className="goal-item">
                                <input type="checkbox" className="goal-checkbox" checked={g.done} onChange={e => toggleGoal(g.id, e.target.checked)} />
                                <span className={`goal-text ${g.done ? 'done' : ''}`}>{g.text}</span>
                                <button className="goal-del-btn" onClick={() => delGoal(g.id)}>🗑️</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'positivas' && (
                <div className="extras-panel active">
                    <h2 className="section-title">💬 Mis Palabras Positivas</h2>
                    <div className="positive-words-grid">
                        {words.map(w => (
                            <span key={w.id} className="word-bubble" style={{ background: WORD_COLORS[w.color_idx % WORD_COLORS.length] }}>
                                {w.text}
                                <span className="w-del" onClick={() => delWord(w.id)}>✖</span>
                            </span>
                        ))}
                    </div>
                    <div className="add-word-row">
                        <input type="text" className="form-input" placeholder="Añade tu propia palabra…" value={newWord} onChange={e => setNewWord(e.target.value)} />
                        <button className="btn-add-note" onClick={addWord}>+ Añadir</button>
                    </div>
                </div>
            )}

            {activeTab === 'doodle' && (
                <div className="extras-panel active">
                    <h2 className="section-title">✏️ Mi Zona Doodle</h2>
                    <div className="doodle-controls">
                        <div className="doodle-colors">
                            {DOODLE_COLORS.map(c => (
                                <div key={c} className={`doodle-color-btn ${brushColor === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setBrushColor(c)}></div>
                            ))}
                        </div>
                        <input type="range" min="1" max="30" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="brush-slider" />
                        <span className="brush-label">Grosor</span>
                        <button className="btn-doodle-clear" onClick={() => {
                            const cvs = canvasRef.current
                            const ctx = cvs?.getContext('2d')
                            if (ctx && cvs) { ctx.fillStyle = 'white'; ctx.fillRect(0, 0, cvs.width, cvs.height) }
                        }}>🗑️ Borrar todo</button>
                        <button className="btn-doodle-save" onClick={() => {
                            if (!canvasRef.current) return
                            const a = document.createElement('a')
                            a.download = 'MiDibujoAgenda.png'
                            a.href = canvasRef.current.toDataURL()
                            a.click()
                        }}>💾 Guardar imagen</button>
                    </div>
                    <canvas
                        id="doodleCanvas"
                        ref={canvasRef}
                        className="doodle-canvas"
                        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} onTouchCancel={stopDraw}
                    ></canvas>
                </div>
            )}

        </div>
    )
}
