const pick = require("../../../utils/pick");
const { getConfigForCheckout } = require("../../globalConfig/service/globalconfig.service");
const Order = require("../model");
const mongoose = require("mongoose");

const addOrder = async (body) => {
  try {
    const addResult = await Order.create(body);

    if (addResult) {
      return { data: addResult, status: true, code: 201 };
    } else {
      return { data: "Order not created", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getOrderByUser = async (userId) => {
  try {
    let userObjectId = mongoose.Types.ObjectId(userId);

    const orders = await Order.aggregate([
      {
        $match: {
          userId: userObjectId,
          mode:"order"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems"
        }
      },
      {
        $unwind: {
          path: "$orderItems",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "orderItems.productDetails"
        }
      },
      {
        $unwind: {
          path: "$orderItems.productDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "prescriptions",
          localField: "prescriptionId",
          foreignField: "_id",
          as: "prescriptionDetails"
        }
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "addressDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$addressDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$prescriptionDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: "$_id",
          status: { $first: "$status" },
          mode: { $first: "$mode" },
          orderType: { $first: "$orderType" },
          totalPayment: { $first: "$totalPayment" },
          // paymentMethod: { $first: "$paymentMethod" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          userDetails: { $first: "$userDetails" },
          addressDetails: { $first: "$addressDetails" },
          prescriptionDetails: { $first: "$prescriptionDetails" },
          orderItems: { $push: "$orderItems" }
        }
      },
      {
        $match: {
          $and: [
            { orderItems: { $exists: true } },
            { $expr: { $gt: [{ $size: "$orderItems" }, 0] } }, // Ensure orderItems array has at least one element
            { $expr: { $gt: [{ $size: { $objectToArray: { $arrayElemAt: ["$orderItems", 0] } } }, 0] } } // Check if the first element in orderItems is not an empty object
          ]
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          mode: 1,
          orderType:1,
          totalPayment: 1,
          // paymentMethod: 1,
          createdAt: 1,
          updatedAt: 1,
          orderItems: 1,
          userDetails: 1,
          addressDetails: 1,
          prescriptionDetails: 1
        }
      }
    ]);




    if (orders && orders.length > 0) {
      return { data: orders, status: true, code: 200 };
    } else {
      return { data: "Orders not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};
const getOrderById = async (id) => {
  try {
    let orderId = mongoose.Types.ObjectId(id);

    const orders = await Order.aggregate([
      { $match: { _id: orderId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "addressDetails",
        },
      },
      {
        $lookup: {
          from: 'prescriptions',
          localField: 'prescriptionId',
          foreignField: '_id',
          as: 'prescriptionData',
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'orderItemData',
        },
      },
      {
        $unwind: {
          path: '$prescriptionData',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$addressDetails", preserveNullAndEmptyArrays: true } },
      // {
      //   $unwind: { path: '$orderItemData', preserveNullAndEmptyArrays: true }
      // },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItemData.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      // {
      //   $addFields: {
      //     'orderItemData.productDetails': { $arrayElemAt: ['$productDetails', 0] },
      //   },
      // },
      {
        $addFields: {
          orderItemData: {
            $map: {
              input: '$orderItemData',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    productDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$productDetails',
                            as: 'pd',
                            cond: { $eq: ['$$pd._id', '$$item.productId'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          orderItemData: {
            $map: {
              input: '$orderItemData',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    total_price: {
                      $multiply: [
                        '$$item.quantity',
                        { $ifNull: ['$$item.productDetails.discountedPrice', 0] }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          enquiryStatus: 1,
          mode: 1,
          durationUnit: 1,
          durationOfDosage: 1,
          enquiryType: 1,
          userId: 1,
          addressId: 1,
          prescriptionId: 1,
          totalPayment: 1,
          createdAt: 1,
          updatedAt: 1,
          userDetails: 1,
          prescriptionData: 1,
          addressDetails: 1,
          orderItemData: 1
        }
      }
    ]);
    console.log("orders", orders);
    console.log("orderItemData", orders[0].orderItemData);
    let totalCartAmount = 0;
    let cartAmount = 0;
    const globalConfigData = await getConfigForCheckout();
    if (globalConfigData) {
      // console.log("globalConfigData", globalConfigData);
      const { deliveryCharges, packagingCharges } = globalConfigData?.config[0];
      totalCartAmount = orders[0].orderItemData.reduce((sum, order) => sum + order.total_price, 0);
      cartAmount = totalCartAmount;
      console.log("charges", deliveryCharges, packagingCharges);
      totalCartAmount += deliveryCharges || 0;
      totalCartAmount += packagingCharges || 0;
    }
    // console.log("carts", orders);
    orders.forEach(order => {
      order.totalCartAmount = totalCartAmount;
      order.cartAmount = cartAmount;
    });
    console.log("orders", orders);
    // await orders.save();
    if (orders && orders.length > 0) {
      return { data: orders, status: true, code: 200 };
    } else {
      return { data: "Orders not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getAllOrders = async (page, limit) => {
  console.log(page, limit);
  try {
    // Ensure page and limit are valid numbers, and set defaults if not provided
    const length = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const start = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const skip = (start - 1) * length;
    const sortQuery = { _id: -1 };

    // Aggregation pipeline
    const pipeline = [
      { $match: { mode: 'order' } },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: length },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'prescriptions',
          localField: 'prescriptionId',
          foreignField: '_id',
          as: 'prescriptionData',
        },
      },
      {
        $unwind: {
          path: '$prescriptionData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData',
        },
      },
      {
        $unwind: {
          path: '$addressData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          mode: 1,
          userId: 1,
          addressId: 1,
          prescriptionId: 1,
          totalPayment: 1,
          createdAt: 1,
          updatedAt: 1,
          userData: 1,
          prescriptionData: 1,
          addressData: 1,
        },
      },
    ];

    // Execute the aggregation pipeline
    const listResult = await Order.aggregate(pipeline);
    const totalResults = await Order.countDocuments();
    const totalPages = Math.ceil(totalResults / length);

    // Check if orders are found and return appropriate response
    if (listResult.length > 0) {
      return {
        data: listResult,
        totalResults,
        totalPages,
        page: start,
        limit: length,
        status: true,
        code: 200,
      };
    } else {
      return { data: "Orders not found", status: false, code: 404 };
    }
  } catch (error) {
    // Return error response
    return { data: error.message, status: false, code: 500 };
  }
};




const updateOrder = async (req, res) => {
  const { id } = await pick(req.params, ["id"]);
  try {
    let filterQuery = {
      _id: mongoose.Types.ObjectId(id),
    };

    const updatedResult = await Order.findOneAndUpdate(filterQuery, req.body, {
      new: true,
    });
    if (updatedResult) {
      return { data: updatedResult, status: true, code: 200 };
    } else {
      return { data: "Order not found", status: false, code: 400 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};


const getAllOrdersEnquiries = async (page, limit) => {
  console.log(page, limit);
  try {
    const length = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const start = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const skip = (start - 1) * length;
    const sortQuery = { _id: -1 };

    const pipeline = [
      { $match: { mode: 'enquiry' } },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: length },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'prescriptions',
          localField: 'prescriptionId',
          foreignField: '_id',
          as: 'prescriptionData',
        },
      },
      {
        $unwind: {
          path: '$prescriptionData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData',
        },
      },
      {
        $unwind: {
          path: '$addressData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'orderItemData',
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          enquiryStatus: 1,
          mode: 1,
          durationUnit: 1,
          durationOfDosage: 1,
          enquiryType: 1,
          userId: 1,
          addressId: 1,
          prescriptionId: 1,
          totalPayment: 1,
          createdAt: 1,
          updatedAt: 1,
          userData: 1,
          prescriptionData: 1,
          addressData: 1,
          orderItemData: 1,
        },
      },
    ];

    const listResult = await Order.aggregate(pipeline);
    const totalResults = listResult?.length;
    const totalPages = Math.ceil(totalResults / length);

    if (listResult.length > 0) {
      return {
        data: listResult,
        totalResults,
        totalPages,
        page: start,
        limit: length,
        status: true,
        code: 200,
      };
    } else {
      return { data: "Orders not found", status: false, code: 404 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

const getAllUserEnquiries = async (page, limit, userId) => {
  let userObjectId = mongoose.Types.ObjectId(userId);
  console.log(page, limit);
  try {
    const length = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const start = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const skip = (start - 1) * length;
    const sortQuery = { _id: -1 };

    // Aggregation pipeline
    const pipeline = [
      { $match: { mode: 'enquiry', userId: userObjectId } },
      { $sort: sortQuery },
      { $skip: skip },
      { $limit: length },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData',
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'prescriptions',
          localField: 'prescriptionId',
          foreignField: '_id',
          as: 'prescriptionData',
        },
      },
      {
        $unwind: {
          path: '$prescriptionData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData',
        },
      },
      {
        $unwind: {
          path: '$addressData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'orderItemData',
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          enquiryStatus: 1,
          mode: 1,
          durationUnit: 1,
          durationOfDosage: 1,
          enquiryType: 1,
          userId: 1,
          addressId: 1,
          prescriptionId: 1,
          totalPayment: 1,
          createdAt: 1,
          updatedAt: 1,
          userData: 1,
          prescriptionData: 1,
          addressData: 1,
          orderItemData: 1,
        },
      },
    ];

    const listResult = await Order.aggregate(pipeline);
    const totalResults = listResult?.length;
    const totalPages = Math.ceil(totalResults / length);

    if (listResult.length > 0) {
      return {
        data: listResult,
        totalResults,
        totalPages,
        page: start,
        limit: length,
        status: true,
        code: 200,
      };
    } else {
      return { data: "Enquiries not found", status: false, code: 404 };
    }
  } catch (error) {
    return { data: error.message, status: false, code: 500 };
  }
};

module.exports = {
  addOrder,
  getOrderByUser,
  getOrderById,
  getAllOrders,
  updateOrder,
  getAllOrdersEnquiries,
  getAllUserEnquiries
};
