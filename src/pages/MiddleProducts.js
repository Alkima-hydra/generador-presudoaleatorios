import React, { useState } from 'react';
import Navbar from '../componentes/navbar';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import '../styles/main.scss';

const MiddleProducts = () => {
  const [seed1, setSeed1] = useState('');
  const [seed2, setSeed2] = useState('');
  const [count, setCount] = useState('');
  const [results, setResults] = useState([]);
  const [isDegenerative, setIsDegenerative] = useState(false);
  const [hasCycles, setHasCycles] = useState(false);
  const [cycleInfo, setCycleInfo] = useState(null);

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
    let prevSeed = seed1Num;
    let currentSeed = seed2Num;
    const generatedResults = [];
    
    // Map para detectar secuencias y ciclos
    // Almacenamos pares de semillas consecutivas como claves para detectar ciclos exactos
    const seedPairsMap = new Map();
    const randomsMap = new Map();
    
    // Para detectar ciclos, necesitamos el par de valores (Xi, Xi+1)
    let firstCyclePair = null;
    let cycleStartIndex = -1;
    let cycleEndIndex = -1;
    let cycleLength = 0;

    // Generar todos los números solicitados
    for (let i = 0; i < countNum; i++) {
      const product = prevSeed * currentSeed;
      let productStr = product.toString();

      // Ajustar paridad del producto según la semilla
      const productDigits = productStr.length;
      const isProductEven = productDigits % 2 === 0;
      if (!isProductEven) {
        productStr = '0' + productStr;
      }

      // Calcular índices para cortar los dígitos del medio
      const totalDigits = productStr.length;
      const start = Math.floor((totalDigits - digitsNum) / 2);
      const end = start + digitsNum;
      const middle = productStr.slice(start, end);
      const nextNumber = parseInt(middle);
      const randomNumber = nextNumber / Math.pow(10, digitsNum);
      const randomFixed = randomNumber.toFixed(digitsNum);

      // Guardamos el resultado actual
      generatedResults.push({
        seed1: prevSeed,
        seed2: currentSeed,
        product: productStr,
        middleStart: start,
        middleEnd: end,
        nextSeed: nextNumber,
        random: randomNumber,
        randomFixed: randomFixed,
        index: i,
        inCycle: false, // Inicialmente no está en un ciclo
        isCycleStart: false,
        isCycleEnd: false
      });

      // Verificar ciclos por pares de semillas (Xi, Xi+1)
      const seedPair = `${currentSeed},${nextNumber}`;
      if (seedPairsMap.has(seedPair) && cycleStartIndex === -1) {
        cycleStartIndex = seedPairsMap.get(seedPair);
        cycleEndIndex = i;
        cycleLength = cycleEndIndex - cycleStartIndex;
        firstCyclePair = seedPair;
      } else if (cycleStartIndex === -1) {
        seedPairsMap.set(seedPair, i);
      }

      // Contar ocurrencias de números random por valor exacto
      randomsMap.set(randomFixed, (randomsMap.get(randomFixed) || 0) + 1);

      // Actualizar semillas para la siguiente iteración
      prevSeed = currentSeed;
      currentSeed = nextNumber;
    }

    // Una vez que tenemos todos los resultados, marcamos los ciclos
    if (cycleStartIndex !== -1) {
      // Marcar todos los elementos del ciclo
      for (let i = cycleStartIndex; i <= cycleEndIndex; i++) {
        generatedResults[i].inCycle = true;
      }
      
      // Marcar inicio y fin del ciclo
      generatedResults[cycleStartIndex].isCycleStart = true;
      generatedResults[cycleEndIndex].isCycleEnd = true;
      
      setHasCycles(true);
      setCycleInfo({
        start: cycleStartIndex,
        end: cycleEndIndex,
        length: cycleLength
      });
    } else {
      setHasCycles(false);
      setCycleInfo(null);
    }

    // Marcar repeticiones de números aleatorios
    const finalResults = generatedResults.map(result => {
      return {
        ...result,
        randomRepeated: randomsMap.get(result.randomFixed) > 1
      };
    });

    // Verificar si la secuencia es degenerativa (si hay valores repetidos)
    const isDegen = new Set(finalResults.map(r => r.nextSeed)).size < finalResults.length;
    
    setResults(finalResults);
    setIsDegenerative(isDegen);
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
                  <th>#</th>
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
                    style={{
                      backgroundColor: result.inCycle ? '#d4f1f9' : 
                                       result.randomRepeated ? '#ffeecc' : ''
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{result.seed1}</td>
                    <td>{result.seed2}</td>
                    <td>
                      <span>{result.product.slice(0, result.middleStart)}</span>
                      <span style={{ color: '#e74c3c' }}>
                        {result.product.slice(result.middleStart, result.middleEnd)}
                      </span>
                      <span>{result.product.slice(result.middleEnd)}</span>
                    </td>
                    <td>
                      {(result.isCycleStart || result.isCycleEnd) ? (
                        <span
                          style={{
                            fontWeight: 'bold',
                            backgroundColor: result.isCycleStart ? '#3498db' : '#2ecc71',
                            color: 'white',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            display: 'inline-block'
                          }}
                        >
                          {result.nextSeed}
                          {result.isCycleStart ? ' (Inicio)' : ' (Fin)'}
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

            {/* Información sobre el ciclo detectado */}
            {hasCycles && cycleInfo && (
              <div className="alert alert-info mt-3">
                <h5>Ciclo detectado:</h5>
                <p>
                  <strong>Posición inicial:</strong> {cycleInfo.start + 1} | 
                  <strong> Posición final:</strong> {cycleInfo.end + 1} | 
                  <strong> Longitud del ciclo:</strong> {cycleInfo.length}
                </p>
              </div>
            )}

            {/* Indicador de repetición de números aleatorios */}
            <p className="text-center mt-3" style={{ color: '#e74c3c' }}>
              Las filas con fondo amarillo contienen números aleatorios que se repiten en la secuencia.
            </p>

            {/* Indicador de ciclos */}
            <p className="text-center mt-3" style={{ color: hasCycles ? '#3498db' : '#2c3e50' }}>
              {hasCycles
                ? 'Se detectó un ciclo en la secuencia. Las filas con fondo celeste pertenecen al ciclo.'
                : 'No se detectaron ciclos en la secuencia generada.'}
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