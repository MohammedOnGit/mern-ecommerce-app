// import CommonForm from "@/components/common/form";
// import { toast } from "sonner";
// import { registerFormControls } from "@/config";
// import { registerUser } from "@/store/auth-slice";
// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";

// const initialState = {
//   userName: "",
//   email: "",
//   password: "",
// };

// function AuthRegister() {
//   const [formData, setFormData] = useState(initialState);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   async function onSubmit(event) {
//     event.preventDefault();

//     try {
//       const resultAction = await dispatch(registerUser(formData));
//       const data = resultAction.payload;

//       if (data?.success) {
//         toast.success(data?.message || "Account created successfully!");
//         navigate("/auth/login");
//       } else {
//         toast.error(data?.message || "Registration failed. Try again.");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       toast.error("Something went wrong. Please try again.");
//     }
//   }

//   return (
//     <div className="mx-auto w-full max-w-md space-y-6">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-3xl font-bold tracking-tight text-foreground">
//           Create new account
//         </h1>
//         <p className="mt-2">
//           Already have an account?
//           <Link
//             className="font-medium ml-2 text-primary hover:underline"
//             to="/auth/login"
//           >
//             Login
//           </Link>
//         </p>
//       </div>

//       {/* Form */}
//       <CommonForm
//         formControls={registerFormControls}
//         buttonText="Sign Up"
//         formData={formData}
//         setFormData={setFormData}
//         onSubmit={onSubmit}
//       />
//     </div>
//   );
// }

// export default AuthRegister;


import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/store/auth-slice";
import { toast } from "sonner";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const { payload } = await dispatch(registerUser(formData));
      if (payload?.success) {
        toast.success(payload.message || "Account created!");
        navigate("/auth/login");
      } else {
        toast.error(payload?.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h2 className="text-center text-2xl font-bold">Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <button type="submit" className="w-full bg-primary text-white py-2 rounded">
          Sign Up
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default AuthRegister;
