import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { BsCartCheck, BsCartCheckFill } from "react-icons/bs";
import {
  DeleteSelectedInventoriesPrompt,
  DeleteSingleInventoryPrompt,
} from "../components/inventory/DeleteInventoryPrompt";
import ApiServices from "../api/ApiServices";
import useHttp from "../hooks/use-http";
import AddEditInventoryForm from "../components/inventory/AddEditInventoryForm";
import CheckoutInventoryForm from "../components/inventory/CheckoutInventoryForm";
import { Tooltip } from "primereact/tooltip";

export default function ManageInventory() {
  const toast = useRef(null);
  const dt = useRef(null);
  const [inventory, setInventory] = useState(null);
  const [selectedInventories, setSelectedInventories] = useState(null);
  const [showAddEditInventoryDialog, setShowAddEditInventoryDialog] =
    useState(false);
  const [showCheckoutInventoryDialog, setShowCheckoutInventoryDialog] =
    useState(false);
  const [showDeleteInventoryDialog, setShowDeleteInventoryDialog] =
    useState(false);
  const [
    showDeleteSelectedInventoryDialog,
    setShowDeleteSelectedInventoryDialog,
  ] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 5,
    page: 0,
    sortField: null,
    sortOrder: 1,
  });

  const { sendRequest, isLoading, data, error, toastData } = useHttp(
    ApiServices.getInventoryList,
    true
  );

  useEffect(() => {
    setUpdateAvailable(true);
  }, [sendRequest, lazyState, globalSearch]);

  useEffect(() => {
    if (updateAvailable) {
      const sortBy = lazyState.sortField
        ? lazyState.sortField === "locationData.name"
          ? "locationName"
          : lazyState.sortField
        : "purchaseDate";

      sendRequest({
        searchText: globalSearch,
        pageSize: lazyState.rows,
        pageIndex: lazyState.page + 1,
        sortField: sortBy,
        sortOrder: lazyState.sortOrder === 1 ? "asc" : "desc",
      });

      setUpdateAvailable(false);
    }
  }, [updateAvailable]);

  if (!isLoading && error) {
    toast?.current?.show(toastData);
  }

  const onPage = (event) => {
    setlazyState(event);
  };

  const onSort = (event) => {
    event["page"] = 0;
    setlazyState(event);
  };

  const deleteInventoryHandler = (
    updateAvailable = false,
    showDialog = false,
    inventoryData = null
  ) => {
    setUpdateAvailable(updateAvailable);
    setInventory(inventoryData);
    setShowDeleteInventoryDialog(showDialog);
  };

  const deleteSelectedInventoryHandler = (
    updateAvailable = false,
    showDialog = false,
    setSelectedNull = true
  ) => {
    setUpdateAvailable(updateAvailable);
    if (setSelectedNull) {
      setInventory(null);
    }
    setShowDeleteSelectedInventoryDialog(showDialog);
  };

  const addEditInventoryHandler = (
    updateAvailable = false,
    showDialog = false,
    inventoryData = null
  ) => {
    setInventory(inventoryData);
    setShowAddEditInventoryDialog(showDialog);
    setUpdateAvailable(updateAvailable);
  };

  const checkoutInventoryHandler = (
    updateAvailable = false,
    showDialog = false,
    inventoryData = null
  ) => {
    setInventory(inventoryData);
    setShowCheckoutInventoryDialog(showDialog);
    setUpdateAvailable(updateAvailable);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column md:flex-row md:align-items-center">
        <Tooltip target=".custom-target-icon" />
        <FaEdit
          fontSize="1.4rem"
          data-pr-tooltip="Edit"
          className="mr-2 custom-target-icon cursor-pointer"
          data-pr-position="top"
          onClick={() => addEditInventoryHandler(false, true, rowData)}
        />
        <FaRegTrashAlt
          fontSize="1.4rem"
          className="mr-2 custom-target-icon cursor-pointer"
          data-pr-tooltip="Delete"
          data-pr-position="top"
          onClick={() => deleteInventoryHandler(false, true, rowData)}
        />
        {rowData.canBeCheckedout && rowData.availableQuantity > 0 && (
          <BsCartCheckFill
            fontSize="1.55rem"
            className="custom-target-icon cursor-pointer"
            data-pr-tooltip="Checkout"
            data-pr-position="top"
            onClick={() => checkoutInventoryHandler(false, true, rowData)}
          />
        )}
      </div>
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Image</span>
        {rowData.image ? (
          <img src={`${rowData.image}`} width="80" />
        ) : (
          ""
        )}
      </>
    );
  };

  const purchaseDateBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Purchase Date</span>
        {rowData.purchaseDate
          ? new Date(rowData.purchaseDate).toLocaleDateString()
          : null}
      </>
    );
  };

  const leftToolbarTemplate = () => {
    return <p className="text-2xl">Manage Inventory</p>;
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <span className="block mt-2 mr-2 md:mt-0 p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            onInput={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search..."
          />
        </span>
        <div className="my-2">
          <Button
            label="New"
            icon="pi pi-plus"
            className="mr-2 p-button-outlined"
            onClick={() => addEditInventoryHandler(false, true)}
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            className="p-button-outlined p-button-danger"
            onClick={() => deleteSelectedInventoryHandler(false, true, false)}
            disabled={!selectedInventories || !selectedInventories.length}
          />
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-2 border-bottom-1 border-gray-300"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
            ref={dt}
            lazy
            value={data?.inventoryList}
            selection={selectedInventories}
            onSelectionChange={(e) => setSelectedInventories(e.value)}
            dataKey="_id"
            responsiveLayout="scroll"
            onSort={onSort}
            sortField={lazyState.sortField}
            sortOrder={lazyState.sortOrder}
            paginator
            rowsPerPageOptions={[5, 10, 25, 50]}
            first={lazyState.first}
            rows={lazyState.rows}
            totalRecords={data?.totalRecords || 0}
            onPage={onPage}
            loading={isLoading}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            emptyMessage="No products found."
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "4rem" }}
            ></Column>
            <Column
              field="name"
              header="Name"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="modelNumber"
              header="Model"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              header="Image"
              body={imageBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="availableQuantity"
              header="Available Quantity"
              sortable
              headerStyle={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="totalQuantity"
              header="Total Quantity"
              sortable
              headerStyle={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="category"
              header="Category"
              sortable
              headerStyle={{ minWidth: "9rem" }}
            ></Column>
            <Column
              field="description"
              header="Description"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="locationData.name"
              header="Location"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="purchaseDate"
              header="Purchase Date"
              sortable
              body={purchaseDateBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              header="Actions"
              body={actionBodyTemplate}
              headerStyle={{ minWidth: "9rem" }}
            ></Column>
          </DataTable>

          {showAddEditInventoryDialog && (
            <AddEditInventoryForm
              addEditInventoryHandler={addEditInventoryHandler}
              showAddEditInventoryDialog={showAddEditInventoryDialog}
              inventory={inventory}
            />
          )}

          {showCheckoutInventoryDialog && (
            <CheckoutInventoryForm
              showCheckoutInventoryDialog={showCheckoutInventoryDialog}
              checkoutInventoryHandler={checkoutInventoryHandler}
              inventory={inventory}
            />
          )}
          {showDeleteInventoryDialog && (
            <DeleteSingleInventoryPrompt
              deleteInventoryHandler={deleteInventoryHandler}
              showDeleteInventoryDialog={showDeleteInventoryDialog}
              inventory={inventory}
            />
          )}
          {showDeleteSelectedInventoryDialog && (
            <DeleteSelectedInventoriesPrompt
              showDeleteSelectedInventoryDialog={
                showDeleteSelectedInventoryDialog
              }
              deleteSelectedInventoryHandler={deleteSelectedInventoryHandler}
              selectedInventories={selectedInventories}
            />
          )}
        </div>
      </div>
    </div>
  );
}
