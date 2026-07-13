import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../utils/helper";
import logoSvg from "../../assets/logo.svg";
import testTubeManSvg from "../../assets/test-tube-man.svg";

// Define form validation schema using Zod
const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      console.log("Logging in with:", data);
      await login(data.userId, data.password);
    } catch (error: any) {
      console.error("Login failed:", error);
      const msg =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full overflow-x-hidden">
      {/* Left Side: Illustration Panel */}
      <div
        className="w-full md:w-1/2 flex flex-col items-center justify-center min-h-[30vh] md:min-h-screen p-8 md:p-12"
        style={{ backgroundColor: "#F7FBFF" }}
      >
        <img
          src={testTubeManSvg}
          alt="Test tube illustration"
          className="w-full max-w-[380px] h-auto"
        />
      </div>

      {/* Right Side: Login Form Area */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 border-t md:border-t-0 md:border-l border-card-border">
        {/* Inner Content Area - No card border wrapper */}
        <div className="w-full max-w-md flex flex-col justify-center">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logoSvg}
              alt="PrepRoute"
              className="w-[135px] h-[34px] -ml-1"
            />
          </div>

          {/* Form Headers */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-text-heading tracking-tight">
              Login
            </h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Use your company provided login credentials
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* User ID field */}
            <div>
              <label
                htmlFor="userId"
                className="block text-base font-semibold text-text-heading mb-2"
              >
                User ID
              </label>
              <input
                id="userId"
                type="text"
                placeholder="Enter User ID"
                className={`w-full text-xs sm:text-sm px-4 py-3 rounded-lg border bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 transition-all ${
                  errors.userId
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-brand-blue focus:border-brand-blue"
                }`}
                {...register("userId")}
              />
              {errors.userId && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-2 font-medium">
                  {errors.userId.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-text-heading mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                className={`w-full text-xs sm:text-sm px-4 py-3 rounded-lg border bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 transition-all ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-brand-blue focus:border-brand-blue"
                }`}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-2 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-between items-center pt-1">
              <a
                href="#forgot-password"
                className="text-[10px] sm:text-xs font-semibold text-brand-blue hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setInfoMessage("Forgot password functionality simulated.");
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Simulated Info Message */}
            {infoMessage && (
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold transition-all">
                {infoMessage}
              </div>
            )}

            {/* Error Message */}
            {loginError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-semibold transition-all">
                {loginError}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 py-3 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-brand-blue/75 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 cursor-pointer flex items-center justify-center"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
