import React from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useLocation } from "react-router";

const LoginPage = () => {
  const router = useLocation();

  return (
    <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
      <div className="flex flex-column align-items-center justify-content-center">
        <div style={{ padding: "0.3rem" }}>
          <div className="w-full surface-card py-8 px-5 sm:px-8">
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-medium mb-3">Welcome!</div>
              <span className="text-600 font-medium">Sign in to continue</span>
            </div>

            <div>
              <label
                htmlFor="email1"
                className="block text-900 text-xl font-medium mb-2"
              >
                Email
              </label>
              <InputText
                inputid="email1"
                type="text"
                placeholder="Email address"
                className="w-full md:w-30rem mb-5"
                style={{ padding: "1rem" }}
              />

              <Button
                label="Sign In"
                className="w-full p-3 text-xl"
                onClick={() => router.push("/")}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
