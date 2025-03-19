import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CardComponent = ({ image, text, path }) => {
  return (
    <Link to={path} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card>
        <Card.Img variant="top" src={image} />
        <Card.Body>
          <Card.Text>{text}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default CardComponent;