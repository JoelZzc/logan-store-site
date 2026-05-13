import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await register(name, email, password, passwordConfirmation);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse');
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
                        Crear cuenta
                    </h1>
                    <p className="text-[11px] tracking-[.06em] text-[#7a7672] font-light mb-8">
                        Regístrate para disfrutar de beneficios exclusivos
                    </p>

                    {error && (
                        <div className="border border-[#e4b0a0] bg-[#fdf0ec] text-[#8a3a2a] text-[11px] px-4 py-3 mb-6 font-light tracking-wide">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                NOMBRE
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                required
                            />
                        </div>

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

                        <div className="mb-5">
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

                        <div className="mb-8">
                            <label className="block text-[10px] tracking-[.1em] text-[#7a7672] mb-2 font-light">
                                CONFIRMAR CONTRASEÑA
                            </label>
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full px-4 py-3 border border-[#e4e0db] text-[#2a2826] text-sm font-light bg-white focus:outline-none focus:border-[#7a7672] transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2a2826] text-[#f4f0ec] py-3 text-[11px] tracking-[.16em] font-light hover:opacity-80 transition-opacity"
                        >
                            CREAR CUENTA
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[11px] text-[#7a7672] font-light">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-[#b08070] hover:text-[#2a2826] transition-colors no-underline"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}