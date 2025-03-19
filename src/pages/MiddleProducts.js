import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import '../styles/main.scss'; // Asegúrate de importar los estilos

const MiddleProducts = () => {
  const [seed1, setSeed1] = useState('');
  const [seed2, setSeed2] = useState('');
  const [count, setCount] = useState('');
  const [results, setResults] = useState([]);
  const [isDegenerative, setIsDegenerative] = useState(false);

  const generateMiddleProducts = () => {
    // Validaciones
    const seed1Num = parseInt(seed1);
    const seed2Num = parseInt(seed2);
    const countNum = parseInt(count);

    if (isNaN(seed1Num) || seed1Num <= 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La primera semilla debe ser un número entero mayor a 2.',
      });
      return;
    }

    if (isNaN(seed2Num) || seed2Num <= 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La segunda semilla debe ser un número entero mayor a 2.',
      });
      return;
    }

    if (isNaN(countNum) || countNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La cantidad debe ser un número entero positivo.',
      });
      return;
    }

    // Verificar que las semillas tengan la misma longitud
    const digitsNum = seed1.toString().length;
    if (seed2.toString().length !== digitsNum) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ambas semillas deben tener la misma cantidad de dígitos.',
      });
      return;
    }

    // Algoritmo de productos medios
    let prevSeed = seed1Num; // Semilla anterior
    let currentSeed = seed2Num; // Semilla actual
    const generatedResults = [];
    const seenNumbers = new Map(); // Map para contar ocurrencias de semillas
    const seenRandoms = new Map(); // Map para contar ocurrencias de números random por valor exacto
    let degenerative = false;

    // Generar todos los números solicitados
    for (let i = 0; i < countNum; i++) {
      const product = prevSeed * currentSeed;
      let productStr = product.toString();

      // Ajustar paridad del producto según la semilla (como en SquaresMiddle)
      const productDigits = productStr.length;
      const isProductEven = productDigits % 2 === 0;
      if (!isProductEven) {
        productStr = '0' + productStr; // Agregar un solo cero a la izquierda si es impar
      }

      // Calcular índices para cortar los dígitos del medio
      const totalDigits = productStr.length;
      const start = Math.floor((totalDigits - digitsNum) / 2);
      const end = start + digitsNum;
      const middle = productStr.slice(start, end);
      const nextNumber = parseInt(middle);
      const randomNumber = nextNumber / Math.pow(10, digitsNum); // Rango 0-1
      const randomFixed = randomNumber.toFixed(digitsNum);

      // Guardamos los números en nuestro mapeo
      generatedResults.push({
        seed1: prevSeed,
        seed2: currentSeed,
        product: productStr,
        middleStart: start,
        middleEnd: end,
        nextSeed: nextNumber,
        random: randomNumber,
        randomFixed: randomFixed,
      });

      // Contar ocurrencias de semillas
      const occurrences = seenNumbers.get(nextNumber) || 0;
      seenNumbers.set(nextNumber, occurrences + 1);

      // Contar ocurrencias de números random por valor exacto
      seenRandoms.set(randomFixed, (seenRandoms.get(randomFixed) || 0) + 1);

      // Verificar degeneración
      if (occurrences > 0) {
        degenerative = true;
      }

      // Actualizar semillas para la siguiente iteración
      prevSeed = currentSeed;
      currentSeed = nextNumber;
    }

    // Segundo recorrido para marcar las filas con números repetidos
    const finalResults = generatedResults.map((result) => {
      const randomRepeated = seenRandoms.get(result.randomFixed) > 1;

      return {
        ...result,
        repeated: seenNumbers.get(result.nextSeed) > 1, // Para degeneración
        randomRepeated: randomRepeated, // Para colorear filas
      };
    });

    console.log('Conteo de números aleatorios:', Object.fromEntries(seenRandoms));
    console.log('Resultados generados:', finalResults);

    setResults(finalResults);
    setIsDegenerative(degenerative);
  };

  // Preparar datos para descarga (solo números en rango 0-1, sin encabezados)
  const csvData = results.map((result) => [result.random]);

  const downloadExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Números');
    XLSX.writeFile(wb, 'numeros_productos_medios.xlsx');
  };

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>
          Algoritmo de Productos Medios
        </h2>
        <Row className="justify-content-center mb-4">
          <Col md={3}>
            <Form.Group controlId="seed1Input">
              <Form.Label>Primera Semilla (mayor a 2)</Form.Label>
              <Form.Control
                type="number"
                value={seed1}
                onChange={(e) => setSeed1(e.target.value)}
                placeholder="Ej: 1234"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="seed2Input">
              <Form.Label>Segunda Semilla (mayor a 2)</Form.Label>
              <Form.Control
                type="number"
                value={seed2}
                onChange={(e) => setSeed2(e.target.value)}
                placeholder="Ej: 5678"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="countInput">
              <Form.Label>Cantidad de Números</Form.Label>
              <Form.Control
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="Ej: 10"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button variant="primary" onClick={generateMiddleProducts}>
              Generar
            </Button>
          </Col>
        </Row>

        {/* Tabla de resultados */}
        {results.length > 0 && (
          <>
            <Table
              striped
              bordered
              hover
              className="mt-4"
              style={{ backgroundColor: isDegenerative ? '#fce4e4' : '#ecf0f1' }}
            >
              <thead>
                <tr>
                  <th>Semilla 1</th>
                  <th>Semilla 2</th>
                  <th>Producto</th>
                  <th>Nueva Semilla</th>
                  <th>Número (0-1)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={result.randomRepeated ? 'repeated-random' : ''}
                    style={result.randomRepeated ? { backgroundColor: '#ffeecc' } : {}}
                  >
                    <td>{result.seed1}</td>
                    <td>{result.seed2}</td>
                    <td>
                      <span>{result.product.slice(0, result.middleStart)}</span>
                      <span style={{ color: '#e74c3c' }}>
                        {result.product.slice(result.middleStart, result.middleEnd)}
                      </span>
                      <span>{result.product.slice(result.middleEnd)}</span>
                    </td>
                    <td>{result.nextSeed}</td>
                    <td style={result.randomRepeated ? { backgroundColor: '#fff3cd' } : {}}>
                      {result.randomFixed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Estilos internos */}
            <style>
              {`
                .repeated-random {
                  background-color: #ffeecc !important;
                }
              `}
            </style>

            {/* Indicador de repetición de números aleatorios */}
            <p className="text-center mt-3" style={{ color: '#e74c3c' }}>
              Las filas con fondo amarillo contienen números aleatorios que se repiten en la secuencia.
            </p>

            {/* Indicador de degeneración */}
            <p className="text-center mt-3" style={{ color: isDegenerative ? '#e74c3c' : '#2c3e50' }}>
              {isDegenerative
                ? 'La secuencia es degenerativa (se detectó repetición de semillas).'
                : 'La secuencia no es degenerativa.'}
            </p>

            {/* Botones de descarga */}
            <Row className="justify-content-center mt-4">
              <Col xs="auto">
                <CSVLink
                  data={csvData}
                  filename="numeros_productos_medios.csv"
                  className="btn btn-outline-primary mr-2"
                >
                  Descargar CSV
                </CSVLink>
              </Col>
              <Col xs="auto">
                <Button variant="outline-primary" onClick={downloadExcel}>
                  Descargar Excel
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default MiddleProducts;