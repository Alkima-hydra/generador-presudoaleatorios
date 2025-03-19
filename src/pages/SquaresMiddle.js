import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import '../styles/main.scss'; // Asegúrate de importar los estilos

const SquaresMiddle = () => {
  const [seed, setSeed] = useState('');
  const [count, setCount] = useState('');
  const [results, setResults] = useState([]);
  const [isDegenerative, setIsDegenerative] = useState(false);
  const [hasCycles, setHasCycles] = useState(false);

  const generateSquaresMiddle = () => {
    // Validaciones
    const seedNum = parseInt(seed);
    const countNum = parseInt(count);

    if (isNaN(seedNum) || seedNum <= 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La semilla debe ser un número entero mayor a 2.',
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

    // Calcular la cantidad de dígitos basada en la semilla
    const digitsNum = seed.toString().length;
    const isSeedEven = digitsNum % 2 === 0;

    // Algoritmo de cuadrados medios
    let currentSeed = seedNum;
    const generatedResults = [];
    const seenNumbers = new Map(); // Map para contar ocurrencias de semillas
    const seedPositions = new Map(); // Map para guardar la primera posición de cada semilla
    const seenRandoms = new Map(); // Map para contar ocurrencias de números random por valor exacto
    let degenerative = false;
    
    // Variables para detectar el primer ciclo
    let firstCycle = null;
    
    // Generar todos los números solicitados
    for (let i = 0; i < countNum; i++) {
      const squared = currentSeed * currentSeed;
      let squaredStr = squared.toString();

      // Ajustar paridad del cuadrado según la semilla
      const squaredDigits = squaredStr.length;
      const isSquaredEven = squaredDigits % 2 === 0;
      if ((isSeedEven && !isSquaredEven) || (!isSeedEven && isSquaredEven)) {
        squaredStr = '0' + squaredStr; // Agregar un solo cero a la izquierda
      }

      // Calcular índices para cortar los dígitos del medio
      const totalDigits = squaredStr.length;
      const start = Math.floor((totalDigits - digitsNum) / 2);
      const end = start + digitsNum;
      const middle = squaredStr.slice(start, end);
      const nextNumber = parseInt(middle);
      const randomNumber = nextNumber / Math.pow(10, digitsNum); // Rango 0-1
      const randomFixed = randomNumber.toFixed(digitsNum);
      
      // Guardamos los números en nuestro mapeo
      generatedResults.push({
        seed: currentSeed,
        squared: squaredStr,
        middleStart: start,
        middleEnd: end,
        nextSeed: nextNumber,
        random: randomNumber,
        randomFixed: randomFixed,
        index: i  // Guardar el índice para facilitar la detección de ciclos
      });

      // Detectar primer ciclo
      if (seedPositions.has(nextNumber) && !firstCycle) {
        const firstPosition = seedPositions.get(nextNumber);
        firstCycle = {
          cycleStart: firstPosition,
          cycleEnd: i
        };
      }

      // Almacenar la primera posición de cada semilla para detectar ciclos
      if (!seedPositions.has(nextNumber)) {
        seedPositions.set(nextNumber, i);
      }

      // Contar ocurrencias de semillas
      const occurrences = seenNumbers.get(nextNumber) || 0;
      seenNumbers.set(nextNumber, occurrences + 1);

      // Contar ocurrencias de números random por su valor exacto
      seenRandoms.set(randomFixed, (seenRandoms.get(randomFixed) || 0) + 1);

      // Verificar degeneración
      if (occurrences > 0) {
        degenerative = true;
      }

      currentSeed = nextNumber;
    }
    
    // Marcar solo el principio y fin del primer ciclo detectado
    const finalResults = generatedResults.map((result, index) => {
      const randomRepeated = seenRandoms.get(result.randomFixed) > 1;
      
      // Verificar si este índice es inicio o fin del primer ciclo
      let isCycleStart = false;
      let isCycleEnd = false;
      
      if (firstCycle) {
        if (index === firstCycle.cycleStart) isCycleStart = true;
        if (index === firstCycle.cycleEnd) isCycleEnd = true;
      }
      
      return {
        ...result,
        repeated: seenNumbers.get(result.nextSeed) > 1,
        randomRepeated: randomRepeated,
        isCycleStart: isCycleStart,
        isCycleEnd: isCycleEnd
      };
    });

    console.log('Conteo de números aleatorios:', Object.fromEntries(seenRandoms));
    console.log('Resultados generados:', finalResults);
    console.log('Primer ciclo detectado:', firstCycle);

    setResults(finalResults);
    setIsDegenerative(degenerative);
    setHasCycles(firstCycle !== null);
  };

  // Preparar datos para descarga (solo números en rango 0-1, sin encabezados)
  const csvData = results.map((result) => [result.random]);

  const downloadExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(csvData); // Array de arrays sin encabezados
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Números');
    XLSX.writeFile(wb, 'numeros_cuadrados_medios.xlsx');
  };

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h2 className="text-center mb-4" style={{ color: '#2c3e50' }}>
          Algoritmo de los Cuadrados Medios
        </h2>
        <Row className="justify-content-center mb-4">
          <Col md={4}>
            <Form.Group controlId="seedInput">
              <Form.Label>Semilla Inicial (mayor a 2)</Form.Label>
              <Form.Control
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Ej: 1234"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
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
            <Button variant="primary" onClick={generateSquaresMiddle}>
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
                  <th>Semilla</th>
                  <th>Cuadrado</th>
                  <th>Nueva Semilla</th>
                  <th>Número (0-1)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr 
                    key={index} 
                    className={result.randomRepeated ? "repeated-random" : ""}
                    style={result.randomRepeated ? { backgroundColor: '#ffeecc' } : {}}
                  >
                    <td>{result.seed}</td>
                    <td>
                      <span>{result.squared.slice(0, result.middleStart)}</span>
                      <span style={{ color: '#e74c3c' }}>
                        {result.squared.slice(result.middleStart, result.middleEnd)}
                      </span>
                      <span>{result.squared.slice(result.middleEnd)}</span>
                    </td>
                    <td>
                      {/* Aplicar estilo en negrita y fondo celeste solo para inicio o fin del primer ciclo */}
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

            {/* Indicador de ciclos */}
            <p className="text-center mt-3" style={{ color: hasCycles ? '#3498db' : '#2c3e50' }}>
              {hasCycles
                ? 'Se detectó un ciclo en la secuencia. Los valores en fondo celeste y negrita marcan el inicio y fin del ciclo.'
                : 'No se detectaron ciclos en la secuencia.'}
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
                  filename="numeros_cuadrados_medios.csv"
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

export default SquaresMiddle;