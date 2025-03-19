import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
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
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [hasCycle, setHasCycle] = useState(false);

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
    const seenSeeds = new Map();
    const seenRandoms = new Map();
    let degenerative = false;
    let cycleDetected = false;
    let periodLength = 0;
    let cycleStartIndex = -1;

    for (let i = 0; i < countNum; i++) {
      const nextSeed = (multiplierNum * currentSeed + incrementNum) % modulusNum;
      const randomNumber = nextSeed / modulusNum;
      const randomFixed = randomNumber.toFixed(4);

      // Almacenar el índice en el que aparece cada semilla y número aleatorio
      if (seenSeeds.has(nextSeed)) {
        if (!cycleDetected) {
          cycleDetected = true;
          cycleStartIndex = seenSeeds.get(nextSeed);
          periodLength = i + 1 - cycleStartIndex;
        }
        degenerative = true;
      } else {
        seenSeeds.set(nextSeed, i);
      }

      // Almacenar el índice en el que aparece cada número aleatorio
      if (!seenRandoms.has(randomFixed)) {
        seenRandoms.set(randomFixed, i);
      }

      generatedResults.push({
        index: i,
        seed: currentSeed,
        nextSeed: nextSeed,
        random: randomNumber,
        randomFixed: randomFixed,
      });

      currentSeed = nextSeed;
    }

    // Marcar semillas y números aleatorios repetidos
    const finalResults = generatedResults.map((result, idx) => {
      const seedRepeated = seenSeeds.get(result.nextSeed) !== idx;
      const randomRepeated = [...seenRandoms.entries()]
        .filter(([rand, index]) => rand === result.randomFixed && index !== idx)
        .length > 0;
      
      // Determinar si este elemento está dentro del ciclo detectado
      const inCycle = cycleDetected && idx >= cycleStartIndex;

      return {
        ...result,
        seedRepeated,
        randomRepeated,
        inCycle,
      };
    });

    console.log('Conteo de números aleatorios:', Object.fromEntries(seenRandoms));
    console.log('Período detectado:', periodLength);
    console.log('Resultados generados:', finalResults);

    setResults(finalResults);
    setIsDegenerative(degenerative);
    setCurrentPeriod(periodLength);
    setHasCycle(cycleDetected);
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

    // Calcular el período máximo teórico
    let theoreticalMaxPeriod = modulusNum;
    if (incrementNum === 0) {
      // Para generadores multiplicativos (c=0)
      theoreticalMaxPeriod = modulusNum - 1;
    }

    if (isCoprime && divisibleByPrimes && divisibleBy4IfM4) {
      Swal.fire({
        icon: 'info',
        title: 'Análisis de Período',
        html: `
          <b>Período Máximo Teórico:</b> ${theoreticalMaxPeriod}<br>
          <b>Período Actual:</b> ${currentPeriod > 0 ? currentPeriod : "No determinado"}<br><br>
          Los parámetros actuales ya cumplen las condiciones de Hull-Dobell.
        `,
      });
      return;
    }

    // Sugerir nuevos parámetros
    const suggestedMultiplier = modulusNum % 4 === 0 ? 5 : 3;
    const suggestedIncrement = 1; // Coprimo con la mayoría de los módulos
    const suggestedModulus = modulusNum % 2 === 0 ? modulusNum : modulusNum + 1; // Asegurar que sea par para simplificar

    Swal.fire({
      icon: 'warning',
      title: 'Análisis de Período',
      html: `
        <b>Período Máximo Teórico:</b> ${theoreticalMaxPeriod}<br>
        <b>Período Actual:</b> ${currentPeriod > 0 ? currentPeriod : "No determinado"}<br><br>
        Los parámetros actuales no garantizan el período máximo:<br>
        - MCD(c, m) = 1: ${isCoprime ? 'Sí ✓' : 'No ✗'}<br>
        - (a-1) divisible por factores primos de m: ${divisibleByPrimes ? 'Sí ✓' : 'No ✗'}<br>
        - Si m divisible por 4, (a-1) también: ${divisibleBy4IfM4 ? 'Sí ✓' : 'No ✗'}<br><br>
        Parámetros sugeridos: <b>a = ${suggestedMultiplier}, c = ${suggestedIncrement}, m = ${suggestedModulus}</b><br>
        ¿Desea aplicar estos cambios?
      `,
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

  const csvData = results.map((result) => [result.randomFixed]);

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

        {/* Información del período y ciclo */}
        {results.length > 0 && (
          <Row className="justify-content-center mb-4">
            <Col md={8} className="text-center">
              <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h5>Información de la Secuencia</h5>
                <Badge bg={isDegenerative ? "warning" : "success"} className="me-2">
                  {isDegenerative ? 'Secuencia Degenerativa' : 'Secuencia No Degenerativa'}
                </Badge>
                <Badge bg={hasCycle ? "info" : "secondary"} className="me-2">
                  {hasCycle ? 'Ciclo Detectado' : 'Sin Ciclo Detectado'}
                </Badge>
                <Badge bg="primary">
                  Período Actual: {currentPeriod > 0 ? currentPeriod : "No determinado"}
                </Badge>
              </div>
            </Col>
          </Row>
        )}

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
                  <th>#</th>
                  <th>Semilla (Xₙ)</th>
                  <th>Nueva Semilla (Xₙ₊₁)</th>
                  <th>Número (0-1)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={index}
                    style={
                      result.inCycle
                        ? { backgroundColor: '#e2f0d9' } // Verde claro para elementos del ciclo
                        : result.randomRepeated
                        ? { backgroundColor: '#ffeecc' } // Amarillo para números aleatorios repetidos
                        : {}
                    }
                  >
                    <td>{result.index}</td>
                    <td>{result.seed}</td>
                    <td style={result.seedRepeated ? { backgroundColor: '#ffd7d7' } : {}}>
                      {result.nextSeed}
                    </td>
                    <td style={result.randomRepeated ? { backgroundColor: '#fff3cd' } : {}}>
                      {result.randomFixed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h5 className="text-center mb-3">Leyenda</h5>
              <Row>
                <Col md={4}>
                  <div style={{ backgroundColor: '#fff3cd', padding: '5px', marginBottom: '5px', borderRadius: '3px' }}>
                    Números aleatorios repetidos
                  </div>
                </Col>
                <Col md={4}>
                  <div style={{ backgroundColor: '#ffd7d7', padding: '5px', marginBottom: '5px', borderRadius: '3px' }}>
                    Semillas repetidas
                  </div>
                </Col>
                <Col md={4}>
                  <div style={{ backgroundColor: '#e2f0d9', padding: '5px', marginBottom: '5px', borderRadius: '3px' }}>
                    Elementos dentro del ciclo
                  </div>
                </Col>
              </Row>
            </div>

            <Row className="justify-content-center mt-4">
              <Col xs="auto">
                <CSVLink
                  data={csvData}
                  filename="numeros_congruencial_lineal.csv"
                  className="btn btn-outline-primary me-2"
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