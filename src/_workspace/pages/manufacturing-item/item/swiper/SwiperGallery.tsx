// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import SwiperCore from 'swiper'
import { Thumbs } from 'swiper/modules'

import { Swiper, SwiperSlide } from 'swiper/react'

// ** Reactstrap Imports

// ** Images

SwiperCore.use([Thumbs])

const SwiperGallery = ({ isRtl, imageArray = [] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  const params = {
    className: 'swiper-gallery',
    spaceBetween: 10,
    navigation: true,
    pagination: {
      clickable: true
      // dynamicBullets: true,
    },
    thumbs: { swiper: thumbsSwiper },
    loop: true
  }

  const paramsThumbs = {
    className: 'gallery-thumbs',
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    onSwiper: setThumbsSwiper
  }

  return (
    <div className='swiper-gallery'>
      <Swiper dir={isRtl ? 'rtl' : 'ltr'} {...params}>
        {imageArray.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`swiper ${index + 1}`}
              className='img-fluid'
              // width={200}
              // height={200}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper {...paramsThumbs}>
        {imageArray.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`swiper ${index + 1}`}
              className='img-fluid'
              // width={100}
              // height={100}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default SwiperGallery
