const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
require('dotenv').config();
const db = require('../models/index');

exports.viewTodo = async (req, res) => {

  try {

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    const todos = await db.Todo.findAll({ where: { UserId: userId } });

    if (!todos) {
      res.status(404).json({
        status: "fail",
        message: "No todos found for the user"
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { todos: todos }
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: 'Internal server error' , error: err});
  }
};

exports.insertTodo = async (req, res) => {
  const { name, category } = req.body;

  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const userId = decodedToken.userId;

  const todoCategory = await db.Category.findOne({ where: { name: category } });

  try {
    const todos = await db.Todo.create({
      name: name,
      CategoryId: todoCategory.id,
      UserId: userId
    });

    res.status(201).json(todos);

  }
  catch (err) {
    res.status(400).json({ status: "error", message: 'Error creating todo', error: err });
  }

};

exports.editTodo = async (req, res) => {
  const { name, todoName } = req.body;

  try {
    const result = await db.Todo.update(
      {
        name: name,
      },
      {
        where: {
          name: todoName,
        }
      }
    );

    if (result[0] === 1) {
      res.status(200).json({ status: "success", message: "Todo updated successfully" });
    } else {
      res.status(404).json({ status: "fail", message: "Todo not found or user does not have permission" });
    }
  }
  catch (err) {
    res.status(400).json({ status: "error", message: 'Error updating todo', error: err });
  }

};

exports.deleteTodo = async (req, res) => {
  const { todoName } = req.body;

  db.Todo.destroy(
    {
      where: {
        name: todoName,
      }
    }
  )
    .then(result => {
      if (result === 1) {
        res.status(200).json({ status: "success", message: "Todo deleted successfully" });
      } else {
        res.status(404).json({ status: "fail", message: "Todo not found or user does not have permission" });
      }
    })
    .catch(err => {
      res.status(400).json({ status: "error", message: 'Error deleting todo', error: err });
    });
};

