const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Hotels = sequelize.define(
  "Hotel",
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    starRating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    location: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    address: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    policies: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    contact: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive"]],
      },
    },
    createdBy: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: "Hotels",
    // If you're using PostgreSQL, you can add this for JSON fields:
    // dialectOptions: {
    //   useUTC: false,
    // },
  }
);

// Define associations
Hotels.associate = function (models) {
  Hotels.hasMany(models.Room, {
    foreignKey: "hotelId",
    as: "rooms",
    onDelete: "CASCADE", // Delete all rooms when hotel is deleted
  });
};

module.exports = Hotels;
