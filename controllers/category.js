const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
require('dotenv').config();
const db = require('../models/index');


exports.insertCategory = async (req, res) => {
    const { name } = req.body;
  
    const todoCategory = await db.Category.findOne({ where: { name: name ?? null } });
  
    if(todoCategory){
      res.status(404).json({ status: "fail", message: "Category already existed!" });
      return;
    }
  
    try {
      const category = await db.Category.create({
        name: name,
      });
  
      res.status(201).json({ status: "success", message: "Category created successfully" });
    }
    catch (err) {
      res.status(400).json({ status: "error", message: 'Error creating category', error: err });
    }
  
  };

  exports.viewCategory = async (req, res) => {

    try {
      const categories = await db.Category.findAll();
  
      if (!categories) {
        res.status(404).json({
          status: "fail",
          message: "No categories found"
        });
        return;
      }
  
      res.status(200).json({
        status: "success",
        data: { categories: categories }
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: 'Internal server error' , error: err});
    }
  };

  
exports.editCategory = async (req, res) => {
    const { name, categoryName } = req.body;
  
    try {
      const result = await db.Category.update(
        {
          name: name,
        },
        {
          where: {
            name: categoryName,
          }
        }
      );
  
      if (result[0] === 1) {
        res.status(200).json({ status: "success", message: "Category updated successfully" });
      } else {
        res.status(404).json({ status: "fail", message: "Category not found or user does not have permission" });
      }
    }
    catch (err) {
      res.status(400).json({ status: "error", message: 'Error updating Category', error: err });
    }
  
  };

  exports.deleteCategory = async (req, res) => {
    const { categoryName } = req.body;
  
    db.Category.destroy(
      {
        where: {
          name: categoryName,
        }
      }
    )
      .then(result => {
        if (result === 1) {
          res.status(200).json({ status: "success", message: "Category deleted successfully" });
        } else {
          res.status(404).json({ status: "fail", message: "Category not found or user does not have permission" });
        }
      })
      .catch(err => {
        res.status(400).json({ status: "error", message: 'Error deleting Category', error: err });
      });
  };