import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const {user} = useSelector(store=>store.auth);
  const [loading, setLoading] = useState(false); // Fixed typo here

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Fixed variable name here
      console.log(input);
      const res = await axios.post(
        "https://socialmediaapp-c7ct.onrender.com/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false); // Fixed variable name here
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
          onSubmit={signupHandler}
          className="w-1/2 border border-gray-200 rounded-sm p-5 my-10"
        >
          <h1 className="font-bold text-xl mb-5">Sign Up</h1>
          <div className="my-2">
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter Name"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
            />
          </div>
          <div className="my-2">
            <Label>Enter Email</Label>
            <Input
              type="email"
              placeholder="e.g:xyz@gmail.com"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
            />
          </div>
          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="keep a Strong password"
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
              "Signup"
            )}
          </Button>
          <span className="text-red-500">Already have an account ? <Link to="/login" className="text-blue-600">Login</Link> </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;
