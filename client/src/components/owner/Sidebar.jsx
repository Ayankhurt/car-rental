import React, { useState } from 'react'
import { assets, ownerMenuLinks } from '../../assets/assets'
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
    // NOTE: In a real app, user data should not be modified directly from an import.
    const { user, axios, fetchUser } = useAppContext();
    const location = useLocation()
    const [image, setImage] = useState('')

    const updateImage = async () => {
        // This is a temporary update. In a real app, you would upload the file to a server.
        try {
            const formData = new FormData();
            formData.append('image', image);
            const {data} = await axios.post('/api/owner/update-image', formData)

            if (data.success) {
                fetchUser(); // Fetch user data again to update the image
                toast.success(data.message);
                setImage(''); // Clear the image state after upload
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
        return (
            // Added text-center here to center the user name
            <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm text-center'>

                {/* The 'group' class enables group-hover utilities on child elements */}
                <div className='relative group'>
                    <label htmlFor="image" className='cursor-pointer'>
                        <img
                            className='rounded-full w-20 h-20 md:w-28 md:h-28 object-cover mx-auto'
                            src={image ? URL.createObjectURL(image) : user?.image || "https://37assets.37signals.com/svn/765-default-avatar.png"}
                            alt="User Avatar"
                        />
                        <input type="file" id='image' accept='image/*' hidden onChange={e => setImage(e.target.files[0])} />

                        {/* This overlay appears on hover because of the parent's 'group' class */}
                        <div className='absolute hidden inset-0 bg-black/40 rounded-full group-hover:flex items-center justify-center'>
                            <img src={assets.edit_icon} width={32} alt="Edit" />
                        </div>
                    </label>
                </div>

                {image && (
                    // Moved onClick to the button for better practice
                    <button className='absolute top-2 right-2 flex items-center p-2 gap-1 bg-primary/10 text-primary cursor-pointer rounded-md' onClick={updateImage} >
                        Save <img src={assets.check_icon} width={13} alt="Save" />
                    </button>
                )}

                {/* This will now be centered because of 'text-center' on the parent div */}
                <p className='mt-2 text-base max-md:hidden'>{user?.name}</p>

                <div className='w-full text-left'> {/* text-left to align nav links properly */}
                    {ownerMenuLinks.map((link, index) => (
                        <NavLink key={index} to={link.path} className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}>
                            <img src={link.path === location.pathname ? link.coloredIcon : link.icon} alt={`${link.name} icon`} />
                            <span className='max-md:hidden'>{link.name}</span>

                            {/* Corrected the conditional class for the active indicator */}
                            <div className={`w-1.5 h-8 rounded-l right-0 absolute ${link.path === location.pathname ? 'bg-primary' : ''}`}></div>
                        </NavLink>
                    ))}
                </div>
            </div>
        )
    }

    export default Sidebar;