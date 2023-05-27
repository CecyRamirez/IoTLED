const mongoose = require('mongoose');
const WebSocket = require('ws');
const mqtt = require('mqtt');


const dbUrl = 'mongodb+srv://cgomez33:jPwtjOdeGJE5vLMl@cluster0.uooqksx.mongodb.net/Lucecitas';
const wss = new WebSocket.Server({port:8080});


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa a la base de datos');

    const dbName = 'Lucecitas'; 
    const collectionName = 'wiwi'; 

    
    const Schema = mongoose.Schema;
    const DatosSchema = new Schema({
      campo1: String,
      campo2: String,
      campo3: Number,
    })

    // Utiliza dbName y collectionName para definir el modelo y la colección
    const DatosModel = mongoose.model(collectionName, DatosSchema);

    wss.on('connection', (ws) => {
        console.log('Cliente conectado');
          
        // Crea un cliente MQTT y conecta al broker
        const client = mqtt.connect('mqtt://192.168.0.54:1883');

        client.on('connect', () => {
            console.log('Conectado al broker MQTT')
        })
        
        client.on('message', (topic, message) => {
            console.log(`Mensaje recibido en el topic ${topic}: ${message.toString()}`)
        })
        
          client.subscribe('luces')
  
           client.publish('luces', 'Hola desde Node.js');
        

        setInterval(() => {
          DatosModel.find().then((datos) => {
            ws.send(JSON.stringify(datos));
          });
        }, 10000); // Envía datos cada 10 segundos (ajusta el intervalo según tus necesidades)
  
        // Maneja los mensajes recibidos desde el cliente WebSocket
        ws.on('message', (message) => {
          console.log('Mensaje recibido desde el cliente:', message);
  
          // Publica el mensaje en el topic MQTT
          client.publish('luces', message);
        });
  
        // Cierra la conexión MQTT y WebSocket cuando el cliente se desconecta
        ws.on('close', () => {
          console.log('Cliente desconectado');
          client.end();
        });
      });
  
      console.log('Servidor web con websockets iniciado en el puerto 8080');
    })
    .catch((error) => {
      console.error('Error al conectar a la base de datos:', error);
    });