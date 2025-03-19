import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import '../styles/main.scss';

// Función para verificar si un número es potencia de 2
const isPowerOf2 = (n) => {
  return n !== 0 && (n & (n - 1)) === 0;
};

// Función mejorada para calcular el período máximo teórico
const getMaxPeriod = (modulus, multiplier, seed) => {
  if (isPowerOf2(modulus)) {
    const isMultiplierValid = (multiplier % 8 === 3 || multiplier % 8 === 5);
    const isSeedOdd = seed % 2 === 1;
    
    if (isMultiplierValid && isSeedOdd) {
      return modulus / 4;
    } else {
      return Math.floor(modulus / 4); // Estimación conservadora
    }
  } else {
    return Math.floor(modulus / 4); // Estimación conservadora
  }
};

const MultiplicativeCongruential = () => {
  const [seed, setSeed] = useState(''); // Semilla inicial (X₀)
  const [multiplier, setMultiplier] = useState(''); // Multiplicador (a)
  const [modulus, setModulus] = useState(''); // Módulo (m)
  const [count, setCount] = useState(''); // Cantidad de números a generar
  const [results, setResults] = useState([]);
  const [isDegenerative, setIsDegenerative] = useState(false);
  const [period, setPeriod] = useState(0);
  const [hasCycles, setHasCycles] = useState(false); // Estado para ciclos

  const generateMultiplicativeCongruential = () => {
    const seedNum = parseInt(seed);
    const multiplierNum = parseInt(multiplier);
    const modulusNum = parseInt(modulus);
    const countNum = parseInt(count);

    // Validaciones
    if (isNaN(seedNum) || seedNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La semilla debe ser un número entero positivo.',
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

    // Verificar si la semilla es coprima con el módulo
    if (seedNum % 2 === 0 && modulusNum % 2 === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La semilla y el módulo no son coprimos. Esto puede llevar a una secuencia degenerativa.',
      });
    }

    // Generación de la secuencia
    let currentSeed = seedNum;
    const generatedResults = [];
    const seenSeeds = new Map(); // Para detectar ciclos en las semillas
    const seenRandoms = new Map(); // Para detectar repeticiones en los aleatorios
    let actualPeriod = 0;
    let cycleStartIndex = -1;
    let hasCycle = false;

    // Agregar la semilla inicial al mapa
    seenSeeds.set(seedNum, 0);

    for (let i = 0; i < countNum; i++) {
      const nextSeed = (multiplierNum * currentSeed) % modulusNum;
      const randomNumber = nextSeed / modulusNum;
      const randomFixed = randomNumber.toFixed(4);

      seenRandoms.set(randomFixed, (seenRandoms.get(randomFixed) || 0) + 1);

      generatedResults.push({
        iteration: i + 1,
        seed: currentSeed,
        nextSeed: nextSeed,
        random: randomNumber,
        randomFixed: randomFixed,
        index: i // Guardar índice para detección de ciclos
      });

      if (seenSeeds.has(nextSeed)) {
        hasCycle = true;
        cycleStartIndex = seenSeeds.get(nextSeed);
        actualPeriod = i + 1 - cycleStartIndex;
        break;
      }

      seenSeeds.set(nextSeed, i + 1);
      currentSeed = nextSeed;
    }

    setIsDegenerative(hasCycle || currentSeed === 0);
    setPeriod(actualPeriod);
    setHasCycles(hasCycle); // Actualizar estado de ciclos

    if (hasCycle && generatedResults.length < countNum) {
      const cycleLength = actualPeriod;
      const remainingIterations = countNum - generatedResults.length;

      for (let i = 0; i < remainingIterations; i++) {
        const cyclePosition = (i % cycleLength) + cycleStartIndex;
        const cycleItem = generatedResults[cyclePosition];
        
        const currentSeed = cycleItem.nextSeed;
        const nextSeed = (multiplierNum * currentSeed) % modulusNum;
        const randomNumber = nextSeed / modulusNum;
        const randomFixed = randomNumber.toFixed(4);
        
        generatedResults.push({
          iteration: generatedResults.length + 1,
          seed: currentSeed,
          nextSeed: nextSeed,
          random: randomNumber,
          randomFixed: randomFixed,
          isCyclePredicted: true
        });
      }
    }

    // Marcar inicio y fin del primer ciclo
    const finalResults = generatedResults.map((result, index) => {
      const isPartOfCycle = hasCycle && index >= cycleStartIndex;
      const isCycleStart = index === cycleStartIndex;
      const isCycleEnd = hasCycle && index === cycleStartIndex + actualPeriod - 1;
      const randomRepeated = seenRandoms.get(result.randomFixed) > 1;

      return {
        ...result,
        isPartOfCycle,
        isCycleStart,
        isCycleEnd,
        randomRepeated
      };
    });

    setResults(finalResults);

    if (currentSeed === 0 && !hasCycle) {
      Swal.fire({
        icon: 'warning',
        title: 'Secuencia Degenerativa',
        text: 'La secuencia ha degenerado completamente a 0. No generará más valores aleatorios únicos.',
      });
    }
  };

  const calculateMaxPeriod = () => {
    const seedNum = parseInt(seed);
    const multiplierNum = parseInt(multiplier);
    const modulusNum = parseInt(modulus);

    if (isNaN(seedNum) || seedNum <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La semilla debe ser un número entero positivo.',
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

    if (isNaN(modulusNum) || modulusNum <= 1) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El módulo debe ser un número entero mayor a 1.',
      });
      return;
    }

    const isModulusPowerOf2 = isPowerOf2(modulusNum);
    const isMultiplierValid = (multiplierNum % 8 === 3 || multiplierNum % 8 === 5);
    const isSeedOdd = seedNum % 2 === 1;
    const maxPeriod = getMaxPeriod(modulusNum, multiplierNum, seedNum);

    if (isModulusPowerOf2 && isMultiplierValid && isSeedOdd) {
      Swal.fire({
        icon: 'info',
        title: 'Período Máximo',
        text: `El período máximo teórico es ${maxPeriod}. Los parámetros actuales cumplen las condiciones para un período óptimo.`,
      });
      return;
    }

    let suggestedSeed = seedNum;
    let suggestedMultiplier = multiplierNum;
    let suggestedModulus = modulusNum;

    if (!isSeedOdd) {
      suggestedSeed = seedNum % 2 === 0 ? seedNum + 1 : seedNum;
    }

    if (!isMultiplierValid) {
      const k = Math.floor(multiplierNum / 8);
      const candidate1 = 8 * k + 3;
      const candidate2 = 8 * k + 5;
      const candidate3 = 8 * (k + 1) + 3;
      const distances = [
        Math.abs(candidate1 - multiplierNum),
        Math.abs(candidate2 - multiplierNum),
        Math.abs(candidate3 - multiplierNum)
      ];
      const minDistanceIndex = distances.indexOf(Math.min(...distances));
      
      if (minDistanceIndex === 0) suggestedMultiplier = candidate1;
      else if (minDistanceIndex === 1) suggestedMultiplier = candidate2;
      else suggestedMultiplier = candidate3;
    }

    if (!isModulusPowerOf2) {
      let powerOf2 = 2;
      while (powerOf2 < modulusNum) {
        powerOf2 *= 2;
      }
      suggestedModulus = powerOf2;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Período Máximo Teórico',
      html: `Los parámetros actuales no garantizan el período máximo teórico (${maxPeriod}):<br>
        - m es potencia de 2: ${isModulusPowerOf2 ? 'Sí' : 'No'}<br>
        - a = 8k ± 3: ${isMultiplierValid ? 'Sí' : 'No'}<br>
        - X₀ impar: ${isSeedOdd ? 'Sí' : 'No'}<br><br>
        Sugerimos: <b>X₀ = ${suggestedSeed}, a = ${suggestedMultiplier}, m = ${suggestedModulus}</b><br>
        Para obtener un período máximo de ${getMaxPeriod(suggestedModulus, suggestedMultiplier, suggestedSeed)}<br>
        ¿Desea aplicar estos cambios?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar cambios',
      cancelButtonText: 'No, mantener actuales',
    }).then((result) => {
      if (result.isConfirmed) {
        setSeed(suggestedSeed.toString());
        setMultiplier(suggestedMultiplier.toString());
        setModulus(suggestedModulus.toString());
        Swal.fire({
          icon: 'success',
          title: 'Parámetros Actualizados',
          text: `Se han aplicado los parámetros: X₀ = ${suggestedSeed}, a = ${suggestedMultiplier}, m = ${suggestedModulus}.`,
        });
      }
    });
  };

  const csvData = results.map((result) => [result.random]);

  const downloadExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Números');
    XLSX.writeFile(wb, 'numeros_congruencial_multiplicativo.xlsx');
  };

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>
          Algoritmo Congruencial Multiplicativo
        </h2>
        
        {/* Formulario de entrada */}
        <Row className="justify-content-center mb-4">
          <Col md={3}>
            <Form.Group controlId="seedInput">
              <Form.Label>Semilla Inicial (X₀)</Form.Label>
              <Form.Control
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Ej: 5"
              />
              <Form.Text className="text-muted">
                Preferiblemente un número impar
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="multiplierInput">
              <Form.Label>Multiplicador (a)</Form.Label>
              <Form.Control
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="Ej: 5"
              />
              <Form.Text className="text-muted">
                Idealmente de la forma 8k±3
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="modulusInput">
              <Form.Label>Módulo (m)</Form.Label>
              <Form.Control
                type="number"
                value={modulus}
                onChange={(e) => setModulus(e.target.value)}
                placeholder="Ej: 16"
              />
              <Form.Text className="text-muted">
                Preferiblemente potencia de 2
              </Form.Text>
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
            <Button variant="primary" onClick={generateMultiplicativeCongruential}>
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
              y sugiere mejoras si es necesario.
            </p>
          </Col>
        </Row>

        {/* Tabla de resultados */}
        {results.length > 0 && (
          <>
            <div className="table-responsive">
              <Table
                bordered
                hover
                className="mt-4"
                style={{ backgroundColor: '#ecf0f1' }}
              >
                <thead>
                  <tr>
                    <th>Iteración</th>
                    <th>Semilla (Xₙ)</th>
                    <th>Nueva Semilla (Xₙ₊₁)</th>
                    <th>Número Aleatorio (0-1)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className={result.randomRepeated ? 'repeated-row' : ''}
                      style={result.randomRepeated ? { backgroundColor: '#e8f4f8' } : {}}
                    >
                      <td>{result.iteration}</td>
                      <td>{result.seed}</td>
                      <td>
                        {result.isCycleStart || result.isCycleEnd ? (
                          <span
                            style={{
                              fontWeight: 'bold',
                              backgroundColor: '#d4f1f9',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              display: 'inline-block'
                            }}
                          >
                            {result.nextSeed}
                          </span>
                        ) : (
                          result.nextSeed
                        )}
                      </td>
                      <td style={result.randomRepeated ? { backgroundColor: '#fff3cd' } : {}}>
                        {result.randomFixed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Información sobre el período y degeneración */}
            <Row className="justify-content-center mt-3">
              <Col md={8}>
                <div className="alert alert-info text-center">
                  <strong>Período Actual:</strong> {period > 0 ? period : 'No detectado en las iteraciones realizadas'}
                </div>
                
                <p className="text-center mt-3" style={{ color: hasCycles ? '#3498db' : '#2c3e50' }}>
                  {hasCycles
                    ? 'Se detectó un ciclo en la secuencia. Los valores en fondo celeste y negrita marcan el inicio y fin del ciclo.'
                    : 'No se detectaron ciclos en la secuencia.'}
                </p>

                <div className={`alert ${isDegenerative ? 'alert-warning' : 'alert-success'} text-center`}>
                  {isDegenerative
                    ? `La secuencia es degenerativa. ${period > 0 ? `Se detectó un ciclo con período ${period}.` : 'La secuencia termina en 0.'}`
                    : 'La secuencia no muestra degeneración en las iteraciones realizadas.'}
                </div>

                <p className="text-center mt-3" style={{ color: '#e74c3c' }}>
                  Las casillas con fondo amarillo en la columna "Número Aleatorio" indican valores que se repiten en la secuencia.
                </p>
              </Col>
            </Row>

            {/* Botones de exportación */}
            <Row className="justify-content-center mt-4 mb-5">
              <Col xs="auto">
                <CSVLink
                  data={csvData}
                  filename="numeros_congruencial_multiplicativo.csv"
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

export default MultiplicativeCongruential;