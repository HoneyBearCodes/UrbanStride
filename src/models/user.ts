import { Schema, Document, model, Types } from 'mongoose';

import { ProductDocument } from './product.js';

// Define the structure of a cart item
interface CartItem {
  // Unique identifier for the product
  // Should use `Types.ObjectId` in document interface
  productId: Types.ObjectId;
  // Quantity of the product in the user's cart
  quantity: number;
}

// Define the structure of a user document
export interface UserDocument extends Document {
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpiration?: Date;
  cart: {
    items: CartItem[];
  };
  addToCart: (product: ProductDocument) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

// Define the schema for the User model
const usesrSchema = new Schema<UserDocument>({
  // User's email is a required string
  email: { type: String, required: true },
  // User's password is a required string
  password: { type: String, required: true },
  // User's cart contains an array of items
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

// Utility method to add an item to the user's cart
usesrSchema.methods.addToCart = function (product: ProductDocument) {
  // Find the index of the product in the user's cart
  const cartProductIndex: number = this.cart.items.findIndex(
    (cartItem: CartItem) =>
      cartItem.productId.toString() === product._id.toString(),
  );

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  // Update the quantity if the product is already in the cart, otherwise add a new item
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  // Update the user's cart
  this.cart = {
    items: updatedCartItems,
  };

  // Save the user document
  this.save();
};

// Utility method to delete a cart item
usesrSchema.methods.removeFromCart = function (productId: string) {
  const updatedCartItems = this.cart.items.filter(
    (item: CartItem) => item.productId.toString() !== productId.toString(),
  );
  this.cart.items = updatedCartItems;
  this.save();
};

// Utility method to clear the cart
usesrSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  this.save();
};

// Create the User model based on the defined schema
const UserModel = model<UserDocument>('User', usesrSchema);

export default UserModel;
