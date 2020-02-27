module.exports = {
  apps : [{
    name: "snacc-server",
    script: "./app.js",
		args: [
			'-s'
		],
		watch: false,
    env: {
      NODE_ENV: "development",
			SNACC_REJECT_UNAUTHORIZED: true
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
