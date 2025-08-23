import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/user.js";
import fs from 'fs';

// API TO CHANGE ROLE TO USER

export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: 'owner' }); // <-- yahan sahi karo
        res.json({ success: true, message: 'User role changed to owner' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// API TO LIST CAR
export const addCars = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);

        // Multer single file upload ke liye req.file use hota hai
        const imageFile = req.file;
        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars',
        });

        let optimiziedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: "1280" },
                { quality: "auto" },
                { format: "webp" }
            ]
        });

        const image = optimiziedImageUrl;
        await Car.create({
            ...car,
            owner: _id,
            image
        });

        res.json({ success: true, message: 'Car added' });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id })
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if (car.owner.toString() !== _id.toString()) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        car.isAvailable = !car.isAvailable;
        await car.save();

        res.json({ success: true, message: 'Availability toggled', car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if (car.owner.toString() !== _id.toString()) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        car.owner = null; // Unlink the owner
        car.isAvailable = false; // Set availability to false
        await car.save();

        res.json({ success: true, message: 'car removed', car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({ owner: _id, status: 'pending' })
        const completedBookings = await Booking.find({ owner: _id, status: 'confirmed' })

        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed')
            .reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;

        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users',
        });
        let optimiziedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: "400" },
                { quality: "auto" },
                { format: "webp" }
            ]
        });

        const image = optimiziedImageUrl;

        await User.findByIdAndUpdate(_id, { image });

        res.json({ success: true, message: 'Image updated successfully', image });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}