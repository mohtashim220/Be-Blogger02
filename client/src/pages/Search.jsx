import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import style from "./Search.module.css";

export default function Search() {
    const navigate = useNavigate();
    const [sidebardata, setSidebardata] = useState({
        searchTerm:'',
         
         
    });
    console.log(sidebardata);

        const [loading,setLoading]=useState(false);
        const [listings,setListings]=useState([]);
    const [showMore, setShowMore] = useState(false);

    console.log(listings);

        useEffect(()=>{
            const urlParams = new URLSearchParams(location.search);
            const searchTermFromUrl=urlParams.get('searchTerm');
             
             
            const sortFromUrl=urlParams.get('sort');
            const orderFromUrl=urlParams.get('order');
            if(
                searchTermFromUrl 
                 
                 
            ){
                setSidebardata({
                    searchTerm:searchTermFromUrl || '',
                     
                   
                });
               } 
               const fetchListings = async ()=>{
                    setLoading(true);
                    setShowMore(false);
                    const searchQuery=urlParams.toString();
                    const res=await fetch( `/api/listing/get?${searchQuery}`);
                    const data=await res.json();
                    if(data.length > 8){
                        setShowMore(true);
                    }else{
                        setShowMore(false);
                    }
                    setListings(data);
                    setLoading(false); 
               };
               
               fetchListings();
        },  [location.search]);
        
        
        
        const handleChange=(e)=>{
            
        if(e.target.id==='searchTerm'){
            setSidebardata({...sidebardata, searchTerm:e.target.value})
        }
           
         

    };
    const handleSubmit = (e)=>{
        e.preventDefault()
        const urlParams= new URLSearchParams()
        urlParams.set('searchTerm', sidebardata.searchTerm)
         
         
         
        const searchQuery = urlParams.toString()
        navigate(`/search?${searchQuery}`);
    };

    const onShowMoreClick = async () => {
        const numberOfListings=listings.length;
        const startIndex=numberOfListings;
        const urlParams=new URLSearchParams(location.search);
        urlParams.set('startIndex', startIndex);
        const searchQuery =urlParams.toString();
        const res=await fetch(`/api/listing/get?${searchQuery}`);
        const data=await res.json();
        if(data.length<9){
            setShowMore(false);
        }
        setListings([...listings,...data]);
    };

  return (
    <div className='flex flex-col md:flex-row'> 
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className='flex flex-col gap-8 '>
            <div className="flex items-center gap-2  ">
                <label className='whitespace-nowrap  font-semibold'>Search Term:</label>
                <input type="text" id='searchTerm' placeholder='Search...' className='border rounded-lg p-3 w-full' value={sidebardata.searchTerm} onChange={handleChange} />
            </div>
  
            
            <button className= {` ${style.searchButton} p-3 rounded-lg uppercase `} >Search</button>
        </form>
      </div>
      <div className=" flex-1 ">
        <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>Search results:</h1>
        <div className=" p-7  ">
            {!loading && listings.length===0 && (
                <p className='text-xl text-slate-700'>No Result found!</p>
            )}
            {loading && (
                <p className="text-xl text-slate-700 text-center w-full">Loading...</p>
            )}
            {
                !loading && listings && listings.map((listing) =><ListingItem key={listing._id } listing={listing}/> )
            }
            {showMore && (
                <button onClick={onShowMoreClick}
                className='text-green-700 hover:underline p-7 text-center w-full'
                >
                    Show More
                    </button>
            )}
        </div>
      </div>
    </div>
  )
}
