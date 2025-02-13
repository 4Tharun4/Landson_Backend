import { Iproductcategory } from "../@types/custom";

import { Schema, model } from "mongoose";

const ProductCategorySchema = new Schema<Iproductcategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
   imageurl:{type:String}
}, { timestamps: true });

export const ProductCategory = model("ProductCategory", ProductCategorySchema);
