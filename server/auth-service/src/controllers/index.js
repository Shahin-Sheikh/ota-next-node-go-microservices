const customerAuthController = require("./customer-auth.controller");
const serviceAuthController = require("./service-auth.controller");
const tokenController = require("./token.controller");
const serviceInitController = require("./service-init.controller");

module.exports = {
  ...customerAuthController,
  ...serviceAuthController,
  ...tokenController,
  ...serviceInitController,
};
