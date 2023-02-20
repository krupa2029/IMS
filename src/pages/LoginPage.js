import React, { Fragment, useContext, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import AuthContext from "../store/auth-context";
import ApiServices from "../api/ApiServices";
import { Toast } from "primereact/toast";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

const fieldValidationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": `Email is required!`,
      "string.email": `Please provide valid email!`,
    }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const toast = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(fieldValidationSchema),
  });

  const onSubmitHandler = (data) => {
    setIsLoading(true);

    ApiServices.login({
      email: data.email,
    })
      .then((responseData) => {
        setIsLoading(false);
        if (responseData.data.httpStatus === 200) {
          if (responseData?.data?.data) {
            authCtx.login(responseData?.data?.data);
          }

          // toast.current.show({
          //   severity: "success",
          //   summary: responseData?.data?.message,
          //   life: 3000,
          // });
          navigate("/dashboard");
        } else {
          toast.current.show({
            severity: "error",
            summary: responseData?.data?.message,
            life: 3000,
          });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
        toast.current.show({
          severity: "error",
          summary: err?.data?.message || "Something went wrong!",
          life: 3000,
        });
      });
  };

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
                    <InputText
                      type="text"
                      placeholder="Enter email"
                      className="w-full md:w-30rem"
                      style={{ padding: "1rem" }}
                      {...register("email")}
                    />
                    <p className="text-red-500 mt-1">{errors.email?.message}</p>
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
