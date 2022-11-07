import mongoose from "mongoose";

// Defining Schema
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  productCode: { type: String, required: true, trim: true },
  productQuantity: { type: String, required: true, trim: true },
  productPrice: { type: String, required: true, trim: true },
  productDate: { type: String, required: true, trim: true },
  productRegister: { type: String, required: true, trim: true },
  productAccount: { type: String, required: true, trim: true },
  productOwner: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
});

// Model
const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;
