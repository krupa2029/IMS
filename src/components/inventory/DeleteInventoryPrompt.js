import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef } from "react";
import ApiServices from "../../api/ApiServices";
import useHttp from "../../hooks/use-http";

export function DeleteSingleInventoryPrompt(props) {
  const toast = useRef(null);
  const { sendRequest, isLoading, toastData, status } = useHttp(
    ApiServices.deleteInventory,
    true
  );

  const hideDeleteInventoryDialog = (updateAvailable = false) => {
    props.deleteInventoryHandler(updateAvailable);
  };

  const deleteInventory = async () => {
    const payload = {
      inventoryData: [
        {
          id: props?.inventory?._id,
          category: props?.inventory?.category === "Equipment" ? "E" : "M",
        },
      ],
    };

    await sendRequest(payload);
  };

  useEffect(() => {
    if (!isLoading && toastData) {
      toast.current.show(toastData);
      if (status === "success") {
        hideDeleteInventoryDialog(true);
      }
    }
  }, [toastData, status]);

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
              Are you sure you want to delete <b>{props.inventory?.name}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}

export function DeleteSelectedInventoriesPrompt(props) {
  const toast = useRef(null);
  const { sendRequest, isLoading, toastData, status } = useHttp(
    ApiServices.deleteInventory,
    true
  );

  const hideDeleteInventoryDialog = (updateAvailable = false) => {
    props.deleteSelectedInventoryHandler(updateAvailable);
  };

  const deleteSelectedInventories = async () => {
    const inventoryData = props.selectedInventories.map((item) => {
      return {
        id: item._id,
        category: item.category === "Equipment" ? "E" : "M",
      };
    });
    const payload = {
      inventoryData: inventoryData,
    };

    await sendRequest(payload);
  };

  useEffect(() => {
    if (!isLoading && toastData) {
      toast.current.show(toastData);
      if (status === "success") {
        hideDeleteInventoryDialog(true);
      }
    }
  }, [toastData, status]);

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
    <>
      <Toast ref={toast} />
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
            <span>
              Are you sure you want to delete the selected inventories?
            </span>
          )}
        </div>
      </Dialog>
    </>
  );
}
