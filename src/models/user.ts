import { Schema, Document, model, Types } from 'mongoose';

// Define the structure of a user document
export interface UserDocument extends Document {
  name: string;
  email: string;
  cart: {
    item: [
      {
        // Unique identifier for the product
        // Should use `Types.ObjectId` in document interface
        productId: Types.ObjectId;
        // Quantity of the product in the user's cart
        quantity: number;
      },
    ];
  };
}

// Define the schema for the User model
const usesrSchema = new Schema<UserDocument>({
  // User's name is a required string
  name: { type: String, required: true },
  // User's email is a required string
  email: { type: String, required: true },
  // User's cart contains an array of items
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// Create the User model based on the defined schema
const UserModel = model<UserDocument>('User', usesrSchema);

export default UserModel;
