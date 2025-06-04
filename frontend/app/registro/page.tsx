'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RegisterRequest {
    username: string;
    password1: string;
    password2: string;
    csrfToken: string;
}

export default function Registro() {
    const [username, setUsername] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [csrfToken, setCsrfToken] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    // Obtener el CSRF token al cargar la página
    useEffect(() => {
        const getCsrfToken = async () => {
            try {
                const response = await fetch('http://localhost:3000/csrf-token');
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                setError('Error al obtener token CSRF');
            }
        };
        getCsrfToken();
    }, []);

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
            const request: RegisterRequest = {
                username,
                password1,
                password2,
                csrfToken
            };

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Error en el registro');
                return;
            }

            setMensaje(data.message || 'Registro exitoso');
            setUsername('');
            setPassword1('');
            setPassword2('');
            router.push('/'); // Redirección a la página principal
        } catch (error) {
            setError('Error al registrar usuario');
        }
    };

    return (
        <div>
            <h2>Registro</h2>

            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Nombre de usuario:</label>
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
                    <label htmlFor="password1">Contraseña:</label>
                    <input
                        type="password"
                        id="password1"
                        value={password1}
                        onChange={e => setPassword1(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password2">Repetir contraseña:</label>
                    <input
                        type="password"
                        id="password2"
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                        required
                    />
                </div>

                <input type="hidden" value={csrfToken} />

                <button type="submit">Crear cuenta</button>
            </form>
        </div>
    );
}
