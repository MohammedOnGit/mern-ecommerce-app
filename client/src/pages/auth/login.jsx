// import CommonForm from "@/components/common/form";
// import { toast } from "sonner";
// import { loginFormControls } from "@/config";
// import { loginUser } from "@/store/auth-slice";
// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";

// const initialState = {
//   email: "",
//   password: "",
// };

// function AuthLogin() {
//   const [formData, setFormData] = useState(initialState);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   async function onSubmit(event) {
//     event.preventDefault();
//     try {
//       const data = await dispatch(loginUser(formData));

//       const message = data?.payload?.message;
//       const user = data?.payload?.user;

//       if (data?.payload?.success) {
//         toast.success(message || "Login successful");

//         // Redirect based on role
//         if (user?.role === "admin") {
//           navigate("/admin/dashboard");
//         } else {
//           navigate("/shop/home");
//         }
//       } else {
//         toast.error(message || "Login failed");
//       }
//     } catch (error) {
//       toast.error("Something went wrong. Please try again.");
//       console.error(error);
//     }
//   }

//   return (
//     <div className="mx-auto w-full max-w-md space-y-6">
//       <div className="text-center">
//         <h1 className="text-3xl font-bold tracking-tight text-foreground">
//           Sign in to your account
//         </h1>
//         <p className="mt-2">
//           Don't have an account?
//           <Link
//             className="font-medium ml-2 text-primary hover:underline"
//             to="/auth/register"
//           >
//             Register
//           </Link>
//         </p>
//       </div>
//       <CommonForm
//         formControls={loginFormControls}
//         buttonText={"Sign in"}
//         formData={formData}
//         setFormData={setFormData}
//         onSubmit={onSubmit}
//       />
//     </div>
//   );
// }

// export default AuthLogin;


import CommonForm from "@/components/common/form";
import { toast } from "sonner";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const result = await dispatch(loginUser(formData));
      
      // Check if the action was fulfilled (success) or rejected (error)
      if (loginUser.fulfilled.match(result)) {
        // Success case - result.payload contains { token, user }
        const { user } = result.payload;
        
        toast.success("Login successful");

        // Redirect based on role
        if (user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/shop/home");
        }
      } else if (loginUser.rejected.match(result)) {
        // Error case - result.payload contains error info from rejectWithValue
        const errorMessage = result.payload?.message || "Login failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign in"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;
