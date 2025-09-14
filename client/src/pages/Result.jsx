import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Result = () => {

  const { resultImage, image } = useContext(AppContext);

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      <div className='bg-white rounded-lg px-4 sm:px-8 py-6 drop-shadow-sm'>

        {/* image container */}
        <div className='flex flex-col sm:grid grid-cols-2 gap-6 sm:gap-8'>

          {/* left side */}
          <div>
            <p className='font-semibold text-gray-600 mb-2'>Original</p>
            <img className='rounded-md border w-full object-contain' src={image ? URL.createObjectURL(image) : ''} alt="" />
          </div>

          {/* right side */}
          <div className='flex flex-col'>
            <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>
            <div className='rounded-md border border-gray-300 min-h-[260px] sm:min-h-[320px] relative bg-layer overflow-hidden'>
              {resultImage && <img src={resultImage} alt="Result" className="max-h-80 w-auto mx-auto" />}
              {
                !resultImage && image && <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='border border-violet-600 rounded-full h-12 w-12 border-t-transparent animate-spin'></div>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* buttons */}
          {resultImage && <div className='flex justify-center sm:justify-end items-center flex-wrap gap-3 sm:gap-4 mt-6'>
            <button className='px-6 sm:px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700'>Try another image</button>
            <a href={resultImage} download className={`px-6 sm:px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700`}>Download image</a>
          </div>}
      </div>
    </div>
  )
}

export default Result;