const express            = require('express');
const route              = express.Router();
const CadastroUsers = require('../controllers/cadastro_users_controller');
const LoginUsers = require('../controllers/login_users_controller');
const DeleteHeroisUsers = require('../controllers/insert_heroi_users_controller');
const InsertHeroisUsers = require('../controllers/delete_herois_controller');
const HeroisController   = require('../controllers/insert_herois_controller');

route.post('/login'              , LoginUsers.LoginUser);
route.post('/cadastro'          , CadastroUsers.CadastroUser);
route.post('/users-heroi'       , InsertHeroisUsers.CadastroDeHeroiAoUsuario);
route.delete('/users-heroi/delete', DeleteHeroisUsers.DeleteHeroisRelacionadosAoUsuario);
route.post('/cadastro_herois'   , HeroisController.postHerois);

module.exports = route;