import React, { useState, useEffect } from "react";

import "./card.scss";
function Card({ Logo, Preview, Link, Description }) {
  function isImageURL(str) {
    const imageFormats = [
      "jpeg",
      "jpg",
      "png",
      "gif",
      "tiff",
      "bmp",
      "svg",
      "webp",
      "apng",
      "avif",
      "heif",
    ];


    // const imageExtensions = /\.(jpg|jpeg|png|gif|bmp)$/i;
    // return imageExtensions.test(str);
    const containsImageFormat = imageFormats.some((format) => str.includes(format));
    return containsImageFormat
  }

  return (
    <a className="Card" href={Link} target="_blank">
      {/* <img className="Logo" src={`${Logo}`} alt="Logo" />
      <img className="Preview" src={`${Preview}`} alt="Preview" /> */}
      {isImageURL(Logo) === false ? (
        <div className="Logo_text">{Logo}</div>
      ) : (
        <img className="Logo" src={Logo} alt="Logo" />
      )}
      {Description ? <p className="Description">{Description}</p> : null}
      <img className="Preview" src={Preview} alt="Preview" />
      {/* <p className="Description">{Description}</p> */}
    </a>
  );
}

export default Card;
