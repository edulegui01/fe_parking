module.exports = {
  apps: [
    {
      name: 'fe_lacosta',
      script: 'npm',
      args: 'run preview',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
