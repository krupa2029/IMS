import React, { Fragment, useContext, useRef } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import AuthContext from "../store/auth-context";
import ApiServices from "../api/ApiServices";
import { Toast } from "primereact/toast";
import { useForm, Controller } from "react-hook-form";
import useHttp from "../hooks/use-http";
import { classNames } from "primereact/utils";

const LoginPage = () => {
  const toast = useRef(null);
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { sendRequest, isLoading, data, error, toastData, status } = useHttp(
    ApiServices.login,
    false
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmitHandler = async (data) => {
    await sendRequest({
      email: data.email,
    });
  };


  if (!isLoading && toastData && status) {
    if (status === "success" && data && !error) {
      authCtx.login(data.accessToken);
      toast.current.show(toastData);
      navigate("/dashboard");
    } else {
      toast.current.show(toastData);
    }
  }

  return (
    <Fragment>
      <Toast ref={toast} position="top-right" />
      <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div className="flex flex-column align-items-center justify-content-center">
          <div style={{ padding: "0.3rem" }}>
            <div className="w-full surface-card py-8 px-5 sm:px-8">
              <div className="text-center mb-5">
                <div className="text-900 text-3xl font-medium mb-3">
                  Welcome!
                </div>
                <span className="text-600 font-medium">Login to continue</span>
              </div>

              <form onSubmit={handleSubmit(onSubmitHandler)}>
                <div className="flex flex-column align-text-center">
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="block text-900 text-xl font-medium mb-2"
                    >
                      Email
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email is required!",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message:
                            "Invalid email address. E.g. example@email.com",
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <InputText
                          id={field.name}
                          {...field}
                          placeholder="Enter email"
                          className={classNames('w-full md:w-30rem',
                            {
                            "p-invalid": fieldState.invalid,
                          })}
                        />
                      )}
                    />
                     <p className="text-red-500 mt-1">{errors['email']?.message}</p>
                  </div>
                  <Button
                    label="Login"
                    loading={isLoading}
                    className="p-3 text-xl"
                  ></Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginPage;
