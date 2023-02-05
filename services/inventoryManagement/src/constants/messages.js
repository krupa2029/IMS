module.exports = {
  // Inventory location
  ADD_LOCATION_SUCCESS: "Location added successfully",
  UPDATE_LOCATION_SUCCESS: "Location updated successfully",
  LOCATION_ALREADY_EXIST: "Location with this name already exist!",
  LOCATION_ID_NOT_EXIST: "Location with this id does not exist!",

  // Inventory Item
  ADD_INVENTORY_SUCCESS: "Inventory item added successfully",
  UPDATE_INVENTORY_SUCCESS: "Inventory item updated successfully",
  INVENTORY_ALREADY_EXIST: "Inventory item with this model number already exist!",
  INVENTORY_ID_NOT_EXIST: "Inventory item with this id does not exist!",
  QUANTITY_DECREASE_LIMIT: "Can not decrease quantity by <n1> as there is only <n2> items are available in the stock!",

  // Inventory Checkout
  INVENTORY_CHECKOUT_SUCCESS: "Inventory item checkedout successfully",
  INVENTORY_ID_NOT_EXIST: "Inventory item with this id does not exist!",
  INVENTORY_NOT_AVAILABLE: "This item is currently unavailable!",
  INSUFFICIENT_INVENTORY: "Currently, There is only <n> items available in the stock!",

  // Inventory Return 
  INVENTORY_RETURN_SUCCESS: "Inventory item returned successfully",
  CHECKOUT_ID_NOT_EXIST: "Checkout item with this id does not exist!",
  RETURN_LIMIT: "Return quantity can not exceed checkedout quantity. You have checkedout <n> items!",

  // Inventory List
  INVENTORY_LIST_SUCCESS: "Record list get successfully"
};
