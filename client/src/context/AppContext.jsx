import { createContext, use, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: window.location.href.split(":")[0] == "http" ? "http://localhost:5000/api/v1" : "/api/v1",
  withCredentials: true,
});

export default api;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;

    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [pickupDate, setPiickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const [cars, setCars] = useState([]);

    //function to check if user is logged in
    const fetchUser = async () => {
        try {
            const { data } = await api.get('/user/data')
            if (data.success) {
                setUser(data.user);
                setIsOwner(data.user.role === 'owner');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //function to fetch all cars the serve

    const fetchCars = async () => {
        try {
            const { data } = await api.get('/user/cars');
            data.success ? setCars(data.cars) : toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

    //function to logout user
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        api.defaults.headers.common['Authorization'] = '';
        // navigate('/');
        toast.success('Logged out successfully');
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        setToken(token);
        fetchCars();
    }, [])

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser()
        }
    }, [token])

    const value = {
        navigate,
        currency,
        api,
        token,
        setToken,
        user,
        setUser,
        isOwner,
        setIsOwner,
        showLogin,
        setShowLogin,
        fetchUser,
        logout,
        pickupDate,
        setPiickupDate,
        returnDate,
        setReturnDate,
        fetchCars,
        cars,
        setCars
    };


    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
export const useAppContext = () => {
    return useContext(AppContext);
}