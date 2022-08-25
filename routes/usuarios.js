const express            = require('express');
const route              = express.Router();
const UsuariosController = require('../controllers/usuarios_controller');
const HeroisController   = require('../controllers/insert_herois_controller');

route.post('/login'              , UsuariosController.LoginUser);
route.post('/cadastro'          , UsuariosController.CadastroUser);
route.post('/users-heroi'       , UsuariosController.CadastroDeHeroiAoUsuario);
route.post('/users-heroi/delete', UsuariosController.DeleteHeroisRelacionadosAoUsuario);
route.post('/cadastro_herois'   , HeroisController.postHerois);

module.exports = route;