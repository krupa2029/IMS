import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { CgArrowRightR } from "react-icons/cg";
import {
  DeleteSelectedInventoriesPrompt,
  DeleteSingleInventoryPrompt,
} from "../components/inventory/DeleteInventoryPrompt";
import ApiServices from "../api/ApiServices";
import useHttp from "../hooks/use-http";
import AddEditInventoryForm from "../components/inventory/AddEditInventoryForm";

export default function ManageInventory() {
  const toast = useRef(null);
  const dt = useRef(null);
  const [inventory, setInventory] = useState(null);
  const [showDeleteInventoryDialog, setShowDeleteInventoryDialog] =
    useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 5,
    page: 0,
    sortField: "checkoutDate",
    sortOrder: -1,
  });

  const { sendRequest, isLoading, data, error, toastData } = useHttp(
    ApiServices.getInventoryCheckoutList,
    true
  );

  const getSortBy = (sortField) => {
    let sortBy = sortField;
    switch (sortField) {
      case "toolDetails.name":
        sortBy = "toolName";
        break;
      case "toolDetails.modelNumber":
        sortBy = "modelNumber";
        break;
      case "toolDetails.type":
        sortBy = "category";
        break;
      case "returnDetails.returnDate":
        sortBy = "returnDate";
        break;
      case "userName":
        sortBy = "checkoutByUserName";
        break;
      default:
        break;
    }
    return sortBy;
  };

  useEffect(() => {
    const sortBy = getSortBy(lazyState.sortField);
    sendRequest({
      searchText: globalSearch,
      userId: null,
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
      <>
        <span className="p-column-title">Return</span>
        <div className="flex flex-column md:flex-row md:align-items-center">
          {!rowData.returnDetails && (
            <CgArrowRightR
              fontSize="1.55rem"
              //   onClick={() => editProduct(rowData)}
            />
          )}
        </div>
      </>
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

  const checkoutDateBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Checkout Date</span>
        {rowData?.checkoutDate
          ? new Date(rowData.checkoutDate).toLocaleDateString()
          : null}
      </>
    );
  };

  const returnDateBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Return Date</span>
        {rowData?.returnDetails?.returnDate
          ? new Date(rowData.returnDetails.returnDate).toLocaleDateString()
          : null}
      </>
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
          <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>
          <DataTable
            ref={dt}
            lazy
            value={data?.recordList}
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
              field="toolDetails.name"
              header="Name"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="toolDetails.modelNumber"
              header="Model"
              sortable
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="toolDetails.type"
              header="Category"
              sortable
              headerStyle={{ minWidth: "9rem" }}
            ></Column>
            <Column
              header="Image"
              body={imageBodyTemplate}
              headerStyle={{ minWidth: "8rem" }}
            ></Column>
            <Column field="quantity" header="Quantity" sortable></Column>
            <Column field="userName" header="Checkout By" sortable></Column>
            <Column
              field="checkoutDate"
              header="Checkout Date"
              sortable
              body={checkoutDateBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="returnDetails.returnDate"
              header="Return Date"
              sortable
              body={returnDateBodyTemplate}
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column
              header="Return"
              body={actionBodyTemplate}
              headerStyle={{ minWidth: "5rem" }}
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
}
