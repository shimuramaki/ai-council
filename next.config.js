/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": ["./node_modules/styled-jsx/**/*"],
  },
};
