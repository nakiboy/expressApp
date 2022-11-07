import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import nodemailer from "nodemailer";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: "failed", message: "Имайл бүртгэлтэй" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
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
            res.send({ status: "failed", message: "Бүртгэх боломжгүй" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Нууц үг болон баталгаажуулах нууц үг таарахгүй байна",
          });
        }
      } else {
        res.send({ status: "failed", message: "Мэдээлэл оруулна уу?" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate JWT Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "Login Success",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Имайл эсвэл нууц үг буруу",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "Бүртгэлгүй хэрэглэгч байна",
          });
        }
      } else {
        res.send({ status: "failed", message: "Мэдээлэл оруулаагүй байна" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Нэвтрэх боломжгүй" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message:
            "Шинэ нууц үг болон баталгаажуулах шинэ нууц үг таарахгүй байна",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
        res.send({
          status: "success",
          message: "Нууц үг амжилттай солигдсон",
        });
      }
    } else {
      res.send({ status: "failed", message: "Мэдээлэл оруулаагүй байна" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://10.0.0.36:3000/api/user/reset/${user._id}/${token}`;
        console.log(link);
        // Send Email
        // let info = await transporter.sendMail({
        //   from: process.env.EMAIL_FROM,
        //   to: user.email,
        //   subject: "Inventory - Password Reset Link",
        //   html: `<a href=${link}>Click Here</a> to Reset Your Password`,
        // });
        let transporter = nodemailer.createTransport({
          host: "",
          port: "3000",
          auth: {
            user: "......",
            pass: "......",
          },
          secureConnection: false,
          tls: { ciphers: "SSLv3" },
        });

        res.send({
          status: "success",
          message: "Нууц үг өөрчлөх код илгээсэн Имайлээ шалгана уу?",
        });
      } else {
        res.send({ status: "failed", message: "Бүртгэлгүй Имайл байна" });
      }
    } else {
      res.send({ status: "failed", message: "Имайл шаардлагтай" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message:
              "Шинэ нууц үг болон баталгаажуулах шинэ нууц үг таарахгүй байна",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "success",
            message: "Нууц үгээ амжилттай сэргээлээ",
          });
        }
      } else {
        res.send({ status: "failed", message: "Мэдээлэл оруулаагүй байна" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Буруу" });
    }
  };
}

export default UserController;
