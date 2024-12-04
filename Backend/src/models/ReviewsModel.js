import { getOne, insertSingleRow, updateRow, deleteRow, getAll } from '~/database/query';
// import { connection } from '~/config/connectDatabase';


async function getReviews(buyer_id) {
  let reviews = await getAll('reviews', { buyer_id } )
    .then((rows) => {
      return rows;
    })
    .catch((err) => {
      throw err;
    });
  return reviews;
}

async function createReviews(data) {
  return await insertSingleRow('reviews', data);
}

async function getOrderById(order_id) {
  try {
    const order = await getOne('orders', 'order_id', order_id);
    return order[0];
  } catch (error) {
    throw new Error(`Lỗi khi lấy đơn hàng với order_id: ${order_id} - ${error.message}`);
  }
}

async function updateReview(buyer_id, product_id, data) {
  const conditions = { buyer_id: buyer_id, product_id: product_id, order_id: data.order_id };
  return await updateRow('reviews', conditions, data);
}

async function deleteReview(buyer_id, product_id, order_id) {
  const conditions = { buyer_id: buyer_id, product_id: product_id, order_id: order_id };
  return await deleteRow('reviews', conditions);
}

async function getReviewsByRate(rate) {
  try {
    const reviews = await getAll('reviews', { rate });
    return reviews;
  } catch (error) {
    throw new Error(`Lỗi khi lấy nhận xét với rate ${rate}: ${error.message}`);
  }
}
export const ReviewsModel = {
  getReviews,
  createReviews,
  updateReview,
  deleteReview,
  getOrderById,
  getReviewsByRate
};