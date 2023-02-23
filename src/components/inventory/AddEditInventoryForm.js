import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { InputSwitch } from "primereact/inputswitch";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FileUpload } from "primereact/fileupload";
import { Calendar } from "primereact/calendar";
import ApiServices from "../../api/ApiServices";
import useHttp from "../../hooks/use-http";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";

function AddEditInventoryForm(props) {
  const toast = useRef(null);
  const [image, setImage] = useState();
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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  function resizeImage(base64Str, maxWidth = 150, maxHeight = 100) {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement("canvas");
        const MAX_WIDTH = maxWidth;
        const MAX_HEIGHT = maxHeight;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
    });
  }
  
  const onSubmitHandler = async (data) => {
    let imageData = null;
    if (image) {
      const imageBase64 = await convertToBase64(image);
      imageData = imageBase64 ? await resizeImage(imageBase64) : null;
    }

    const payload = {
      id: props.inventory?._id || null,
      name: data.name,
      description: data.description,
      image: imageData || (!data.removeImage ? props.inventory?.image : null),
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

  const customImageSelectHandler = (event) => {
    const file = event.files[0];
    setImage(file);
  };

  const onTemplateClear = () => {
    setImage(null);
  };
  const chooseOptions = {
    icon: "pi pi-fw pi-images",
    label: "Choose an image",
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={props.showAddEditInventoryDialog}
        style={{ width: "50rem" }}
        header={props.inventory?._id ? "Edit Inventory" : "Add Inventory"}
        modal
        className="p-fluid"
        onHide={() => hideDialog()}
      >
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="formgrid grid mb-0">
            <div className="col-7">
              <div className="field mb-3">
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
              <div className="field mt-3">
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
                        className={classNames({
                          "p-invalid": fieldState.invalid,
                        })}
                      />
                      {getFormErrorMessage(field.name)}
                    </>
                  )}
                />
              </div>
              <div className="field">
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
            <div className="field col-5">
              <div className="field">
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

              <div className="field">
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

              <div className="formgrid grid ">
                <div className="field col-6">
                  <label htmlFor="category" className="mb-3">
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
                            <label htmlFor="equipment" className="ml-1 mr-5">
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
              </div>
            </div>
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
                    rows={2}
                    cols={30}
                    className={classNames({
                      "p-invalid": fieldState.error,
                    })}
                  />
                  {getFormErrorMessage(field.name)}
                </>
              )}
            />
          </div>

          <div className="field flex">
            <label htmlFor="canBeCheckedout" className="mr-3">
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

          <div className="flex card-container">
            <div className="flex-grow-1 mr-3">
              <div>
                <label htmlFor="image">
                  {props.inventory?.image
                    ? "Update an image"
                    : " Upload an image"}
                </label>
                <FileUpload
                  name="image"
                  mode="advanced"
                  uploadOptions={{ className: "hidden" }}
                  chooseOptions={chooseOptions}
                  onSelect={customImageSelectHandler}
                  onClear={onTemplateClear}
                  customUpload={true}
                  cancelLabel="Cancel"
                  emptyTemplate={
                    <p className="m-0">
                      Drag and drop image to here to upload.
                    </p>
                  }
                />
              </div>
            </div>
            {props.inventory?.image && (
              <div className="flex-none flex flex-column mt-4 justify-content-center">
                <div className="flex-none flex align-items-center">
                  <img
                    src={`${props.inventory.image}`}
                    className="mr-1"
                    width={150}
                  />
                </div>
                <div className="flex flex-row mt-2">
                  <label htmlFor="removeImage" className="mr-2">
                    Remove Image?
                  </label>
                  <Controller
                    name="removeImage"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <div>
                        <Checkbox
                          inputId={field.name}
                          checked={image ? false : field.value}
                          inputRef={field.ref}
                          onChange={(e) => field.onChange(e.checked)}
                          disabled={image ? true : false}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="formgrid grid flex justify-content-end mt-5">
            <div className="mr-2">
              <Button
                type="button"
                label="Cancel"
                className="p-button-outlined"
                onClick={hideDialog}
              />
            </div>
            <div>
              <Button
                type="submit"
                label="Save"
                loading={addEditInventory.isLoading}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default AddEditInventoryForm;
