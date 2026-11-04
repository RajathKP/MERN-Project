// import React from "react";
// import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

// const TourForm = () => {
//   const [tour, setTour] = useState({
//     title: "",
//     location: "",
//     description: "",
//     duration: "",
//     price: "",
//     oldPrice: "",
//     discount: "",
//     reviews: "",
//     rating: "5",
//     image: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setTour({
//       ...tour,
//       [name]: value,
//     });
//   };

//   const handleImage = (e) => {
//     const file = e.target.files[0];

//     if (file) {
//       setTour({
//         ...tour,
//         image: URL.createObjectURL(file),
//       });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     console.log("New Tour:", tour);

//     alert("Tour added successfully!");

//     setTour({
//       title: "",
//       location: "",
//       description: "",
//       duration: "",
//       price: "",
//       oldPrice: "",
//       discount: "",
//       reviews: "",
//       rating: "5",
//       image: "",
//     });
//   };

//   return (



//     // <Container className="py-5">

//     //   <Card className="shadow">
//     //     <Card.Body className="p-4">

//     //       <h2 className="mb-4">
//     //         Add New Tour
//     //       </h2>

//     //       <Form onSubmit={handleSubmit}>

//     //         {/* Tour Title */}
//     //         <Form.Group className="mb-3">
//     //           <Form.Label>Tour Title</Form.Label>
//     //           <Form.Control
//     //             type="text"
//     //             name="title"
//     //             value={tour.title}
//     //             onChange={handleChange}
//     //             placeholder="Example: Dubai Skyline & Desert Nights"
//     //             required
//     //           />
//     //         </Form.Group>

//     //         {/* Location */}
//     //         <Form.Group className="mb-3">
//     //           <Form.Label>Location</Form.Label>
//     //           <Form.Control
//     //             type="text"
//     //             name="location"
//     //             value={tour.location}
//     //             onChange={handleChange}
//     //             placeholder="Example: Dubai, UAE"
//     //             required
//     //           />
//     //         </Form.Group>

//     //         {/* Description */}
//     //         <Form.Group className="mb-3">
//     //           <Form.Label>Description</Form.Label>
//     //           <Form.Control
//     //             as="textarea"
//     //             rows={4}
//     //             name="description"
//     //             value={tour.description}
//     //             onChange={handleChange}
//     //             placeholder="Enter tour description"
//     //             required
//     //           />
//     //         </Form.Group>

//     //         <Row>

//     //           {/* Duration */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Duration</Form.Label>
//     //               <Form.Control
//     //                 type="text"
//     //                 name="duration"
//     //                 value={tour.duration}
//     //                 onChange={handleChange}
//     //                 placeholder="Example: 7 Days"
//     //                 required
//     //               />
//     //             </Form.Group>
//     //           </Col>

//     //           {/* Rating */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Rating</Form.Label>
//     //               <Form.Select
//     //                 name="rating"
//     //                 value={tour.rating}
//     //                 onChange={handleChange}
//     //               >
//     //                 <option value="5">★★★★★ - 5</option>
//     //                 <option value="4">★★★★☆ - 4</option>
//     //                 <option value="3">★★★☆☆ - 3</option>
//     //                 <option value="2">★★☆☆☆ - 2</option>
//     //                 <option value="1">★☆☆☆☆ - 1</option>
//     //               </Form.Select>
//     //             </Form.Group>
//     //           </Col>

//     //           {/* Reviews */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Number of Reviews</Form.Label>
//     //               <Form.Control
//     //                 type="number"
//     //                 name="reviews"
//     //                 value={tour.reviews}
//     //                 onChange={handleChange}
//     //                 placeholder="Example: 5"
//     //               />
//     //             </Form.Group>
//     //           </Col>

//     //         </Row>

//     //         <Row>

//     //           {/* Old Price */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Original Price</Form.Label>
//     //               <Form.Control
//     //                 type="number"
//     //                 name="oldPrice"
//     //                 value={tour.oldPrice}
//     //                 onChange={handleChange}
//     //                 placeholder="Example: 2800"
//     //               />
//     //             </Form.Group>
//     //           </Col>

//     //           {/* Current Price */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Sale Price</Form.Label>
//     //               <Form.Control
//     //                 type="number"
//     //                 name="price"
//     //                 value={tour.price}
//     //                 onChange={handleChange}
//     //                 placeholder="Example: 2500"
//     //                 required
//     //               />
//     //             </Form.Group>
//     //           </Col>

//     //           {/* Discount */}
//     //           <Col md={4}>
//     //             <Form.Group className="mb-3">
//     //               <Form.Label>Discount</Form.Label>
//     //               <Form.Control
//     //                 type="text"
//     //                 name="discount"
//     //                 value={tour.discount}
//     //                 onChange={handleChange}
//     //                 placeholder="Example: 11% OFF"
//     //               />
//     //             </Form.Group>
//     //           </Col>

//     //         </Row>

//     //         {/* Image */}
//     //         <Form.Group className="mb-4">
//     //           <Form.Label>Tour Image</Form.Label>

//     //           <Form.Control
//     //             type="file"
//     //             accept="image/*"
//     //             onChange={handleImage}
//     //           />

//     //           {tour.image && (
//     //             <div className="mt-3">
//     //               <img
//     //                 src={tour.image}
//     //                 alt="Tour Preview"
//     //                 style={{
//     //                   width: "250px",
//     //                   height: "160px",
//     //                   objectFit: "cover",
//     //                   borderRadius: "8px",
//     //                 }}
//     //               />
//     //             </div>
//     //           )}
//     //         </Form.Group>

//     //         {/* Buttons */}
//     //         <div className="d-flex gap-2">

//     //           <Button
//     //             variant="primary"
//     //             type="submit"
//     //           >
//     //             Add Tour
//     //           </Button>

//     //           <Button
//     //             variant="secondary"
//     //             type="button"
//     //             onClick={() =>
//     //               setTour({
//     //                 title: "",
//     //                 location: "",
//     //                 description: "",
//     //                 duration: "",
//     //                 price: "",
//     //                 oldPrice: "",
//     //                 discount: "",
//     //                 reviews: "",
//     //                 rating: "5",
//     //                 image: "",
//     //               })
//     //             }
//     //           >
//     //             Clear
//     //           </Button>

//     //         </div>

//     //       </Form>

//     //     </Card.Body>
//     //   </Card>

//     // </Container>
//   );
// };

// export default TourForm;