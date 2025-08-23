import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react'

const MyBookings = () => {

  const { api, user, currency } = useAppContext();

  const [bookings, setBookings] = useState([])
  // const currency = import.meta.env.VITE_CURRENCY

  const fetchMyBookings = async () => {
    try {
      const { data } = await api.get('/bookings/user');
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  useEffect(() => {
    user && fetchMyBookings()
  }, [user])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mx-auto' >
      <Title title='My Bookings' subTitle='View and manage all your car bookings' align='left' />

      <div className='space-y-6 mt-8'>
        {bookings.map((booking, index) => (
          <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 , delay: index * 0.1 }}

          key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border border-borderColor rounded-lg'>

            {/* Left side: Car Image + Info */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-2'>
                <img src={booking.car.image} alt="" className='w-full h-auto aspect-video object-cover' />
              </div>
              <p className='text-lg font-medium'>{booking.car.brand} {booking.car.model}</p>
              <p className='text-gray-500 text-xs'>{booking.car.year} • {booking.car.category} • {booking.car.location}</p>
            </div>

            {/* Middle: Booking Info (CORRECTED SECTION) */}
            <div className='md:col-span-2 space-y-3'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
                <p className={`px-3 py-1 text-xs rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{booking.status}</p>
              </div>
              <div className='flex items-start gap-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-0.5' />
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p className='font-medium'>{new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <img src={assets.location_icon_colored} alt="" className='w-4 h-4 mt-0.5' />
                <div>
                  <p className='text-gray-500'>Pick-up Location</p>
                  <p className='font-medium'>{booking.car.location}</p>
                </div>
              </div>
            </div>

            {/* Right side: Price + Actions */}
            <div className='md:col-span-1 flex flex-col gap-6 justify-between'>
              <div className='text-sm text-gray-500 text-right'>
                <p className='text-gray-500'>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked on {booking.createdAt.split('T')[0]}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default MyBookings