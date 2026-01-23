import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "@/store/auth-slice";
import { toast } from "sonner";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(result)) {
        toast.success("Login successful");
        const { user } = result.payload;
        navigate(user?.role === "admin" ? "/admin/dashboard" : "/shop/home");
      } else {
        toast.error(result.payload?.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h2 className="text-center text-2xl font-bold">Sign In</h2>

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
          Sign In
        </button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default AuthLogin;
