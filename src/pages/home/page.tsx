import Grid from '@mui/material/Grid'

import WelcomeCard from './WelcomeCard'
import DirectorCard from './DirectorCard'

import { BoxRevealDemo } from './BoxReveal'

const Homepage = () => {
  return (
    <>
      <section>
        <WelcomeCard />
      </section>
      <section id='home' className='overflow-hidden pbs-[20px] -mbs-[30px] relative'>
        <Grid className='mbe-3' alignItems='center' justifyContent='center' container spacing={6}>
          <Grid item xs={12} md={12}>
            <Grid>
              <section id='card' className='overflow-hidden pbs-[80px] -mbs-[20px] relative'>
                <BoxRevealDemo />
              </section>
            </Grid>
            <Grid>
              <section id='card' className='overflow-hidden pbs-[130px] -mbs-[20px] relative'>
                <DirectorCard />
              </section>
            </Grid>
          </Grid>
        </Grid>
      </section>
    </>
  )
}

export default Homepage
