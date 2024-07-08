const Category = require("../model");
const mongoose = require("mongoose");
const pick = require("../../../utils/pick");

const addCategory = async (body) => {
  try {
    const addResult = await Category.create(body);

    if (addResult) {
      return { data: addResult, status: true, code: 201 };
    } else {
      return { data: "Category not created", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getCategory = async () => {
  try {
    let filterQuery = { active: true };
    const category = await Category.find(filterQuery).populate('categoryId');
    console.log("category",category);
    if (category) {
      return { data: category, status: true, code: 200 };
    } else {
      return { data: "Category not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const updateCategory = async (req, res) => {
  const { id } = await pick(req.params, ['id'])
  try {
    let filterQuery = {
      _id: mongoose.Types.ObjectId(id),
      active: true,
    };

    const updatedResult = await Category.findOneAndUpdate(
      filterQuery,
      req.body,
      { new: true }
    );
    if (updatedResult) {
      return { data: updatedResult, status: true, code: 200 };
    } else {
      return { data: "Category not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const deleteCategory = async (id) => {
  try {
    let filterQuery = { _id: mongoose.Types.ObjectId(id), active: true };

    const updateResult = await Category.findOneAndUpdate(
      filterQuery,
      { active: false },
      { new: true }
    );

    if (updateResult) {
      return { data: updateResult, status: true, code: 200 };
    } else {
      return { data: "Category not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

module.exports = {
  getCategory,
  updateCategory,
  deleteCategory,
  addCategory,
};
