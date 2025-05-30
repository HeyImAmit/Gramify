import React from 'react'
import './Home.css'
import Hero from '../../components/Hero/Hero'
import Slogan from '../../components/Slogan/Slogan'
import About from '../../components/About/About'
import Features from '../../components/Features/Features'
import MeetDevelopers from '../../components/MeetDev/MeetDevelopers'

const Home = () => {
  return (
    <div>
      <Hero />
      <Slogan />
      <About />
      <Features />
      <MeetDevelopers />
    </div>
  )
}

export default Home
