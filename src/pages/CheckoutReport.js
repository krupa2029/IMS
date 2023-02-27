import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Tooltip } from "primereact/tooltip";
import React, { useContext, useEffect, useRef, useState } from "react";
import { CgArrowRightR } from "react-icons/cg";
import ApiServices from "../api/ApiServices";
import ReturnInventoryForm from "../components/inventory/ReturnInventoryForm";
import PERMISSION_CODE from "../constants/enums";
import useHttp from "../hooks/use-http";
import AuthContext from "../store/auth-context";

export default function ManageInventory() {
  const { permissions, userData } = useContext(AuthContext);
  const toast = useRef(null);
  const dt = useRef(null);
  const [inventory, setInventory] = useState(null);
  const [showReturnInventoryDialog, setShowReturnInventoryDialog] =
    useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
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
    setUpdateAvailable(true);
  }, [sendRequest, lazyState, globalSearch]);

  useEffect(() => {
    if (updateAvailable) {
      const sortBy = getSortBy(lazyState.sortField);
      sendRequest({
        searchText: globalSearch,
        userId: permissions.includes(
          PERMISSION_CODE.VIEW_ALL_USER_CHECKOUT_REPORT
        )
          ? null
          : userData._id,
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
  const returnInventoryHandler = (
    updateAvailable = false,
    showDialog = false,
    inventoryData = null
  ) => {
    setInventory(inventoryData);
    setShowReturnInventoryDialog(showDialog);
    setUpdateAvailable(updateAvailable);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Return</span>
        <div className="flex flex-column md:flex-row md:align-items-center">
          {!rowData.returnDetails && (
            <>
              <Tooltip target=".custom-target-icon" />
              <CgArrowRightR
                fontSize="1.55rem"
                className="custom-target-icon cursor-pointer"
                data-pr-tooltip="Return"
                onClick={() => returnInventoryHandler(false, true, rowData)}
              />
            </>
          )}
        </div>
      </>
    );
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <>
        <span className="p-column-title">Image</span>
        {rowData.toolDetails?.image ? (
          <img src={`${rowData.toolDetails.image}`} width="80" />
        ) : (
          ""
        )}
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

  const leftToolbarTemplate = () => {
    return <p className="text-2xl">Inventory Checkout Report</p>;
  };

  const rightToolbarTemplate = () => {
    return (
      <span className="block mt-2 my-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search..."
        />
      </span>
    );
  };

  return (
    <div className="grid">
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
            value={data?.recordList}
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
              headerStyle={{ minWidth: "10rem" }}
            ></Column>
            <Column field="quantity" header="Quantity" sortable></Column>
            
            {permissions.includes(
              PERMISSION_CODE.VIEW_ALL_USER_CHECKOUT_REPORT
            ) && (
              <Column field="userName" header="Checkout By" sortable></Column>
            )}

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
            {permissions.includes(PERMISSION_CODE.RETURN_INVENTORY) && (
              <Column
                header="Return Item"
                body={actionBodyTemplate}
                headerStyle={{ minWidth: "5rem" }}
              ></Column>
            )}
          </DataTable>

          {showReturnInventoryDialog && (
            <ReturnInventoryForm
              showReturnInventoryDialog={showReturnInventoryDialog}
              returnInventoryHandler={returnInventoryHandler}
              inventory={inventory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
