import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: String, // название продукта
    price: String, // цена продукта
    img: String, // ссылка на фотографию продукта
    cat_id: Number, // айди категории
    item_id: Number, // айди продукта в категории
});

const Product = model('Product', productSchema);
export default Product;