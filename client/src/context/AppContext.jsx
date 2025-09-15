import { createContext, useState } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [credit, setCredit] = useState(0);
    const [image, setImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const { getToken } = useAuth();
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();

    // Fetch user credits
    const loadCredits = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setCredit(data.credits);
            }
        } catch (error) {
            console.error('Error loading credits:', error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Remove background from image
    const remove_bg = async (image) => {
        try {
            if (!isSignedIn) return openSignIn();

            setImage(image);
            setResultImage(null); // reset before loading
            navigate('/result');

            const token = await getToken();
            const formData = new FormData();
            if (image) formData.append('image', image);

            const { data } = await axios.post(
                `${backendUrl}/api/image/remove-bg`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (data.success) {
                setResultImage(data.resultimage);
                await loadCredits(); // always sync Navbar credits
            } else {
                toast.error(data.message);
                if (data.creditBalance === 0) {
                    navigate('/buy');
                }
            }
        } catch (error) {
            console.error('Error removing background:', error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const value = {
        credit,
        setCredit,
        loadCredits,
        backendUrl,
        image,
        setImage,
        remove_bg,
        resultImage,
        setResultImage
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
