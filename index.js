const SerialPort = require("serialport").SerialPort;
const { ReadlineParser } = require("@serialport/parser-readline");
const admin = require("firebase-admin");

// Configuracion de la conexión a Firebase Firestore
const serviceAccount = require("./sistemariego-de91e-firebase-adminsdk-v4bz6-dc002f9a51.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sistemariego-de91e-default-rtdb.firebaseio.com", // Base de datos de Firebase
});
const db = admin.firestore();

// Configura la conexión a Arduino
const port = new SerialPort({
  path: "COM3",
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

obtenerDatosdeAlarma();

// Escucha los datos recibidos desde Arduino
parser.on("data", (data) => {
  console.log(data);
  // const datosParseados = parsearDatos(data);
  // guardarDatosFirestore(datosParseados);
});

// parser.write()

// Función para parsear (convertirlos de un string a un objeto manejable para enviar a la base de datos) los datos recibidos desde Arduino
function parsearDatos(data) {
  const datos = data.split("|");
  const humedad = datos[0];
  const temperatura = datos[1];
  const lluvia = datos[2];
  const co2 = datos[3];
  const luz = datos[4];
  const presion = datos[5];

  const datosParseados = {
    fecha: admin.firestore.Timestamp.now(),
    humedad,
    temperatura,
    lluvia,
    co2,
    luz,
    presion,
    viento: (Math.random() * 200).toFixed(2),
  };

  return datosParseados;
}

// Función para guardar los datos en Firestore
function guardarDatosFirestore(datos) {
  const id = new Date().valueOf().toString();
  db.collection("sensor_data").doc(id).set(datos).then((docRef) => {
    // console.log('Datos guardados en Firestore con ID:', docRef.id);
  })
  .catch((error) => {
    console.error("Error al guardar los datos en Firestore:", error);
  });
}


function obtenerDatosdeAlarma() {
  db.collection('alarma').onSnapshot(snapshot => {
    // const data = {
    //   co2: snapshot.docs[0]?.data().valor,
    //   temp: snapshot.docs[2]?.data().valor
    // }

    const data = [snapshot.docs[2]?.data().valor,snapshot.docs[0]?.data().valor]
    // parser.write(JSON.stringify(data.toString()));
    parser.write(data.toString());

  });
}
