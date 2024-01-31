/*
 * Utility file for getting and printing IP addresses
 */

import os from 'os';

/**
 * Retrieves the private (local) IP address of the server.
 * @returns {string} The private IP address.
 */
export const getPrivateIpAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const key in interfaces) {
    const iface = interfaces[key];

    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const { address, family, internal } = iface[i];

        if (family === 'IPv4' && !internal) {
          return address;
        }
      }
    }
  }

  return 'Unable to retrieve private IP address.';
};
