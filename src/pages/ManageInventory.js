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
  }, [sendRequest, lazyState, globalSearch]);

  if (!isLoading && error) {
    toast?.current?.show(toastData);
  }

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex flex-column md:flex-row md:align-items-center">
        <FaEdit
          fontSize="1.4rem"
          className="mr-3"
          onClick={() => {
            setInventory(rowData);
            setShowAddEditInventoryDialog(true);
          }}
        />
        <FaRegTrashAlt
          fontSize="1.4rem"
          className="mr-3"
          onClick={() => {
            setInventory(rowData);
            setShowDeleteInventoryDialog(true);
          }}
        />
        {/* <RiInboxUnarchiveLine fontSize="1.55rem" 
        // onClick={() => editProduct(rowData)}
         /> */}
        {(rowData.canBeCheckedout && rowData.availableQuantity > 0) && (
          <BsCartCheckFill
            fontSize="1.55rem"
              onClick={() => {
                setInventory(rowData);
                setShowCheckoutInventoryDialog(true);
              }}
          />
        )}
      </div>
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Image</span>
        {/* <img
          src={`${contextPath}/demo/images/product/${rowData.image}`}
          alt={rowData.image}
          className="shadow-2"
          width="100"
        /> */}
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
    return (
      <React.Fragment>
        <div className="my-2">
          <Button
            label="New"
            icon="pi pi-plus"
            className="mr-2"
            onClick={() => {
              setInventory(null);
              setShowAddEditInventoryDialog(true);
            }}
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => setShowDeleteSelectedInventoryDialog(true)}
            disabled={!selectedInventories || !selectedInventories.length}
          />
        </div>
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search..."
        />
      </span>
    );
  };

  const onPage = (event) => {
    console.log(event);
    setlazyState(event);
  };

  const onSort = (event) => {
    console.log(event);
    event["page"] = 0;
    setlazyState(event);
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-4"
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
              headerStyle={{ minWidth: "8rem" }}
            ></Column>
            <Column
              field="availableQuantity"
              header="Available Quantity"
              sortable
            ></Column>
            <Column
              field="totalQuantity"
              header="Total Quantity"
              sortable
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
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
          </DataTable>

          <AddEditInventoryForm
            setShowAddEditInventoryDialog={setShowAddEditInventoryDialog}
            showAddEditInventoryDialog={showAddEditInventoryDialog}
            inventory={inventory}
            setInventory={setInventory}
          />
          <CheckoutInventoryForm
            setShowCheckoutInventoryDialog={setShowCheckoutInventoryDialog}
            showCheckoutInventoryDialog={showCheckoutInventoryDialog}
            inventory={inventory}
            setInventory={setInventory}
          />
          <DeleteSingleInventoryPrompt
            setShowDeleteInventoryDialog={setShowDeleteInventoryDialog}
            showDeleteInventoryDialog={showDeleteInventoryDialog}
            inventory={inventory}
            setInventory={setInventory}
          />
          <DeleteSelectedInventoriesPrompt
            showDeleteSelectedInventoryDialog={
              showDeleteSelectedInventoryDialog
            }
            setShowDeleteSelectedInventoryDialog={
              setShowDeleteSelectedInventoryDialog
            }
            selectedInventories={selectedInventories}
            setSelectedInventories={setSelectedInventories}
          />
        </div>
      </div>
    </div>
  );
}
