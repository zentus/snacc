const PluginTransformRuntime = ["@babel/plugin-transform-runtime", {
	regenerator: true
}]

const PresetReact = "@babel/preset-react"

const PresetEnv = ["@babel/preset-env", {
	targets: {
		node: "1"
	}
}]

module.exports = {
	plugins: [
		PluginTransformRuntime
	],
  presets: [
    PresetReact,
    PresetEnv
  ]
}
