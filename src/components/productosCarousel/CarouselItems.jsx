import React, { use, useEffect, useState } from "react";
import './CarouselItems.css'

const CarouselItems = ({items, CardItem, handleAddItem}) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3)

  const siguiente = () => {
    if (index < items.length - visible) setIndex(index + 1);
  };

  const anterior = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (!Array.isArray(items) || items.length === 0) {
    return <p className="carousel-empty">No hay items disponibles</p>;
  }
  useEffect(() => {
    const screenWidth = window.innerWidth
    if (screenWidth >= 1200) {setVisible(4)}
    else if(screenWidth >= 992) {setVisible(3)}
    else if(screenWidth >= 768) {setVisible(2)}
    else {setVisible(1)}
  }, [])
  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <div className="carousel-viewport">
          <div className="carousel-track"
          style={{
              transform: `translateX(-${index * (100 / visible)}%)`,
            }}>
            {items.map((item) => (
              <CardItem item={item} key={item.id} handleAddItem={()=>handleAddItem(item)}/> 
            ))}
          </div>
        </div>

        <button
          onClick={anterior}
          disabled={index === 0}
          className={`carousel-btn left-btn ${
            index === 0 ? "disabled" : ""
          }`}
        >
          ◀
        </button>

        <button
          onClick={siguiente}
          disabled={index >= items.length - visible}
          className={`carousel-btn right-btn ${
            index >= items.length - visible ? "disabled" : ""
          }`}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default CarouselItems;