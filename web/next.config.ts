import type { NextConfig } from 'next';
const config:NextConfig={
  serverExternalPackages:['@grpc/grpc-js','@grpc/proto-loader'],
};
export default config;
