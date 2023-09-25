import React from "react";

// import { CardOcto } from "../../Components";
import { CardOcto } from "../../Components";
import "./services.scss";
function Services() {
  const services = [
    {
      Header: "Design Consultation",
      Text: "Using the power of artificial intelligence we quickly and efficiently go through possible designs with to meet your needs",
    },
    {
      Header: "Prototype Design",
      Text: "We then turn those design candidates into real designs using design software like Figma and Adobe XD",
    },
    {
      Header: "Web Development",
      Text: "We then turn those designs into real websites using React and other web technologies",
    },
    {
      Header: "Deployment",
      Text: "We then deploy those websites to the web using AWS or your deployment service of choice",
    },
  ];

  return (
    <div className="Services" style={{ position: "relative" }}>
      <div
        id="services"
        style={{ position: "absolute", top: -110, right: "50%" }}
      />
      <div className="Header">
        <h1>Services</h1>
        <hr />
      </div>
      <div className="cardWrapper">
        {services.map((service, index) => (
          // <CardOcto key={index} Header={service.Header} Text={service.Text} />
          <CardOcto key={index} Header={service.Header} Text={service.Text} />
        ))}
      </div>
    </div>
  );
}

export default Services;
