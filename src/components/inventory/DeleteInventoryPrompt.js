import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import React, { useRef, useState } from "react";

export function DeleteSingleInventoryPrompt(props) {
  const toast = useRef(null);

  const hideDeleteInventoryDialog = () => {
    props.setShowDeleteInventoryDialog(false);
  };

  const deleteInventory = () => {
    console.log(props.inventory);
    props.setShowDeleteInventoryDialog(false);
    toast.current.show({
      severity: "success",
      summary: "Inventory deleted successfully",
      life: 3000,
    });
  };

  const deleteProductDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteInventoryDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteInventory}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={props.showDeleteInventoryDialog}
        style={{ width: "450px" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteInventoryDialog}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {props.inventory && (
            <span>
              Are you sure you want to delete <b>{props.inventory.name}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}

export function DeleteSelectedInventoriesPrompt(props) {
  const hideDeleteInventoryDialog = () => {
    props.setShowDeleteSelectedInventoryDialog(false);
  };

  const deleteSelectedInventories = () => {
    console.log(props.inventory);
    props.setShowDeleteSelectedInventoryDialog(false);
    // Toast.current.show({
    //   severity: "success",
    //   summary: "Successful",
    //   detail: "Inventory Deleted",
    //   life: 3000,
    // });
  };

  const deleteDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteInventoryDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteSelectedInventories}
      />
    </>
  );

  return (
    <Dialog
      visible={props.showDeleteSelectedInventoryDialog}
      style={{ width: "450px" }}
      header="Confirm"
      modal
      footer={deleteDialogFooter}
      onHide={hideDeleteInventoryDialog}
    >
      <div className="flex align-items-center justify-content-center">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem" }}
        />
        {props.selectedInventories && (
          <span>Are you sure you want to delete the selected inventories?</span>
        )}
      </div>
    </Dialog>
  );
}
