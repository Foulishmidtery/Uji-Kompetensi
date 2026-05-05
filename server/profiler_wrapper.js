process.env.NODE_ENV = 'test';
const app = require('./server');

const PORT = process.env.PORT || 5000;

// Inject kill switch for clinic.js graceful shutdown
app.get('/__clinic_kill', (req, res) => {
  res.send('Gracefully shutting down for clinic.js...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
