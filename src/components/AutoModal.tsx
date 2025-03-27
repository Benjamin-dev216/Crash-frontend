import React, { useState } from "react";

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  show,
  onHide,
  onLogin,
  onRegister,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check for password mismatch only if registering (not login)
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Clear any previous error
    setError("");

    // Call respective function based on login or register mode
    isLogin
      ? onLogin(formData.username, formData.password)
      : onRegister(formData.username, formData.password);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 flex flex-col space-y-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isLogin ? "Login" : "Register"}
          </h2>
          <button
            onClick={onHide}
            className="absolute top-4 right-4 text-4xl text-gray-700 leading-none select-none bg-transparent border-none outline-none hover:bg-transparent hover:border-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {!isLogin && (
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-black py-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle Button at Bottom */}
        <div className="text-center mt-auto">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Reusable InputField Component
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 float-start">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all"
      required
    />
  </div>
);

export default AuthModal;
