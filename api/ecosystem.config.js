module.exports = {
  apps: [
    {
      name: 'api',
      script: './dist/main.js',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
