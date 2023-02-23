import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Calendar } from "primereact/calendar";
import ApiServices from "../../api/ApiServices";
import useHttp from "../../hooks/use-http";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";

function CheckoutInventoryForm(props) {
  const toast = useRef(null);
  const checkoutInventory = useHttp(ApiServices.checkoutInventory, false);
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const getFormErrorMessage = (name) => {
    return (
      errors[name] && <small className="p-error">{errors[name].message}</small>
    );
  };

  const hideDialog = (updateAvailable = false) => {
    props.checkoutInventoryHandler(updateAvailable);
  };

  const onSubmitHandler = (data) => {
    console.log(data);
    const payload = {
      toolId: props.inventory?._id,
      toolType: props.inventory?.category === "Material" ? "M" : "E",
      expectedReturnDate: data.expectedReturnDate?.toISOString(),
      checkoutQuantity: data.checkoutQuantity,
      notes: data.notes,
    };
    checkoutInventory.sendRequest(payload);
  };

  useEffect(() => {
    reset();
    if (!checkoutInventory.isLoading && checkoutInventory.toastData) {
      toast.current.show(checkoutInventory.toastData);
      if (checkoutInventory.status === "success") {
        hideDialog(true);
      }
    }
  }, [checkoutInventory.toastData, checkoutInventory.status]);

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={props.showCheckoutInventoryDialog}
        style={{ width: "43rem" }}
        header={"Checkout Inventory"}
        modal
        className="p-fluid"
        onHide={hideDialog}
      >
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="formgrid grid mt-2">
            <div className="col-6">
              <div className="field mb-3">
                <label htmlFor="name">Name</label>
                <InputText
                  name="name"
                  value={props.inventory?.name || ""}
                  disabled
                />
              </div>
              <div className="field">
                <label htmlFor="modelNumber">Model</label>
                <InputText
                  name="modelNumber"
                  value={props.inventory?.modelNumber || ""}
                  disabled
                />
              </div>
            </div>
            <div className="field col-6 flex justify-content-end">
              {props.inventory?.image && (
                <img
                  src={`${props.inventory.image}`}
                  className="mr-1"
                />
              )}
            </div>
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="description">Description</label>
              <InputTextarea
                name="description"
                value={props.inventory?.description || ""}
                disabled
              />
            </div>
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="category" className="mb-2">
                Category
              </label>

              <div className="flex">
                <div className="flex flex-row mb-2">
                  <RadioButton
                    name="category"
                    inputId="equipment"
                    disabled
                    value="Equipment"
                    checked={props.inventory?.category === "Equipment"}
                  />
                  <label htmlFor="equipment" className="ml-1 mr-3">
                    Equipment
                  </label>
                </div>

                <div className="flex flex-row">
                  <RadioButton
                    name="category"
                    inputId="material"
                    disabled
                    value="Material"
                    checked={props.inventory?.category === "Material"}
                  />
                  <label htmlFor="material" className="ml-1 mr-3">
                    Material
                  </label>
                </div>
              </div>
            </div>
            <div className="field col">
              <label htmlFor="availableQuantity">Available Quantity</label>
              <InputNumber
                name="availableQuantity"
                value={props.inventory?.availableQuantity || 1}
                disabled
              />
            </div>
          </div>

          <div className="field"></div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="expectedReturnDate">Expected Return Date</label>
              <Controller
                name="expectedReturnDate"
                control={control}
                rules={{ required: "Please select date!" }}
                render={({ field }) => (
                  <>
                    <Calendar
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      dateFormat="mm/dd/yy"
                      placeholder="mm/dd/yyyy"
                      minDate={new Date()}
                      showIcon
                    />
                    {getFormErrorMessage(field.name)}
                  </>
                )}
              />
            </div>

            <div className="field col">
              <label htmlFor="checkoutQuantity">Checkout Quantity</label>
              <Controller
                name="checkoutQuantity"
                control={control}
                rules={{
                  required: "Checkout quantity is required!",
                  validate: (value) => {
                    if (value < 1) {
                      return "Quantity can not be less than 1!";
                    } else if (value > props.inventory?.availableQuantity) {
                      return `There is only ${props.inventory?.availableQuantity} item/items available for checkout!`;
                    }
                  },
                }}
                defaultValue={1}
                render={({ field, fieldState }) => (
                  <>
                    <InputNumber
                      id={field.name}
                      inputRef={field.ref}
                      value={field.value}
                      showButtons
                      min={1}
                      max={props.inventory?.availableQuantity}
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
          <div className="field">
            <label htmlFor="notes">Notes</label>
            <Controller
              name="notes"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <InputTextarea
                    id={field.name}
                    {...field}
                    rows={2}
                    cols={30}
                  />
                </>
              )}
            />
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
                label="Checkout"
                loading={checkoutInventory.isLoading}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default CheckoutInventoryForm;
