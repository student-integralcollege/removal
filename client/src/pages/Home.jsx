import React from 'react'
import Header from '../components/header'
import Step from '../components/step'
import BgSlider from '../components/Bgslider'
import Testimonials from '../components/Testimonial'
import Upload from '../components/Upload'

const Home = () => {
  return (
    <div>
      <Header />
      <Step />
      <BgSlider />
      <Testimonials />
      <Upload />
    </div>
  )
}
export default Home