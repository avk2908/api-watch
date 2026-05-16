const Consul = require("consul");

const consul = new Consul({
  host: process.env.CONSUL_HOST || "localhost",
  port: process.env.CONSUL_PORT || 8500,
  promisify: true,
});

const getServiceUrl = async (serviceName) => {
  try {
    const services = await consul.health.service({ service: serviceName, passing: true });
    if (!services || services.length === 0) {
      throw new Error(`No healthy instances of ${serviceName} found`);
    }
    const { Address, Port } = services[0].Service;
    return `http://${Address}:${Port}`;
  } catch (err) {
    console.error(`Consul lookup failed for ${serviceName}:`, err.message);
    throw err;
  }
};

const registerWithConsul = async () => {
  const serviceHost = process.env.SERVICE_HOST || "localhost";
  const port = parseInt(process.env.PORT || 3000);
  const serviceName = process.env.SERVICE_NAME || "gateway-service";

  try {
    await consul.agent.service.register({
      id: `${serviceName}-${port}`,
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
    console.log(`Gateway registered with Consul`);
  } catch (err) {
    console.error("Consul registration failed:", err.message);
  }
};

module.exports = { getServiceUrl, registerWithConsul };