import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import '../styles/main.scss'; // Asegúrate de importar los estilos

// Función para calcular el MCD (Máximo Común Divisor) usando el algoritmo de Euclides
const gcd = (a, b) => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Función para encontrar los factores primos de un número
const primeFactors = (n) => {
  const factors = [];
  let divisor = 2;
  while (n >= 2) {
    if (n % divisor === 0) {
      if (!factors.includes(divisor)) factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
};

const LinearCongruential = () => {
  const [seed, setSeed] = useState(''); // Semilla inicial (X₀)
  const [multiplier, setMultiplier] = useState(''); // Multiplicador (a)
  const [increment, setIncrement] = useState(''); // Incremento (c)
  const [modulus, setModulus] = useState(''); // Módulo (m)
  const [count, setCount] = useState(''); // Cantidad de números a generar
  const [results, setResults] = useState([]);
  const [isDegenerative, setIsDegenerative] = useState(false);

  const generateLinearCongruential = () => {
    const seedNum = parseInt(seed);
    const multiplierNum = parseInt(multiplier);
    const incrementNum = parseInt(increment);
    const modulusNum = parseInt(modulus);
    const countNum = parseInt(count);

    if (isNaN(seedNum) || seedNum < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La semilla debe ser un número entero no negativo.',
      });
      return;
    }

    if (isNaN(multiplierNum) || multiplierNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El multiplicador debe ser un número entero positivo.',
      });
      return;
    }

    if (isNaN(incrementNum) || incrementNum < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El incremento debe ser un número entero no negativo.',
      });
      return;
    }

    if (isNaN(modulusNum) || modulusNum <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El módulo debe ser un número entero mayor a 1.',
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

    let currentSeed = seedNum;
    const generatedResults = [];
    const seenNumbers = new Map();
    const seenRandoms = new Map();
    let degenerative = false;

    for (let i = 0; i < countNum; i++) {
      const nextSeed = (multiplierNum * currentSeed + incrementNum) % modulusNum;
      const randomNumber = nextSeed / modulusNum;
      const randomFixed = randomNumber.toFixed(4);

      generatedResults.push({
        seed: currentSeed,
        nextSeed: nextSeed,
        random: randomNumber,
        randomFixed: randomFixed,
      });

      const occurrences = seenNumbers.get(nextSeed) || 0;
      seenNumbers.set(nextSeed, occurrences + 1);
      seenRandoms.set(randomFixed, (seenRandoms.get(randomFixed) || 0) + 1);

      if (occurrences > 0) {
        degenerative = true;
      }

      currentSeed = nextSeed;
    }

    const finalResults = generatedResults.map((result) => {
      const randomRepeated = seenRandoms.get(result.randomFixed) > 1;

      return {
        ...result,
        repeated: seenNumbers.get(result.nextSeed) > 1,
        randomRepeated: randomRepeated,
      };
    });

    console.log('Conteo de números aleatorios:', Object.fromEntries(seenRandoms));
    console.log('Resultados generados:', finalResults);

    setResults(finalResults);
    setIsDegenerative(degenerative);
  };

  const calculateMaxPeriod = () => {
    const multiplierNum = parseInt(multiplier);
    const incrementNum = parseInt(increment);
    const modulusNum = parseInt(modulus);

    if (isNaN(multiplierNum) || multiplierNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El multiplicador debe ser un número entero positivo.',
      });
      return;
    }

    if (isNaN(incrementNum) || incrementNum < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El incremento debe ser un número entero no negativo.',
      });
      return;
    }

    if (isNaN(modulusNum) || modulusNum <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El módulo debe ser un número entero mayor a 1.',
      });
      return;
    }

    // Verificar las condiciones de Hull-Dobell
    const isCoprime = gcd(incrementNum, modulusNum) === 1;
    const aMinus1 = multiplierNum - 1;
    const factors = primeFactors(modulusNum);
    const divisibleByPrimes = factors.every((factor) => aMinus1 % factor === 0);
    const divisibleBy4IfM4 = modulusNum % 4 === 0 ? aMinus1 % 4 === 0 : true;

    if (isCoprime && divisibleByPrimes && divisibleBy4IfM4) {
      Swal.fire({
        icon: 'info',
        title: 'Período Máximo',
        text: `El período máximo teórico es ${modulusNum}. Los parámetros actuales ya cumplen las condiciones de Hull-Dobell.`,
      });
      return;
    }

    // Sugerir nuevos parámetros
    const suggestedMultiplier = 5; // Ejemplo simple que suele funcionar bien
    const suggestedIncrement = 1; // Coprimo con la mayoría de los módulos
    const suggestedModulus = modulusNum % 2 === 0 ? modulusNum : modulusNum + 1; // Asegurar que sea par para simplificar

    Swal.fire({
      icon: 'warning',
      title: 'Período Máximo Teórico',
      html: `Los parámetros actuales no garantizan el período máximo (${modulusNum}):<br>
        - MCD(c, m) = 1: ${isCoprime ? 'Sí' : 'No'}<br>
        - (a-1) divisible por factores primos de m: ${divisibleByPrimes ? 'Sí' : 'No'}<br>
        - Si m divisible por 4, (a-1) también: ${divisibleBy4IfM4 ? 'Sí' : 'No'}<br><br>
        Sugerimos: <b>a = ${suggestedMultiplier}, c = ${suggestedIncrement}, m = ${suggestedModulus}</b><br>
        ¿Desea aplicar estos cambios?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'No, mantener actuales',
    }).then((result) => {
      if (result.isConfirmed) {
        setMultiplier(suggestedMultiplier.toString());
        setIncrement(suggestedIncrement.toString());
        setModulus(suggestedModulus.toString());
        Swal.fire({
          icon: 'success',
          title: 'Parámetros Actualizados',
          text: `Se han aplicado los parámetros: a = ${suggestedMultiplier}, c = ${suggestedIncrement}, m = ${suggestedModulus}.`,
        });
      }
    });
  };

  const csvData = results.map((result) => [result.random]);

  const downloadExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Números');
    XLSX.writeFile(wb, 'numeros_congruencial_lineal.xlsx');
  };

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>
          Algoritmo Congruencial Lineal
        </h2>
        <Row className="justify-content-center mb-4">
          <Col md={2}>
            <Form.Group controlId="seedInput">
              <Form.Label>Semilla Inicial (X₀)</Form.Label>
              <Form.Control
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Ej: 5"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="multiplierInput">
              <Form.Label>Multiplicador (a)</Form.Label>
              <Form.Control
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="Ej: 7"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="incrementInput">
              <Form.Label>Incremento (c)</Form.Label>
              <Form.Control
                type="number"
                value={increment}
                onChange={(e) => setIncrement(e.target.value)}
                placeholder="Ej: 3"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="modulusInput">
              <Form.Label>Módulo (m)</Form.Label>
              <Form.Control
                type="number"
                value={modulus}
                onChange={(e) => setModulus(e.target.value)}
                placeholder="Ej: 16"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="countInput">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="Ej: 10"
              />
            </Form.Group>
          </Col>
          <Col md={1} className="d-flex align-items-end">
            <Button variant="primary" onClick={generateLinearCongruential}>
              Generar
            </Button>
          </Col>
        </Row>

        {/* Botón y explicación del período máximo */}
        <Row className="justify-content-center mb-4">
          <Col md={4} className="text-center">
            <Button variant="secondary" onClick={calculateMaxPeriod}>
              Calcular Período Máximo
            </Button>
            <p className="mt-2" style={{ color: '#666' }}>
              Este botón calcula el período máximo teórico del generador basado en los parámetros
              a (multiplicador), c (incremento) y m (módulo), según las condiciones de Hull-Dobell,
              y sugiere cambios si es necesario.
            </p>
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
                  <th>Semilla (Xₙ)</th>
                  <th>Nueva Semilla (Xₙ₊₁)</th>
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
                    <td>{result.seed}</td>
                    <td>{result.nextSeed}</td>
                    <td style={result.randomRepeated ? { backgroundColor: '#fff3cd' } : {}}>
                      {result.randomFixed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <style>
              {`
                .repeated-random {
                  background-color: #ffeecc !important;
                }
              `}
            </style>

            <p className="text-center mt-3" style={{ color: '#e74c3c' }}>
              Las filas con fondo amarillo contienen números aleatorios que se repiten en la secuencia.
            </p>

            <p className="text-center mt-3" style={{ color: isDegenerative ? '#e74c3c' : '#2c3e50' }}>
              {isDegenerative
                ? 'La secuencia es degenerativa (se detectó repetición de semillas).'
                : 'La secuencia no es degenerativa.'}
            </p>

            <Row className="justify-content-center mt-4">
              <Col xs="auto">
                <CSVLink
                  data={csvData}
                  filename="numeros_congruencial_lineal.csv"
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

export default LinearCongruential;