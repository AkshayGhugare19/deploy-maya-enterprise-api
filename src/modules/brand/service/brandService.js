const Brand = require("../model");
const mongoose = require("mongoose");
const pick = require("../../../utils/pick");

const addBrand = async (body) => {
  try {
    const addResult = await Brand.create(body);

    if (addResult) {
      return { data: addResult, status: true, code: 201 };
    } else {
      return { data: "Brand not created", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getBrand = async () => {
  try {
    let filterQuery = { active: true };
    const brand = await Brand.find(filterQuery).populate('categoryId');;
    if (brand) {
      return { data: brand, status: true, code: 200 };
    } else {
      return { data: "Brand not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};
const getBrandById = async (id) => {
  try {
    let filterQuery = { _id: mongoose.Types.ObjectId(id)};
    const brand = await Brand.find(filterQuery).populate('categoryId');;
    if (brand) {
      return { data: brand, status: true, code: 200 };
    } else {
      return { data: "Brand not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getBrandsByCategoryId = async (categoryId) => {
  try {
    let filterQuery = { categoryId: mongoose.Types.ObjectId(categoryId)};
    const brands = await Brand.find(filterQuery).populate('categoryId');
    if (brands) {
      return { data: brands, status: true, code: 200 };
    } else {
      return { data: "Brands not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const updateBrand = async (req,res) => {
  const { id } = await pick(req.params, ['id'])
  try {
    let filterQuery = {
      _id: mongoose.Types.ObjectId(id),
      active: true,
    };

    const updatedResult = await Brand.findOneAndUpdate(
      filterQuery,
      req.body,
      { new: true }
    );
    if (updatedResult) {
      return { data: updatedResult, status: true, code: 200 };
    } else {
      return { data: "Brand not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const deleteBrand = async (id) => {
  try {
    let filterQuery = { _id: mongoose.Types.ObjectId(id), active: true };

    const updateResult = await Brand.findOneAndUpdate(
      filterQuery,
      { active: false },
      { new: true }
    );

    if (updateResult) {
      return { data: updateResult, status: true, code: 200 };
    } else {
      return { data: "Brand not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

module.exports = {
  getBrand,
  updateBrand,
  deleteBrand,
  addBrand,
  getBrandById,
  getBrandsByCategoryId,
};
