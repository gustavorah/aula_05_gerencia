import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Necessário para testes com DOM (React)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Para suportar imports com @/
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Se importar arquivos de estilo
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Arquivo com setup do testing-library
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};

export default config;
