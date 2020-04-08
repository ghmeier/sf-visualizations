module.exports = {
  mode: 'development',
  target: 'web',
  context: __dirname,
  entry: {
    main: './src/client/main.jsx',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'build-[name].js',
  },
  module: {
    rules: [
      // Configuration for .jsx files (i.e. React code).
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-syntax-object-rest-spread',
              '@babel/plugin-proposal-function-bind',
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-export-default-from',
              // Allows parsing JSX at all.
              '@babel/plugin-syntax-jsx',

              // Transforms JSX into React function calls.
              // https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html
              '@babel/plugin-transform-react-jsx',
            ],
            // Optimization: In production, strip superfluous whitespace and line terminators.
            compact: false,
          },
        },
      },
    ],
  },
  resolve: {
    // Allows us to import files without specifying an extension. .js takes precedence over .jsx.
    extensions: ['.js', '.jsx'],

    // Explicitly alias certain import paths to specific locations.
    alias: {
      '~': `${__dirname}/src/client`,
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
    recharts: 'Recharts',
  },
};
