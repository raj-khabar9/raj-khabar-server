import mongoose from "mongoose";

const tableStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    columns: [
      {
        name: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ["text", "number", "date", "boolean"],
          default: "text"
        },
        required: {
          type: Boolean,
          default: false
        },
        unique: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("TableStructure", tableStructureSchema);
