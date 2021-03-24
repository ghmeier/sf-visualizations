const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  context: __dirname,
  entry: {
    main: './src/client/main.jsx',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template'),

      scripts: [
        'https://unpkg.com/react@16.14.0/umd/react.production.min.js',
        'https://unpkg.com/react-dom@16.14.0/umd/react-dom.production.min.js',
        'https://unpkg.com/prop-types/prop-types.min.js',
        'https://unpkg.com/recharts@2.0.8/umd/Recharts.min.js',
        'build-main.js',
      ],
      links: [
        { rel: 'stylesheet', href: 'https://unpkg.com/tachyons@4.8.1/css/tachyons.min.css' },
        {
          rel: 'stylesheet',
          type: 'text/css',
          href:
            'https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700italic,700',
        },
      ],
      headHtmlSnippet: '<style type="text/css">body { font-family: \'Roboto\' }</style>',
      appMountId: 'root',
      title: 'SF COVID Visalizations',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/server/views/layout.html', to: 'dist/index.html' }],
    }),
  ],
  output: {
    path: `${__dirname}/dist`,
    filename: 'build-[name].js',
  },
  module: {
    rules: [
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
              '@babel/plugin-syntax-jsx',
              '@babel/plugin-transform-react-jsx',
            ],
            compact: false,
          },
        },
      },
      {},
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
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
