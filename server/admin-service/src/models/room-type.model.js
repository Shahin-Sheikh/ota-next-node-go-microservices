const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const RoomType = sequelize.define(
  "RoomType",
  {
    id: {
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
      allowNull: false,
    },
    maxOccupancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pricePerNight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    size: {
      type: DataTypes.STRING, // e.g., "25 sqm"
      allowNull: true,
    },
    bedType: {
      type: DataTypes.STRING, // e.g., "King", "Queen", "Twin"
      allowNull: true,
    },
    quantityAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRefundable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    cancellationPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "room_types",
  }
);

module.exports = RoomType;
