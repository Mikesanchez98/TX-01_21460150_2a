const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const dotenv = require('dotenv');
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sha1 = require('sha1');

dotenv.config();

const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const users = [
    {username: 'admin', password: '123'}
];

const sessions = {};
const secureCookieOptions = () => ({
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
});

const app = express();
//busca el header cookie 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

//endpoint hacia raiz que solo envia un hello world 
app.get('/', (req,res)=>{
    res.send('Hello world Miki!');
});

//endpoint hacia csrf-token que envia un token aleatorio nuevo cada que refresca
app.get("/csrf-token", (req,res) => {
    const csrfToken = new csrf().create(SECRET_KEY);
    res.json({csrfToken});
});

app.post('/login', async (req, res) =>{
    const { username, password, csrfToken} = req.body;

    // Validar CSRF token
    if (!csrf().verify(SECRET_KEY, csrfToken)){
        return res.status(403).json({error: 'Token CSRF inválido'});
    } 

    // Validar campos
    if (!username || !password){
        return res.status(400).json({error: 'Usuario y Contraseña son requeridos.'});
    }

    // Normalizar y hashear el nombre de usuario
    const normalizedUsername = username.toLowerCase();
    const hashedUsername = sha1(normalizedUsername);

    // Buscar el usuario en la "base de datos"
    const user = users.find(user => user.username === hashedUsername);
    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }
    // Comparar contraseña hasheada con bcrypt
    const passwordHash = await bcrypt.compare(password, user.password);
    if (!passwordHash) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const sessionId = crypto.randomBytes(16).toString('base64url');
    sessions[sessionId] = {username};
    res.cookie('sessionId', sessionId, secureCookieOptions());
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
});

// Regex para validar el nombre de usuario
const regexpUsuario = /^[a-zA-Z][0-9a-zA-Z]{5,49}$/;

// Función para validar que la contraseña sea segura
function validarPassword(password) {
    return (
        password.length >= 10 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9\s]/.test(password)
    );
}

// Endpoint para registrar usuarios
app.post('/register', async (req, res) => {
    const { username, password1, password2, csrfToken } = req.body;

    // Validar el token CSRF
    if (!csrf().verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Token CSRF inválido' });
    }

    // Validar campos obligatorios
    if (!username || !password1 || !password2) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar que las contraseñas coincidan
    if (password1 !== password2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Validar el formato del nombre de usuario
    if (!regexpUsuario.test(username)) {
        return res.status(400).json({ error: 'Nombre de usuario inválido. Debe tener entre 6 y 50 caracteres, comenzar con letra y solo contener letras y números.' });
    }

    // Validar la seguridad de la contraseña
    if (!validarPassword(password1)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un símbolo.' });
    }

    // Normalizar el username y verificar si ya existe
    const normalizedUsername = username.toLowerCase();
    const hashedUsername = sha1(normalizedUsername);

    const userExists = users.find(user => user.username === hashedUsername);
    if (userExists) {
        return res.status(409).json({ error: 'Este nombre de usuario ya está registrado.' });
    }

    // Hashear la contraseña de forma segura
    const hashedPassword = await bcrypt.hash(password1, 10);

    // Guardar el nuevo usuario en memoria (username ya viene hasheado)
    users.push({ username: hashedUsername, password: hashedPassword });

    // Crear sesión automáticamente
    const sessionId = crypto.randomBytes(16).toString('base64url');
    sessions[sessionId] = { username: normalizedUsername }; // Se guarda la versión normalizada (no el hash)
    res.cookie('sessionId', sessionId, secureCookieOptions());

    // Enviar mensaje de éxito
    res.status(201).json({ message: 'Feliciades, el usuario fue registrado exitosamente' });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/login`);
});