// webpack.config.js
module.exports = {
    // ... other config
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ['@tailwindcss/postcss', {}],
                                    ['autoprefixer', {}],
                                ],
                            },
                        },
                    },
                ],
            },
            // ... other rules
        ],
    },
};