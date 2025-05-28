import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import style from './Profile.module.css'
import { toast } from 'react-hot-toast'


import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signoutUserFailure,
  signoutUserStart,
 signoutUserSuccess,
} from "../redux/user/userslice";

import { useDispatch } from "react-redux";
 
// import { useNavigate } from "react-router-dom";

export default function Profile() {

  const fileRef = useRef(null);
  const { currentuser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploaderror, setfileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingerror, setShowLisitngError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
   

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = () => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setfileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    if (confirm("do you want to update your profile")) {
      console.log("update button is clicked");
      e.preventDefault();
       
      try {
        dispatch(updateUserStart());
        console.log(currentuser._id);
        const res = await fetch(`/api/user/update/${currentuser._id}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        console.log("updated data", data);
        if (data.success === false) {
          dispatch(updateUserFailure(data.message));
          return;
        }
        else{
           toast.success("user profile updated")
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
      } catch (err) {
        dispatch(updateUserFailure(err.message));
      }
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete account ?");
  if (!confirmDelete) {
    // Call your delete function
    return
  }
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentuser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      } else {
        toast.success("account deleted successfully")
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignoutUser = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      else {
        dispatch(signoutUserSuccess(data));
        // navigate('/sign-in')

      }
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  }

   

  useEffect(() => {
    const showListing = async () => {
      try {
        setShowLisitngError(false);
        const res = await fetch(`api/user/listings/${currentuser._id}`);
        const data = await res.json();
        if (data.success === false) {
                showListingerror(true);
                return;
              }
              setUserListings(data);
              console.log(data);
              
            } catch (error) {
              setShowLisitngError(true);
    }};
     
    showListing();
  }, []);

  

  const handleListingDelete = async (listingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
  if (!confirmDelete) {
     
    return
  }
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        
      });
       const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      toast.success("blog deleted successfully")
      setUserListings((prev) => prev.filter((listing)=> listing._id !== listingId));
    

  } catch (error) {
    console.log(error.message)
      
  }
}

  return (
    <div className={`p-3 max-w-lg mx-auto ${style.container} `}>
      <h1 className="text-3xl font-semiblod text-center my-3 ">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 place-items-center">
        <input
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        ></input>
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentuser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        ></img>

        <p className="text-sm self-center">
          {fileUploaderror ? (
            <span className="text-red-700">
              Error Image upload (image must be lass than 2mb){" "}
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{` Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image Successfully Uploaded!</span>
          ) : (
            ""
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          className="border p-3 "
          defaultValue={currentuser.username}
          id="username"
          onChange={handleChange}
        ></input>
        <input
          type="text"
          placeholder="email"
          className="border p-3 "
          defaultValue={currentuser.email}
          id="email"
          onChange={handleChange}
        ></input>
        <input
          type="password"
          placeholder="password"
          className="border p-3 "
          id="password"
          onChange={handleChange}
        ></input>
        <button
          disabled={loading}
          className={` ${style.button} p-3 uppercase `}
        >
          {loading ? "loading..." : "update"}
        </button>
        
      </form>

      <div className="flex justify-between mt-3">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span
          onClick={handleSignoutUser}
          className="text-red-700 cursor-pointer"
        >
          Sign out
        </span>
      </div>
      <p className="text-red-700 mt-2"> {error ? error : ""}</p>
       
    </div>
  );
}
