var path = require('path');

module.exports = {
    entry: {
      qc: './src/app/QCApp/index.js',
      analytics: './src/app/AnalyticsApp/index.js',
      dashboard: './src/app/DashboardApp/index.js',
      dashboardCampaign: './src/app/DashboardApp/Campaign.js',
      dashboardGroup: './src/app/DashboardApp/Group.js',
      dashboardAdvertisement: './src/app/DashboardApp/Advertisement.js',
    },
    output: {
      path: path.resolve(__dirname, "..", "news_site", "static", "js", "react"),
      filename: "[name].js"
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test : /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
            test: /\.css$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader'],
          },
        {
            test: /\.css$/,  
            include: /node_modules/,  
            loaders: ['style-loader', 'css-loader'],
       },
       {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
       }
      ]
    }
  };