import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde otros equipos de la red local
  // (p. ej. el móvil) por la IP de la máquina. Sin esto, Next 16 bloquea los
  // recursos de desarrollo en orígenes que no sean localhost y los botones no
  // responden (el cliente no se hidrata). Añade aquí las IPs/hosts que uses.
  allowedDevOrigins: ["192.168.1.29"],
};

export default nextConfig;
