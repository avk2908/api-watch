const Consul = require("consul");

const registerWithConsul = async () => {
  const consul = new Consul({
    host: process.env.CONSUL_HOST || "localhost",
    port: process.env.CONSUL_PORT || 8500,
    promisify: true,
  });

  const serviceHost = process.env.SERVICE_HOST || "localhost";
  const port = parseInt(process.env.PORT || 3002);
  const serviceName = process.env.SERVICE_NAME || "monitor-service";
  const serviceId = `${serviceName}-${port}`;

  try {
    await consul.agent.service.register({
      id: serviceId,
      name: serviceName,
      address: serviceHost,
      port: port,
      check: {
        http: `http://${serviceHost}:${port}/health`,
        interval: "10s",
        timeout: "5s",
        deregistercriticalserviceafter: "30s",
      },
    });
    console.log(`Registered with Consul as "${serviceId}"`);
  } catch (err) {
    console.error("Consul registration failed:", err.message);
  }
};

module.exports = registerWithConsul;