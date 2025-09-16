import React from 'react';
import { assets, plans } from '../assets/assets';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import useAuth from '@clerk/clerk-react';
import { toast } from 'react-toastify';

const BuyCredits = () => {

  const { backendUrl, loadCreditData } = useContext(AppContext);
  const navigate = useNavigate();
  const getToken = useAuth();

  const initPayment = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      description: "Credits Purchase",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        const token = await getToken.getToken();
        try {
          const { data } = await axios.post(`${backendUrl}/api/user/verify-razor`, { response }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (data.success) {
            loadCreditData();
            navigate('/');
            toast.success("Payment successful!");
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message);
        }
      }
    }

    const rzp = new  window.Razorpay(options)
    rzp.open();

  }

  const paymentRazorpay = async (planId) => {
    try {
      const token = await getToken.getToken();
      const response = await axios.post(`${backendUrl}/api/user/pay-razor`, { planId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (data.success) {
        initPayment(data.order);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };


  return (
    <div className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our plans</button>
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10'>
        Choose the plan that's right for you
      </h1>
      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((items, index) => (
          <div className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-500' key={index}>
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 font-semibold'>{items.id}</p>
            <p className='text-sm'>{items.desc}</p>
            <p className='mt-6'>
              <span>${items.price}</span>/ {items.credits} credits
            </p>
            <button onClick={() => paymentRazorpay(items.id)} className='w-full bg-gray-700 text-white mt-8 text-sm rounded-md py-2.5 min-w-52'>Get started</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredits;