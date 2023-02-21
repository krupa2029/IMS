import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { InputSwitch } from "primereact/inputswitch";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { FileUpload } from "primereact/fileupload";
import { Calendar } from "primereact/calendar";
import ApiServices from "../../api/ApiServices";
import useHttp from "../../hooks/use-http";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";

function AddEditInventoryForm(props) {
  const toast = useRef(null);
  const getLocations = useHttp(ApiServices.getLocationList, true);
  const addEditInventory = useHttp(ApiServices.addEditInventory, false);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset();
    if (props.showAddEditInventoryDialog) {
      getLocations.sendRequest();
    }
  }, [
    getLocations.sendRequest,
    props.showAddEditInventoryDialog,
    props.inventory,
  ]);

  const getFormErrorMessage = (name) => {
    return (
      errors[name] && <small className="p-error">{errors[name].message}</small>
    );
  };

  const hideDialog = (updateAvailable = false) => {
    props.addEditInventoryHandler(updateAvailable);
  };

  const onSubmitHandler = async (data) => {
    const payload = {
      id: props.inventory?._id || null,
      name: data.name,
      description: data.description,
      image: null,
      category: data.category === "Equipment" ? "E" : "M",
      purchaseDate: data.purchaseDate.toISOString(),
      modelNumber: data.modelNumber,
      locationId: data.location._id,
      totalQuantity: data.totalQuantity,
      canBeCheckedout: data.canBeCheckedout,
      isDeleted: false,
    };
    await addEditInventory.sendRequest(payload);
  };

  useEffect(() => {
    if (!addEditInventory.isLoading && addEditInventory.toastData) {
      toast.current.show(addEditInventory.toastData);
      if (addEditInventory.status === "success") {
        hideDialog(true);
      }
    }
  }, [addEditInventory.toastData, addEditInventory.status]);

  const customBase64Uploader = async (event) => {
    // convert file to base64 encoded
    const file = event.files[0];
    const reader = new FileReader();
    let blob = await fetch(file.objectURL).then((r) => r.blob()); //blob:url
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data = reader.result;
      console.log(base64data);
    };
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={props.showAddEditInventoryDialog}
        style={{ width: "800px" }}
        header={props.inventory?._id ? "Edit Inventory" : "Add Inventory"}
        modal
        className="p-fluid"
        onHide={() => hideDialog()}
      >
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="name">Name</label>
              <Controller
                name="name"
                control={control}
                defaultValue={props.inventory?.name || ""}
                rules={{ required: "Name is required!" }}
                render={({ field, fieldState }) => (
                  <>
                    <InputText
                      id={field.name}
                      {...field}
                      autoFocus
                      className={classNames({
                        "p-invalid": fieldState.invalid,
                      })}
                    />
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>
            {/* <div className="field col">
            <label htmlFor="name">Name</label>

            <input type="file" />
          </div> */}
            <div className="field col">
              <label htmlFor="modelNumber">Model</label>
              <Controller
                name="modelNumber"
                control={control}
                defaultValue={props.inventory?.modelNumber || ""}
                rules={{ required: "Model number is required!" }}
                render={({ field, fieldState }) => (
                  <>
                    <InputText
                      id={field.name}
                      {...field}
                      autoFocus
                      className={classNames({
                        "p-invalid": fieldState.invalid,
                      })}
                    />
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <Controller
              name="location"
              control={control}
              defaultValue={props.inventory?.locationData}
              rules={{ required: "Location is required!" }}
              render={({ field, fieldState }) => (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    placeholder="Select a Location"
                    onChange={(e) => field.onChange(e.value)}
                    options={getLocations.data}
                    optionLabel="name"
                    className={classNames({ "p-invalid": fieldState.invalid })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <Controller
              name="description"
              control={control}
              defaultValue={props.inventory?.description || ""}
              rules={{ required: "Description is required!" }}
              render={({ field, fieldState }) => (
                <>
                  <InputTextarea
                    id={field.name}
                    {...field}
                    rows={4}
                    cols={30}
                    className={classNames({ "p-invalid": fieldState.error })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          {/* <div className="field">
          <label htmlFor="description">Image</label>
          <FileUpload
            name="demo[]"
            // mode="basic"
            disabled
            customUpload
            uploadHandler={customBase64Uploader}
            accept="image/*"
            maxFileSize={1000000}
            emptyTemplate={
              <p className="m-0">Drag and drop files to here to upload.</p>
            }
          />
        </div> */}

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="category" className="mb-2">
                Category
              </label>
              <Controller
                name="category"
                control={control}
                defaultValue={props.inventory?.category || null}
                rules={{ required: "Please select one!" }}
                render={({ field }) => (
                  <>
                    <div className="flex">
                      <div className="flex flex-row mb-2">
                        <RadioButton
                          inputId="equipment"
                          {...field}
                          inputRef={field.ref}
                          value="Equipment"
                          checked={field.value === "Equipment"}
                        />
                        <label htmlFor="equipment" className="ml-1 mr-3">
                          Equipment
                        </label>
                      </div>

                      <div className="flex flex-row">
                        <RadioButton
                          inputId="material"
                          {...field}
                          inputRef={field.ref}
                          value="Material"
                          checked={field.value === "Material"}
                        />
                        <label htmlFor="material" className="ml-1 mr-3">
                          Material
                        </label>
                      </div>
                    </div>
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>
            <div className="field col">
              <label htmlFor="canBeCheckedout" className="mb-2">
                Allow to checkout?
              </label>
              <Controller
                name="canBeCheckedout"
                control={control}
                defaultValue={props.inventory?.canBeCheckedout || true}
                render={({ field }) => (
                  <div>
                    <InputSwitch
                      inputId={field.name}
                      checked={field.value}
                      inputRef={field.ref}
                      onChange={(e) => field.onChange(e.value)}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className="field"></div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <Controller
                name="purchaseDate"
                control={control}
                defaultValue={
                  props.inventory?.purchaseDate
                    ? new Date(props.inventory.purchaseDate)
                    : null
                }
                rules={{ required: "Please select date!" }}
                render={({ field }) => (
                  <>
                    <Calendar
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      dateFormat="mm/dd/yy"
                      placeholder="mm/dd/yyyy"
                      maxDate={new Date()}
                      showIcon
                    />
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>
            <div className="field col">
              <label htmlFor="totalQuantity">Total Quantity</label>
              <Controller
                name="totalQuantity"
                control={control}
                rules={{
                  required: "Total quantity is required!",
                  validate: (value) =>
                    value >= 1 || "Quantity can not be less than 1",
                }}
                defaultValue={props.inventory?.totalQuantity || 1}
                render={({ field, fieldState }) => (
                  <>
                    <InputNumber
                      id={field.name}
                      inputRef={field.ref}
                      value={field.value}
                      showButtons
                      min={0}
                      onValueChange={(e) => field.onChange(e)}
                      inputClassName={classNames({
                        "p-invalid": fieldState.error,
                      })}
                    />
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>
          </div>

          <div className="formgrid grid flex justify-content-end ">
            <div>
              <Button
                type="button"
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
              />
            </div>
            <div>
              <Button
                type="submit"
                label="Save"
                loading={addEditInventory.isLoading}
                icon="pi pi-check"
                className="p-button-text"
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default AddEditInventoryForm;
