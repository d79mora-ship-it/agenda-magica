'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { launchConfetti } from '@/utils/confetti'

export default function PortadaPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState({
    full_name: '',
    grade: '',
    school_year: '',
    school_name: '',
    avatar_url: '',
    favorites: {
      musica: '', libro: '', color: '', asig: '', animal: '', comida: ''
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          grade: data.grade?.toString() || '',
          school_year: data.school_year || '',
          school_name: data.school_name || '',
          avatar_url: data.avatar_url || '',
          favorites: data.favorites || { musica: '', libro: '', color: '', asig: '', animal: '', comida: '' }
        })
      } else {
        // Insert empty profile if none exists
        await supabase.from('profiles').insert([{ id: user.id }])
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (updates: Partial<typeof profile>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name: newProfile.full_name,
      grade: newProfile.grade ? parseInt(newProfile.grade) : null,
      school_year: newProfile.school_year,
      school_name: newProfile.school_name,
      avatar_url: newProfile.avatar_url,
      favorites: newProfile.favorites
    }).eq('id', user.id)
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      handleSave({ avatar_url: result })
      launchConfetti()
    }
    reader.readAsDataURL(file)
  }

  if (loading) return <div className="page-wrapper text-center">Cargando tu agenda... ✨</div>

  return (
    <div className="page-wrapper portada-page">
      <div className="portada-hero relative">
        <div className="portada-stars" aria-hidden="true">✨⭐💫✨⭐💫✨</div>
        <h1 className="portada-title">Mi Agenda Mágica</h1>
        <p className="portada-sub">Tu espacio especial para este curso 🌈</p>
      </div>

      <div className="portada-form-grid">
        <div className="form-card card-pink">
          <div className="form-card-icon">👧</div>
          <label htmlFor="inputNombre" className="form-label">Mi nombre es…</label>
          <input type="text" id="inputNombre" className="form-input" placeholder="Escribe tu nombre aquí ✨" maxLength={40}
            value={profile.full_name} onChange={e => handleSave({ full_name: e.target.value })} />
        </div>

        <div className="form-card card-mint">
          <div className="form-card-icon">🎒</div>
          <label htmlFor="inputCurso" className="form-label">Estoy en…</label>
          <select id="inputCurso" className="form-select" value={profile.grade} onChange={e => handleSave({ grade: e.target.value })}>
            <option value="">Elige tu curso 📚</option>
            <option value="1">1º de Primaria</option>
            <option value="2">2º de Primaria</option>
            <option value="3">3º de Primaria</option>
            <option value="4">4º de Primaria</option>
            <option value="5">5º de Primaria</option>
            <option value="6">6º de Primaria</option>
          </select>
        </div>

        <div className="form-card card-lavender">
          <div className="form-card-icon">🗓️</div>
          <label htmlFor="inputAnio" className="form-label">Año escolar</label>
          <input type="text" id="inputAnio" className="form-input" placeholder="Ej: 2025 – 2026" maxLength={12}
            value={profile.school_year} onChange={e => handleSave({ school_year: e.target.value })} />
        </div>

        <div className="form-card card-peach">
          <div className="form-card-icon">🏫</div>
          <label htmlFor="inputColegio" className="form-label">Mi colegio</label>
          <input type="text" id="inputColegio" className="form-input" placeholder="Nombre de tu cole 🏫" maxLength={50}
            value={profile.school_name} onChange={e => handleSave({ school_name: e.target.value })} />
        </div>
      </div>

      <div className="favorites-section">
        <h2 className="section-title text-center">💖 Mis Cosas Favoritas</h2>
        <div className="favorites-grid mt-4">
          <div className="fav-card">
            <span className="fav-emoji">🎵</span>
            <label>Canción favorita</label>
            <input type="text" className="form-input-sm" placeholder="Mi canción fav…"
              value={profile.favorites.musica} onChange={e => handleSave({ favorites: { ...profile.favorites, musica: e.target.value } })} />
          </div>
          <div className="fav-card">
            <span className="fav-emoji">📖</span>
            <label>Libro favorito</label>
            <input type="text" className="form-input-sm" placeholder="Mi libro fav…"
              value={profile.favorites.libro} onChange={e => handleSave({ favorites: { ...profile.favorites, libro: e.target.value } })} />
          </div>
          <div className="fav-card">
            <span className="fav-emoji">🎨</span>
            <label>Color favorito</label>
            <input type="text" className="form-input-sm" placeholder="Mi color fav…"
              value={profile.favorites.color} onChange={e => handleSave({ favorites: { ...profile.favorites, color: e.target.value } })} />
          </div>
          <div className="fav-card">
            <span className="fav-emoji">🌟</span>
            <label>Asignatura fav</label>
            <input type="text" className="form-input-sm" placeholder="Mi asig. fav…"
              value={profile.favorites.asig} onChange={e => handleSave({ favorites: { ...profile.favorites, asig: e.target.value } })} />
          </div>
          <div className="fav-card">
            <span className="fav-emoji">🐾</span>
            <label>Animal favorito</label>
            <input type="text" className="form-input-sm" placeholder="Mi animal fav…"
              value={profile.favorites.animal} onChange={e => handleSave({ favorites: { ...profile.favorites, animal: e.target.value } })} />
          </div>
          <div className="fav-card">
            <span className="fav-emoji">🍕</span>
            <label>Comida favorita</label>
            <input type="text" className="form-input-sm" placeholder="Mi comida fav…"
              value={profile.favorites.comida} onChange={e => handleSave({ favorites: { ...profile.favorites, comida: e.target.value } })} />
          </div>
        </div>
      </div>

      <div className="avatar-section">
        <h2 className="section-title">🖼️ Mi Foto o Dibujo</h2>
        <label className="avatar-upload-area block mx-auto mt-4">
          {!profile.avatar_url ? (
            <div className="avatar-placeholder mx-auto">
              <span className="avatar-emoji">🦄</span>
              <p>Toca para añadir tu foto o dibujo</p>
            </div>
          ) : (
            <img src={profile.avatar_url} className="avatar-img mx-auto" alt="Mi foto" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </label>
      </div>

      <div className="portada-footer mt-8">
        <p>¡Este es tu espacio mágico! ✨🌈💖</p>
      </div>
    </div>
  )
}
