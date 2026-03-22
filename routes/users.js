const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - Registrar usuário
router.post('/register', userController.register);

// POST /api/users/login - Login de usuário
router.post('/login', userController.login);

// GET /api/users/:id - Buscar perfil do usuário
router.get('/:id', userController.getProfile);

// PUT /api/users/:id - Atualizar perfil
router.put('/:id', userController.updateProfile);

module.exports = router;