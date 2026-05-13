import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f0ec] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="no-underline">
                        <div
                            className="text-4xl text-[#2a2826] font-light"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                            LoGan
                        </div>
                        <div className="text-[9px] tracking-[.22em] text-[#7a7672] mt-1 font-light">
                            PERFUMERÍA
                        </div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white border border-[#e4e0db] p-10">

                    <h1
                        className="text-2xl font-light text-[#2a2826] mb-1"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-[11px] tracking-[.06em] text-[#7a7672] font-light mb-8">
                        Inicia sesión para continuar
                    </p>

                    {error && (
                        <div className="border border-[#e4b0a0] bg-[#fdf0ec] text-[#8a3a2a] text-[11px] px-4 py-3 mb-6 font-light tracking-wide">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                CORREO ELECTRÓNICO
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                required
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                CONTRASEÑA
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2a2826] text-[#f4f0ec] py-3 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity"
                        >
                            INICIAR SESIÓN
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[11px] text-[#7a7672] font-light">
                        ¿No tienes cuenta?{' '}
                        <Link
                            to="/register"
                            className="text-[#b08070] hover:text-[#2a2826] transition-colors no-underline"
                        >
                            Regístrate
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}