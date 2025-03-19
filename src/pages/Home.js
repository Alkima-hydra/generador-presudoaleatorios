import React from 'react';
import Navbar from '../componentes/navbar';
import CardComponent from '../componentes/CardComponent';
import { Container, Row, Col } from 'react-bootstrap';
import imagen1 from '../assets/images/imagen1.jpg';
import imagen2 from '../assets/images/imagen2.jpg';
import imagen3 from '../assets/images/imagen3.jpg';
import imagen4 from '../assets/images/imagen4.jpeg';

const Home = () => {
  const cards = [
    { image: imagen1, text: 'Algoritmo de los Cuadrados Medios' },
    { image: imagen2, text: 'Algoritmo de los Productos Medios' },
    { image: imagen3, text: 'Algoritmo Congruencial Lineal' },
    { image: imagen4, text: 'Algoritmo Congurencial Multiplicativo' }
  ];

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>
          Buenos días, genere numeros aleatorios por cualquiera de estos métodos, haga click en alguno para continuar
        </h2>
        <Row>
          {cards.map((card, index) => (
            <Col md={3} key={index} className="mb-4">
              <CardComponent image={card.image} text={card.text} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Home;