import { useReducer, useCallback, useContext } from "react";
import AuthContext from "../store/auth-context";

function httpReducer(state, action) {
  // Sending Request to Server for Data...
  if (action.type === "SEND") {
    return {
      data: null,
      error: null,
      status: "pending",
      isLoading: true,
      toastData: null,
    };
  }

  // If get the data successfully...
  if (action.type === "SUCCESS") {
    return {
      data: action.responseData.data,
      error: null,
      status: "success",
      isLoading: false,
      toastData: {
        severity: "success",
        summary: action.responseData?.message,
        life: 3000,
      },
    };
  }

  //If don't get expected response...
  if (action.type === "ERROR") {
    return {
      data: null,
      error: action.errorMessage,
      status: "error",
      isLoading: false,
      toastData: {
        severity: "error",
        summary: action.errorMessage,
        life: 3000,
      },
    };
  }

  return state;
}

// When sending Request set startWithPending=true...

function useHttp(requestFunction, isLoading = false) {
  const authCtx = useContext(AuthContext);
  const initialHttpState = {
    isLoading: isLoading,
    status: null,
    data: null,
    error: null,
    toastData: null,
  };
  const [httpState, dispatch] = useReducer(httpReducer, initialHttpState);

  // sendRequest will be created/stored when 'requestFunction' have any Changes...
  const sendRequest = useCallback(
    async function (requestData) {
      dispatch({ type: "SEND" });
      try {
        const responseData = await requestFunction(requestData);
        if (responseData.data.httpStatus === 200) {
          dispatch({ type: "SUCCESS", responseData: responseData.data });
        } else {
          dispatch({
            type: "ERROR",
            errorMessage:
              responseData.data.data.message || "Something went wrong!",
          });
        }
      } catch (error) {
        console.log(error);
        if(error.response.status === 401){
          dispatch({
            type: "ERROR",
            errorMessage: "Your session expired. Please login to continue!",
          });
          authCtx.logout()
        }
        dispatch({
          type: "ERROR",
          errorMessage: error.response.data.message || "Something went wrong!",
        });
      }
    },
    [requestFunction]
  );

  return {
    sendRequest,
    ...httpState,
  };
}

export default useHttp;
