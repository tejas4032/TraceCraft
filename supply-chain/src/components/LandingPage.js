import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supplyChainImage from "../assets/supply-chain.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookSquare,
  faTwitterSquare,
  faYoutubeSquare,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const LandingPage = () => {
  const navigate = useNavigate();

  // State for controlling the testimonial slider
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Testimonials with 10 entries
  const testimonials = [
    {
      message:
        "TraceCraft has transformed our supply chain management. The transparency and efficiency it provides are unmatched!",
      name: "John Doe",
      title: "CEO, ABC Corp",
    },
    {
      message:
        "The blockchain-powered features of TraceCraft have made our operations much more streamlined and secure.",
      name: "Jane Smith",
      title: "COO, XYZ Industries",
    },
    {
      message:
        "We can now track products in real-time, and the security features have greatly reduced fraudulent activities.",
      name: "Alice Johnson",
      title: "Supply Chain Manager, Global Goods Inc.",
    },
    {
      message:
        "TraceCraft has given us clear visibility across the entire supply chain. It's been a game-changer for our company.",
      name: "Bob Martin",
      title: "Logistics Director, GreenTech Solutions",
    },
    {
      message:
        "The efficiency of TraceCraft's platform has helped us reduce delays and improve collaboration across our network.",
      name: "Charlie Williams",
      title: "Operations Lead, FutureTech Enterprises",
    },
    {
      message:
        "TraceCraft has provided unparalleled transparency in our supply chain. We now have complete trust in our data.",
      name: "Eve Davis",
      title: "Head of Procurement, TechNet Systems",
    },
    {
      message:
        "With TraceCraft, we’ve gained the visibility we’ve always wanted, leading to improved decision-making.",
      name: "David Lee",
      title: "CIO, Digital Logistics",
    },
    {
      message:
        "The platform is user-friendly and has greatly simplified our reporting and tracking processes.",
      name: "Sophia Green",
      title: "Supply Chain Director, GlobalTech",
    },
    {
      message:
        "Our entire supply chain is now much more secure, and we’ve seen a significant reduction in errors.",
      name: "Michael Clark",
      title: "Procurement Officer, Auto Parts Inc.",
    },
    {
      message:
        "TraceCraft has significantly improved our efficiency, and the real-time tracking feature is invaluable.",
      name: "Laura White",
      title: "Operations Manager, EcoTech",
    },
  ];

  // Automatically change the testimonial every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 3) % testimonials.length); // Change every 5 seconds and move 3 steps
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle next testimonial
  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 3) % testimonials.length);
  };

  // Handle previous testimonial
  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 3 + testimonials.length) % testimonials.length);
  };

  // Get 3 testimonials at a time for the slider
  const getVisibleTestimonials = () => {
    return [
      testimonials[(currentTestimonial + 0) % testimonials.length],
      testimonials[(currentTestimonial + 1) % testimonials.length],
      testimonials[(currentTestimonial + 2) % testimonials.length],
    ];
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#333",
        fontFamily: "'Roboto', sans-serif",
        minHeight: "100vh",
        margin: "0",
        padding: "20px",
      }}
    >
      {/* Header Section */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    borderBottom: "2px solid #1976d2",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "0 0 20px 20px",
  }}
>
  {/* Logo */}
  <img
    src={require("../assets/logo.png")} // Add your logo image here
    alt="Company Logo"
    style={{
      height: "60px",  // Adjust size of logo
      objectFit: "contain",
    }}
  />

  {/* Navigation Buttons */}
  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
    <button
      style={{
        fontSize: "1.1em",
        backgroundColor: "transparent",
        color: "#333",
        border: "none",
        cursor: "pointer",
        fontWeight: "500",
        transition: "color 0.3s ease",
      }}
      onClick={() => navigate("/login")}
      onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
      onMouseLeave={(e) => (e.target.style.color = "#333")}
    >
      Login
    </button>
    <button
      style={{
        padding: "10px 25px",
        fontSize: "1.2em",
        backgroundColor: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        fontWeight: "500",
      }}
      onClick={() => navigate("/signup")}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#1565c0")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#1976d2")}
    >
      Sign Up
    </button>
  </div>
