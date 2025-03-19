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
  // Para m = 2^k, el período máximo es 2^(k-2) = m/4 cuando:
  // 1. m es potencia de 2
  // 2. a = 8t ± 3 (para algún t)
  // 3. X₀ es impar
  if (isPowerOf2(modulus)) {
    const isMultiplierValid = (multiplier % 8 === 3 || multiplier % 8 === 5);
    const isSeedOdd = seed % 2 === 1;
    
    if (isMultiplierValid && isSeedOdd) {
      return modulus / 4;
    } else {
      // Si no cumple las condiciones, el período puede ser menor
      return Math.floor(modulus / 4);  // Estimación conservadora
    }
  } else {
    // Para otros casos, el período máximo es menor
    return Math.floor(modulus / 4);  // Estimación conservadora
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
  
  // Definir estilos de colores como constantes con mayor especificidad
  const STYLES = {
    tableBgNormal: '#ecf0f1',
    tableBgDegenerative: '#f8f9fa',
    rowCycle: '#fff3cd !important',       // Amarillo claro con !important
    rowRepeated: '#e8f4f8 !important',    // Azul claro con !important
    badgeWarning: '#ffc107',   // Amarillo
    badgeInfo: '#17a2b8'       // Azul
  };

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
      // Aplicar el algoritmo congruencial multiplicativo: X_(n+1) = (a * X_n) mod m
      const nextSeed = (multiplierNum * currentSeed) % modulusNum;
      
      // Calcular el número aleatorio en el rango [0,1)
      const randomNumber = nextSeed / modulusNum;
      const randomFixed = randomNumber.toFixed(4);

      // Registrar el número aleatorio para detectar repeticiones
      seenRandoms.set(randomFixed, (seenRandoms.get(randomFixed) || 0) + 1);

      // Guardar el resultado actual
      generatedResults.push({
        iteration: i + 1,
        seed: currentSeed,
        nextSeed: nextSeed,
        random: randomNumber,
        randomFixed: randomFixed,
      });

      // Verificar si la siguiente semilla ya ha sido vista (ciclo detectado)
      if (seenSeeds.has(nextSeed)) {
        hasCycle = true;
        cycleStartIndex = seenSeeds.get(nextSeed);
        actualPeriod = i + 1 - cycleStartIndex;
        break; // Terminar la generación al detectar un ciclo completo
      }

      // Registrar la siguiente semilla y su posición
      seenSeeds.set(nextSeed, i + 1);
      
      // Actualizar la semilla para la próxima iteración
      currentSeed = nextSeed;
    }

    // Si se encontró un ciclo o si la secuencia termina en 0, es degenerativa
    setIsDegenerative(hasCycle || currentSeed === 0);
    setPeriod(actualPeriod);

    // Si la secuencia no completó todas las iteraciones solicitadas debido
    // a que se encontró un ciclo, completar los resultados
    if (hasCycle && generatedResults.length < countNum) {
      const cycleLength = actualPeriod;
      const remainingIterations = countNum - generatedResults.length;
      
      // Generar las iteraciones restantes basadas en el ciclo detectado
      for (let i = 0; i < remainingIterations; i++) {
        const cyclePosition = (i % cycleLength) + cycleStartIndex;
        const cycleItem = generatedResults[cyclePosition];
        
        // Calcular la siguiente semilla basada en la actual
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
          isCyclePredicted: true // Marca esta iteración como parte de un ciclo predicho
        });
      }
    }

    // Marcar en los resultados cuáles forman parte del ciclo
    const finalResults = generatedResults.map((result, index) => {
      const isPartOfCycle = hasCycle && index >= cycleStartIndex;
      const isCycleStart = index === cycleStartIndex;
      const randomRepeated = seenRandoms.get(result.randomFixed) > 1;

      return {
        ...result,
        isPartOfCycle,
        isCycleStart,
        randomRepeated
      };
    });

    setResults(finalResults);

    // Si la secuencia termina en 0 y no se detectó un ciclo,
    // mostrar advertencia de degeneración total
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

    // Condiciones específicas para período máximo cuando m es potencia de 2
    const isModulusPowerOf2 = isPowerOf2(modulusNum);
    const isMultiplierValid = (multiplierNum % 8 === 3 || multiplierNum % 8 === 5);
    const isSeedOdd = seedNum % 2 === 1;
    
    // Calcular el período máximo teórico
    const maxPeriod = getMaxPeriod(modulusNum, multiplierNum, seedNum);

    // Verificar si los parámetros actuales son óptimos
    if (isModulusPowerOf2 && isMultiplierValid && isSeedOdd) {
      Swal.fire({
        icon: 'info',
        title: 'Período Máximo',
        text: `El período máximo teórico es ${maxPeriod}. Los parámetros actuales cumplen las condiciones para un período óptimo.`,
      });
      return;
    }

    // Sugerir mejores parámetros
    let suggestedSeed = seedNum;
    let suggestedMultiplier = multiplierNum;
    let suggestedModulus = modulusNum;

    // Hacer la semilla impar si no lo es
    if (!isSeedOdd) {
      suggestedSeed = seedNum % 2 === 0 ? seedNum + 1 : seedNum;
    }

    // Ajustar el multiplicador para que sea de la forma 8k ± 3
    if (!isMultiplierValid) {
      // Encontrar el multiplicador válido más cercano
      const k = Math.floor(multiplierNum / 8);
      const candidate1 = 8 * k + 3;
      const candidate2 = 8 * k + 5;
      const candidate3 = 8 * (k + 1) + 3;
      
      // Seleccionar el más cercano al valor actual
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

    // Ajustar el módulo para que sea potencia de 2 si no lo es
    if (!isModulusPowerOf2) {
      // Encontrar la potencia de 2 más cercana y mayor que el módulo actual
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

  // CSS personalizado para aplicar directamente al componente
  const customStyles = `
    .cycle-row {
      background-color: #fff3cd !important;
    }
    .repeated-row {
      background-color: #e8f4f8 !important;
    }
    .cycle-start {
      border-top: 2px solid #e67e22 !important;
      font-weight: bold !important;
    }
    .cycle-predicted {
      background-color: #ffeeba !important;
      font-style: italic;
    }
    /* Esta regla asegura que las celdas no pierdan el color por efecto de striped */
    .table-striped>tbody>tr.cycle-row:nth-of-type(odd),
    .table-striped>tbody>tr.cycle-row:nth-of-type(even),
    .table-striped>tbody>tr.repeated-row:nth-of-type(odd),
    .table-striped>tbody>tr.repeated-row:nth-of-type(even),
    .table-striped>tbody>tr.cycle-predicted:nth-of-type(odd),
    .table-striped>tbody>tr.cycle-predicted:nth-of-type(even) {
      --bs-table-accent-bg: transparent !important;
    }
  `;

  return (
    <>
      <Navbar />
      <style>{customStyles}</style>
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
                style={{ backgroundColor: STYLES.tableBgNormal }}
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
                  {results.map((result, index) => {
                    // Determinar las clases CSS
                    let rowClasses = '';
                    
                    if (result.isCyclePredicted) {
                      rowClasses += ' cycle-predicted';
                    } else if (result.isPartOfCycle) {
                      rowClasses += ' cycle-row';
                    } else if (result.randomRepeated) {
                      rowClasses += ' repeated-row';
                    }
                    
                    if (result.isCycleStart) {
                      rowClasses += ' cycle-start';
                    }
                    
                    return (
                      <tr key={index} className={rowClasses}>
                        <td>{result.iteration}</td>
                        <td>{result.seed}</td>
                        <td>{result.nextSeed}</td>
                        <td>{result.randomFixed}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Información sobre el período y degeneración */}
            <Row className="justify-content-center mt-3">
              <Col md={8}>
                <div className="alert alert-info text-center">
                  <strong>Período Actual:</strong> {period > 0 ? period : 'No detectado en las iteraciones realizadas'}
                </div>
                
                <div className={`alert ${isDegenerative ? 'alert-warning' : 'alert-success'} text-center`}>
                  {isDegenerative
                    ? `La secuencia es degenerativa. ${period > 0 ? `Se detectó un ciclo con período ${period}.` : 'La secuencia termina en 0.'}`
                    : 'La secuencia no muestra degeneración en las iteraciones realizadas.'}
                </div>
                
                <div className="alert alert-secondary text-center">
                  <p>
                    <strong>Leyenda:</strong>
                  </p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <div>
                      <span className="badge" style={{ backgroundColor: STYLES.badgeWarning, color: 'black' }}>⬤</span>
                      <span className="ms-1">Número que forma parte del ciclo</span>
                    </div>
                    <div>
                      <span className="badge" style={{ backgroundColor: STYLES.badgeInfo, color: 'white' }}>⬤</span>
                      <span className="ms-1">Número aleatorio repetido</span>
                    </div>
                    {isDegenerative && period > 0 && (
                      <div>
                        <span className="badge" style={{ backgroundColor: '#ffeeba', color: 'black' }}>⬤</span>
                        <span className="ms-1">Valor predicho basado en ciclo detectado</span>
                      </div>
                    )}
                  </div>
                </div>
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