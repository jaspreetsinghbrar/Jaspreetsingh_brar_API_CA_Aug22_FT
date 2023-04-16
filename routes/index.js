var express = require('express');
var router = express.Router();
const indexController = require('../controllers/todo');
const categoryController = require('../controllers/category');
const auth = require('../middleware/auth');

/* GET home page. */
router.get('/', auth.authenticateToken, indexController.viewTodo);
router.post('/create', auth.authenticateToken, indexController.insertTodo);
router.put('/edit', auth.authenticateToken, indexController.editTodo);
router.delete('/delete', auth.authenticateToken, indexController.deleteTodo);

router.get('/category', auth.authenticateToken, categoryController.viewCategory);
router.post('/category/create', auth.authenticateToken, categoryController.insertCategory);
router.put('/category/edit', auth.authenticateToken, categoryController.editCategory);
router.delete('/category/delete', auth.authenticateToken, categoryController.deleteCategory);


module.exports = router;
