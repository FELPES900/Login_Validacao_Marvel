const express = require('express');
const router = express.Router();
const CadastroUsers = require('../controllers/cadastro_users_controller');
const LoginUsers = require('../controllers/login_users_controller');
const DeleteHeroisUsers = require('../controllers/insert_heroi_users_controller');
const InsertHeroisUsers = require('../controllers/delete_herois_controller');
const HeroisController = require('../controllers/insert_herois_controller');

router.get('/login', (req, res) => { LoginUsers.LoginUser });
router.post('/cadastro', (req, res) => { CadastroUsers.CadastroUser });
router.post('/users-heroi', (req, res) => { InsertHeroisUsers.CadastroDeHeroiAoUsuario });
router.delete('/users-heroi/delete', (req, res) => { DeleteHeroisUsers.DeleteHeroisRelacionadosAoUsuario });
router.post('/cadastro_herois', (req, res) => { HeroisController.postHerois });

module.exports = router;