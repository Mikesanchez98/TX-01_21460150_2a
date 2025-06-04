'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface LoginRequest {
    username: string;
    password: string;
    csrfToken: string;
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/csrf-token');
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (err) {
                setError('Error al obtener token CSRF');
            }
        };
        getCsrfToken();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        

        try {
            const request: LoginRequest = { username, password, csrfToken };
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error al iniciar sesión');
                return;
            }

            setMensaje(data.message || 'Inicio de sesión exitoso');
            router.push('/'); // Redirección a la página principal

        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <div>
            <h2>Login</h2>

            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <input type="hidden" id="csrfToken" value={csrfToken} />
                <button type="submit">Iniciar sesión</button>
            </form>

            <div style={{ marginTop: '1rem' }}>
                <Link href="/registro">
                    ¿No tienes cuenta? <strong>Regístrate aquí</strong>
                </Link>
            </div>
        </div>
    );
}
