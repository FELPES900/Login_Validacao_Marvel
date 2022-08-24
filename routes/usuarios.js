const express            = require('express');
const route              = express.Router();
const UsuariosController = require('../controllers/usuarios_controller');
const HeroisController   = require('../controllers/insert_herois_controller');

route.post('/cadastro_herois', HeroisController.postHerois);
route.post('/cadastro'    , UsuariosController.CadastroUser);
route.post('/login'       , UsuariosController.LoginUser);
route.post('/users-heroi' , UsuariosController.CadastroDeHeroiAoUsuario);

module.exports = route;