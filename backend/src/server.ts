import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';

// Importar todos los modelos para registrarlos en Mongoose
import './models/Permission';
import './models/Role';
import './models/Division';
import './models/Employee';
import './models/ApprovalFlow';
import './models/CSWCategory';
import './models/CSW';
import './models/Project';
import './models/WeeklyReport';
import './models/CalendarEvent';

const startServer = async (): Promise<void> => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(config.port, () => {
      console.log('🚀 ============================================');
      console.log(`🚀 Servidor corriendo en http://localhost:${config.port}`);
      console.log(`🚀 Entorno: ${config.env}`);
      console.log(`🚀 Frontend: ${config.frontend.url}`);
      console.log(`🚀 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API Docs (Swagger): http://localhost:${config.port}/api-docs`);
      console.log('🚀 ============================================');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();
