const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const  categoryService  = require("../service/categoryService");
const { sendResponse } = require("../../../utils/responseHandler");
const pick = require("../../../utils/pick");

const addCategory = catchAsync(async (req, res) => {
  const body = req.body;
  const category = await categoryService.addCategory(body);
  if (category.status) {
    sendResponse(res, httpStatus.CREATED, category.data, null);
  } else {
    if (category.code == 400) {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    } else if (category.code == 500) {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, category.data);
    } else {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    }
  }
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategory();
  if (category.status) {
    sendResponse(res, httpStatus.OK, category.data, null);
  } else {
    if (category.code == 400) {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    } else if (category.code == 500) {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, category.data);
    } else {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    }
  }
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req, res);
  if (category.status) {
    sendResponse(res, httpStatus.OK, category.data, null);
  } else {
    if (category.code == 400) {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    } else if (category.code == 500) {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, category.data);
    } else {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    }
  }
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = await pick(req.params, ['id'])
  const category = await categoryService.deleteCategory(id);
  if (category.status) {
    sendResponse(res, httpStatus.OK, category.data, null);
  } else {
    if (category.code == 400) {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    } else if (category.code == 500) {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, category.data);
    } else {
      sendResponse(res, httpStatus.BAD_REQUEST, null, category.data);
    }
  }
});

module.exports = {
  getCategory,
  updateCategory,
  deleteCategory,
  addCategory,
};
