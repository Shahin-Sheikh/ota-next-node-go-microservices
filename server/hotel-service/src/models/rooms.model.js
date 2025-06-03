const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Rooms = sequelize.define(
  "Room",
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hotelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Hotels", // This references the Hotels table
        key: "_id",
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    bedConfiguration: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    inventory: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    isRefundable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "Rooms",
    indexes: [
      // Add index for hotelId for better query performance
      {
        fields: ["hotelId"],
      },
      // Add index for type if you'll frequently search by room type
      {
        fields: ["type"],
      },
    ],
  }
);

// Define associations (should be called after all models are defined)
Rooms.associate = function (models) {
  Rooms.belongsTo(models.Hotel, {
    foreignKey: "hotelId",
    as: "hotel",
  });
};

module.exports = Rooms;