</div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80vh",
          position: "relative",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            width: "50%",
            padding: "2rem",
            textAlign: "left",
            zIndex: 1,
            color: "#333",
          }}
        >
          <h2
            style={{
              fontSize: "3.5em",
              color: "#1976d2",
              fontWeight: "700",
              marginBottom: "20px",
              letterSpacing: "2px",
            }}
          >
            Revolutionizing Supply Chains with Blockchain Transparency
          </h2>
          <p style={{ fontSize: "1.3em", lineHeight: "1.6", margin: "20px 0" }}>
            Say goodbye to blind spots in your supply chain. With TraceCraft,
            ensure every transaction is secure, every product is traceable, and
            every partner is accountable.
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <img
            src={supplyChainImage}
            alt="Supply Chain Illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "15px",
            }}
          />
        </div>
      </div>

      {/* Feature Cards - Positioned above Testimonials */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "30px",
          marginTop: "60px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.8em", color: "#1976d2", marginBottom: "15px" }}>
            Real-Time Tracking
          </h3>
          <p style={{ fontSize: "1.1em", color: "#555" }}>
            Monitor every product in your supply chain from production to delivery with our advanced tracking system.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.8em", color: "#1976d2", marginBottom: "15px" }}>
            Blockchain Security
          </h3>
          <p style={{ fontSize: "1.1em", color: "#555" }}>
            Ensure end-to-end security and data integrity with blockchain-based records that are tamper-proof.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            flex: 1,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.8em", color: "#1976d2", marginBottom: "15px" }}>
            Seamless Integration
          </h3>
          <p style={{ fontSize: "1.1em", color: "#555" }}>
            Easily integrate with your existing systems and streamline operations with minimal disruption.
          </p>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "60px auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h2 style={{ fontSize: "2.5em", color: "#1976d2", marginBottom: "20px" }}>
          What Our Clients Say
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            onClick={handlePrevTestimonial}
            style={{
              fontSize: "2em",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
              marginRight: "20px",
            }}
          >
            &lt;
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={index}
                style={{
                  flex: "1",
                  padding: "15px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <p style={{ fontSize: "1.2em", color: "#555", fontStyle: "italic" }}>
                  "{testimonial.message}"
                </p>
                <h3 style={{ fontSize: "1.5em", color: "#1976d2" }}>
                  {testimonial.name}
                </h3>
                <p style={{ fontSize: "1.1em", color: "#777" }}>
                  {testimonial.title}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleNextTestimonial}
            style={{
              fontSize: "2em",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
              marginLeft: "20px",
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Contact Form Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "50px 0",
          textAlign: "center",
          borderRadius: "15px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "2.5em", color: "#1976d2", marginBottom: "20px" }}>
          Get in Touch with Us
        </h2>
        <p style={{ fontSize: "1.2em", color: "#555", marginBottom: "30px" }}>
          Have any questions? We'd love to hear from you. Fill out the form below, and we'll get back to you as soon as possible.
        </p>

        <form
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Your Name"
            style={{
              padding: "15px",
              width: "100%",
              maxWidth: "500px",
              fontSize: "1.1em",
              border: "2px solid #ddd",
              borderRadius: "10px",
              marginBottom: "15px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
          />
          <input
            type="email"
            placeholder="Your Email"
            style={{
              padding: "15px",
              width: "100%",
              maxWidth: "500px",
              fontSize: "1.1em",
              border: "2px solid #ddd",
              borderRadius: "10px",
              marginBottom: "15px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
          />
          <textarea
            placeholder="Your Message"
            style={{
              padding: "15px",
              width: "100%",
              maxWidth: "500px",
              fontSize: "1.1em",
              height: "150px",
              border: "2px solid #ddd",
              borderRadius: "10px",
              marginBottom: "15px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
          ></textarea>
          <button
            type="submit"
            style={{
              padding: "15px 25px",
              fontSize: "1.2em",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "30px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Footer Section */}
<div
  style={{
    backgroundColor: "#1976d2",
    padding: "10px 0",  // Reduced padding to make it smaller
    textAlign: "center",
    color: "white",
    borderTopLeftRadius: "20px",  // Rounded upper-left corner
    borderTopRightRadius: "20px", // Rounded upper-right corner
  }}
>
  <p style={{ marginBottom: "10px" }}>Follow us on social media</p>
  <div style={{ fontSize: "2em" }}>
    <FontAwesomeIcon icon={faFacebookSquare} style={{ margin: "0 10px" }} />
    <FontAwesomeIcon icon={faTwitterSquare} style={{ margin: "0 10px" }} />
    <FontAwesomeIcon icon={faYoutubeSquare} style={{ margin: "0 10px" }} />
    <FontAwesomeIcon icon={faLinkedin} style={{ margin: "0 10px" }} />
  </div>
  <p style={{ marginTop: "10px" }}>© 2024 TraceCraft, All rights reserved.</p>
</div>

    </div>
  );
};

export default LandingPage;
