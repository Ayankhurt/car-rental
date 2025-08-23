import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate }
    });
    return bookings.length === 0;
}


export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;
        const cars = await Car.find({ location, isAvailable: true });
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
            return { ...car._doc, isAvailable: isAvailable };
        });

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true);

        res.json({
            success: true,
            availableCars
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const createBooking = async (req, res) => {
    try {
        const { car: carId, pickupDate, returnDate } = req.body;

        // Pehle availability check karo
        const isAvailable = await checkAvailability(carId, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: 'Car is already booked for these dates.' });
        }

        // Car ki details nikaalein
        const car = await Car.findById(carId);
        if (!car) {
            return res.json({ success: false, message: 'Car not found' });
        }

        // Days calculate karein
        const days = Math.max(
            1,
            Math.ceil(
                (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
            )
        );
        const price = car.pricePerDay * days;

        // Booking create karein
        const booking = await Booking.create({
            car: carId,
            user: req.user._id,
            owner: car.owner,
            pickupDate,
            returnDate,
            price,
            status: 'pending'
        });

        res.json({ success: true, message: 'Booking created', booking });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate('car').sort({createdAt: -1});
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.json({ success: false, message: 'Unauthorized' });
        }
        // select hata do ya sirf "-user.password" likho
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('car')
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const changeBookingStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json({ success: true, message: 'Booking status updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};