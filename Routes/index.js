const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const categoryRoutes = require("./categoryRoutes");
const subCategoryRoutes = require("./subCategoryRoutes");
const vendorRoutes = require("./vendorRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const brandRoutes = require("./brandRoutes");
const orderRoutes = require("./orderRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const AnnouncementRoutes = require("./AnnouncementRoutes");
const customerRoutes = require("./customerRoutes");
const offerRoutes = require("./offerRoutes");
const reviewRoutes = require("./reviewRoutes");
const faqRoutes = require("./faqRoutes");
const blogRoutes = require("./blogRoutes");
const termsAndConditionRoutes = require("./termsAndConditionRoutes");
const aboutUsRoutes = require("./aboutUsRoutes");
const careerRoutes = require("./careerRoutes");
const bannerRoutes = require("./bannerRoutes");
const all = [].concat(userRoutes, adminRoutes, categoryRoutes,
    subCategoryRoutes, vendorRoutes,
    productRoutes, cartRoutes, brandRoutes,
    orderRoutes, wishlistRoutes, AnnouncementRoutes,
    customerRoutes, offerRoutes, reviewRoutes,
    faqRoutes, blogRoutes, termsAndConditionRoutes, aboutUsRoutes, careerRoutes, bannerRoutes);

module.exports = all;