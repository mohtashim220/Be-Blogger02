import {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { MdDeleteOutline } from "react-icons/md";
import { CiEdit } from "react-icons/ci";


 
 
import { useRef } from "react";
import { useSelector } from "react-redux";
 
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import style from './Profile.module.css'
import { toast } from 'react-hot-toast'



import { useDispatch } from "react-redux";




 
export default function  Dashboard() {
     
    const fileRef = useRef(null);
  const { currentuser, loading, error } = useSelector((state) => state.user);
  
  const [fileUploaderror, setfileUploadError] = useState(false);
   
  const [showListingerror, setShowLisitngError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
  
  // const formattedDate = new Date(listing.updatedAt).toLocaleDateString();
  

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
    <div className='flex flex-col md:flex-row my-full-height-div'> 
      <div className="md:border-r-2 h-screen  w-48"> {/* Added w-64 here */}
    <div className='pl-3 mt-5 '>
        <Link to={"/create-listing"}>
            <button className={` ${style.searchButton} p-3 rounded-lg uppercase `}>Create Blog</button>
        </Link>
    </div>
    <div className='pl-3  '>
        <Link to={"/comments"}>
            <button className={` ${style.searchButton} p-3 rounded-lg uppercase `}>Comments</button>
        </Link>
    </div>
    <div className='pl-3  '>
        <Link to={"/stats"}>
            <button className={` ${style.searchButton} p-3 rounded-lg uppercase `}>Stats</button>
        </Link>
    </div>
    <div className='pl-3 '>
        <Link to={"/setting"}>
            <button className={` ${style.searchButton} p-3 rounded-lg uppercase `}>Setting</button>
        </Link>
    </div>
    <div className='pl-3'>
        <Link to={"/profile"}>
            <button className={` ${style.searchButton} p-3 rounded-lg uppercase `}>Profile</button>
        </Link>
    </div>
</div>
 
    

      <div className=" flex-1 ">

         {
       userListings && userListings.length < 1 && <div className="flex flex-col items-center justify-center text-center bg-white p-10 rounded-xl shadow-md border border-gray-200 max-w-md mx-auto  mt-10">
       <h2 className="text-2xl font-bold text-slate-700 mb-4 ">
         No Blog Posted Yet
       </h2>
       <p className="text-slate-600 mb-6">Looks like you haven’t shared anything yet.</p>
       <Link
         to="/create-listing"
         className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition duration-300"
       >
         Post a Blog
       </Link>
     </div> }

       
         {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
           <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Your Blogs</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                {listing.imagesURLs[0] && <img
                  src={listing.imagesURLs[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                /> }
              </Link>
              <Link
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.title}</p>
                
              </Link>
              <span className="text-sm text-black-500 mt-8 ">Posted on {new Date(listing.updatedAt).toLocaleDateString()}</span>

              <div className="flex flex-col item-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  <MdDeleteOutline />
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase mt-5"> <CiEdit />
                   </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}


         
      </div>
    </div>
  )
}
