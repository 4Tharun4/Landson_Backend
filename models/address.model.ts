import mongoose, { model, Schema } from "mongoose";
import { IAddress } from "../@types/custom";

const AddressSchema = new Schema<IAddress>(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      isDefault: { type: Boolean, default: false }, // Default address flag
    },
    { timestamps: true }
  );
  
  export const Address = mongoose.model<IAddress>("Address", AddressSchema);