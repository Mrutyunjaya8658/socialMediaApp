import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user} = useSelector(store=>store.auth);
  const [loading, setLoading] = useState(false); // Corrected variable name

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Set loading to true when login starts
      console.log(input);

      const res = await axios.post(
        "https://socialmediaapp-c7ct.onrender.com/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user))
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false); // Set loading back to false when the request is complete
    }
  };
  useEffect(()=>{
    if (user) {
      navigate("/");
    }
  },[])

  return (
    <div>
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form
          onSubmit={loginHandler} // Corrected handler name
          className="w-1/2 border border-gray-200 rounded-sm p-5 my-10"
        >
          <h1 className="font-bold text-xl mb-5">Log in</h1>

          <div className="my-2">
            <Label>Enter Email</Label>
            <Input
              type="email"
              placeholder="e.g: xyz@gmail.com"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>
          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Keep a strong password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
            />
          </div>

          
          <Button type="submit" className="w-full my-4" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <span className="text-red-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600">
              Signup
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
