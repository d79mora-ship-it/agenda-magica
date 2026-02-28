import { login, signup } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-4">
            {params.error && (
                <div className="mb-4 bg-red-100 text-red-600 px-6 py-3 rounded-xl shadow-sm border border-red-200">
                    Oops! Error: {params.error}
                </div>
            )}
            <form className="bg-white/80 p-8 rounded-3xl shadow-xl backdrop-blur-sm w-full max-w-sm border-2 border-pink-100">
                <h1 className="text-3xl font-extrabold text-purple-900 text-center mb-2">Mi Agenda Mágica</h1>
                <p className="text-center text-purple-500 font-semibold mb-8">Entra a tu espacio especial ✨</p>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-gray-700 text-sm" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 outline-none focus:border-purple-400 bg-white"
                            placeholder="yo@ejemplo.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-gray-700 text-sm" htmlFor="password">Palabra secreta</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 outline-none focus:border-purple-400 bg-white"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button formAction={login} className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                        Entrar 🌈
                    </button>
                    <button formAction={signup} className="w-full py-3 bg-white text-purple-500 font-bold rounded-xl border-2 border-purple-200 shadow-sm hover:bg-purple-50 transition-all">
                        Nueva cuenta ✍️
                    </button>
                </div>
            </form>
        </div>
    )
}
