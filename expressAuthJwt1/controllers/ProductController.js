import ProductModel from "../models/Product.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";

class ProductController {
  static ProductRegistration = async (req, res) => {
    const {
      productName,
      productCode,
      productQuantity,
      productPrice,
      productDate,
      productRegister,
      productAccount,
      productOwner,
      tc,
    } = req.body;
    const product = await ProductModel.findOne({
      productName: productName,
      productCode: productCode,
      productQuantity: productQuantity,
      productPrice: productPrice,
      productDate: productDate,
      productRegister: productRegister,
      productAccount: productAccount,
      productOwner: productOwner,
    });
    if (product) {
      res.send({ status: "failed", message: "product already exists" });
    } else {
      if (
        productName &&
        productCode &&
        productQuantity &&
        productPrice &&
        productDate &&
        productRegister &&
        productAccount &&
        productOwner &&
        tc
      ) {
        if (productName) {
          try {
            const salt = await bcrypt.genSalt(10);
            const doc = new ProductModel({
              productCode: productCode,
              productQuantity: productQuantity,
              productPrice: productPrice,
              productDate: productDate,
              productRegister: productRegister,
              productAccount: productAccount,
              productOwner: productOwner,
              tc: tc,
            });
            await doc.save();
            const saved_product = await ProductModel.findOne({
              productCode: productCode,
              productQuantity: productQuantity,
              productPrice: productPrice,
              productDate: productDate,
              productRegister: productRegister,
              productAccount: productAccount,
              productOwner: productOwner,
            });
            // Generate JWT Token
            const token = jwt.product(
              { productID: saved_product._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "success",
              message: "Registration Success",
              token: token,
            });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "Unable to Register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and Confirm Password doesn't match",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    }
  };
}
export default ProductController;
