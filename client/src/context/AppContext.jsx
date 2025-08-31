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

    const loadCredits = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get(`${backendUrl}/api/users/credits`, {
                headers: {
                    token: token
                }
            });
            if (data.success) {
                setCredit(data.creditBalance);
            }
        } catch (error) {
            console.error("Error loading credits:", error);
            toast.error(error.message);
        }
    };

    const remove_bg = async (image) => {
        try { 
            if (!isSignedIn) {
                return openSignIn();
            }

            setImage(image);
            setResultImage(false);
            navigate('/result');

            const token = await getToken();
            const formData = new FormData();
            image && formData.append('image', image);
            const { data } = await axios.post(`${backendUrl}/api/image/remove-bg`, formData, {
                headers: { token },
            });
            if (data.success) {
                setResultImage(data.data);
                // Optimistically decrement credit and sync later if needed
                setCredit((prev) => Math.max(0, (prev || 0) - 1));
            } else {
                toast.error(data.message);
                if (typeof data.creditBalance === 'number') {
                    setCredit(data.creditBalance);
                }
                if (data.creditBalance === 0) {
                    navigate('/buy-credits');
                }
            }
        } catch (error) {
            console.error("Error removing background:", error);
            toast.error(error.message);
        }
    };

    const value = {
        credit, setCredit,
        loadCredits,
        backendUrl,
        remove_bg,
        image, setImage,
        resultImage, setResultImage
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;