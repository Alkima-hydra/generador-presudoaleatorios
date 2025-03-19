import React from 'react';
import { Card } from 'react-bootstrap';

const CardComponent = ({ image, text }) => {
  return (
    <Card>
      <Card.Img variant="top" src={image} />
      <Card.Body>
        <Card.Text>{text}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CardComponent;