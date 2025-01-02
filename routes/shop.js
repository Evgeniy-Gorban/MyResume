const express = require("express");
const router = express.Router();
const shopController = require("../controllers/Shop/shop");
const adminController = require("../controllers/Shop/admin");
const { checkAuth, checkAdmin } = require("../middleware/checkAuth");
const uploadProfileImage = require('../middleware/uploadProfileImage')
const uploadProductImage = require('../middleware/uploadProductImage')

router.get("/", checkAuth, shopController.viewShopGet);

router.get("/profile/:username", checkAuth, shopController.profileShopGet);
router.post("/profile/upload/:username", uploadProfileImage.single("profilePhoto"), checkAuth, shopController.profilePhotoPost)

router.post("/product/add", checkAuth, shopController.addToCartPost);
router.put("/product/update", checkAuth, shopController.updateProductToCartPut);
router.delete("/product/delete", checkAuth, shopController.removeProductToCartDelete);

router.get("/placing-order", checkAuth, shopController.placingOrderGet);

router.get("/admin/panel", checkAuth, checkAdmin, adminController.adminPanelGet);
router.get("/admin/product/add", checkAuth, checkAdmin, adminController.addProductGet);
router.post("/admin/product/add", uploadProductImage.single("productImg"), checkAuth, checkAdmin, adminController.addProductPost);
router.delete("/admin/user/delete/:userId", checkAuth, checkAdmin, adminController.deleteUserDelete);
router.delete("/admin/cart/product/delete/:userId/:productId", checkAuth, checkAdmin, adminController.deleteProductFromCartDelete);
router.delete("/admin/product/delete/:productId", checkAuth, checkAdmin, adminController.deleteProductDelete);
router.get("/admin/product/edit/:productId", checkAuth, checkAdmin, adminController.editProductGet);
router.put("/admin/product/edit/:productId", uploadProductImage.single("productImg"), checkAuth, checkAdmin, adminController.editProductPut);

module.exports = router;
