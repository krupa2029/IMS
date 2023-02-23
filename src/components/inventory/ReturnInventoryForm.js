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
import { Tooltip } from "primereact/tooltip";

function ReturnInventoryForm(props) {
  const { inventory } = props;
  const toast = useRef(null);
  const returnInventory = useHttp(ApiServices.returnInventory, false);
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
    props.returnInventoryHandler(updateAvailable);
  };

  const onSubmitHandler = (data) => {
    console.log(data);
    const payload = {
      checkoutId: inventory?.checkoutId,
      returnDate: data.returnDate?.toISOString(),
      returnQuantity: data.returnQuantity,
    };

    console.log(payload);

    returnInventory.sendRequest(payload);
  };

  useEffect(() => {
    reset();
    if (!returnInventory.isLoading && returnInventory.toastData) {
      toast.current.show(returnInventory.toastData);
      if (returnInventory.status === "success") {
        hideDialog(true);
      }
    }
  }, [returnInventory.toastData, returnInventory.status]);

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={props.showReturnInventoryDialog}
        style={{ width: "45rem" }}
        header={"Return Inventory"}
        modal
        className="p-fluid"
        onHide={hideDialog}
      >
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="formgrid grid mt-2">
            <div className="col">
              <div className="field mb-3">
                <label htmlFor="name">Name</label>
                <Controller
                  name="name"
                  control={control}
                  defaultValue={inventory?.toolDetails?.name || ""}
                  render={({ field }) => (
                    <InputText id={field.name} value={field.value} disabled />
                  )}
                />
              </div>
              <div className="field mb-3">
                <label htmlFor="modelNumber">Model</label>
                <Controller
                  name="modelNumber"
                  control={control}
                  defaultValue={inventory?.toolDetails?.modelNumber || ""}
                  render={({ field }) => (
                    <InputText id={field.name} value={field.value} disabled />
                  )}
                />
              </div>
            </div>
            {inventory?.toolDetails?.image && (
              <div className="field col-6 flex justify-content-end">
                <img
                  src={`${inventory?.toolDetails?.image}`}
                  className="mr-1"
                />
              </div>
            )}
          </div>

          <div className="formgrid grid mt-2">
            <div className="col-6">
              <div className="field mb-3">
                <label htmlFor="category" className="mb-3">
                  Category
                </label>

                <div className="flex">
                  <div className="flex flex-row mb-2">
                    <RadioButton
                      name="category"
                      inputId="equipment"
                      disabled
                      value="Equipment"
                      checked={inventory?.toolDetails?.type === "Equipment"}
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
                      checked={inventory?.toolDetails?.type === "Material"}
                    />
                    <label htmlFor="material" className="ml-1 mr-3">
                      Material
                    </label>
                  </div>
                </div>
              </div>
              <div className="field mt-2">
                <label htmlFor="returnDate">Return Date</label>
                <Controller
                  name="returnDate"
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
                        maxDate={new Date()}
                        showIcon
                      />
                      {getFormErrorMessage(field.name)}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="col-6">
              <div className="field">
                <label htmlFor="checkoutQuantity">
                  Currently Checkedout Quantity
                </label>
                <InputNumber
                  name="checkoutQuantity"
                  value={inventory?.checkoutQuantity}
                  disabled
                />
              </div>
              <div className="field">
                <label htmlFor="returnQuantity">Return Quantity</label>
                <Controller
                  name="returnQuantity"
                  control={control}
                  rules={{
                    required: "Return quantity is required!",
                    validate: (value) => {
                      if (value < 1) {
                        return "Quantity can not be less than 1!";
                      } else if (value > inventory?.checkoutQuantity) {
                        return `You have checkedout ${inventory?.checkoutQuantity} item/items only!`;
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
                        max={inventory?.checkoutQuantity}
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
                label="Return"
                loading={returnInventory.isLoading}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default ReturnInventoryForm;
